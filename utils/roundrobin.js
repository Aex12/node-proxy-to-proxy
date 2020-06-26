'use strict';

function roundRobin (arr) {
	let i = 0;

	if (!Array.isArray(arr)) {
		throw new TypeError('array parameter must be an array');
	}

	return function () {
		if (i >= arr.length) i = 0;
		return arr[i++];
	};
}

module.exports = exports = roundRobin;