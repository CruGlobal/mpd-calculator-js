(function ( module ) {
	'use strict';

	module
		.controller( 'ChangeMinistryController', function ( $log, $scope, $timeout, $state, ministries, ministry ) {
			$scope.$state = $state;
			$scope.ministries = ministries;
			$scope.ministry = ministry;

			$scope.editable = false;

			$scope.toggleInput = function () {
				$scope.editable = !$scope.editable;
				if ( $scope.editable ) {
					$timeout( function () {
						var ele = document.getElementById( 'changeMinistry' );
						ele.focus();
						ele.select();
					} );
				}
			};

			$scope.cancelOnESC = function ( keyCode ) {
				if ( keyCode == 27 ) {
					$scope.editable = false;
				}
			};

			$scope.onSelectMinistry = function ( $item, $model, $label ) {
				$scope.editable = false;
				$state.go( 'budgets', {min_code: $item.min_code} );
			};
		} );

})( angular.module( 'mpdCalculator.states.ministry' ) );
