(function() {
	'use strict';

	window.$ = {};


	// localStorage + JSON wrapper:
	$.storage = {
		get: function(prop) {
			return JSON.parse(localStorage.getItem(prop));
		},
		set: function(prop, val) {
			localStorage.setItem(prop, JSON.stringify(val));
		},
		has: function(prop) {
			return localStorage.hasOwnProperty(prop);
		},
		remove: function(prop) {
			localStorage.removeItem(prop);
		},
		clear: function() {
			localStorage.clear();
		}
	};


	// DOM Helpers:

	$.id = document.getElementById.bind(document);

	$.on = function(target, type, callback) {
		target.addEventListener(type, callback, false);
	};


	// Loop through an array of data objects,
	// render each data object as an element with data inserted using the renderer,
	// append each element to a documentFragment, and return the documentFragment:
	$.renderMultiple = function(arr, renderer) {
		var renderedEls = [].map.call(arr, renderer);
		var docFrag = document.createDocumentFragment();
		var l = renderedEls.length;
		for (var i = 0; i < l; i++) docFrag.appendChild(renderedEls[i]);
		return docFrag;
	};


	// http://jsbin.com/DOMBuilder/2/edit
	$.DOM = {
		buildNode: function buildNode(nodeData) {
			if (typeof nodeData === 'string')
				return document.createTextNode(nodeData);
			var el = document.createElement(nodeData.el || 'div');
			for (var attr in nodeData) {
				if (['el', 'kid', 'kids'].indexOf(attr) === -1) {
					if (attr[0] === '_') el[attr.slice(1)] = nodeData[attr];
					else if (attr.slice(0,3) === 'on_') {
						var eventName = attr.slice(3);
						var handlers = nodeData[attr];
						for (var i = 0; i < handlers.length; i++) el.addEventListener(eventName, handlers[i]);
					}
					else el.setAttribute(attr, nodeData[attr]);
				}
			}
			if (nodeData.kid) el.appendChild(buildNode(nodeData.kid));
			else if (nodeData.kids) el.appendChild($.DOM.buildDocFrag(nodeData.kids));
			return el;
		},
		buildDocFrag: function buildDocFrag(arr) {
			var docFrag = document.createDocumentFragment();
			arr.forEach(function appendEach(nodeData) {
				docFrag.appendChild($.DOM.buildNode(nodeData));
			});
			return docFrag;
		}
	};
})();