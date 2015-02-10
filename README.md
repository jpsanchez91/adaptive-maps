<a name="module_AdaptiveMaps"></a>
# AdaptiveMaps for Meteor
Unified Google Maps API for web and mobile. 
Uses native Google Maps SDK on android and iOS through 
[phonegap-googlemaps-plugin](https://github.com/wf9a5m75/phonegap-googlemaps-plugin)

Also has built-in support for reactive map markers, inspired by 
[Live Google Maps for Meteor](https://github.com/singlow/meteor-live-maps/).

## Installation

	meteor add johanholmerin:adaptive-maps

## Simple example

	AdaptiveMaps.init(function () {
		var mapOptions = {
			mapTypeId: 'ROADMAP'
			camera: {
				latLng: new AdaptiveMaps.LatLng(59.3260728, 18.1047187),
				zoom: 12
			}
		}
		var adaptiveMap = new AdaptiveMaps.Map(document.getElementById('map'), mapOptions);

		adaptiveMap.addLiveMarkers({
			cursor: Markers.find(),
			transform: function (doc) {
				return {
					title: doc.name,
					position: new AdaptiveMaps.LatLng(doc.lat, doc.lon),
					foo: doc.bar
				}
			},
			onClick: function () {
				console.log('Bar: ' + this.get('foo'));
			}
		});
	});

## API Reference


* AdaptiveMaps
  * class: .Map
    * [new AdaptiveMaps.Map(element, [options])](#new_module_AdaptiveMaps.Map_new)
    * _instance_
      * [.addLiveMarkers(options)](#module_AdaptiveMaps.Map#addLiveMarkers) ⇒ <code>Object</code>
      * [.setCenter(latlng)](#module_AdaptiveMaps.Map#setCenter)
  * [.init([options], [callback])](#module_AdaptiveMaps.init)
  * [.LatLng(lat, lng)](#module_AdaptiveMaps.LatLng) ⇒ <code>Object</code>
  * [type: ~Point](#module_AdaptiveMaps..Point) → <code>Object</code>
  * [type: ~MarkerOptions](#module_AdaptiveMaps..MarkerOptions) → <code>Object</code>
  * [type: ~MapOptions](#module_AdaptiveMaps..MapOptions) → <code>Object</code>
  * [type: ~MapOptions.controls](#module_AdaptiveMaps.MapOptions.controls) → <code>Object</code>
  * [type: ~MapOptions.gestures](#module_AdaptiveMaps.MapOptions.gestures) → <code>Object</code>
  * [type: ~MapOptions.camera](#module_AdaptiveMaps.MapOptions.camera) → <code>Object</code>
  * [type: ~Icon](#module_AdaptiveMaps..Icon) → <code>Object</code>

<a name="new_module_AdaptiveMaps.Map_new"></a>
#### new AdaptiveMaps.Map(element, [options])
Constructs a map.


| Param | Type | Description |
| --- | --- | --- |
| element | <code>HTMLElement</code> | The element where the map should be rendered. |
| [options] | <code>Object</code> | Options to be passed to library, e.g. zoom. |

<a name="module_AdaptiveMaps.Map#addLiveMarkers"></a>
#### map.addLiveMarkers(options) ⇒ <code>Object</code>
Adds, updated and removes markers on the map.

**Returns**: <code>Object</code> - Live query handler with stop method.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.cursor | <code>Cursor</code> | Cursor for the markers. |
| [options.transform] | <code>function</code> | Function to modify the marker document. |
| [options.onClick] | <code>function</code> | Event listener for onClick event. |

<a name="module_AdaptiveMaps.Map#setCenter"></a>
#### map.setCenter(latlng)
Centers the map.


| Param | Type | Description |
| --- | --- | --- |
| latlng | <code>Object</code> | LatLng object from AdaptiveMaps.LatLng. |

<a name="module_AdaptiveMaps.init"></a>
### AdaptiveMaps.init([options], [callback])
Loads the appropiate Google Maps library.


| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Options to be passed to Google when loading Maps library.      Overrides properties set in Meteor.settings.public.google_maps. Web only. |
| [callback] | <code>function</code> | Function to be called when the library has loaded. |

<a name="module_AdaptiveMaps.LatLng"></a>
### AdaptiveMaps.LatLng(lat, lng) ⇒ <code>Object</code>
Generates the appropiate LatLng object.

**Returns**: <code>Object</code> - LatLng object  

| Param | Type | Description |
| --- | --- | --- |
| lat | <code>Number</code> | Latitude |
| lng | <code>Number</code> | Longitude |

<a name="module_AdaptiveMaps..Point"></a>
### type: AdaptiveMaps~Point → <code>Object</code>
**Properties**

| Name | Type |
| --- | --- |
| x | <code>Number</code> | 
| y | <code>Number</code> | 

<a name="module_AdaptiveMaps..MarkerOptions"></a>
### type: AdaptiveMaps~MarkerOptions → <code>Object</code>
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| icon | <code>[Icon](#module_AdaptiveMaps..Icon)</code> |  |
| title | <code>String</code> | TODO |
| snippet | <code>String</code> | TODO |
| position | <code>LatLng</code> |  |
| anchorPoint | <code>Point</code> | Position of the tip of the infoWindow. Relative from marker center. |
| draggable | <code>Boolean</code> |  |
| visible | <code>Boolean</code> |  |
| __Web Only__ |||
| animation | <code>Animation</code> | https://developers.google.com/maps/documentation/javascript/reference#Animation |
| clickable | <code>Boolean</code> |  |
| crossOnDrag | <code>Boolean</code> |  |
| cursor | <code>String</code> |  |
| opacity | <code>Number</code> |  |
| optimized | <code>Boolean</code> |  |
| place | <code>Place</code> | https://developers.google.com/maps/documentation/javascript/reference#Place |
| shape | <code>MarkerShape</code> | https://developers.google.com/maps/documentation/javascript/reference#MarkerShape |
| zIndex | <code>Number</code> |  |
| __Mobile Only__ |||
| flat | <code>Boolean</code> |  |
| styles | <code>Object</code> | https://github.com/wf9a5m75/phonegap-googlemaps-plugin/wiki/Marker#text-styling |

<a name="module_AdaptiveMaps..Icon"></a>
### type: AdaptiveMaps~Icon → <code>Object</code>
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| path | <code>SVGPath</code> |  |
| anchor | <code>Point</code> | Rotation origin. Relative from top left icon corner. |
| rotation | <code>Number</code> |  |
| fillColor | <code>String</code> |  |
| fillOpacity | <code>Number</code> | TODO |
| scale | <code>Number</code> | TODO |
| strokeColor | <code>String</code> | TODO |
| StrokeWeight | <code>Number</code> | TODO |
| __Mobile |  | Only__ |
| size | <code>Point</code> | __Required on mobile.__ |

<a name="module_AdaptiveMaps..MapOptions"></a>
### type: AdaptiveMaps~MapOptions → <code>Object</code>
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| backgroundColor | <code>String</code> |  |
| mapTypeId | <code>&#x27;ROADMAP&#x27;</code> \| <code>&#x27;HYBRID&#x27;</code> \| <code>&#x27;SATELLITE&#x27;</code> \| <code>&#x27;TERRAIN&#x27;</code> |  |
| MapOptions.controls | <code>[MapOptions.controls](#module_AdaptiveMaps.MapOptions.controls)</code> |  |
| MapOptions.gestures | <code>[MapOptions.gestures](#module_AdaptiveMaps.MapOptions.gestures)</code> | __Mobile Only__ |
| MapOptions.camera | <code>[MapOptions.camera](#module_AdaptiveMaps.MapOptions.camera)</code> |  |
| __Mobile Only__ |||
| disableDefaultUI | <code>Boolean</code> |  |
| disableDoubleClickZoom | <code>Boolean</code> |  |
| draggable | <code>Boolean</code> |  |
| draggableCursor | <code>String</code> |  |
| draggingCursor | <code>String</code> |  |
| heading | <code>Number</code> |  |
| keyboardShortcuts | <code>Boolean</code> |  |
| mapMaker | <code>Boolean</code> |  |
| mapTypeControl | <code>Boolean</code> |  |
| mapTypeControlOptions | <code>MapTypeControlOptions</code> | https://developers.google.com/maps/documentation/javascript/reference#MapTypeControlOptions |
| maxZoom | <code>Number</code> |  |
| minZoom | <code>Number</code> |  |
| noClear | <code>Boolean</code> |  |
| overviewMapControl | <code>Boolean</code> |  |
| overviewMapControlOptions | <code>OverviewMapControlOptions</code> | https://developers.google.com/maps/documentation/javascript/reference#OverviewMapControlOptions |
| panControl | <code>Boolean</code> |  |
| panControlOptions | <code>PanControlOptions</code> | https://developers.google.com/maps/documentation/javascript/reference#PanControlOptions |
| rotateControl | <code>Boolean</code> |  |
| rotateControlOptions | <code>RotateControlOptions</code> | https://developers.google.com/maps/documentation/javascript/reference#RotateControlOptions |
| scaleControl | <code>Boolean</code> |  |
| scaleControlOptions | <code>ScaleControlOptions</code> | https://developers.google.com/maps/documentation/javascript/reference#ScaleControlOptions |
| scrollwheel | <code>Boolean</code> |  |
| streetView | <code>StreetViewPanorama</code> | https://developers.google.com/maps/documentation/javascript/reference#StreetViewPanorama |
| streetViewControl | <code>Boolean</code> |  |
| streetViewControlOptions | <code>StreetViewControlOptions</code> | https://developers.google.com/maps/documentation/javascript/reference#StreetViewControlOptions |
| styles | <code>Array.&lt;MapTypeStyle&gt;</code> | https://developers.google.com/maps/documentation/javascript/reference#MapTypeStyle |
| zoomControlOptions | <code>ZoomControlOptions</code> | https://developers.google.com/maps/documentation/javascript/reference#ZoomControlOptions |

<a name="module_AdaptiveMaps.MapOptions.controls"></a>
### type: AdaptiveMaps~MapOptions.controls → <code>Object</code>
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| zoom | <code>Boolean</code> |  |
| __Mobile Only__ |||
| compass | <code>Boolean</code> |  |
| myLocationButton | <code>Boolean</code> |  |
| indoorPicker | <code>Boolean</code> |  |

<a name="module_AdaptiveMaps.MapOptions.gestures"></a>
### type: AdaptiveMaps~MapOptions.gestures → <code>Object</code>
__Mobile Only__

**Properties**

| Name | Type |
| --- | --- |
| scroll | <code>Boolean</code> | 
| tilt | <code>Boolean</code> | 
| rotate | <code>Boolean</code> | 
| zoom | <code>Boolean</code> | 

<a name="module_AdaptiveMaps.MapOptions.camera"></a>
### type: AdaptiveMaps~MapOptions.camera → <code>Object</code>
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| latLng | <code>LatLng</code> |  |
| tilt | <code>Number</code> |  |
| zoom | <code>Number</code> |  |
| bearing | <code>Number</code> | __Mobile Only__ |

<a name="module_AdaptiveMaps..Icon"></a>
### type: AdaptiveMaps~Icon → <code>Object</code>
Icon for use with Marker

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| path | <code>SVGPath</code> |  |
| anchor | <code>Point</code> | Rotation origin. Relative from top left icon corner. |
| rotation | <code>Number</code> |  |
| fillColor | <code>String</code> |  |
| fillOpacity | <code>Number</code> | TODO |
| scale | <code>Number</code> | TODO |
| strokeColor | <code>String</code> | TODO |
| strokeWeight | <code>Number</code> | TODO |
| __Mobile |  | Only__ |
| size | <code>Size</code> | __Required on mobile.__ |