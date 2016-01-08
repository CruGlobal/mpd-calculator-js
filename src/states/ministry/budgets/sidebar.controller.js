(function ( module ) {
	'use strict';

	module
		.controller( 'BudgetsSidebarController', function ( $log, $scope, $state, user, budgets, isAdmin ) {
			$scope.$state = $state;
			$scope.user = user;
			$scope.budgets = budgets;
			$scope.isAdmin = isAdmin;

			$scope.notEqual = function ( actual, expected ) {
				return !angular.equals( actual, expected );
			};
		} );

})( angular.module( 'mpdCalculator.states.budgets' ) );
