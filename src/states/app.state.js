(function ( module ) {
	'use strict';

	module.config( function ( $stateProvider, $urlRouterProvider ) {
		$urlRouterProvider.otherwise( '/' );

		$stateProvider.state( 'app', {
			abstract:    true,
			url:         '/',
			templateUrl: 'states/app.html',
			controller:  function ( $log, $scope, $state ) {
				$scope.$state = $state;
			},
			resolve:     {
				'session':    function ( $log, Session ) {
					return true;
				},
				'user':       function ( $log, $q, session ) {
					var deferred = $q.defer();
					deferred.resolve( session.user );
					return deferred.promise;
				},
				'ministries': function ( $log, session, Ministries ) {
					return Ministries.whq().$promise;
				}
			}
		} );
	} );

})( angular
	.module( 'mpdCalculator.states.app', [
		// Dependencies
		'ui.router',
		'ngStorage',
		'mpdCalculator.api.mpdCalculator',
		'angular-growl'
	] ) );
