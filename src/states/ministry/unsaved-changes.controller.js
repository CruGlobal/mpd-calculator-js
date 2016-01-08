(function ( module ) {
	'use strict';

	function UnsavedChangesController( $modalInstance ) {
		this.$modalInstance = $modalInstance;
	}

	UnsavedChangesController.prototype.ok = function () {
		this.$modalInstance.close();
	};

	UnsavedChangesController.prototype.cancel = function () {
		this.$modalInstance.dismiss();
	};

	module.controller( 'UnsavedChangesController', UnsavedChangesController );

})( angular.module( 'mpdCalculator.states.ministry' ) );
