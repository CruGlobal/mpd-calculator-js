(function ( module ) {
	'use strict';

	module.factory( 'Session', function ( $injector, $q, $log, Settings ) {
		var token,
			session;

		return {
			getSession:    function () {
				var deferred = $q.defer();
				if ( angular.isDefined( session ) ) {
					deferred.resolve( session );
				}
				else {
					$injector.get( '$http' )
						.get( Settings.api.measurements( '/token' ), {params: {st: Settings.ticket}} )
						.then( function ( response ) {
							token = response.data.session_ticket;
							session = response.data;
							deferred.resolve( session );
						}, function ( reason ) {
							deferred.reject( reason );
						} );
				}
				return deferred.promise;
			},
			request:       function ( config ) {
				if ( config.url.indexOf( Settings.api.measurements() ) === 0 ) {
					$log.debug( 'Measurements API Request', config );

					// Enable HTTP Credentials for measurements API requests
					config.withCredentials = true;

					// Add token to request as Authorization Bearer
					if ( !angular.isUndefined( token ) ) {
						config.headers['Authorization'] = 'Bearer ' + token;
					}
				}
				return config;
			},
			responseError: function ( response ) {
				return $q.reject( response );
			}
		}
	} );
})( angular.module( 'mpdCalculator.api.measurements' ) );
