(function ( module ) {
	'use strict';

	module.config( function ( $stateProvider ) {

		$stateProvider.state( 'select', {
			parent:  'app',
			url:     '',
			resolve: {
				// This resolve checks if a ministry is defined in localStorage, if so it transitions to the budgets
				// state and skips the select state. If undefined, it resolves the promise.
				'ministry': function ( $log, $q, $state, $localStorage, ministries ) {
					var deferred    = $q.defer(),
						ministry_id = $localStorage.ministry_id || undefined;
					if ( angular.isUndefined( ministry_id ) ) {
						deferred.resolve( false );
					}
					else {
						var ministry = _.findWhere( ministries, {ministry_id: ministry_id} );
						if ( angular.isUndefined( ministry ) ) {
							// ministry_id is set but not found, remove it from localStorage
							delete $localStorage.ministry_id;
							deferred.resolve( false );
						}
						else {
							$state.transitionTo( 'budgets', {min_code: ministry.min_code} );
							deferred.reject();
						}
					}
					return deferred.promise;
				}
			},
			views:   {
				'ministry@app': {
					templateUrl: 'states/select/select.html',
					controller:  'SelectMinistryController'
				},
				'@app':         {
					templateUrl: 'states/select/content.html'
				}
			}
		} );
	} );

})( angular
	.module( 'mpdCalculator.states.select', [
		// Dependencies
		'ui.router',
		'ngStorage',
		'mpdCalculator.api.measurements',
		'ui.bootstrap.typeahead',
		'ui.bootstrap.tpls',

		// Required States
		'mpdCalculator.states.app',
		'mpdCalculator.states.budgets'
	] ) );
