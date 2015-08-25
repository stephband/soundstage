(function(window) {
	var MIDI = window.MIDI;

	var timeDiffs = [];

	var objectTriggers = {
		"noteon": function start(object, event) {
			object.start && object.start(event[0], event[2], event[3]);
		},

		"noteoff": function stop(object, event) {
			object.stop && object.stop(event[0], event[2]);
		},

		"note": function startstop(object, event) {
			object.start && object.start(event[0], event[2], event[3]);
			object.stop && object.stop(event[0] + event[4], event[2]);
		},

		"param": function automate(object, event) {
			object.automate(event[2], event[3], event[0], event[4], event[5]);
		},

		"pitch": function pitch(object, event) {
			// name, value, time, curve, duration
			object.pitch && object.automate("pitch", event[2], event[0], "linear", 0.08);
		}
	};

	function addToSequence(sequence, event, notes, time) {
		// Set the duration of already added "note" events
		if (event[1] === "noteoff") {
			note = notes[event[2]];

			if (note) {
				note[4] = sequence.beatAtTime(time) - note[0];
				notes[event[2]] = undefined;
			}

			// This note has already been added to the sequence. High-
			// tail it outta here.
			return;
		}

		// Cache "noteon" events as "note" events, ready for their
		// duration to be set by the next "noteoff" event.
		if (event[1] === "noteon") {
			event[0] = sequence.beatAtTime(event[0]);
			event[1] = "note";

			note = notes[event[2]];

			if (note) {
				note[4] = sequence.beatAtTime(time) - note[0];
			}

			notes[event[2]] = event;
		}

		// Add the event to sequence.
		sequence.add(event);
	}

	function EventDistributor(audio, object, sequence, midimap, keys) {
		var distributor = this;
		var midimap = assign({}, midimap);
		var notes = {};

		function distributeMIDI(message, time) {
			var currentTime = audio.currentTime;
			var event = MIDI.normalise(message, currentTime);
			var note;

			// Map controllers to params
			if (midimap && event[1] === "control" && midimap[event[2]]) {
				event[1] === "param";
				event[2] === midimap[event[2]];
			}

			// Trigger changes on audio objects
			if (object) {
				objectTriggers[type](object, event);
			}

			// Keep a note of the offset between audio time and
			// DOMHighResTimeStamp time
			EventDistributor.midiTimeOffset = currentTime - time / 1000;

			// Map "noteon" and "noteoff" events to "note" events
			if (sequence && distributor.recording) {
				addToSequence(sequence, event, notes, currentTime);
			}
		}

		if (MIDI) { MIDI.on(distributeMIDI); }

		function distributeSequenceEvent(event) {
			if (object) {
				objectTriggers[type](object, event);
			}

			if (MIDI && distributor.sendMIDI) {
				//var MIDI.denormalise(event);
				midi.send(event);
			}
		}

		if (sequence) { sequence.subscribe(distributeSequenceEvent); }

		function distributeKeys(event) {
			var currentTime = audio.currentTime;

			event[0] = currentTime;

			if (object) {
				objectTriggers[type](object, event);
			}

			if (MIDI && distributor.sendMIDI) {
				//var MIDI.denormalise(event);
				MIDI.send(event);
			}

			// Map "noteon" and "noteoff" events to "note" events
			if (sequence && distributor.recording) {
				addToSequence(sequence, event, notes, currentTime);
			}
		}

		if (keys) { keys.subscribe(distributeKeys); }

		this.recording = false;
		this.sendMIDI = false;

		Object.defineProperties(this, {
			midimap: {
				value: midimap,
				enumerable: true
			}
		});
	}

	window.EventDistributor = EventDistributor;
})(window);