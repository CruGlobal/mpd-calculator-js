(function ( module ) {
	'use strict';

	// Initialize Application Settings
	module.config( function ( SettingsProvider ) {
		SettingsProvider.setConfig( window.MPDCalculator.config );
	} );

	// Configure Debug Logging
	module.config( function ( $logProvider, SettingsProvider ) {
		$logProvider.debugEnabled( SettingsProvider.isDevelopment() );
	} );

	// Configure HTTP interceptors
	//module.config( function ( $httpProvider ) {
	//	$httpProvider.interceptors.push( 'Session' );
	//} );

	// Configure Growl
	module.config( function ( growlProvider ) {
		growlProvider.globalPosition( 'top-right' );
		growlProvider.globalDisableCountDown( true );
		growlProvider.globalTimeToLive( {success: 10000, error: -1, warning: -1, info: 10000} );
	} );

	module.config( function ( uiSelectConfig ) {
		uiSelectConfig.theme = 'bootstrap';
	} );

	module.run( function ( $log, $rootScope, $location ) {
		// Configure application for use in iFrame
		if ( typeof window.parent !== 'undefined' ) {
			var parentHash = window.parent.location.hash;
			if ( parentHash ) {
				$location.path( parentHash.slice( 1 ) );
			}

			$rootScope.$on( '$locationChangeSuccess', function () {
				console.log( '$locationChangeSuccess: ', $location.path() );
				window.parent.location.hash = '#' + $location.path();
			} );
		}

		$rootScope.$on( '$stateChangeError', function ( event, toState, toParams, fromState, fromParams, error ) {
			$log.error( '$stateChangeError:', toState, toParams, error );
		} );
	} );

})( angular.module( 'mpdCalculator' ) );
