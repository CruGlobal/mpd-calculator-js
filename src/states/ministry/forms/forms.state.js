(function ( module ) {
	'use strict';

	module.config( function ( $stateProvider ) {
		$stateProvider.state( 'forms', {
			parent:  'ministry',
			url:     '/forms',
			resolve: {
				'forms': function ( $log, $stateParams, $state, session, MPDForms, ministry, isAdmin ) {
					if ( !isAdmin ) {
						$state.go( 'budgets' );
					}

					return MPDForms.query( {
						ministry_id:    ministry.ministry_id,
						show_inactive:  true,
						include_global: true
					} ).$promise;
				}
			},
			views:   {
				'sidebar@app':  {
					templateUrl: 'states/ministry/forms/sidebar.html',
					controller:  'FormsSidebarController'
				},
				'ministry@app': {
					templateUrl: 'states/ministry/change-ministry.html',
					controller:  'ChangeMinistryController'
				}
			}
		} );
	} );

})( angular
	.module( 'mpdCalculator.states.forms', [
		// Dependencies
		'ui.router',
		'mpdCalculator.api.mpdCalculator',
		'mpdCalculator.components.mpdFormList',

		// States
		'mpdCalculator.states.ministry',
		'mpdCalculator.states.forms.edit'
	] ) );
