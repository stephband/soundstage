
import { last } from '../../fn/fn.js';
import { timeAtDomTime } from './context.js';

// 60 frames/sec frame rate
const frameDuration = 1000 / 60;

// Config

export const config = {
    automationEventsKey: 'automationEvents',

    // Value considered to be 0 for the purposes of scheduling
    // exponential curves.
    minExponentialValue: 1.40130e-45,

    // Multiplier for duration of target events indicating roughly when
    // they can be considered 'finished'
    targetDurationFactor: 9
};

export const methodNames = {
	"step":        "setValueAtTime",
	"linear":      "linearRampToValueAtTime",
	"exponential": "exponentialRampToValueAtTime",
	"target":      "setTargetAtTime"
};

export const curves = {
    "equalpowerin": function equalpowerin(t) {
        return Math.pow(t, 0.5);
    },

    "equalpowerout": function equalpowerout(t) {
        return Math.pow(1 - t, 0.5);
    }
};

export function isAudioContext(object) {
	return window.AudioContext && window.AudioContext.prototype.isPrototypeOf(object);
}

export function isAudioNode(object) {
	return window.AudioNode && window.AudioNode.prototype.isPrototypeOf(object);
}

export function isAudioParam(object) {
	return window.AudioParam && window.AudioParam.prototype.isPrototypeOf(object);
}




// Polyfill cancelAndHoldAtTime
//
// Todo - this polyfill is not finished. This algorithm needs to be
// implemented:
//
// https://www.w3.org/TR/webaudio/#dom-audioparam-cancelandholdattime

if (!AudioParam.prototype.cancelAndHoldAtTime) {
    AudioParam.prototype.cancelAndHoldAtTime = function cancelAndHoldAtTime(time) {
    	const param  = this;
        const events = getAutomationEvents(param);
    	const tValue = getValueAtTime(events, time);

        while (events[--n] && events[n][0] >= time);

    	const event1 = events[n];
    	const event2 = events[n + 1];
    	const tCurve = event2[2];

    	console.log(event1, event2, tValue);
    	console.log(methodNames[curve], value, time, duration);

        param.cancelScheduledValues(time);
    	param[methodNames[tCurve]](tValue, time);
    }
}


// Automate audio param

function getObjectParam(name, object) {
    console.log('TODO: get param ' + name + ' of audio-object ', object);
}

export function getParam(name, node) {
    // Support Audio Objects, for now
    return isAudioObject(node) ?
        getObjectParam(node, name) :
        node[name] ;
}

export function getAutomationEvents(param) {
    if (DEBUG && !AudioParam.prototype.isPrototypeOf(param)) {
        throw new Error('Not an AudioParam ' + JSON.stringify(param));
    }

	// Todo: I would love to use a WeakMap to store data about AudioParams,
	// but FF refuses to allow AudioParams as WeakMap keys. So... lets use
	// an expando *sigh*.
	return param[config.automationEventsKey] || (param[config.automationEventsKey] = []);
}

function automateParamEvents(param, events, time, value, curve, duration) {
	curve = curve || "step";

	var n = events.length;
	while (events[--n] && events[n].time >= time);

    // Before and after events
	var event0 = events[n];
	var event1 = events[n + 1];

    // Deal with exponential curves starting or ending with value 0. Swap them
    // for step curves, which is what they tend towards for low values.
    // Todo: deal with -ve values.
	if (curve === "exponential") {
		if (value <= config.minExponentialValue) {
			time = event0 ? event0.time : 0 ;
			curve = "step";
		}
		else if (event0 && event0.value < config.minExponentialValue) {
			curve = "step";
		}

        // Schedule the param event
    	param.exponentialRampToValueAtTime(value, time, duration);
	}
    else if (curve === "equalpowerin") {
        curve = "curve";
        const m = Math.round(duration * 44100 / 64);
        const values = new Float64Array(m);
        let n = m;

        while (n--) {
            values[n] = curves['equalpowerin'](n / m) * value;
        }

        param.setValueCurveAtTime(values, time, duration);
        value = values;
    }
    else if (curve === "equalpowerout") {
        curve = "curve";
        const startValue = getValueAtTime(param, time);
        const m = Math.round(duration * 44100 / 32);
        const values = new Float64Array(m);
        let n = m;

        while (n--) {
            values[n] = curves['equalpowerout'](n / m) * startValue;
        }

        param.setValueCurveAtTime(values, time, duration);
        value = values;
    }
    else if (curve === "hold") {
        // Schedule the param event
    	param.cancelAndHoldAtTime(time);
        value = getValueAtTime(param, time);
        curve = event1 && event1.curve === 'exponential' ?
            'exponential' :
            'step' ;
        events.length = n + 1;
        events.push({ time, value, curve, duration });
        return;
    }
    else {
        // Schedule the param event
    	param[methodNames[curve]](value, time, duration);
    }

	// Keep events organised as AudioParams do
	var event = { time, value, curve, duration };

	// If the new event is at the end of the events list
	if (!event1) {
		events.push(event);
		return;
	}

	// Where the new event is at the same time as an existing event...
	if (event1.time === time) {
        // scan forward through events at this time...
		while (events[++n] && events[n].time === time) {
            // and if an event with the same curve is found, replace it...
			if (events[n].curve === curve) {
				events.splice(n, 1, event);
				return;
			}
		}

        // or tack it on the end of those events.
		events.splice(n - 1, 0, event);
        return;
	}

	// The new event is between event1 and event2
	events.splice(n + 1, 0, event);
}

/*
automate(param, time, value, curve, decay)

param - AudioParam object
time  -
value -
curve - one of 'step', 'hold', 'linear', 'exponential' or 'target'
decay - where curve is 'target', decay is a time constant for the decay curve
*/

export function automate(param, time, curve, value, duration, notify, context) {
    //console.log('AUTOMATE', arguments[5], time, curve, value, duration, param);
	var events = getAutomationEvents(param);
	automateParamEvents(param, events, time, value, curve, duration);

    if (!notify || !context) {
        console.warn('No notify for param change', value, curve, param);
        return;
    }

    // If param is flagged as already notifying, do nothing
    if (param.animationFrame) { return; }

    // Notify at half frame rate
    function frame2(time) {
        param.animationFrame = requestAnimationFrame(frame1);
    }

    function frame1(time) {
        const renderTime = time + frameDuration;
        const outputTime = timeAtDomTime(context, renderTime);
        const outputValue = getValueAtTime(param, outputTime);

        notify(param, 'value', outputValue);

        if (events[events.length - 1].time < outputTime) {
            param.animationFrame = undefined;

            requestAnimationFrame(function f() {
                // getValueAtTime is inaccurate, even up the value
                // to the actual latest value
                notify(param, 'value', param.value);
            });

            return;
        }

        param.animationFrame = requestAnimationFrame(frame2);
    }

    param.animationFrame = requestAnimationFrame(frame1);
}

export function getAutomationEndTime(events) {
    const event = last(events);

    return event ?
        event[1] === 'target' ?
            event[0] + event[3] * config.targetDurationFactor :
        event[0] :
    0 ;
}

// Get audio param value at time

const interpolate = {
	// Automation curves as described at:
	// http://webaudio.github.io/web-audio-api/#h4_methods-3

	'step': function stepValueAtTime(value1, value2, time1, time2, time) {
		return time < time2 ? value1 : value2 ;
	},

	'linear': function linearValueAtTime(value1, value2, time1, time2, time) {
		return value1 + (value2 - value1) * (time - time1) / (time2 - time1) ;
	},

	'exponential': function exponentialValueAtTime(value1, value2, time1, time2, time) {
		return value1 * Math.pow(value2 / value1, (time - time1) / (time2 - time1)) ;
	},

	'target': function targetEventsValueAtTime(value1, value2, time1, time2, time, duration) {
		return time < time2 ?
			value1 :
			value2 + (value1 - value2) * Math.pow(Math.E, (time2 - time) / duration);
	},

    'curve': function(value1, value2, time1, time2, time, duration) {
        // Todo
    }
};

function getValueBetweenEvents(event1, event2, time) {
	var curve  = event2.curve;
	return interpolate[curve](event1.value, event2.value, event1.time, event2.time, time, event1.duration);
}

function getEventsValueAtEvent(events, n, time) {
	var event = events[n];
	return event.curve === "target" ?
		interpolate.target(getEventsValueAtEvent(events, n - 1, event.time), event.value, 0, event.time, time, event.decay) :
		event.value ;
}

export function getEventsValueAtTime(events, time) {
	var n = events.length;

	while (events[--n] && events[n].time >= time);

	var event0 = events[n];
	var event1 = events[n + 1];

    // Time is before the first event in events
	if (!event0) {
		return 0;
	}

    // Time is at or after the last event in events
	if (!event1) {
		return getEventsValueAtEvent(events, n, time);
	}

	if (event1.time === time) {
		// Scan through to find last event at this time
		while (events[++n] && events[n].time === time);
		return getEventsValueAtEvent(events, n - 1, time) ;
	}

	if (time < event1.time) {
		return event1.curve === "linear" || event1.curve === "exponential" ?
			getValueBetweenEvents(event0, event1, time) :
			getEventsValueAtEvent(events, n, time) ;
	}
}

export function getValueAtTime(param, time) {
	var events = getAutomationEvents(param);

	if (!events || events.length === 0) {
		return param.value;
	}

	return getEventsValueAtTime(events, time);
}


/*
requestAutomationData(param, rate, t0, t1)

rate   - data points per second
t0     - start time
t1     - stop time
events - array of automation events to render to data
*/

export function requestBufferFromEvents(rate, t0, t1, events) {
    const sampleRate  = 22050;
    const sampleScale = rate / sampleRate;
    const length  = Math.floor(sampleRate * (t1 - t0) * sampleScale + 1);
    const context = new OfflineAudioContext(1, length, sampleRate);
    const source  = new ConstantSourceNode(context);
    const param   = source.offset;

    source.connect(context.destination);
    source.start(0);
    source.stop(t1 - t0);

    let n = -1;

    // Skip events before t0
    while (events[++n] && events[n].time < t0);
    --n;

    // Todo: calculate current start value
    if (events[n]) {
        automate(param, events[n].time * sampleScale, events[n].curve, events[n].value, events[n].decay * sampleScale);
        //param.setValueAtTime(events[n].value, events[n].time * sampleScale);
    }

    // Process events from t0 to t1
    while (events[++n] && events[n].time < t1) {
        //console.log(n, events[n]);
        automate(param, (events[n].time - t0) * sampleScale, events[n].curve, events[n].value, events[n].decay && events[n].decay * sampleScale);
        //param[methodNames[events[n].curve]](events[n].value, (events[n].time - t0) * sampleScale, events[n].decay * sampleScale);
    }

    // Process final event following t1
    if (events[n]) {
        automate(param, (events[n].time - t0) * sampleScale, events[n].curve, events[n].value, events[n].decay * sampleScale);
        //param[methodNames[events[n].curve]](events[n].value, (events[n].time - t0) * sampleScale, events[n].decay * sampleScale);
    }

    return context.startRendering();
}

function bufferToChannel0(buffer) {
    return buffer.getChannelData(0);
}

export function requestAutomationData(param, rate, t0, t1) {
    const events = getAutomationEvents(param);
    return requestBufferFromEvents(rate, t0, t1, events)
    .then(bufferToChannel0);
}
