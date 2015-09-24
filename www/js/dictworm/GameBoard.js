(function(window) {
	var GameBoard = {};

	/**
	 * Represents a gameboard tile (letter). Each tile represents a single letter on the board.
	 * The tile object will never change letters, and thus, be destroyed when the letter on the
	 * game board is used.
	 *
	 * @param {!HTMLElement} element The element this tile is.
	 * @constructor
	 */
	GameBoard.Tile = function(element) {
		/** @type {!HTMLElement} */
		this.element_ = element;

		/**
		 * Animates this tile out with the given function that must handle the callback.
		 *
		 * @param {!function(!HTMLElement, !function())} fn
		 * @param {!function()} callback
		 */
		this.animateOutWithFn = function(fn, callback) {
			fn(element, callback);
		};
	};


	window.GameBoard = GameBoard;
} (window));
