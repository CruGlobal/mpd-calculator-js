(function ( module ) {
	'use strict';

	module.controller( 'CreateBudgetController', function ( $log, $scope, $state, $modal, gettext, MPDBudgets, forms, form, budget, user, growl, budgets ) {
		$scope.forms = forms;
		$scope.form = form;
		$scope.budget = budget;
		$scope.user = user;
		$scope.isEditable = true;

		$scope.$watch( 'budget.mpd_def_id', function ( id, oldId ) {
			if ( angular.isUndefined( id ) ) return;
			$state.go( 'createBudget', {mpd_def_id: id} );
		} );

		$scope.saveDraft = function () {
			MPDBudgets.save( $scope.budget, function ( value, responseHeaders ) {
				// Notify on success
				growl.success( gettext( 'Budget successfully saved.' ) );

				// Add budget to budgets list (updates sidebar).
				budgets.push( value );

				// Route to editBudget since we now have an mpd_budget_id
				$state.go( 'editBudget', {mpd_budget_id: value.mpd_budget_id} );
			}, function ( httpResponse ) {
				// Notify on failure
				growl.error( gettext( 'An error occurred while saving the budget. Please try again.' ) );
			} );
		};

		$scope.$on( '$stateChangeStart', function ( event, toState, toParams, fromState, fromParams ) {
			// Warn on unsaved changes
			if ( $scope.createForm.$dirty ) {
				event.preventDefault();
				$modal.open( {
					backdrop:    'static',
					keyboard:    false,
					templateUrl: 'states/ministry/unsaved-changes.modal.html',
					controller:  'UnsavedChangesController as dialog'
				} ).result.then( function () {
						// Discard changes and proceed with transition.
						$scope.createForm.$setPristine();
						$state.go( toState, toParams );
					}, function () {
					} );
			}
		} );
	} );

})( angular.module( 'mpdCalculator.states.budgets.create' ) );
