(function ( module ) {
	'use strict';

	/**
	 * AngularJS default filter with the following expression:
	 * "person in people | filter: {name: $select.search, age: $select.search}"
	 * performs a AND between 'name: $select.search' and 'age: $select.search'.
	 * We want to perform a OR.
	 */
	module.filter( 'propsFilter', function () {
		return function ( items, props ) {
			var out = [];

			if ( angular.isArray( items ) ) {
				items.forEach( function ( item ) {
					var itemMatches = false;

					var keys = Object.keys( props );
					for ( var i = 0; i < keys.length; i++ ) {
						var prop = keys[i];
						var text = props[prop].toLowerCase();
						if ( item[prop].toString().toLowerCase().indexOf( text ) !== -1 ) {
							itemMatches = true;
							break;
						}
					}

					if ( itemMatches ) {
						out.push( item );
					}
				} );
			} else {
				// Let the output be the input untouched
				out = items;
			}

			return out;
		};
	} );


	module.controller( 'EditFormController', function ( $log, $scope, $state, $modal, gettext, MPDForms, form, forms, growl, ministries, ministry ) {
		$scope.form = form;

		if ( form.is_global ) {
			$scope.isEditable = false;
		}
		else {
			$scope.isEditable = true;
		}

		$scope.saveForm = function () {
			var method = angular.isDefined( $scope.form.mpd_def_id ) ? 'update' : 'save';
			// PUT/POST require ministry_id
			$scope.form.ministry_id = ministry.ministry_id;
			MPDForms[method]( $scope.form, function ( value, responseHeaders ) {
				// Success
				var form = _.findWhere( forms, {mpd_def_id: value.mpd_def_id} );
				if ( angular.isDefined( form ) ) {
					angular.copy( value, form );
				}
				else {
					forms.push( value );
				}

				// Notify on success
				growl.success( gettext( 'Budget form has been saved.' ) );

				$scope.editForm.$setPristine();
				$state.go( 'editForm', {mpd_def_id: value.mpd_def_id}, {reload: true} );
			}, function ( httpResponse ) {
				// Failure
				$log.error( httpResponse );

				// Notify on failure
				growl.error( gettext( 'An error occurred while saving the budget form. Please try again.' ) );
			} );
		};

		$scope.shareForm = function () {
			$modal.open( {
				backdrop:    'static',
				scope:       $scope,
				keyboard:    false,
				templateUrl: 'states/ministry/forms/edit/share-form.modal.html',
				controller:  function ( $scope, $modalInstance, $state ) {
					$scope.ministries = ministries;
					$scope.selected = {ministries: []};

					$scope.share = function () {
						var sharedForm = {
							mpd_def_id:             form.mpd_def_id,
							ministry_id:            ministry.ministry_id,
							shared_with_ministries: $scope.selected.ministries
						};
						MPDForms.update( sharedForm ).$promise.then( function ( value, responseHeaders ) {
							// Notify on success
							growl.success( gettext( 'Budget Form successfully shared.' ) );

							// Close Modal
							$modalInstance.close();
						}, function ( httpResponse ) {
							// Notify on failure
							growl.error( gettext( 'An error occurred while sharing the budget form. Please try again.' ) );

							$modalInstance.dismiss();
						} );
					};

					$scope.cancel = function () {
						$modalInstance.dismiss();
					};
				}
			} ).result.then( function () {
					// Reload on success
					$scope.editForm.$setPristine();
					$state.go( 'editForm', {}, {reload: true} );
				}, function () {
					// Modal dismissed or canceled
				} );
		};

		$scope.$on( '$stateChangeStart', function ( event, toState, toParams, fromState, fromParams ) {
			// Warn on unsaved changes
			if ( $scope.editForm.$dirty ) {
				event.preventDefault();
				$modal.open( {
					backdrop:    'static',
					keyboard:    false,
					templateUrl: 'states/ministry/unsaved-changes.modal.html',
					controller:  'UnsavedChangesController as dialog'
				} ).result.then( function () {
						// Discard changes and proceed with transition.
						$scope.editForm.$setPristine();
						$state.go( toState, toParams );
					}, function () {
					} );
			}
		} );

	} );

})( angular.module( 'mpdCalculator.states.forms.edit' ) );
