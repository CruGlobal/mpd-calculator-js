(function ( module ) {
	'use strict';

	module.factory( 'MPDForms', function ( $log, $resource, Settings ) {
		var transformFormRequest = function ( form, headersGetter ) {

			// Fix view_order based on array index
			angular.forEach( form.sections, function ( section, sectionIndex ) {
				section.view_order = sectionIndex + 1;
				angular.forEach( section.questions, function ( question, questionIndex ) {
					question.view_order = questionIndex + 1;
				} );
			} );

			return angular.isObject( form ) ? angular.toJson( form ) : form;
		};

		return $resource( Settings.api.measurements( '/mpd_def/:mpd_def_id' ), {
			mpd_def_id:  '@mpd_def_id',
			ministry_id: '@ministry_id'
		}, {
			'get':    {method: 'GET'},
			'query':  {method: 'GET', isArray: true},
			'save':   {method: 'POST', transformRequest: transformFormRequest},
			'update': {method: 'PUT', transformRequest: transformFormRequest}
		} );
	} );
})( angular.module( 'mpdCalculator.api.measurements' ) );
