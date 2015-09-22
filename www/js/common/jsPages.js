(function(window) {
	const MAIN_ID = "main";
	const CAPTURE_CLASS = "page-link";
	const DATA_NAME = "page-link";

	/**
	 * jsPages is a library which provides easy organization between single-index websites.
	 */
	var jsPages = {};

	/**
	 * Represents an HTML page transformation. Each HTML page must have an accompanying javascript
	 * Page object associated to it in order to transition into/out of that page.
	 */
	jsPages.Page = function() {
		/** @type {?String} */ this.path_;
		/** @type {!function(HTMLElement)} */ this.openFn_;
		/** @type {!function(HTML5Element, function())} */ this.closeFn_;

		/**
		 * Creates a new default instance of a Page.
		 */
		this.constructor = function() {
			this.path_ = null;
			this.openFn_ = function(element) {};
			this.closeFn_ = function(element, callback) {
				callback();
			};
		};
		this.constructor();

		/**
		 * Sets the path for the HTML page this Page object represents. Returns this Page object for
		 * method chaining. The passed string should only be the page name from "www/pages" and
		 * without extension. Eg. if a page was located in "www/pages/other/MyPage.html", then
		 * string passed should be "other/MyPage".
		 *
		 * @param {!String} path
		 * @returns {!jsPages.Page} this
		 */
		this.setHtmlPath = function(path) {
			this.path_ = path;
			return this;
		};

		/**
		 * Sets the open function for this Page.
		 *
		 * @public
		 * @param {!function(HTMLElement)} transitionFn This function should accept an
		 * HTMLElement parameter to which it can use for selecting its elements for animation.
		 * @returns {!jsPages.Page} this
		 */
		this.setOpenFn = function(fn) {
			this.openFn_ = fn;
			return this;
		};

		/**
		 * Sets the closing function for this Page.
		 *
		 * @param {!function(HTMLElement, function())} fn This function's HTMLElement
		 * should be used to select the page's elements for animation. The function parameter
		 * must be called once all animations are complete.
		 * @returns {!jsPages.Page} this
		 */
		this.setCloseFn = function(fn) {
			this.closeFn_ = fn;
			return this;
		};

		/**
		 * Performs this page's animations to the given parent element.
		 *
		 * @param {!HTMLElement} element
		 */
		this.animateOpen = function(element) {
			this.openFn_(element);
		};

		/**
		 * Executes the transition-out function, or executes the callback if no transition is set.
		 *
		 * @param {!HTMLElement} element The parent element of the page.
		 * @param {!function()} callback The callback to execute once the page is cleaned up.
		 */
		this.animateClose = function(element, callback) {
			this.closeFn_(element, callback);
		};

		/**
		 * Returns the html page name associated to this Page object.
		 * @return {!String} The path of the HTML page.
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
	jsPages.Manager = {
		/** @type {?jsPages.Page} */ currentPage_: null,
		/** @type {?HTMLElement} */ currentPageNode_: null,
		/** @type {!{}} */ registeredPages_: {},

		/**
		 * Opens the given page on the screen.
		 *
		 * @param {String} id
		 */
		open: function(id) {
			var nextPage = this.registeredPages_[id];
			if (!nextPage) {
				throw id + " is not a valid page id.";
			}

			/** @type {!HTMLElement} */
			var newPageContainer = document.createElement("div");
			/** @type {!boolean} */
			var isOldPageClosed = false;
			/** @type {!boolean} */
			var isNewPageLoaded = false;
			/** @type {function()} */
			var completeTransition = function() {
				if (!isOldPageClosed || !isNewPageLoaded) {
					return;
				}

				var main = document.getElementById(MAIN_ID);
				while (main.firstChild) {
					main.removeChild(main.firstChild);
				}
				main.appendChild(newPageContainer);
				jsPages.Utility.setPageLinks();
				nextPage.animateOpen(newPageContainer);
			};

			// Load page
			$.ajax(
					jsPages.Utility.getFullUrl(nextPage),
					{
						success: function(data) {
							newPageContainer.innerHTML = data;
							isNewPageLoaded = true;
							completeTransition();
						}
					}
			);

			// Close old page
			if (!!this.currentPage_ && !!this.currentPageNode_) {
				this.currentPage_.animateClose(this.currentPageNode_, function() {
					isOldPageClosed = true;
					completeTransition();
				});
			} else {
				isOldPageClosed = true;
				completeTransition();
			}
		},

		/**
		 * Registers a Page associated to an identifier string.
		 *
		 * @param {String} id
		 * @param {jsPages.Page} page
		 */
		register: function(id, page) {
			if (!!this.registeredPages_[id]) {
				throw "Duplicate page entry: " + id;
			}
			this.registeredPages_[id] = page;
		}
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
			return "pages/" + page.getHtmlPath() + ".html";
		},

		setPageLinks: function() {
			$('.' + CAPTURE_CLASS).click(function() {
				jsPages.Manager.open($(this).attr('data-' + DATA_NAME));
			});
		}
	};

	// Add to window
	window.jsPages = jsPages;
} (window));
