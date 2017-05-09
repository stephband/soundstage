	// Event types
	//
	// [time, "note", number, velocity, duration]
	// [time, "noteon", number, velocity]
	// [time, "noteoff", number]
	// [time, "param", name, value, curve]
	// [time, "pitch", semitones]
	// [time, "chord", root, mode, duration]
	// [time, "sequence", data || name, rate, startBeat, duration, address]

	var sequence = [
		// 160bpm
		[0,        'rate', 0.25],
		[0,        'note', 12, 1, 0.025],
		[0.041667, 'note', 14, 1, 0.025],
		[0.083333, 'note', 16, 1, 0.025],
		[0.125,    'note', 18, 1, 0.025],
		[0.166667, 'note', 20, 1, 0.025],
		[0.208333, 'note', 22, 1, 0.025],
		[0.25,     'note', 24, 1, 0.025],

		[0.25,     'param', 'gain', 0.0625, 'step'],
		[0.291667, 'param', 'test', 0.5,    'linear'],
		[0.333333, 'param', 'gain', 0.125,  'linear'],
		[0.375,    'param', 'test', 0.75,   'step'],
		[0.416667, 'param', 'gain', 0.0001, 'exponential'],
		[0.416667, 'param', 'test', 0.625,  'exponential'],

		[0.5,      'note', 24, 1, 0.025],
		[0.5,      'sequence', [
			[0,        'rate', 2],
			[0,        'note', 32, 1, 0.025],
			[0.041667, 'note', 34, 1, 0.025],
			[0.083333, 'note', 36, 1, 0.025],
			[0.125,    'note', 38, 1, 0.025],
			[0.166667, 'note', 40, 1, 0.025],
			[0.208333, 'note', 42, 1, 0.025],
			[0.25,     'note', 44, 1, 0.025],
			[0.5,      'note', 44, 1, 0.025],
			[0.75,     'note', 44, 1, 0.025],
			[1,        'note', 44, 1, 0.025],
			[1.25,     'note', 44, 1, 0.025],
			[1.5,      'note', 44, 1, 0.025],
			[1.75,     'note', 44, 1, 0.025],
			[2,        'note', 44, 1, 0.025],
			[2.25,     'note', 44, 1, 0.025],
			[2.5,      'note', 44, 1, 0.025],
			[2.75,     'note', 44, 1, 0.025],
			[3,        'note', 44, 1, 0.025],
			[3,        'sequence', [
				[0,        'rate', 1.5],
				[0,        'sequence', [
					[0,        'rate', 1.33333333],
					[0,        'note', 72, 1, 0.025],
					[0.041667, 'note', 74, 1, 0.025],
					[0.083333, 'note', 76, 1, 0.025],
					[0.125,    'note', 78, 1, 0.025],
					[0.166667, 'note', 80, 1, 0.025],
					[0.208333, 'note', 82, 1, 0.025],
					[0.25,     'note', 84, 1, 0.025],
					[0.5,      'note', 84, 1, 0.025],
					[0.75,     'note', 84, 1, 0.025],
					[1,        'note', 84, 1, 0.025],
					[1.25,     'note', 84, 1, 0.025],
					[1.5,      'note', 84, 1, 0.025],
					[1.75,     'note', 84, 1, 0.025],
					[2,        'note', 84, 1, 0.025],
					[2.25,     'note', 84, 1, 0.025],
					[2.5,      'note', 84, 1, 0.025],
					[2.75,     'note', 84, 1, 0.025],
					[3,        'note', 84, 1, 0.025],
					[3.25,     'note', 84, 1, 0.025],
					[3.5,      'note', 84, 1, 0.025],
					[3.75,     'note', 84, 1, 0.025],
				]],
				[0,        'note', 52, 1, 0.025],
				[0.041667, 'note', 54, 1, 0.025],
				[0.083333, 'note', 56, 1, 0.025],
				[0.125,    'note', 58, 1, 0.025],
				[0.166667, 'note', 60, 1, 0.025],
				[0.208333, 'note', 62, 1, 0.025],
				[0.25,     'note', 64, 1, 0.025],
				[0.5,      'note', 64, 1, 0.025],
				[0.75,     'note', 64, 1, 0.025],
				[1,        'note', 64, 1, 0.025],
				[1.25,     'note', 64, 1, 0.025],
				[1.5,      'note', 64, 1, 0.025],
				[1.75,     'note', 64, 1, 0.025],
				[2,        'note', 64, 1, 0.025],
				[2.25,     'note', 64, 1, 0.025],
				[2.5,      'note', 64, 1, 0.025],
				[2.75,     'note', 64, 1, 0.025],
				[3,        'note', 64, 1, 0.025],
				[3.25,     'note', 64, 1, 0.025],
				[3.5,      'note', 64, 1, 0.025],
				[3.75,     'note', 64, 1, 0.025],
			]],
			[3.25,     'note', 44, 1, 0.025],
			[3.5,      'rate', 1],
			[3.5,      'note', 44, 1, 0.025],
			[3.75,     'note', 44, 1, 0.025],
			[4,        'rate', 2],
			[4,        'note', 44, 1, 0.025],
			[4.25,     'note', 44, 1, 0.025],
			[4.5,      'note', 44, 1, 0.025],
			[4.75,     'note', 44, 1, 0.025],
			[5,        'note', 44, 1, 0.025],
			[5.25,     'note', 44, 1, 0.025],
			[5.5,      'note', 44, 1, 0.025],
			[5.75,     'note', 44, 1, 0.025],
			[6,        'note', 44, 1, 0.025],
		]],
		[0.5,      'sequence', [
			[0,        'rate', 3],
			[0,        'note', 52, 1, 0.025],
			[0.041667, 'note', 54, 1, 0.025],
			[0.083333, 'note', 56, 1, 0.025],
			[0.125,    'note', 58, 1, 0.025],
			[0.166667, 'note', 60, 1, 0.025],
			[0.208333, 'note', 62, 1, 0.025],
			[0.25,     'note', 64, 1, 0.025],
			[0.5,      'note', 64, 1, 0.025],
			[0.75,     'note', 64, 1, 0.025],
			[1,        'note', 64, 1, 0.025],
			[1.25,     'note', 64, 1, 0.025],
			[1.5,      'note', 64, 1, 0.025],
			[1.75,     'note', 64, 1, 0.025],
			[2,        'note', 64, 1, 0.025],
			[2.25,     'note', 64, 1, 0.025],
			[2.5,      'note', 64, 1, 0.025],
			[2.75,     'note', 64, 1, 0.025],
			[3,        'note', 64, 1, 0.025],
			[3.25,     'note', 64, 1, 0.025],
			[3.5,      'note', 64, 1, 0.025],
			[3.75,     'note', 64, 1, 0.025],
		]],
		[0.5,      'sequence', [
			[0,        'rate', 4],
			[0,        'note', 72, 1, 0.025],
			[0.041667, 'note', 74, 1, 0.025],
			[0.083333, 'note', 76, 1, 0.025],
			[0.125,    'note', 78, 1, 0.025],
			[0.166667, 'note', 80, 1, 0.025],
			[0.208333, 'note', 82, 1, 0.025],
			[0.25,     'note', 84, 1, 0.025],
			[0.5,      'note', 84, 1, 0.025],
			[0.75,     'note', 84, 1, 0.025],
			[1,        'note', 84, 1, 0.025],
			[1.25,     'note', 84, 1, 0.025],
			[1.5,      'note', 84, 1, 0.025],
			[1.75,     'note', 84, 1, 0.025],
			[2,        'note', 84, 1, 0.025],
			[2.25,     'note', 84, 1, 0.025],
			[2.5,      'note', 84, 1, 0.025],
			[2.75,     'note', 84, 1, 0.025],
			[3,        'note', 84, 1, 0.025],
			[3.25,     'note', 84, 1, 0.025],
			[3.5,      'note', 84, 1, 0.025],
			[3.75,     'note', 84, 1, 0.025],
		]],
		[0.5,      'sequence', [
			[0,        'rate', 6],
			[0,        'note', 92, 1, 0.025],
			[0.041667, 'note', 94, 1, 0.025],
			[0.083333, 'note', 96, 1, 0.025],
			[0.125,    'note', 98, 1, 0.025],
			[0.166667, 'note', 100, 1, 0.025],
			[0.208333, 'note', 102, 1, 0.025],
			[0.25,     'note', 104, 1, 0.025],
			[0.5,      'note', 104, 1, 0.025],
			[0.75,     'note', 104, 1, 0.025],
			[1,        'note', 104, 1, 0.025],
			[1.25,     'note', 104, 1, 0.025],
			[1.5,      'note', 104, 1, 0.025],
			[1.75,     'note', 104, 1, 0.025],
			[2,        'note', 104, 1, 0.025],
			[2.25,     'note', 104, 1, 0.025],
			[2.5,      'note', 104, 1, 0.025],
			[2.75,     'note', 104, 1, 0.025],
			[3,        'note', 104, 1, 0.025],
			[3.25,     'note', 104, 1, 0.025],
			[3.5,      'note', 104, 1, 0.025],
			[3.75,     'note', 104, 1, 0.025],
		]],
		[0.75,     'note', 24, 1, 0.025],
		[1,        'rate', 2],
		[1,        'note', 24, 1, 0.025],
		[1.25,     'note', 24, 1, 0.025],
		[1.5,      'note', 24, 1, 0.025],
		[1.75,     'note', 24, 1, 0.025],
		[2,        'note', 24, 1, 0.025],
		[2.25,     'note', 24, 1, 0.025],
		[2.5,      'note', 24, 1, 0.025],
		[2.75,     'note', 24, 1, 0.025],
		[3,        'note', 24, 1, 0.025],
		[3.25,     'note', 24, 1, 0.025],
		[3.5,      'note', 24, 1, 0.025],
		[3.75,     'note', 24, 1, 0.025],
	];