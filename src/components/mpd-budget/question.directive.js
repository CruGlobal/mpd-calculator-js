(function ( module ) {
	'use strict';

	module.directive( 'mpdBudgetQuestion', function ( $log ) {
		return {
			restrict:    'A',
			require:     ['^mpdBudgetSection'],
			templateUrl: 'components/mpd-budget/question.html',
			link:        function ( $scope, $element, $attributes, $controllers ) {
				var sectionController = $controllers[0];

				$scope.values = {
					model: undefined
				};

				// Locate or build new answer
				$scope.answer = _.findWhere( $scope.budget.answers, {mpd_question_id: $scope.question.mpd_question_id} );
				if ( angular.isUndefined( $scope.answer ) ) {
					$scope.answer = {
						mpd_question_id: $scope.question.mpd_question_id
					};
					$scope.budget.answers.push( $scope.answer );
				}

				// Update questionValue if answer.value changes, this also sets initial value
				$scope.$watch( 'answer.value', function ( value, prev ) {
					if ( value === prev && isFinite( $scope.values.model ) ) return;

					// Update answer on budget formula scope
					$scope.budgetController.setAnswerValue(
						$scope.section.view_order,
						$scope.question.view_order,
						value
					);

					// Value is always Monthly Gross
					switch ( $scope.question.type ) {
						case 'basic_month':
							$scope.values.model = value;
							break;
						case 'net_month':
							$scope.values.model = value - $scope.answer.tax;
							break;
						case 'basic_year':
							$scope.values.model = ( angular.isDefined( value ) && isFinite( value ) )
								? Math.round( value * 12 )
								: undefined;
							break;
						case 'net_year':
							$scope.values.model = Math.round( (value * 12) - ($scope.answer.tax * 12) );
							break;
					}
				} );

				// Update answer(value and tax) when questionValue changes
				$scope.$watch( 'values.model', function ( value, prev ) {
					var tax;
					if ( value === prev ) return;

					// Bail early if value is bad
					if ( !isFinite( value ) || value === null ) {
						delete $scope.answer.value;
						delete $scope.answer.tax;
						return;
					}

					// Question type determines value type.
					switch ( $scope.question.type ) {
						case 'basic_month':
							$scope.answer.value = value;
							//Tax not tracked when value is gross
							delete $scope.answer.tax;
							break;
						case 'net_month':
							tax = $scope.budgetController.evaluateFormula( $scope.question.formula, {NET: value} );
							if ( isFinite( tax ) && tax !== null ) {
								$scope.answer.tax = tax;
								$scope.answer.value = value + tax;
							}
							else {
								$scope.answer.value = value;
								delete $scope.answer.tax;
							}
							break;
						case 'basic_year':
							$scope.answer.value = value / 12;
							//Tax not tracked when value is gross
							delete $scope.answer.tax;
							break;
						case 'net_year':
							tax = $scope.budgetController.evaluateFormula( $scope.question.formula, {NET: value} );
							if ( isFinite( tax ) && tax !== null ) {
								$scope.answer.tax = tax / 12;
								$scope.answer.value = (value + tax) / 12;
							}
							else {
								$scope.answer.value = value / 12;
								delete $scope.answer.tax;
							}
							break;
					}
				} );

				$scope.calculated = function () {
					var value = $scope.budgetController.evaluateFormula( $scope.question.formula );
					if ( angular.isDefined( value ) && isFinite( value ) ) {
						$scope.answer.value = value;
						return value;
					}
					delete $scope.answer.value;
				};

				sectionController.addQuestion( $scope );
			}
		}
	} );

})( angular.module( 'mpdCalculator.components.mpdBudget' ) );
