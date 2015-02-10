Package.describe({
	name: 'johanholmerin:adaptive-maps',
	version: '0.1.0',
	summary: 'Unified Google Maps API for web and mobile.',
	git: 'https://github.com/johanholmerin/adaptive-maps.git',
	documentation: 'README.md'
});

Package.onUse(function(api) {
	api.addFiles('johanholmerin:adaptive-maps.js', 'client');

	api.use([
		'mrt:googlemaps',
		'mdg:geolocation',
		'underscore'
	], 'client');

	Cordova.depends({
		'plugin.google.maps': '1.2.4'
	});

	api.export('AdaptiveMaps');
});
