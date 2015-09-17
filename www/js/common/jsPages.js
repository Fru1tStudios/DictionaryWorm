(function(window) {
	/**
	 * jsPages is a library which provides easy organization between single-index websites.
	 */
	var jsPages = {};
	var MAIN_ID = "main";

	/**
	 * Represents an HTML page transformation. Each HTML page must have an accompanying javascript
	 * Page object associated to it in order to transition into/out of that page.
	 */
	jsPages.Page = function() {
		/** @type {String} */
		this.path_ = null;
		/** @type {function()} */
		this.transitionInFn_ = null;
		/** @type {function(function())} */
		this.transitionOutFn_ = null;

		/**
		 * Creates a new instance of a Page.
		 */
		this.constructor = function() { };

		/**
		 * Sets the path for the HTML page this Page object represents. Returns this Page object for
		 * method chaining. The passed string should only be the page name from "www/pages" and
		 * without extension. Eg. if a page was located in "www/pages/other/MyPage.html", then
		 * string passed should be "other/MyPage".
		 *
		 * @param {String} path
		 * @returns {jsPages.Page} this
		 */
		this.setHtmlPath = function(path) {
			this.path_ = path;
			return this;
		};

		/**
		 * Sets the transition in function for this Page.
		 *
		 * @param {function()} transitionFn The function to execute.
		 * @returns {jsPages.Page} this
		 */
		this.setInFn = function(transitionFn) {
			this.transitionInFn_ = transitionFn;
			return this;
		};

		/**
		 * Sets the transition out function for this Page.
		 *
		 * @param {function(function())} transitionFn The function to execute. The function must
		 * accept a parameter that is called when all animations are complete.
		 * @returns {jsPages.Page} this
		 */
		this.setOutFn = function(transitionFn) {
			this.transitionOutFn_ = transitionFn;
			return this;
		};

		/**
		 * Executes the transition-in function, or executes the callback if no transition is set.
		 */
		this.playIn = function() {
			var self = this;
			// TODO(v1): Make a function to load this so that Manager can load while transition
			// out occurs on the previous page.
			jsPages.Utility.loadPageContents(this, function(data) {
				document.getElementById(MAIN_ID).appendChild(data);

				// Call transition if one is available.
				if (!!this.transitionInFn_) {
					this.transitionInFn_()
				}
			});
		};

		/**
		 * Executes the transition-out function, or executes the callback if no transition is set.
		 *
		 * @param {function()} callback The callback to execute once the page is cleaned up.
		 */
		this.playOut = function(callback) {
			var self = this;
			(!!this.transitionOutFn_)
					? this.transitionOutFn_(function() { self.cleanUp_(callback); })
					: this.cleanUp_(callback);
		};

		/**
		 * Cleans up main for the next Page.
		 *
		 * @private
		 * @param {function()} callback The function to execute once the cleanup is complete.
		 */
		this.cleanUp_ = function(callback) {
			document.getElementById(MAIN_ID).innerHTML = "";
			callback();
		};

		/**
		 * Returns the html page name associated to this Page object.
		 * @return {String} The path of the HTML page.
		 */
		this.getHtmlPath = function() {
			if (this.path_ == null) {
				throw "Page loader path never set.";
			}
			return this.path_;
		};
	};

	/**
	 * Represents the underlying organizer of jsPages.
	 */
	jsPages.Manager = function() {
		/** @type {jsPages.Page} */
		this.currentPage = null;

		/**
		 * Opens the given page on the screen.
		 *
		 * @param transition
		 */
		this.open = function(page) {
			var self = this;
			(!!this.currentPage)
					? this.currentPage.playOut(function() { self.completeTransition_(page); })
					: self.completeTransition_(page);
		};

		this.completeTransition_ = function(page) {
			page.playIn();
		};
	};

	/**
	 * Contains utility methods for jsPages
	 */
	jsPages.Utility = {
		/**
		 * Gets the entire HTML URL that represents the given jsPages.Page object.
		 *
		 * @param {jsPages.Page} page
		 */
		getFullUrl: function(page) {
			return "/pages/" + page.getHtmlPath() + ".html";
		},

		/**
		 * Loads the page contents and calls the given callback with the data returned.
		 *
		 * @param {jsPages.Page} page
		 * @param {function(String)} callback
		 */
		loadPageContents: function(page, callback) {
			$.ajax(
					jsPages.Utility.getFullUrl(page),
					{
						success: function(data) {
							callback(data);
						}
					});
		}
	};

	// Add to window
	window.jsPages = jsPages;
} (window));
