
//import AudioObject from '../../../context-object/modules/context-object.js';
import { print, printGroup, printGroupEnd } from './print.js';
import { remove } from '../../../fn/fn.js';
import { getPrivates } from '../privates.js';
import { numberToFrequency } from '../../../midi/midi.js';
import Tone from './tone.js';
import NodeGraph from './node-graph.js';
import { automate } from '../audio-param.js';
import { assignSettings } from './assign-settings.js';
import Pool from '../pool.js';

const DEBUG = window.DEBUG;
const assign = Object.assign;
const define = Object.defineProperties;

export const config = {
	tuning: 440
};

const graph = {
	nodes: [
		{ id: 'output',        type: 'gain',     data: { gain:   1 } },
		{ id: 'pitch',         type: 'constant', data: { offset: 0 } },
		{ id: 'pitchToDetune', type: 'gain',     data: { gain: 100 } },
		{ id: 'frequency',     type: 'constant', data: { offset: 0 } },
		{ id: 'q',             type: 'constant', data: { offset: 0 } },
	],

	connections: [
		{ source: 'pitch', target: 'pitchToDetune' }
	],

	params: {
		gain:            'output.gain',
		pitch:           'pitch.offset',
		filterFrequency: 'frequency.offset',
		filterQ:         'q.offset'
	}
};

// Declare some useful defaults
var defaults = {
	"gain":   0.5,
	"pitch":  0
};

const properties = {
	"osc-1-mix":              { enumerable: true, writable: true },
	"osc-2-mix":              { enumerable: true, writable: true },
	"osc-1":                  { enumerable: true, writable: true },
	"osc-2":                  { enumerable: true, writable: true },
	"env-1":                  { enumerable: true, writable: true },
	"env-2":                  { enumerable: true, writable: true },
	"detune":                 { enumerable: true, writable: true },
	'velocity-to-env-1-gain': { enumerable: true, writable: true },
	'velocity-to-env-1-rate': { enumerable: true, writable: true },
	'velocity-to-env-2-gain': { enumerable: true, writable: true },
	'velocity-to-env-2-rate': { enumerable: true, writable: true }
};

function by0(a, b) {
	return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0 ;
}

function isDefined(val) {
	return val !== undefined && val !== null;
}

function isIdle(node) {
	return node.startTime !== undefined && node.context.currentTime > node.stopTime;
}

function setup() {
	this.get('pitchToDetune').connect(note['osc-1'].detune);
	this.get('pitchToDetune').connect(note['osc-2'].detune);
	this.get('frequency').connect(note.filterFrequency);
	this.get('q').connect(note.filterQ);

	note.connect(this.get('output'));
}

function ToneSynth(context, settings, stage) {
	if (DEBUG) { printGroup('ToneSynth'); }

	// Private
	const privates = getPrivates(this);

	// Graph
	NodeGraph.call(this, context, graph);

	// Properties
	define(this, properties);

	let filterType;

	define(this, {
		filterType: {
			enumerable: true,

			get: function() {
				return filterType;
			},

			set: function(type) {
				filterType = type;
				privates.notes.forEach((note) => {
					if (!note.startTime) { return; }
					if (note.stopTime < note.context.currentTime) { return; }
					note.filter.type = filterType
				});
			}
		}
	});

	// Params
	this.gain            = this.get('output').gain;
	this.pitch           = this.get('pitch').offset;
	this.filterFrequency = this.get('frequency').offset;
	this.filterQ         = this.get('q').offset;

	this.get('pitch').start();
	this.get('frequency').start();
	this.get('q').start();

	// Note pool
	privates.notes = new Pool(Tone, isIdle, (note) => {
		this.get('pitchToDetune').connect(note['osc-1'].detune);
		this.get('pitchToDetune').connect(note['osc-2'].detune);
		this.get('frequency').connect(note.filterFrequency);
		this.get('q').connect(note.filterQ);
		note.connect(this.get('output'));
	});

	// Update settings
	assignSettings(this, defaults, settings);

	if (DEBUG) { printGroupEnd(); }
}

// Mix AudioObject prototype into MyObject prototype
assign(ToneSynth.prototype, NodeGraph.prototype, {
	create: function() {
		const privates = getPrivates(this);

		// Use this as the settings object
		return privates.notes.create(this.context, this);
	},

	start: function(time, number, velocity) {
		velocity = velocity === undefined ? 0.25 : velocity ;
		var frequency = numberToFrequency(config.tuning, number);
		const note = this.create();
		note.name - number;
		return note.start(time, frequency, velocity);
	},

	stop: function(time, number, velocity) {
		const privates = getPrivates(this);

		time = time || this.context.currentTime;

		// Stop all notes
		if (!isDefined(number)) {
			privates.notes.forEach(() => {
				note.stop(time, velocity);
			});

			return this;
		}

		const note = privates.notes.find((note) => {
			note.name === number && note.startTime !== undefined && note.stopTime === undefined
		});

		if (note) {
			note.stop(time, velocity);
		}

		return this;
	},

	destroy: function() {
		const privates = getPrivates(this);

		for (let note of privates.notes) {
			note.disconnect();
		}

		this.get('output').disconnect();
		return this;
	}
});

ToneSynth.defaults  = {
	filterQ:         { min: 0,   max: 100,   transform: 'quadratic',   value: 0.25 },
	filterFrequency: { min: 16,  max: 16000, transform: 'logarithmic', value: 16 }
};

export default ToneSynth;