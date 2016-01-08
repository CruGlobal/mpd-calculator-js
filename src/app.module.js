(function () {
	'use strict';

	angular.module( 'mpdCalculator', [
		// Dependencies
		'gettext',
		'ui.router',
		'ngSanitize',
		'ui.select',
		'mpdCalculator.settingsService',
		'mpdCalculator.api.measurements',

		// States
		'mpdCalculator.states.budgets',
		'mpdCalculator.states.budgets.budget.edit',
		'mpdCalculator.states.budgets.create',
		'mpdCalculator.states.forms',
		'mpdCalculator.states.forms.edit',
		'mpdCalculator.states.select'
	] );
})();
