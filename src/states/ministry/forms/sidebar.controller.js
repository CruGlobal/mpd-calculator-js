(function ( module ) {
	'use strict';

	module
		.controller( 'FormsSidebarController', function ( $log, $scope, $state, user, forms ) {
			$scope.$state = $state;
			$scope.user = user;
			$scope.forms = forms;

			// Marks global forms as active if no active ministry forms exist, inactive otherwise
			$scope.globalActive = function ( form, index, forms ) {
				if ( form.is_global ) {
					var active = _.findWhere( forms, {active: true, is_global: false} );
					form.active = typeof active === 'undefined';
				}
				return true;
			}
		} );

})( angular.module( 'mpdCalculator.states.forms' ) );
