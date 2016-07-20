(function ( module ) {
	'use strict';

	module.config( function ( $stateProvider ) {
		$stateProvider.state( 'createBudget', {
			parent:  'budgets',
			//TODO Make mpd_def_id part of the url, missing or invalid would choose first form
			url:     '/create/{mpd_def_id}',
			resolve: {
				'forms':  function ( $log, $q, $state, MPDForms, ministry ) {
					var deferred = $q.defer();
					MPDForms.query( {
						ministry_id:    ministry.ministry_id,
						include_global: true
					}, function ( forms ) {
						// API returns all global and ministry active forms
						// Filter the list to only ones the use may use
						var active = _.where( forms, {active: true, is_global: false} );
						// If non-global active forms exist, return those
						if ( active.length ) {
							deferred.resolve( active );
						}
						// Else if we have forms, they should all be global, return them
						else if ( forms.length ) {
							deferred.resolve( forms );
						}
						else {
							deferred.reject();
						}
					}, function () {
						// Error fetching forms
						deferred.reject();
						$state.go( 'budgets' );
					} );
					return deferred.promise;
				},
				'form':   function ( $log, $state, $stateParams, MPDForms, ministry, forms ) {
					if ( angular.isDefined( $stateParams.mpd_def_id ) && $stateParams.mpd_def_id !== '' ) {
						var mpd_def_id = +$stateParams.mpd_def_id,
							form       = _.findWhere( forms, {mpd_def_id: mpd_def_id} );
						if ( angular.isDefined( form ) ) {
							return MPDForms.get( {ministry_id: ministry.ministry_id, mpd_def_id: mpd_def_id} ).$promise;
						}
					}
					// mpd_def_id is missing or not found in forms, use first form in list.
					var first = _.first( forms );
					$state.go( 'createBudget', {mpd_def_id: first.mpd_def_id} );
				},
				'budget': function ( $log, session, ministry, form, MPDBudgets, user ) {
					$log.debug( 'form', form );
					var defaults = {
						person_id:   session.user.person_id,
						person_name: [user.last_name, user.first_name].join( ', ' ),
						ministry_id: ministry.ministry_id
					};
					return MPDBudgets.newBudget( form, defaults );
				}
			},
			views:   {
				'@app': {
					templateUrl: 'states/ministry/budgets/create/create.html',
					controller:  'CreateBudgetController'
				}
			}
		} );
	} );

})( angular
	.module( 'mpdCalculator.states.budgets.create', [
		// Dependencies
		'ui.router',
		'ui.bootstrap.modal',
		'ui.bootstrap.tpls',
		'mpdCalculator.components.mpdBudget',
		'mpdCalculator.states.budgets',
		'mpdCalculator.api.mpdCalculator'
	] ) );
