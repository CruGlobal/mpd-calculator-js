(function ( module ) {
	'use strict';

	module.directive( 'mpdBudget', function ( $log ) {
		var questionReplace  = /{(\d+\.\d+)}/gi,
			variableReplace  = /{([\w\.]+?)}/gi,
			percentMatch     = /^%(\d+(\.\d+)?)$/i,
			normalizeFormula = function ( formula ) {
				var percent = formula.match( percentMatch );
				if ( percent === null ) {
					return formula
						.replace( questionReplace, 'q[$1]' )
						.replace( variableReplace, "$1" );
				}
				else {
					return 'SUBTOTAL * (' + percent[1] + ' / ( 100 - ' + percent[1] + ' ))';
				}
			};

		return {
			restrict:    'E',
			require:     'ngModel',
			scope:       {
				budget:   '=ngModel',
				form:     '=mpdBudgetForm',
				editable: '=mpdBudgetEditable'
			},
			transclude:  true,
			templateUrl: 'components/mpd-budget/mpd-budget.html',
			link:        function ( $scope, $element, $attributes, $controllers ) {
				$scope.showCompliance = $scope.$eval( $attributes.showCompliance ) === true;
			},
			controller:  function ( $scope ) {
				// Create a new isolate scope to run evaluate formulas against
				var formulaScope = $scope.$new( true ),
					sections     = [];
				formulaScope.q = {};
				$scope.values = {
					subtotal:     undefined,
					percent:      undefined,
					period_start: angular.isDefined( $scope.budget.period_start )
									  ? moment( $scope.budget.period_start, 'YYYY-MM' ).toDate()
									  : moment().date( 1 ).toDate()
				};
				$scope.minPeriodStart = moment().date( 1 ).subtract( {years: 1, months: 1} ).format( 'YYYY-MM' );

				var evaluateFormula = function ( formula, locals ) {
					locals = typeof locals === 'undefined' ? {} : locals;
					if ( angular.isUndefined( formula ) || formula === null ) return undefined;
					var value = formulaScope.$eval( normalizeFormula( formula ), locals );
					return ( angular.isUndefined( value ) || value === null )
						? undefined
						: value;
				};

				this.setAnswerValue = function ( section, question, value ) {
					var id = section + '.' + question;
					if ( angular.isUndefined( value ) || value === null ) {
						delete formulaScope.q[id];
					}
					else {
						formulaScope.q[id] = value;
					}
				};

				this.evaluateFormula = evaluateFormula;

				$scope.evalFormula = function ( formula, locals ) {
					return evaluateFormula( formula, locals );
				};

				this.addSection = function ( sectionScope ) {
					sections.push( sectionScope );
				};

				$scope.budgetSubtotal = function () {
					var hasValues = false,
						total     = 0;

					angular.forEach( sections, function ( section, index ) {
						if ( isFinite( section.total ) ) {
							total += section.total;
							hasValues = true;
						}
					} );

					if ( hasValues ) {
						$scope.values.subtotal = total;
						return total;
					}
					delete $scope.values.subtotal;
				};

				$scope.$watch( 'values.subtotal', function ( subtotal, prev ) {
					if ( subtotal === prev ) return;

					// Assessment
					if ( angular.isDefined( $scope.budget.assessment_formula ) && $scope.budget.assessment_formula !== null && isFinite( subtotal ) ) {
						$scope.budget.assessment = evaluateFormula( $scope.budget.assessment_formula, {SUBTOTAL: subtotal} );
					}
					else {
						delete $scope.budget.assessment;
					}

					//Subsidy
					if ( angular.isDefined( $scope.budget.subsidy_formula ) && $scope.budget.subsidy_formula !== null && isFinite( subtotal ) ) {
						$scope.budget.subsidy = evaluateFormula( $scope.budget.subsidy_formula, {SUBTOTAL: subtotal} );
					}
					else {
						delete $scope.budget.subsidy;
					}

					//total_expense_budget = subtotal + assessment
					$scope.budget.total_expense_budget = $scope.$eval( 'values.subtotal + budget.assessment' );

					//total_to_raise = total_expense_budget - subsidy
					$scope.budget.total_to_raise = $scope.$eval( 'budget.total_expense_budget - budget.subsidy' );
				} );

				$scope.$watch( 'values.period_start', function ( date, prevDate ) {
					if ( angular.isDefined( date ) ) {
						$scope.budget.period_start = moment( date ).format( 'YYYY-MM' );
					}
				} );
			}
		};
	} );
})( angular.module( 'mpdCalculator.components.mpdBudget' ) );
