(function ( module ) {
	'use strict';

	module.factory( 'MPDBudgets', function ( $log, $resource, Settings ) {
		var transformBudgetResponse = function ( budget ) {
				// Remove empty fields
				var requiredFields = ['assessment', 'subsidy', 'total_expense_budget', 'total_to_raise', 'current_support_level'];
				angular.forEach( requiredFields, function ( key ) {
					if ( angular.isDefined( this[key] ) && this[key] === null ) {
						delete this[key];
					}
				}, budget );
				return budget;
			},
			transformBudgetRequest  = function ( budget, headersGetter ) {
				if ( !angular.isDefined( budget.ignoreTransform ) ) {
					// Add missing required fields
					var requiredFields = {
						'assessment':            0,
						'subsidy':               0,
						'total_expense_budget':  null,
						'total_to_raise':        null,
						'current_support_level': null
					};
					angular.forEach( requiredFields, function ( value, key ) {
						if ( angular.isUndefined( this[key] ) || this[key] === null ) {
							this[key] = value;
						}
					}, budget );
				}

				// Remove answers without values and mpd_answer_id
				if ( angular.isArray( budget.answers ) ) {
					for ( var i = budget.answers.length - 1; i >= 0; i-- ) {
						if ( angular.isUndefined( budget.mpd_answer_id ) ) {
							if ( angular.isUndefined( budget.answers[i].value ) || budget.answers[i].value == null ) {
								budget.answers.splice( i, 1 );
							}
						}
					}
				}

				delete budget.ignoreTransform;

				return angular.isObject( budget ) ? angular.toJson( budget ) : budget;
			},
			decorateBudget          = function ( budget, form ) {
				// Set budget fields from form fields
				if ( angular.isUndefined( budget.assessment_formula ) || budget.assessment_formula === null || isFinite( budget.assessment_formula ) ) {
					budget.assessment_formula = (angular.isDefined( form.assessment_formula ) && form.assessment_formula !== null)
						? form.assessment_formula
						: undefined;
				}

				if ( angular.isUndefined( budget.subsidy_formula ) || budget.subsidy_formula === null || isFinite( budget.subsidy_formula ) ) {
					budget.subsidy_formula = (angular.isDefined( form.subsidy_formula ) && form.subsidy_formula !== null)
						? form.subsidy_formula
						: undefined;
				}

				return budget;
			},
			newBudget               = function ( form, defaults ) {
				// Generates new budget object from the given form
				var budget = {
					mpd_def_id:   form.mpd_def_id,
					period_start: moment().date( 1 ).format( 'YYYY-MM' ),
					status:       'Draft',
					answers:      []
				};
				return decorateBudget( transformBudgetResponse( angular.extend( budget, defaults ) ), form );
			},
			api                     = $resource( Settings.api.measurements( '/mpd_budget/:mpd_budget_id' ), {
				mpd_budget_id: '@mpd_budget_id',
				ministry_id:   '@ministry_id'
			}, {
				'get':    {
					method: 'GET', interceptor: {
						response: function ( response ) {
							return transformBudgetResponse( response.resource );
						}
					},
					headers: { 'Accepts': 'application/json' }
				},
				'query':  {
					method: 'GET', isArray: true, interceptor: {
						response: function ( response ) {
							return angular.forEach( response.resource, transformBudgetResponse );
						}
					},
					headers: { 'Accept': 'application/json' }
				},
				'save':   {method: 'POST', transformRequest: transformBudgetRequest},
				'update': {
					method: 'PUT', transformRequest: transformBudgetRequest, interceptor: {
						response: function ( response ) {
							return transformBudgetResponse( response.resource );
						}
					}
				}
			} );
		api.decorateBudget = decorateBudget;
		api.newBudget = newBudget;
		return api;
	} );

})( angular.module( 'mpdCalculator.api.measurements' ) );
