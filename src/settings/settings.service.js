(function ( module ) {
	'use strict';

	module.provider( 'Settings', function () {
		var config = {};

		this.setConfig = function ( c ) {
			config = c;
		};

		this.isDevelopment = function () {
			return config.environment === 'development';
		};

		function apiUrl( base, path ) {
			if ( typeof path === 'undefined' ) return base;
			return ( path.indexOf( '/' ) === 0 )
				? base + path
				: base + '/' + path;
		}

		this.$get = function () {
		    return {
		        locale: config.locale,
				api:    {
					measurements: function ( path ) {
						return apiUrl( config.api.measurements, path );
					}
				},
				ticket: config.ticket
			};
		}
	} );

})( angular.module( 'mpdCalculator.settingsService', [] ) );
