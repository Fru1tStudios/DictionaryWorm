(function() {
	/**
	 * States an assertion and throws an error if it fails.
	 *
	 * @param {!boolean} cond
	 * @param {!String} message
	 * @constructor
	 */
	window.assert = function(cond, message) {
		if (!cond) {
			throw message;
		}
	};
} ());
