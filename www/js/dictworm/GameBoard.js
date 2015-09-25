(function() {
	const TILE_SELECTED_CLASS = "selected";
	const TILE_DATA_ROW_KEY = "tilerow";
	const TILE_DATA_LAST_SELECTED_KEY = "timeselected";

	const COL_CLASS_NAME = "column";
	const COL_DATA_COLUMN_KEY = "column";
	const COL_DATA_LENGTH_KEY = "length";
	const LENGTH_LONG = "long";
	const LENGTH_SHORT = "short";

	const WORD_EL_ID = "gameboard-word";
	const WORD_SCORE_EL_ID = "gameboard-score";

	var GameBoard = {};

	/**
	 * Contains the distribution of letter frequency in the english language.
	 *
	 * @type {{ A: number, B: number, C: number, D: number, E: number, F: number, G: number, H: number, I: number, J: number, K: number, L: number, M: number, N: number, O: number, P: number, Qu: number, R: number, S: number, T: number, U: number, V: number, W: number, X: number, Y: number, Z: number}}
	 */
	GameBoard.Letter = {
		A: 8.167,
		B: 1.492,
		C: 2.782,
		D: 4.253,
		E: 12.702,
		F: 2.228,
		G: 2.015,
		H: 6.094,
		I: 6.966,
		J: 0.153,
		K: 0.772,
		L: 4.025,
		M: 2.406,
		N: 6.749,
		O: 7.507,
		P: 1.929,
		Qu: 0.095,
		R: 5.987,
		S: 6.327,
		T: 9.056,
		U: 2.758,
		V: 0.978,
		W: 2.361,
		X: 0.150,
		Y: 1.974,
		Z: 0.074
	};

	/**
	 * Provides utility methods for Letters
	 *
	 * @type {{getNewLetter: GameBoard.LetterUtil.getNewLetter}}
	 */
	GameBoard.LetterUtil = {
		/**
		 * Gets a new letter following the english distribution of letter usage.
		 *
		 * @returns {!String}
		 */
		getNewLetter: function() {
			var rand = Math.random() * 100;
			var rollingValue = 0;
			for (var key in GameBoard.Letter) {
				if (!GameBoard.Letter.hasOwnProperty(key)) {
					continue;
				}

				rollingValue += GameBoard.Letter[key];
				if (rollingValue > rand) {
					return key;
				}
			}

			return "?";
		}
	};

	/**
	 * Represents a gameboard column. Each column holds either 8 or 9 tiles depending on its
	 * position. This object provides utilities to add and remove tiles within the column that's
	 * represented by this object.
	 *
	 * @param {!HTMLElement} element The DOM element column.
	 * @constructor
	 */
	GameBoard.Column = function(element) {
		/** @type {!HTMLElement} The element that represents this column */
		this.element_ = element;
		/** @type {!HTMLElement[]} The tiles within this column */
		this.tiles_ = [];

		/**
		 * Adds the given tile to the top of this column.
		 *
		 * @param {!HTMLElement} tile The tile to add to this column.
		 */
		this.add = function(tile) {
			tile.dataset[TILE_DATA_ROW_KEY] = this.element_.children.length;
			(this.element_.children.length == 0)
					? this.element_.appendChild(tile)
					: this.element_.insertBefore(tile, this.element_.firstChild);
			this.tiles_.push(tile);
		};

		/**
		 * Creates a tile with the given letter and adds it to this column.
		 *
		 * @param {!String} letter The letter to add
		 */
		this.createAndAdd = function(letter) {
			var tile = document.createElement("div");
			tile.innerHTML = letter;
			this.add(tile);
		};

		/**
		 * Removes the given tile from this column, but doesn't refactor the column's tiles yet.
		 * This should be used if multiple tiles are removed from the column
		 * @param tile
		 */
		this.remove = function(tile) {

		};
	};

	/**
	 * Provides utility methods for Tiles.
	 *
	 * @type {{select: GameBoard.TileUtil.select, deselect: GameBoard.TileUtil.deselect, getRow: GameBoard.TileUtil.getRow, getColumn: GameBoard.TileUtil.getColumn, isInShortColumn: GameBoard.TileUtil.isInShortColumn, areAdjacent: GameBoard.TileUtil.areAdjacent}}
	 */
	GameBoard.TileUtil = {
		/**
		 * Plays the selection animation for the given tile, if it isn't already selected.
		 *
		 * @param {!HTMLElement} tile
		 */
		select: function(tile) {
			if (!tile.classList.contains(TILE_SELECTED_CLASS)) {
				tile.classList.add(TILE_SELECTED_CLASS);
			}
		},

		/**
		 * Plays the de-select animation for the given tile, if it's currently selected.
		 *
		 * @param {!HTMLElement} tile
		 */
		deselect: function(tile) {
			if (tile.classList.contains(TILE_SELECTED_CLASS)) {
				tile.classList.remove(TILE_SELECTED_CLASS);
			}
		},

		/**
		 * Returns the tile's row.
		 *
		 * @param {!HTMLElement} tile
		 * @return {!number}
		 */
		getRow: function(tile) {
			return (!!tile.dataset[TILE_DATA_ROW_KEY]) ? tile.dataset[TILE_DATA_ROW_KEY] : -1;
		},

		/**
		 * Returns the tile's column
		 *
		 * @param {!HTMLElement} tile
		 * @returns {!number}
		 */
		getColumn: function(tile) {
			return tile.parentNode.dataset[COL_DATA_COLUMN_KEY];
		},

		/**
		 * Returns if the tile is in a short column.
		 *
		 * @param {!HTMLElement} tile
		 * @returns {!boolean}
		 */
		isInShortColumn: function(tile) {
			return (tile.parentNode.dataset[COL_DATA_LENGTH_KEY] == LENGTH_SHORT);
		},

		/**
		 * Checks if the two tiles are adjacent to one another. Returns false if the same tile
		 * is passed for both arguments.
		 *
		 * @param {!HTMLElement} tile1
		 * @param {!HTMLElement} tile2
		 * @return {!boolean}
		 */
		areAdjacent: function(tile1, tile2) {
			if (tile1.isEqualNode(tile2)) {
				return false;
			}

			var tile1Col = this.getColumn(tile1);
			var tile2Col = this.getColumn(tile2);

			// More than 1 row apart
			if (Math.abs(tile1Col - tile2Col) > 1) {
				return false;
			}

			// Same row, must be above or below
			if (tile1Col == tile2Col) {
				return (Math.abs(this.getRow(tile1) - this.getRow(tile2)) == 1);
			}

			var tile1Row = this.getRow(tile1);
			var tile2Row = this.getRow(tile2);

			// Tile1 in short column, so tile 2 must be same number or below
			if (this.isInShortColumn(tile1)) {
				return (tile1Row == tile2Row || tile1Row + 1 == tile2Row);
			}

			// Otherwise, tile1 in long column, so tile2 must be above or same number
			return (tile1Row - 1 == tile2Row || tile1Row == tile2Row);
		}
	};

	/**
	 * Represents the logic for a Game.
	 *
	 * @constructor
	 */
	GameBoard.Logic = function() {
		// Begin constructor
		/** @type {!GameBoard.Column[]} */
		this.columns_ = [];
		/** @type {!HTMLElement} */
		this.gameboardScore = document.getElementById(WORD_SCORE_EL_ID);
		/** @type {!HTMLElement} */
		this.gameboardWord = document.getElementById(WORD_EL_ID);
		/** @type {!HTMLElement[]} */
		this.currentPath_ = [];
		// End constructor

		var columns = document.getElementsByClassName(COL_CLASS_NAME);
		assert(columns.length == 7, "Didn't find 7 columns when creating the game board.");
		for (var i = 0; i < columns.length; i++) {
			this.columns_[i] = new GameBoard.Column(columns[i]);
			var lettersToMake = (columns[i].dataset[COL_DATA_LENGTH_KEY] == LENGTH_LONG) ? 9 : 8;
			for (var j = 0; j < lettersToMake; j++) {
				this.columns_[i].createAndAdd(GameBoard.LetterUtil.getNewLetter())
			}
		}
	};


	window.GameBoard = GameBoard;
} ());
