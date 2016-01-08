(function ( module ) {
	'use strict';

	module.directive( 'mpdBudgetSection', function ( $log ) {
		return {
			restrict:    'A',
			require:     ['^mpdBudget'],
			templateUrl: 'components/mpd-budget/section.html',
			link:        function ( $scope, $element, $attributes, $controllers ) {
				$scope.budgetController = $controllers[0];
				$scope.budgetController.addSection( $scope );
			},
			controller:  function ( $scope ) {
				var questions = [];

				this.addQuestion = function ( scope ) {
					questions.push( scope );
				};

				$scope.sectionTotal = function ( year ) {
					var year      = typeof year === 'undefined' ? false : year,
						hasValues = false,
						total     = 0;

					angular.forEach( questions, function ( question, index ) {
						if ( isFinite( question.answer.value ) ) {
							total += question.answer.value;
							hasValues = true;
						}
					} );

					if ( hasValues ) {
						$scope.total = total;
						return year ? total * 12 : total;
					}
					delete $scope.total;
					return undefined;
				};
			}
		}
	} );

})( angular.module( 'mpdCalculator.components.mpdBudget' ) );
