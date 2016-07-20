(function ( module ) {
	'use strict';

	module.config( function ( $stateProvider ) {
		$stateProvider.state( 'budgets', {
			parent:  'ministry',
			url:     '/budgets?code',
			resolve: {
				'budgets': function ( $log, $stateParams, session, MPDBudgets, ministry ) {
					var code = (angular.isDefined( $stateParams.code ) && $stateParams.code !== '')
						? $stateParams.code : undefined;
					delete $stateParams.code;
					return MPDBudgets.query( {
						ministry_id: ministry.ministry_id,
						code:        code
					} ).$promise;
				}
			},
			views:   {
				'sidebar@app':  {
					templateUrl: 'states/ministry/budgets/sidebar.html',
					controller:  'BudgetsSidebarController'
				},
				'ministry@app': {
					templateUrl: 'states/ministry/change-ministry.html',
					controller:  'ChangeMinistryController'
				}
			}
		} );
	} );

})( angular
	.module( 'mpdCalculator.states.budgets', [
		// Dependencies
		'ui.router',
		'mpdCalculator.api.mpdCalculator',
		'mpdCalculator.components.mpdBudgetList',

		// States
		'mpdCalculator.states.ministry',
		'mpdCalculator.states.budgets.create',
		'mpdCalculator.states.budgets.budget.edit'
	] ) );
