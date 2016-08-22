/**
 * Unified Google Maps API for web and mobile. 
 * Uses native Google Maps SDK on android and iOS through 
 * [phonegap-googlemaps-plugin](https://github.com/wf9a5m75/phonegap-googlemaps-plugin)
 * 
 * Also has built-in support for reactive map markers, inspired by 
 * [Live Google Maps for Meteor](https://github.com/singlow/meteor-live-maps/).
 *
 * ## Installation
 *
 * 	meteor add johanholmerin:adaptive-maps
 *
 * ## Simple example
 * 
 * 	AdaptiveMaps.init(function () {
 * 		var mapOptions = {
 * 			mapTypeId: 'ROADMAP'
 * 			camera: {
 * 				latLng: new AdaptiveMaps.LatLng(59.3260728, 18.1047187),
 * 				zoom: 12
 * 			}
 * 		}
 * 		var adaptiveMap = new AdaptiveMaps.Map(document.getElementById('map'), mapOptions);
 * 
 * 		adaptiveMap.addLiveMarkers({
 * 			cursor: Markers.find(),
 * 			transform: function (doc) {
 * 				return {
 * 					title: doc.name,
 * 					position: new AdaptiveMaps.LatLng(doc.lat, doc.lon),
 * 					foo: doc.bar
 * 				}
 * 			},
 * 			onClick: function () {
 * 				console.log('Bar: ' + this.get('foo'));
 * 			}
 * 		});
 * 	});
 *
 * ## API Reference
 *
 * @module AdaptiveMaps
 *
 */

AdaptiveMaps = {};

/**
 * @type {Object}
 * @private
 */
var map;

/**
 * @typedef {Object} Point
 * @property {Number} x
 * @property {Number} y
 */

/**
 * Loads the appropiate Google Maps library.
 * @function module:AdaptiveMaps.init
 * @param {Object} [options] - Options to be passed to Google when loading Maps library. 
 *     Overrides properties set in Meteor.settings.public.google_maps. Web only.
 * @param {Function} [callback] - Function to be called when the library has loaded.
 */
AdaptiveMaps.init = function (options, callback) {
	var callback = callback || options,
	    options;

	if (typeof options === 'function') 
		options = {};

	_.defaults(options, (Meteor.settings &&
	                   Meteor.settings.public &&
	                   Meteor.settings.public.google_maps));

	if (Meteor.isCordova) {
		map = plugin.google.maps.Map.getMap();
		map.on(plugin.google.maps.event.MAP_READY, callback);
	} else {
		GoogleMaps.initialize(options, callback);
	}
}

/**
 * Generates the appropiate LatLng object.
 * @function module:AdaptiveMaps.LatLng
 * @param {Number} lat - Latitude
 * @param {Number} lng - Longitude
 * @returns {Object} LatLng object
 */
AdaptiveMaps.LatLng = function (lat, lng) {
	if (Meteor.isCordova) {
		return new plugin.google.maps.LatLng(lat, lng);
	} else {
		return new google.maps.LatLng(lat, lng);
	}
}

/**
 * Constructs a map.
 * @class module:AdaptiveMaps.Map
 * @param {HTMLElement} element - The element where the map should be rendered.
 * @param {Object} [options] - Options to be passed to library, e.g. zoom.
 */
AdaptiveMaps.Map = function (element, options) {
	var self = this;
	self._markers = {};

	if (! (self instanceof AdaptiveMaps.Map)) {
		throw new Error("AdaptiveMaps.Map needs to be called with the new keyword");
	}

	if (Meteor.isCordova) {
		options.mapTypeId = plugin.google.maps.MapTypeId[options.mapTypeId];
		self.originalMap = self.originalMap || map;
		self.originalMap.setOptions(options);
		self.originalMap.setDiv(element);
	} else {
		options.mapTypeId = google.maps.MapTypeId[options.mapTypeId];
		// transform properties
		if (options.controls)
			options.zoomControl = options.controls.zoom;
		if (options.camera) {
			options.center = options.camera.latLng;
			options.tilt = options.camera.tilt;
			options.zoom = options.camera.zoom;
		}
		self.originalMap = self.originalMap || new google.maps.Map(element, options);
	}
}

/**
 * Adds, updated and removes markers on the map.
 * @function module:AdaptiveMaps.Map#addLiveMarkers
 * @param {Object} options
 * @param {Cursor} options.cursor - Cursor for the markers.
 * @param {Function} [options.transform] - Function to modify the marker document.
 * @param {Function} [options.onClick] - Event listener for onClick event.
 * @returns {Object} Live query handler with stop method.
 */
AdaptiveMaps.Map.prototype.addLiveMarkers = function (options) {
	var self = this,
	    cursor = options.cursor,
	    transform = options.transform || function (doc) { return doc; },
	    onClick = options.onClick,
			handle;

		handle = cursor.observe({
			added: function (doc) {
				var _id = doc._id,
				    doc = AdaptiveMaps._transformMarker(doc, transform),
				    marker;

				if (Meteor.isCordova) {
					self.originalMap.addMarker(doc, function (marker) {
						marker.setIcon({
							url: doc.icon,
							size: doc.size
						});
						marker.setInfoWindowAnchor(doc.infoWindowAnchor[0], doc.infoWindowAnchor[1]);
						marker.setIconAnchor(doc.anchor.x, doc.anchor.y);

						marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, onClick);
						self._markers[_id] = marker;
					});
				} else {
					_.extend(doc, { map: self.originalMap });
					var marker = new google.maps.Marker(doc);
					google.maps.event.addListener(marker, 'click', onClick);
					self._markers[_id] = marker;
				}
			},
			changed: function (doc) {
				var _id = doc._id,
				    doc = AdaptiveMaps._transformMarker(doc, transform),
				    marker = self._markers[_id];

				if (Meteor.isCordova) {
					_.each(doc, function (value, key) {
						var setKey;

						// special cases
						if (key === 'icon') {
							marker.setIcon({ url: value, size: doc.size });
						} else if (key === 'infoWindowAnchor') {
							marker.setInfoWindowAnchor(value[0], value[1]);
						} else if (key === 'anchor') {
							marker.setIconAnchor(doc.anchor.x, doc.anchor.y);

						// most cases
						} else {
							// modify with method if possible
							setKey = 'set' + key.charAt(0).toUpperCase() + key.substring(1);
							if (typeof marker[setKey] === 'function')
								marker[setKey](value);
							else
								marker.set(key, value);
						}
					});
				} else {
					_.extend(doc, { map: self.originalMap });
					marker.setOptions(doc);
				}
			},
			removed: function (doc) {
				var marker = self._markers[doc._id];

				if (Meteor.isCordova) {
					marker.remove();
				} else {
					marker.setMap(null);
				}
				delete self._markers[doc._id];
			}
		});

		return handle;
}

/**
 * Centers the map.
 * @function module:AdaptiveMaps.Map#setCenter
 * @param {Object} latlng - LatLng object from AdaptiveMaps.LatLng.
 */
AdaptiveMaps.Map.prototype.setCenter = function (latLng) {
	var self = this;
	self.originalMap.setCenter(latLng);
}



AdaptiveMaps._transformMarker = function (doc, transform) {
	var doc = transform(doc),
	    newDoc = {};

	// no transform needed on web
	if (!Meteor.isCordova)
		return doc;

	// rename properties
	if (doc.icon) {
		if (doc.anchorPoint && doc.icon.size) {
			// phonegap calculates from top left, web from center
			newDoc.infoWindowAnchor = [
				doc.anchorPoint.x + doc.icon.size.width/2,
				doc.anchorPoint.y + doc.icon.size.height/2
			];
			delete doc.anchorPoint;
		}
		newDoc.icon = AdaptiveMaps._pathToBase64Png(doc.icon);
		newDoc.size = doc.icon.size;
		if (doc.icon.anchor)
			newDoc.anchor = doc.icon.anchor;
		if (doc.icon.rotation)
			newDoc.rotation = doc.icon.rotation;
	}
	_.defaults(newDoc, doc);

	return newDoc;
}

// http://jsfiddle.net/handtrix/YvQ5y/
// http://www.html5rocks.com/en/tutorials/canvas/hidpi/
AdaptiveMaps._pathToBase64Png = function (icon) {
	var path = icon.path,
	    color = icon.fillColor,
	    size = icon.size,

	// get the canvas and context
	    canvas = document.createElement('canvas'),
	    ctx = canvas.getContext('2d'),
	
	// prepare fake image, svg and result
	    img = new Image,
			svg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"  width="' 
			    + size.width + '" height="'+ size.height + '" viewBox="0 0 ' + size.width 
					+ ' ' + size.height + '"><path d="' + path + '" fill="' + color 
					+ '"/></svg>',
			dataUrl,

	// make sure we get 1:1 pixels
	// query the various pixel ratios
	    devicePixelRatio = window.devicePixelRatio || 1,
	    backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
	                        ctx.mozBackingStorePixelRatio ||
	                        ctx.msBackingStorePixelRatio ||
	                        ctx.oBackingStorePixelRatio ||
	                        ctx.backingStorePixelRatio || 1,

	    ratio = devicePixelRatio / backingStoreRatio;

	img.src = svg;

	// upscale...
	canvas.height = img.height * ratio;
	canvas.width = img.width * ratio;

	// and scale back
	ctx.scale(ratio, ratio);

	ctx.drawImage(img,0,0);
	dataURL = canvas.toDataURL('image/png');

	return dataURL;
}


/**
 * @typedef {Object} MarkerOptions
 * @property {Icon} icon
 * @property {String} title - TODO
 * @property {String} snippet - TODO
 * @property {LatLng} position
 * @property {Point} anchorPoint - Position of the tip of the infoWindow. Relative from marker center.
 * @property {Boolean} draggable
 * @property {Boolean} visible
 * @property {}  __Web Only__
 * @property {Animation} animation - https://developers.google.com/maps/documentation/javascript/reference#Animation
 * @property {Boolean} clickable
 * @property {Boolean} crossOnDrag
 * @property {String} cursor
 * @property {Number} opacity
 * @property {Boolean} optimized
 * @property {Place} place - https://developers.google.com/maps/documentation/javascript/reference#Place 
 * @property {MarkerShape} shape - https://developers.google.com/maps/documentation/javascript/reference#MarkerShape
 * @property {Number} zIndex
 * @property {}  __Mobile Only__
 * @property {Boolean} flat
 * @property {Object} styles - https://github.com/wf9a5m75/phonegap-googlemaps-plugin/wiki/Marker#text-styling
 */

/**
 * @typedef {Object} Icon
 * @property {SVGPath} path
 * @property {Point} anchor - Rotation origin. Relative from top left icon corner.
 * @property {Number} rotation
 * @property {String} fillColor
 * @property {Number} fillOpacity - TODO
 * @property {Number} scale - TODO
 * @property {String} strokeColor - TODO
 * @property {Number} StrokeWeight - TODO
 * @property {}   __Mobile Only__
 * @property {Point} size - __Required on mobile.__
 */

/**
 * @typedef {Object} MapOptions
 * @property {String} backgroundColor
 * @property {'ROADMAP'|'HYBRID'|'SATELLITE'|'TERRAIN'} mapTypeId
 * @property {MapOptions.controls} MapOptions.controls
 * @property {MapOptions.gestures} MapOptions.gestures - __Mobile Only__
 * @property {MapOptions.camera} MapOptions.camera
 * @property {}  __Web Only__
 * @property {Boolean} disableDefaultUI
 * @property {Boolean} disableDoubleClickZoom
 * @property {Boolean} draggable
 * @property {String} draggableCursor
 * @property {String} draggingCursor
 * @property {Number} heading
 * @property {Boolean} keyboardShortcuts
 * @property {Boolean} mapMaker
 * @property {Boolean} mapTypeControl
 * @property {MapTypeControlOptions} mapTypeControlOptions - https://developers.google.com/maps/documentation/javascript/reference#MapTypeControlOptions
 * @property {Number} maxZoom
 * @property {Number} minZoom
 * @property {Boolean} noClear
 * @property {Boolean} overviewMapControl
 * @property {OverviewMapControlOptions} overviewMapControlOptions - https://developers.google.com/maps/documentation/javascript/reference#OverviewMapControlOptions
 * @property {Boolean} panControl
 * @property {PanControlOptions} panControlOptions - https://developers.google.com/maps/documentation/javascript/reference#PanControlOptions
 * @property {Boolean} rotateControl
 * @property {RotateControlOptions} rotateControlOptions - https://developers.google.com/maps/documentation/javascript/reference#RotateControlOptions
 * @property {Boolean} scaleControl
 * @property {ScaleControlOptions} scaleControlOptions - https://developers.google.com/maps/documentation/javascript/reference#ScaleControlOptions
 * @property {Boolean} scrollwheel
 * @property {StreetViewPanorama} streetView - https://developers.google.com/maps/documentation/javascript/reference#StreetViewPanorama
 * @property {Boolean} streetViewControl
 * @property {StreetViewControlOptions} streetViewControlOptions - https://developers.google.com/maps/documentation/javascript/reference#StreetViewControlOptions
 * @property {MapTypeStyle[]} styles - https://developers.google.com/maps/documentation/javascript/reference#MapTypeStyle
 * @property {ZoomControlOptions} zoomControlOptions - https://developers.google.com/maps/documentation/javascript/reference#ZoomControlOptions 
 */

/**
 * @typedef {Object} MapOptions.controls
 * @property {Boolean} zoom
 * @property {}  __Mobile Only__
 * @property {Boolean} compass
 * @property {Boolean} myLocationButton
 * @property {Boolean} indoorPicker
 */

/**
 * __Mobile Only__
 * @typedef {Object} MapOptions.gestures
 * @property {Boolean} scroll
 * @property {Boolean} tilt
 * @property {Boolean} rotate
 * @property {Boolean} zoom
 */

/**
 * @typedef {Object} MapOptions.camera
 * @property {LatLng} latLng
 * @property {Number} tilt
 * @property {Number} zoom
 * @property {Number} bearing - __Mobile Only__
 */

/**
 * Icon for use with Marker
 * @typedef {Object} Icon
 * @property {SVGPath} path
 * @property {Point} anchor - Rotation origin. Relative from top left icon corner.
 * @property {Number} rotation
 * @property {String} fillColor
 * @property {Number} fillOpacity - TODO
 * @property {Number} scale - TODO
 * @property {String} strokeColor - TODO
 * @property {Number} strokeWeight - TODO
 * @property {}  __Mobile Only__
 * @property {Size} size - __Required on mobile.__
 */


/**
 * @license
 * ## License
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Johan Holmerin
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
