(function ( module ) {
	'use strict';

	module.directive( 'mpdBudgetList', function ( $log ) {
		return {
			restrict:    'E',
			scope:       {
				budgets: '&',
				title:   '@'
			},
			templateUrl: 'components/mpd-budget-list/mpd-budget-list.html',
			link:        function ( $scope, $element, $attributes, $controllers ) {
				$scope.showPersonName = $scope.$eval( $attributes.showPersonName ) === true;
			},
			controller:  function ( $scope ) {
				$scope.visible = true;
			}
		};
	} );
})( angular.module( 'mpdCalculator.components.mpdBudgetList', [
	// Filters
	'mpdCalculator.components.periodFilter',
] ) );
