(function ( module ) {
	'use strict';

	module.directive( 'mpdFormList', function ( $log ) {
		return {
			restrict:    'E',
			scope:       {
				forms:       '&forms',
				title:       '@',
				description: '@'
			},
			templateUrl: 'components/mpd-form-list/mpd-form-list.html',
			controller:  function ( $scope ) {
				$scope.collapsed = false;
			}
		};
	} );
})( angular.module( 'mpdCalculator.components.mpdFormList', [] ) );
