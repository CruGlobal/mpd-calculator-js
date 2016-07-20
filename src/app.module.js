(function () {
	'use strict';

	angular.module( 'mpdCalculator', [
		// Dependencies
        'cas-auth-api',
		'gettext',
		'ui.router',
		'ngSanitize',
		'ui.select',
		'mpdCalculator.settingsService',
		'mpdCalculator.api.mpdCalculator',
        

		// States
		'mpdCalculator.states.budgets',
		'mpdCalculator.states.budgets.budget.edit',
		'mpdCalculator.states.budgets.create',
		'mpdCalculator.states.forms',
		'mpdCalculator.states.forms.edit',
		'mpdCalculator.states.select'
	] );
})();
