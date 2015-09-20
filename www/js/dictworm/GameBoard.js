(function(window) {
	var GameBoard = {};

	GameBoard.Tile = function(position) {
		/** @type {!number} */
		this.position;

		this.constructor = function(position) {
			this.position = position;
		};
		this.constructor(position);


	};

	window.GameBoard = GameBoard;
} (window));
