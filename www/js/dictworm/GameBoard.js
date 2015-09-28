(function() {
	const DOUBLE_TAP_SUBMIT_TIME = 350;

	const MINIMUM_WORD_LENGTH = 3;

	const TILE_ANIMATE_OUT_CLASS = "animate-out";
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
	const WORD_TOTAL_SCORE_EL_ID = "gameboard-total-score";

	var GameBoard = {};

	/**
	 * Contains the distribution of letters as well as each letter value.
	 *
	 * @type {{A: {frequency: number, points: number}, B: {frequency: number, points: number}, C: {frequency: number, points: number}, D: {frequency: number, points: number}, E: {frequency: number, points: number}, F: {frequency: number, points: number}, G: {frequency: number, points: number}, H: {frequency: number, points: number}, I: {frequency: number, points: number}, J: {frequency: number, points: number}, K: {frequency: number, points: number}, L: {frequency: number, points: number}, M: {frequency: number, points: number}, N: {frequency: number, points: number}, O: {frequency: number, points: number}, P: {frequency: number, points: number}, Qu: {frequency: number, points: number}, R: {frequency: number, points: number}, S: {frequency: number, points: number}, T: {frequency: number, points: number}, U: {frequency: number, points: number}, V: {frequency: number, points: number}, W: {frequency: number, points: number}, X: {frequency: number, points: number}, Y: {frequency: number, points: number}, Z: {frequency: number, points: number}}}
	 */
	GameBoard.Letter = {
		A: { frequency: 8.167, points: 1 },
		B: { frequency: 1.492, points: 3 },
		C: { frequency: 2.782, points: 3 },
		D: { frequency: 4.253, points: 2 },
		E: { frequency: 12.702, points: 1 },
		F: { frequency: 2.228, points: 4 },
		G: { frequency: 2.015, points: 2 },
		H: { frequency: 6.094, points: 4 },
		I: { frequency: 6.966, points: 1 },
		J: { frequency: 0.153, points: 8 },
		K: { frequency: 0.772, points: 5 },
		L: { frequency: 4.025, points: 1 },
		M: { frequency: 2.406, points: 3 },
		N: { frequency: 6.749, points: 1 },
		O: { frequency: 7.507, points: 1 },
		P: { frequency: 1.929, points: 3 },
		Qu: { frequency: 0.095, points: 11 },
		R: { frequency: 5.987, points: 1 },
		S: { frequency: 6.327, points: 1 },
		T: { frequency: 9.056, points: 1 },
		U: { frequency: 2.758, points: 1 },
		V: { frequency: 0.978, points: 4 },
		W: { frequency: 2.361, points: 4 },
		X: { frequency: 0.150, points: 8 },
		Y: { frequency: 1.974, points: 4 },
		Z: { frequency: 0.074, points: 10 }
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

				rollingValue += GameBoard.Letter[key].frequency;
				if (rollingValue > rand) {
					return key;
				}
			}

			return "?";
		}
	};

	/**
	 * Provides utility methods for Tiles.
	 *
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
		 * Animates the given tile out of the field.
		 *
		 * @param {!HTMLElement} tile The tile to animate out.
		 * @param {?function()} [callback]
		 */
		animateOut: function(tile, callback) {
			tile.classList.add(TILE_ANIMATE_OUT_CLASS);
			if (!!callback) {
				setTimeout(callback, Constants.CSS_ANIMATE_TIME_RESPONSIVE);
			}
		},

		/**
		 * Returns if the passed tile is selected.
		 *
		 * @param {!HTMLElement} tile.
		 * @return {!boolean} If the passed tile is selected.
		 */
		isSelected: function(tile) {
			return tile.classList.contains(TILE_SELECTED_CLASS);
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

			var tile1Row = parseInt(this.getRow(tile1));
			var tile2Row = parseInt(this.getRow(tile2));

			// Tile1 in short column, so tile 2 must be same number or below
			if (this.isInShortColumn(tile1)) {
				return (tile1Row == tile2Row || tile1Row + 1 == tile2Row);
			}

			// Otherwise, tile1 in long column, so tile2 must be above or same number
			return (tile1Row - 1 == tile2Row || tile1Row == tile2Row);
		}
	};

	/**
	 * Represents a gameboard column. Each column holds either 8 or 9 tiles depending on its
	 * position. This object provides utilities to add and remove tiles within the column that's
	 * represented by this object.
	 *
	 * @param {!HTMLElement} element The DOM element column.
	 * @class
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
			tile.addEventListener(
					'click', function() { GameBoard.Game.tileClickEventHandler(this); });
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
		this.addLetter = function(letter) {
			var tile = document.createElement("div");
			tile.innerHTML = letter;
			this.add(tile);
		};

		/**
		 * Removes the given tile from this column.
		 *
		 * @param {!HTMLElement} tile
		 */
		this.remove = function(tile) {
			GameBoard.TileUtil.animateOut(tile);
			// TODO(note): This is potentially unsupported.
			var tileIndex = this.tiles_.indexOf(tile);
			this.element_.removeChild(this.tiles_[tileIndex]);
			this.tiles_.splice(tileIndex, 1);

			for (var i = tileIndex; i < this.tiles_.length; i++) {
				this.tiles_[i].dataset[TILE_DATA_ROW_KEY] = i;
			}
		};

		/**
		 * Clears this column.
		 */
		this.reset = function() {
			while (this.element_.firstChild) {
				this.element_.removeChild(this.element_.firstChild);
			}
			this.tiles_ = [];
		};
	};

	/**
	 * Represents the logic for a Game.
	 *
	 * @class
	 */
	GameBoard.Logic = function() {
		// Begin constructor
		/** @type {!GameBoard.Column[]} */
		this.columns_ = [];
		/** @type {!HTMLElement} */
		this.gameboardScoreElement_ = document.getElementById(WORD_SCORE_EL_ID);
		/** @type {!HTMLElement} */
		this.gameboardWordElement_ = document.getElementById(WORD_EL_ID);
		/** @type {!HTMLElement} */
		this.gameboardTotalScoreElement_ = document.getElementById(WORD_TOTAL_SCORE_EL_ID);
		/** @type {!HTMLElement[]} */
		this.currentPath_ = [];
		/** @type {!number} */
		this.gameScore_ = 0;
		// End constructor

		/**
		 * Resets the game board, producing a new set of tiles within each column.
		 */
		this.reset = function() {
			var columns = document.getElementsByClassName(COL_CLASS_NAME);
			assert(columns.length == 7, "Didn't find 7 columns when creating the game board.");
			for (var i = 0; i < columns.length; i++) {
				this.columns_[i] = new GameBoard.Column(columns[i]);

				var lettersToMake = (columns[i].dataset[COL_DATA_LENGTH_KEY] == LENGTH_LONG) ? 9 : 8;
				for (var j = 0; j < lettersToMake; j++) {
					this.columns_[i].addLetter(GameBoard.LetterUtil.getNewLetter())
				}
			}
		};
		this.reset();

		/**
		 * Returns if the given parameter is a valid English word.
		 *
		 * @param {!String} word
		 * @returns {!boolean} If the given parameter is a valid English word.
		 */
		this.isValidWord = function(word) {
			return true;
		};

		/**
		 * Handles an attempt at submitting a word.
		 *
		 * @returns {!boolean}
		 * @private
		 */
		this.handleWordSubmit_ = function() {
			// Calculate result and score
			var word = "";
			var score = 0;
			var currentLetter = "";
			for (var i = 0; i < this.currentPath_.length; i++) {
				currentLetter = this.currentPath_[i].innerHTML.toUpperCase();
				score += GameBoard.Letter[currentLetter].points;
				word += currentLetter;
			}

			// Check validity
			if (!this.isValidWord(word)) {
				// TODO(v1): Update message
				GameBoard.Game.showError("Invalid word");
				return false;
			}

			// Add score
			this.gameScore_ += score;
			this.gameboardTotalScoreElement_.innerHTML = this.gameScore_.toString();

			// Remove from game board + add new letters
			var tileCol = -1;
			for (var i = 0; i < this.currentPath_.length; i++) {
				tileCol = GameBoard.TileUtil.getColumn(this.currentPath_[i]);
				this.columns_[tileCol].addLetter(GameBoard.LetterUtil.getNewLetter());
				this.columns_[tileCol].remove(this.currentPath_[i]);
			}

			// Finally, remove from current path
			this.currentPath_ = [];

			return true;
		};

		/**
		 * Handles the business end of a tile being clicked on. Should be called every tile click.
		 *
		 * @param {!HTMLElement} tile The tile that was clicked.
		 */
		this.handleTileClick = function(tile) {
			var justSelected = false;
			// Select if not selected
			if (!GameBoard.TileUtil.isSelected(tile)) {
				// Tile is current not selected and needs to be selected.
				if (this.currentPath_.length == 0
						|| GameBoard.TileUtil.areAdjacent(
								this.currentPath_[this.currentPath_.length - 1], tile)) {
					this.currentPath_.push(tile);
					GameBoard.TileUtil.select(tile);
					justSelected = true;
				} else {
					return;
				}
			}

			// TODO(note): Use of .indexOf
			var tileIndexInPath = this.currentPath_.indexOf(tile);

			// Check if double clicked
			if (!!tile.dataset[TILE_DATA_LAST_SELECTED_KEY]
					&& this.currentPath_.length >= MINIMUM_WORD_LENGTH
					&& (tileIndexInPath == -1 || tileIndexInPath == this.currentPath_.length - 1)
					&& Date.now() - parseInt(tile.dataset[TILE_DATA_LAST_SELECTED_KEY])
							< DOUBLE_TAP_SUBMIT_TIME) {
				if (!this.handleWordSubmit_()) {
					return;
				}
			}

			tile.dataset[TILE_DATA_LAST_SELECTED_KEY] = Date.now();
			if (GameBoard.TileUtil.isSelected(tile) && !justSelected) {
				// Tile is currently selected and needs to be deselected
				var tilesToRemove = this.currentPath_.splice(tileIndexInPath);
				tilesToRemove.forEach(function (tile) {
					GameBoard.TileUtil.deselect(tile);
				});
			}

			var word = "";
			var score = 0;
			var currentLetter = "";
			for (var i = 0; i < this.currentPath_.length; i++) {
				currentLetter = this.currentPath_[i].innerHTML.toUpperCase();
				score += GameBoard.Letter[currentLetter].points;
				word += currentLetter;
			}
			this.gameboardWordElement_.innerHTML = word;
			this.gameboardScoreElement_.innerHTML = score.toString();
		};
	};

	/**
	 * Entry methods for DictionaryWorm games
	 */
	GameBoard.Game = {
		/** @type {?GameBoard.Logic} */
		logicInstance_: null,

		newGame: function() {
			this.logicInstance_ = new GameBoard.Logic();
		},

		tileClickEventHandler: function(tile) {
			this.logicInstance_.handleTileClick(tile);
		},

		showError: function(error) {
			// TODO(v1): Implement better ui for errors
			alert(error);
		}
	};

	window.GameBoard = GameBoard;
} ());
