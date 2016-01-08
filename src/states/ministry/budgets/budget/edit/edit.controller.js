(function ( module ) {
	'use strict';

	module.controller( 'EditBudgetController', function ( $log, $scope, $state, $modal, growl, gettext, MPDBudgets, form, budget, isEditable, isAdmin, isApprover, isOwner ) {
		// $scope.budget is a copy, upon save, this will get copied back to the original.
		$scope.budget = angular.copy( budget );
		$scope.form = form;
		$scope.isEditable = isEditable;
		$scope.isApprover = isApprover;
		$scope.isOwner = isOwner;
		$scope.isAdmin = isAdmin;
		$scope.isSavingBudget = false;

		$scope.saveBudget = function () {
			$scope.isSavingBudget = true;

			MPDBudgets.save( $scope.budget, function ( value, responseHeaders ) {
				// Notify on success
				growl.success( gettext( 'Budget successfully saved.' ) );

				// Update original budget
				angular.copy( value, budget );

				// Reload current state
				$state.go( 'editBudget', {}, {reload: true} );
			}, function ( httpResponse ) {
				// Notify on failure
				growl.error( gettext( 'An error occurred while saving the budget. Please try again.' ) );
				$scope.isSavingBudget = false;
			} );
		};

		$scope.requestApproval = function () {
			$scope.isSavingBudget = true;
			$modal.open( {
				backdrop:    'static',
				scope:       $scope,
				keyboard:    false,
				templateUrl: 'states/ministry/budgets/budget/edit/approve.modal.html',
				controller:  function ( $scope, $modalInstance, $state ) {

					$scope.submit = function () {
						var submittedBudget = angular.copy( $scope.budget );
						submittedBudget.status = 'Submitted';
						submittedBudget.approver_link = $state.href( 'editBudget', {}, {absolute: true} );
						MPDBudgets.update( submittedBudget ).$promise.then( function ( value, responseHeaders ) {
							// Notify on success
							growl.success( gettext( 'Budget submitted for approval.' ) );

							// Copy updated budget to the original.
							angular.copy( value, budget );

							// Close Modal
							$modalInstance.close();
						}, function ( httpResponse ) {
							// Notify on failure
							growl.error( gettext( 'An error occurred while submitting the budget. Please try again.' ) );

							$modalInstance.dismiss();
						} );
					};

					$scope.cancel = function () {
						$modalInstance.dismiss();
					};
				}
			} ).result.then( function () {
					// Reload on success
					$state.go( 'editBudget', {}, {reload: true} );
				}, function () {
					// Modal dismissed or canceled, remove approver info
					delete $scope.budget.approver_link;
					delete $scope.budget.approver_email;
					$scope.isSavingBudget = false;
				} );
		};

		$scope.approveBudget = function () {
			$scope.isSavingBudget = true;

			MPDBudgets.update( {
				ignoreTransform: true,
				mpd_budget_id:   $scope.budget.mpd_budget_id,
				status:          'Approved'
			}, function ( value, responseHeaders ) {
				// Notify on success
				growl.success( gettext( 'Budget Approved.' ) );

				// Update original budget
				angular.copy( value, budget );

				// Reload current state
				$state.go( 'editBudget', {}, {reload: true} );
			}, function ( httpResponse ) {
				// Notify on failure
				growl.error( gettext( 'An error occurred while approving the budget. Please try again.' ) );

				$scope.isSavingBudget = false;
			} );
		};

		$scope.processBudget = function () {
			$scope.isSavingBudget = true;

			MPDBudgets.update( {
				ignoreTransform: true,
				mpd_budget_id:   $scope.budget.mpd_budget_id,
				status:          'Processed'
			}, function ( value, responseHeaders ) {
				// Notify on success
				growl.success( gettext( 'Budget marked as Processed.' ) );

				// Update original budget
				angular.copy( value, budget );

				// Reload current state
				$state.go( 'editBudget', {}, {reload: true} );
			}, function ( httpResponse ) {
				// Notify on failure
				growl.error( gettext( 'An error occurred while processing the budget. Please try again.' ) );

				$scope.isSavingBudget = false;
			} );
		};

		$scope.rejectBudget = function () {
			$scope.isSavingBudget = true;

			$modal.open( {
				backdrop:    'static',
				scope:       $scope,
				keyboard:    false,
				templateUrl: 'states/ministry/budgets/budget/edit/reject.modal.html',
				controller:  function ( $scope, $modalInstance, $state ) {

					$scope.reject = function () {
						//TODO Ask user what status to reject to
						MPDBudgets.update( {
							ignoreTransform: true,
							mpd_budget_id:   $scope.budget.mpd_budget_id,
							status:          'Draft'
						}, function ( value, responseHeaders ) {
							// Notify on success
							growl.success( gettext( 'Budget has been rejected.' ) );

							// Update original budget
							angular.copy( value, budget );

							$modalInstance.close();
						}, function ( httpResponse ) {
							// Notify on failure
							growl.error( gettext( 'An error occurred while rejecting the budget. Please try again.' ) );

							$modalInstance.dismiss();
						} );
					};

					$scope.cancel = function () {
						$modalInstance.dismiss();
					};
				}
			} ).result.then( function () {
					// On success go to budgets state
					$state.go( 'budgets' );
				}, function () {
					$scope.isSavingBudget = false;
				} );
		};

		$scope.deleteBudget = function () {
			$scope.isSavingBudget = true;

			$modal.open( {
				backdrop:    'static',
				scope:       $scope,
				keyboard:    false,
				templateUrl: 'states/ministry/budgets/budget/edit/delete.modal.html',
				controller:  function ( $scope, $modalInstance, $state ) {

					$scope.delBudget = function () {
						MPDBudgets.update( {
							ignoreTransform: true,
							mpd_budget_id:   $scope.budget.mpd_budget_id,
							status:          'Cancelled'
						}, function ( value, responseHeaders ) {
							// Notify on success
							growl.success( gettext( 'Budget has been deleted.' ) );

							// Update original budget
							angular.copy( value, budget );

							$modalInstance.close();
						}, function ( httpResponse ) {
							// Notify on failure
							growl.error( gettext( 'An error occurred while deleting the budget. Please try again.' ) );

							$modalInstance.dismiss();
						} );
					};

					$scope.cancel = function () {
						$modalInstance.dismiss();
					};
				}
			} ).result.then( function () {
					// On success go to budgets state
					$state.go( 'budgets' );
				}, function () {
					$scope.isSavingBudget = false;
				} );

		};

		$scope.cancel = function () {
			$state.go( 'budgets' );
		};

		$scope.$on( '$stateChangeStart', function ( event, toState, toParams, fromState, fromParams ) {
			// Warn on unsaved changes
			if ( $scope.editForm.$dirty ) {
				event.preventDefault();
				$modal.open( {
					backdrop:    'static',
					keyboard:    false,
					templateUrl: 'states/ministry/unsaved-changes.modal.html',
					controller:  'UnsavedChangesController as dialog'
				} ).result.then( function () {
						// Discard changes and proceed with transition.
						$scope.editForm.$setPristine();
						$state.go( toState, toParams );
					}, function () {
					} );
			}
		} );
	} );

})( angular.module( 'mpdCalculator.states.budgets.budget.edit' ) );
