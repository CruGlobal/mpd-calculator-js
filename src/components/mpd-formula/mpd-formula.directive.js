(function ( module ) {
	'use strict';

	module.directive( 'mpdFormula', function ( $log ) {
		return {
			restrict:    'E',
			require:     ['ngModel'],
			scope:       {
				formula:     '=ngModel',
				form:        '=form',
				disabled:    '&disabled',
				placeholder: '@placeholder',
				description: '@description',
				name:        '@name'
			},
			templateUrl: 'components/mpd-formula/mpd-formula.html',
			link:        function ( $scope, $element, $attributes, $controllers ) {
				$scope.modelController = $controllers[0];
				$scope.includeNet = $attributes.includeNet === 'true';
				$scope.includeSubtotal = $attributes.includeSubtotal === 'true';
			},
			controller:  function ( $scope, $modal ) {
				$scope.editFormula = function () {
					$modal.open( {
						templateUrl: 'components/mpd-formula/formula-editor.modal.html',
						controller:  'FormulaEditorController',
						backdrop:    'static',
						keyboard:    false,
						resolve:     {
							'labels':  function () {
								return {
									name:        $scope.name,
									placeholder: $scope.placeholder,
									description: $scope.description
								}
							},
							'formula': function () {
								return angular.copy( $scope.formula );
							},
							'tokens':  function () {
								var tokens = [];
								if ( $scope.includeNet ) tokens.push( 'NET' );
								if ( $scope.includeSubtotal ) tokens.push( 'SUBTOTAL' );
								angular.forEach( $scope.form.sections, function ( section, sectionIndex ) {
									angular.forEach( section.questions, function ( question, questionIndex ) {
										tokens.push( (sectionIndex + 1) + '.' + (questionIndex + 1) + '' );
									} );
								} );
								return tokens;
							}
						}
					} ).result.then( function ( value ) {
							$scope.modelController.$setViewValue( value );
						}, function () {
						} );
				};
			}
		};
	} );
})( angular.module( 'mpdCalculator.components.mpdFormula' ) );
