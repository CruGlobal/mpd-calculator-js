(function ( module ) {
	'use strict';

	module.directive( 'mpdForm', function ( $log ) {
		return {
			restrict:    'E',
			scope:       {
				form:       '=form',
				isEditable: '=isEditable'
			},
			transclude:  true,
			templateUrl: 'components/mpd-form/mpd-form.html',
			link:        function ( $scope, $element, $attributes, $controllers ) {
			},
			controller:  function ( $scope ) {
				$scope.sectionSortableOptions = {
					handle: '.navbar-brand.move-handle'
				};

				$scope.questionSortableOptions = {
					handle: '.col-xs-1.move-handle'
				};

				$scope.$watch( 'form', function ( form, oldForm ) {
					// Section and questions not guaranteed to be ordered by view_order, fix that here.
					if ( angular.isUndefined( form ) ) return;

					if ( angular.isArray( form.sections ) ) {
						form.sections = _.sortBy( form.sections, 'view_order' );

						angular.forEach( form.sections, function ( section ) {

							if ( angular.isArray( section.questions ) ) {
								section.questions = _.sortBy( section.questions, 'view_order' );
							}

						} );
					}
				} );

				$scope.addSection = function () {
					$scope.form.sections.push( {
						total_mode: 'both',
						questions:  [{
							type: 'basic_month'
						}]
					} );
				};

				$scope.addQuestion = function ( section ) {
					section.questions.push( {
						type: 'basic_month'
					} )
				};

				$scope.removeSection = function ( section ) {
					var index = _.indexOf( $scope.form.sections, section );
					if ( index >= 0 ) {
						$scope.form.sections.splice( index, 1 );
					}
				};
			}
		};
	} );
})( angular.module( 'mpdCalculator.components.mpdForm' ) );
