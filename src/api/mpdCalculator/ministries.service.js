(function ( module ) {
	'use strict';

	module.factory( 'Ministries', function ( $log, $resource, Settings ) {
	    return $resource(Settings.api.mpdCalculator('/ministries/:ministry_id'), {}, {
			'whq':     {method: 'GET', isArray: true, params: {whq_only: 'true'}, cache: true},
			'query':   {method: 'GET', isArray: true}
		} );
	} );

})(angular.module('mpdCalculator.api.mpdCalculator'));
