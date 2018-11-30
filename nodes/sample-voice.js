import Sample from './sample.js';

import { nothing } from '../../fn/fn.js';
import { getPrivates } from '../modules/utilities/privates.js';
import NodeGraph   from './node-graph.js';
import PlayNode from './play-node.js';
import { automate, getAutomationEvents, getAutomationEndTime } from '../modules/automate.js';
import { assignSettings } from '../modules/assign-settings.js';

import map from './sampler/sample-maps/gretsch-kit.js';

const DEBUG  = window.DEBUG;
const assign = Object.assign;
const define = Object.defineProperties;
const max    = Math.max;

const graph = {
    nodes: [{
        id:    'detune',
        type:  'constant',
        data: { offset: 0 }
    }, {
        id:    'gain',
        type:  'gain',
        data: { gain: 0 }
    }, {
		id:    'gainEnvelope',
		type:  'envelope',
        data: { attack: [], release: [] }
	}, {
		id:    'output',
        type:  'biquad-filter',
		data: { type: 'lowpass', frequency: 100, detune: 0, Q: 0.4 }
	}, {
		id:    'frequencyEnvelope',
		type:  'envelope',
        data: { attack: [], release: [] }
	}],

	connections: [
        { source: 'gain',              target: 'output' },
        { source: 'gainEnvelope',      target: 'gain.gain' },
        { source: 'frequencyEnvelope', target: 'output.frequency' }
    ]
};



const defaults = {
    gain: 0,

    gainEnvelope: {
        attack:  [[0, 'step', 1]],
        release: [[0, 'target', 0, 4]]
    },

    gainEnvelopeFromVelocity: 1,
    gainRateFromVelocity:     0,

    frequency: 100,

    frequencyEnvelope: {
        attack:  [[0, 'step', 1]],
        release: [[0, 'target', 0, 4]]
    },

    frequencyEnvelopeFromVelocity: 1000,
    frequencyRateFromVelocity:     0,

    detune: 0,
    Q:      1,
    level:  1
};


const properties = {
	sampleMap:                     { enumerable: true, writable: true },
    gainEnvelopeFromVelocity:      { enumerable: true, writable: true },
    gainRateFromVelocity:          { enumerable: true, writable: true },
    frequencyEnvelopeFromVelocity: { enumerable: true, writable: true },
    frequencyRateFromVelocity:     { enumerable: true, writable: true }
};


function bell(n) {
	return n * (Math.random() + Math.random() - 1);
}




function createSamples(destination, map, time, note=69, velocity=1) {
    return map
    .filter((region) => {
        return region.noteRange[0] <= note
        && region.noteRange[region.noteRange.length - 1] >= note
        && region.velocityRange[0] <= velocity
        && region.velocityRange[region.velocityRange.length - 1] >= velocity ;
    })
    .map((region) => {
        const sample = new Sample(destination.context, region.sample);
        // Set gain based on velocity and sensitivity


        // Todo interpolate gain frim velocity and note ranges
        sample.gain.setValueAtTime(1, time);


        return sample;
    });
}




export default function SampleVoice(context, settings) {
	NodeGraph.call(this, context, graph);
    PlayNode.call(this, context);

    this.gain              = this.get('gain').gain;
    this.gainEnvelope      = this.get('gainEnvelope');
    this.frequency         = this.get('output').frequency;
    this.frequencyEnvelope = this.get('frequencyEnvelope');
    this.Q                 = this.get('output').Q;
    this.detune            = this.get('detune').offset;

    this.reset(context, settings);
}

assign(SampleVoice.prototype, PlayNode.prototype, NodeGraph.prototype, {
	reset: function(context, settings) {
        PlayNode.prototype.reset.apply(this);
        assignSettings(this, defaults, settings);
	},

	start: function(time, note, velocity) {
        // Get regions from map
        const gain    = this.get('gain');
        const filter  = this.get('output');
        const sources = createSamples(gain, map.data, time, note, velocity);

        let n = sources.length;
        while (n--) {
            this.get('detune').connect(sources[n].detune);
            sources[n].connect(gain);
            sources[n].start(time, numberToFrequency(440, note));
        }

		this.gainEnvelope.start(time, 'attack', velocity * this.gainEnvelopeFromVelocity, velocity * this.gainRateFromVelocity);
		this.frequencyEnvelope.start(time, 'attack', velocity * this.frequencyEnvelopeFromVelocity, velocity * this.frequencyRateFromVelocity);

		PlayNode.prototype.start.call(this, time);

		return this;
	},

	stop: function(time, frequency, velocity) {
        // Clamp stopTime to startTime
        time = time > this.startTime ? time : this.startTime;

		//this.get('osc-1').stop(time + duration);
		//this.get('osc-2').stop(time + duration);
		this.gainEnvelope.start(time, 'release', 1 + velocity * this.gainEnvelopeFromVelocity, 1 + velocity * this.gainRateFromVelocity);
		this.frequencyEnvelope.start(time, 'release', 1 + velocity * this.frequencyEnvelopeFromVelocity, 1 + velocity * this.frequencyRateFromVelocity);

		const stopTime = time + max(
			getAutomationEndTime(this.gainEnvelope.release),
			getAutomationEndTime(this.frequencyEnvelope.release)
		);

		this.gainEnvelope.stop(stopTime);
		this.frequencyEnvelope.stop(stopTime);

        PlayNode.prototype.stop.call(this, stopTime);

		// Prevent filter feedback from ringing past note end
		this.Q.setValueAtTime(stopTime, 0);

		return this;
	}
});