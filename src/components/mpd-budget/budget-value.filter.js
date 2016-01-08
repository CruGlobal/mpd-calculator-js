(function ( module ) {
	'use strict';

	module.filter( 'budgetValue', function ( $log, $filter, $locale ) {
		var currencyFilter = $filter( 'currency' ),
			formats        = $locale.NUMBER_FORMATS;
		return function ( input ) {
			var value = currencyFilter( input < 0 ? -1 * input : input, '', 0 );
			if ( angular.isDefined( value ) && value !== null ) {
				value = value.replace( formats.GROUP_SEP, '' );
				return input < 0 ? '-' + value : value;
			}
		};
	} );

})( angular.module( 'mpdCalculator.components.mpdBudget' ) );
