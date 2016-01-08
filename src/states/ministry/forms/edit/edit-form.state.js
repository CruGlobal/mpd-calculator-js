(function ( module ) {
	'use strict';

	module.config( function ( $stateProvider ) {
		$stateProvider.state( 'editForm', {
			parent:  'forms',
			url:     '/{mpd_def_id}',
			resolve: {
				'form': function ( $log, $q, $stateParams, $state, MPDForms, ministry, forms ) {
					var deferred = $q.defer(),
						form     = undefined;

					// Edit form by ID
					if ( angular.isDefined( $stateParams.mpd_def_id ) && $stateParams.mpd_def_id !== '' ) {
						var mpd_def_id = +$stateParams.mpd_def_id;

						// All Forms must be fetched from the API
						MPDForms.get( {mpd_def_id: mpd_def_id, ministry_id: ministry.ministry_id}, function ( form ) {
							deferred.resolve( form );
						}, function () {
							// Error fetching form
							deferred.reject();
							$state.go( 'forms' );
						} );
					}
					// New form using $stateParams.form as template
					else if ( angular.isDefined( $stateParams.form ) && angular.isObject( $stateParams.form ) ) {
						form = angular.copy( $stateParams.form );
						delete form.mpd_def_id;
						form.is_global = false;
						deferred.resolve( form );
					}
					// New blank form
					else {
						deferred.resolve( {
							is_global: false,
							sections:  [{
								total_mode: 'both',
								view_order: 1,
								questions:  [{
									view_order: 1,
									type:       'basic_month'
								}]
							}]
						} );
					}
					return deferred.promise;
				}
			},
			views:   {
				'@app': {
					templateUrl: 'states/ministry/forms/edit/edit-form.html',
					controller:  'EditFormController'
				}
			},
			params:  {
				form: undefined
			}
		} );
	} );

})( angular
	.module( 'mpdCalculator.states.forms.edit', [
		// Dependencies
		'ui.router',
		'ui.select',
		'ui.bootstrap.modal',
		'ui.bootstrap.tpls',
		'mpdCalculator.states.forms',
		'mpdCalculator.api.measurements',
		'mpdCalculator.components.mpdForm',
		'mpdCalculator.components.mpdFormula'
	] ) );
