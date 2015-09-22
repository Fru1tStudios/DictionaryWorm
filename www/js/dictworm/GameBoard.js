(function(window) {
	var GameBoard = {};

	GameBoard.Tile = function(position) {
		/** @type {!number} */
		this.position;
		/** @type {!HTMLElement} */
		this.element;

		/**
		 * Specifies a new game board tile that is part of a game board.
		 *
		 * @param {!HTMLElement} element The html element that corresponds to this tile.
		 */
		this.constructor = function(element) {
			this.position = -1;
		};
		this.constructor(position);

		/**
		 * Sets this tile's position to the given value.
		 *
		 * @param {!number} position The position of this tile.
		 */
		this.setPosition = function(position) {
			this.position = position;
		};
	};


	window.GameBoard = GameBoard;
} (window));
