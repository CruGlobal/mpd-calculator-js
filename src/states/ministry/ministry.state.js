(function ( module ) {
	'use strict';

	module.config( function ( $stateProvider ) {

		$stateProvider.state( 'ministry', {
			abstract: true,
			parent:   'app',
			url:      '{min_code}',
			resolve:  {
				'ministry': function ( $log, $q, $state, $stateParams, $localStorage, ministries ) {
					var deferred = $q.defer();
					// Unknown min_code
					if ( angular.isUndefined( $stateParams.min_code ) || $stateParams.min_code === '' ) {
						$state.go( 'select' );
						deferred.reject();
					}
					else {
						var ministry = _.findWhere( ministries, {min_code: $stateParams.min_code} );

						if ( angular.isUndefined( ministry ) ) {
							// Ministry is not a valid WHQ Ministry
							$state.go( 'select' );
							deferred.reject();
						}
						else {
							// Save ministry_id to localStorage, this allows the app to remember your last ministry
							$localStorage.ministry_id = ministry.ministry_id;
							deferred.resolve( ministry );
						}
					}
					return deferred.promise;
				},
				'isAdmin': function ( $log, session, ministry ) {
					return ministry.is_admin;
				}
			}
		} );
	} );

})( angular
	.module( 'mpdCalculator.states.ministry', [
		// Dependencies
		'ui.router',
		'ngStorage',
		'mpdCalculator.api.mpdCalculator',
		'ui.bootstrap.typeahead',
		'ui.bootstrap.tpls',

		// Required States
		'mpdCalculator.states.app',
		'mpdCalculator.states.select'
	] ) );


