(function ( module ) {
	'use strict';

	module.filter( 'period', function ( $log, $filter, $locale ) {
		var dateFilter = $filter( 'date' );
		return function ( input ) {
			if ( angular.isUndefined( input ) || input === null ) {
				return;
			}
			return dateFilter( moment( input, 'YYYY-MM' ).toDate(), 'MMMM yyyy' );
		};
	} );

})( angular.module( 'mpdCalculator.components.periodFilter', [] ) );
