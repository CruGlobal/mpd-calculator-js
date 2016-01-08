(function ( module ) {
	'use strict';

	module.config( function ( $stateProvider ) {
		$stateProvider.state( 'budget', {
			abstract: true,
			parent:   'budgets',
			url:      '/{mpd_budget_id:int}',
			resolve:  {
				'budget':     function ( $log, $q, $state, $stateParams, budgets ) {
					var deferred = $q.defer();
					// Invalid or missing mpd_budget_id
					if ( angular.isUndefined( $stateParams.mpd_budget_id ) || $stateParams.mpd_budget_id === '' ) {
						$state.go( 'budgets' );
						deferred.reject();
					}
					else {
						var budget = _.findWhere( budgets, {mpd_budget_id: $stateParams.mpd_budget_id} );
						if ( angular.isUndefined( budget ) ) {
							$state.go( 'budgets' );
							deferred.reject();
						}
						else {
							deferred.resolve( budget );
						}
					}
					return deferred.promise;
				},
				'form':       function ( $log, MPDForms, budget ) {
					return MPDForms.get( {
						mpd_def_id:  budget.mpd_def_id,
						ministry_id: budget.ministry_id
					} ).$promise;
				},
				'isOwner':    function ( $log, user, budget ) {
					return user.person_id === budget.person_id;
				},
				'isApprover': function ( $log, user, budget ) {
					return angular.isDefined( budget.approved_by ) && user.person_id === budget.approved_by;
				},
				'isEditable': function ( $log, budget, isAdmin, isOwner ) {
					// Permissions grid
					//           Draft Submitted Approved Processed Cancelled
					//  Person     Y       Y         N        N         N
					// Approver    - <---- N  -----> N        N         N
					// Leader      -       Y ------> Y <----> Y         N
					//               <--------------

					switch ( budget.status ) {
						case 'Draft':
						case 'Submitted':
							return isAdmin || isOwner;
						case 'Approved':
							return isAdmin;
						case 'Processed':
							return false;
					}
					return false;
				}
			}
		} );
	} );

})( angular
	.module( 'mpdCalculator.states.budgets.budget', [
		// Dependencies
		'ui.router',
		'mpdCalculator.states.budgets',
		'mpdCalculator.api.measurements'
	] ) );
