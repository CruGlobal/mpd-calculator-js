(function (module) {
    'use strict';

    module.run(function ($rootScope, gettextCatalog) {
        var loadLanguage = function (locale, locales) {
            if (locales.length === 0) {
                gettextCatalog.setCurrentLanguage(locale);
            }
            else {
                var current = locales.shift();
                gettextCatalog
					.loadRemote('languages/' + current.join('-') + '.json')
					.then(function (response) {
					    gettextCatalog.setStrings(locale, response.data[current.join('_')]);
					})
					.finally(function () {
					    loadLanguage(locale, locales);
					})
            }
        };

        $rootScope.$watch('locale', function (locale, oldLocale) {
            if (angular.isUndefined(locale) || locale === '') return;
            var locales = [],
				parts = locale.split('-');
            // Given 'ku-Arab-IQ' locale
            // locales will be [['ku'], ['ku','Arab'], ['ku','Arab','IQ']]
            for (var i = 0; i < parts.length; i++) {
                locales.push(parts.slice(0, i + 1));
            }
            loadLanguage(locale, locales)
        });

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            if (angular.isDefined(toParams.min_code) && toParams.min_code !== '') {
                switch (toParams.min_code) {
                    case 'GUE':
                        $rootScope.locale = 'en-US';
                        break;
                }
            }
        });
        //$rootScope.locale = "fr";
    });

})(angular.module('mpdCalculator'));