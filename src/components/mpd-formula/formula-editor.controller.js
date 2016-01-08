(function ( module ) {
	'use strict';

	module.controller( 'FormulaEditorController', function ( $log, $scope, $modalInstance, formula, tokens, labels ) {
		$scope.labels = labels;
		$scope.formula = formula;
		$scope.tokens = tokens;
		$scope.formulaScope = $scope.$new( true );
		$scope.formulaScope.q = {};
		$scope.normalizedFormula = undefined;
		$scope.invalidFormula = true;

		var questionReplace  = /{(\d+\.\d+)}/gi,
			variableReplace  = /{([\w\.]+?)}/gi,
			percentMatch     = /^%(\d+(\.\d+)?)$/i,
			normalizeFormula = function ( formula ) {
				var percent = formula.match( percentMatch );
				if ( percent === null ) {
					return formula
						.replace( questionReplace, "q[$1].value" )
						.replace( variableReplace, "q['$1'].value" );
				}
				else {
					return 'q[\'SUBTOTAL\'].value * (' + percent[1] + ' / ( 100 - ' + percent[1] + ' ))';
				}
			};

		$scope.insertToken = function ( text ) {
			var element = jQuery( '#formulaEditor' ).get( 0 ),
				value   = element.value,
				endIndex,
				range;

			if ( typeof element.selectionStart != "undefined" && typeof element.selectionEnd != "undefined" ) {
				endIndex = element.selectionEnd;
				element.value = value.slice( 0, element.selectionStart ) + text + value.slice( endIndex );
				element.selectionStart = element.selectionEnd = endIndex + text.length;
			} else if ( typeof document.selection != "undefined" && typeof document.selection.createRange != "undefined" ) {
				element.focus();
				range = document.selection.createRange();
				range.collapse( false );
				range.text = text;
				range.select();
			}
			angular.element( element ).trigger( 'input' );
		};

		$scope.$watch( 'formula', function ( value, oldValue ) {
			if ( angular.isUndefined( value ) || value === '' || value === null ) {
				$scope.formulaScope = $scope.$new( true );
				$scope.formulaScope.q = {};
				$scope.normalizedFormula = undefined;
				return;
			}

			var formulaScope = $scope.$new( true );
			formulaScope.q = {};
			$scope.normalizedFormula = normalizeFormula( value );

			var percent = value.match( percentMatch );
			if ( percent === null ) {
				// Not a % formula
				var matches;
				while ( (matches = variableReplace.exec( value )) !== null ) {
					var token = matches[1];
					formulaScope.q[token] = {
						label: token,
						value: angular.isDefined( $scope.formulaScope.q[token] ) ? $scope.formulaScope.q[token].value : 0
					}
				}
			}
			else {
				// Is a % formula
				formulaScope.q['SUBTOTAL'] = {
					label: 'SUBTOTAL',
					value: angular.isDefined( $scope.formulaScope.q['SUBTOTAL'] ) ? $scope.formulaScope.q['SUBTOTAL'].value : 0
				};
			}

			$scope.formulaScope = formulaScope;
		} );

		$scope.evalFormula = function () {
			var value;
			try {
				value = $scope.formulaScope.$eval( $scope.normalizedFormula, {} );
				$scope.invalidFormula = false;
			} catch ( error ) {
				$scope.invalidFormula = true;
			}
			return ( angular.isUndefined( value ) || value === null )
				? undefined
				: value;

		};

		$scope.ok = function () {
			$modalInstance.close( $scope.formula );
		};

		$scope.cancel = function () {
			$modalInstance.dismiss();
		};
	} );

})( angular.module( 'mpdCalculator.components.mpdFormula' ) );
