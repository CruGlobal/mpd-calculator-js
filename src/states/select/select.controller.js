(function ( module ) {
	'use strict';

	module
		.controller( 'SelectMinistryController', function ( $log, $scope, $timeout, $state, ministries, ministry ) {
			$scope.$state = $state;
			$scope.ministries = ministries;
			$scope.ministry = ministry || undefined;

			$scope.editable = true;

			$scope.onSelectMinistry = function ( $item, $model, $label ) {
				$scope.editable = false;
				$state.go( 'budgets', {min_code: $item.min_code} );
			};
		} );

})( angular.module( 'mpdCalculator.states.select' ) );
