(function ( module ) {
	'use strict';

	module.config( function ( $stateProvider ) {
		$stateProvider.state( 'editBudget', {
			parent:  'budget',
			url:     '',
			resolve: {
				'budget': function ( $log, MPDBudgets, budget, form ) {
					return MPDBudgets.decorateBudget( budget, form );
				}
			},
			views:   {
				'@app': {
					templateUrl: 'states/ministry/budgets/budget/edit/edit.html',
					controller:  'EditBudgetController'
				}
			}
		} );
	} );

})( angular
	.module( 'mpdCalculator.states.budgets.budget.edit', [
		// Dependencies
		'ui.router',
		'ui.bootstrap.modal',
		'ui.bootstrap.tpls',
		'mpdCalculator.components.mpdBudget',
		'mpdCalculator.api.measurements',

		// States
		'mpdCalculator.states.budgets.budget'
	] ) );
