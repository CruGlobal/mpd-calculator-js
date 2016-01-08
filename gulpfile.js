'use strict';

var gulp        = require( 'gulp' ),
	bower       = require( 'gulp-bower' ),
	del         = require( 'del' ),
	cdnizer     = require( 'gulp-cdnizer' ),
	htmlreplace = require( 'gulp-html-replace' ),
	minifyHTML  = require( 'gulp-minify-html' ),
	concat      = require( 'gulp-concat' ),
	ngAnnotate  = require( 'gulp-ng-annotate' ),
	uglify      = require( 'gulp-uglify' ),
	minifyCSS   = require( 'gulp-minify-css' ),
	ngHtml2Js   = require( 'gulp-ng-html2js' ),
	sourcemaps  = require( 'gulp-sourcemaps' ),
	path        = require( 'path' ),
	crypto      = require( 'crypto' ),
	less        = require( 'gulp-less' ),
	gettext     = require( 'gulp-angular-gettext' ),
	url         = require( 'url' ),
	request     = require( 'request' ),
	revisions   = {};

function revisionMap() {

	function md5( str ) {
		return crypto.createHash( 'md5' ).update( str ).digest( 'hex' ).slice( 0, 8 );
	}

	function saveRevision( file, callback ) {
		revisions[file.relative] = file.relative + '?rev=' + md5( file.contents );
		callback( null, file );
	}

	return require( 'event-stream' ).map( saveRevision );
}

function uploadToOneSky() {
	var onesky = require( './onesky.json' ),
		ts     = Math.floor( new Date() / 1000 );

	function uploadPOTFile( file, callback ) {
		//https://github.com/onesky/api-documentation-platform/blob/master/resources/file.md#upload---upload-a-file
		request.post( {
			url:      url.format( {
				protocol: 'https',
				host:     'platform.api.onesky.io',
				pathname: '/1/projects/' + onesky.project_id + '/files',
				query:    {
					api_key:   onesky.api_key,
					timestamp: ts,
					dev_hash:  crypto.createHash( 'md5' ).update( ts + onesky.api_secret ).digest( 'hex' )
				}
			} ),
			formData: {
				file:        {
					value:   file.contents,
					options: {
						filename: file.relative
					}
				},
				file_format: 'GNU_POT'
			}
		}, function ( err, httpResponse, body ) {
			if ( err ) {
				callback( err );
			}
			callback( null, file );
		} );
	}

	return require( 'event-stream' ).map( uploadPOTFile );
}

gulp.task( 'clean', function ( callback ) {
	del( ['dist'], callback );
} );

gulp.task( 'html', ['clean', 'bower', 'scripts', 'library', 'partials', 'styles', 'htaccess'], function () {
	return gulp.src( 'src/*.html' )
		.pipe( cdnizer( {
			allowMin: true,
			files:    [
				// JavaScript
				'google:jquery',
				'google:angular-loader',
				'google:angular-resource',
				'google:angular-sanitize',
				'google:angular',
				{
					file:    'bower_components/angular-bootstrap/*.js',
					package: 'angular-bootstrap',
					cdn:     'cdnjs:angular-ui-bootstrap:${ filenameMin }'
				},
				{
					file:    'bower_components/angular-ui-router/**/*.js',
					package: 'angular-ui-router',
					cdn:     'cdnjs:angular-ui-router:${ filenameMin }'
				},
				{
					file:    'bower_components/moment/*.js',
					package: 'moment',
					cdn:     'cdnjs:moment.js:${ filenameMin }'
				},
				{
					file:    'bower_components/underscore/underscore.js',
					package: 'underscore',
					cdn:     'cdnjs:underscore.js:underscore-min.js'
				},
				{
					file:    'bower_components/ngstorage/ngStorage.js',
					package: 'ngStorage',
					cdn:     '//cdnjs.cloudflare.com/ajax/libs/ngStorage/${ version }/ngStorage.min.js'
				},
				{
					file:    'bower_components/webshim/js-webshim/dev/polyfiller.js',
					package: 'webshim',
					cdn:     '//cdnjs.cloudflare.com/ajax/libs/webshim/${ version }/minified/polyfiller.js'
				},
				{
					file:    'bower_components/jquery-ui/jquery-ui.js',
					package: 'jquery-ui',
					cdn:     '//code.jquery.com/ui/${ version }/jquery-ui.min.js'
				},
				{
					file:    'bower_components/angular-ui-sortable/sortable.js',
					package: 'angular-ui-sortable',
					cdn:     '//cdnjs.cloudflare.com/ajax/libs/angular-ui-sortable/${ version }/sortable.min.js'
				},
				{
					file:    'bower_components/ui-select/dist/select.js',
					package: 'ui-select',
					cdn:     '//cdnjs.cloudflare.com/ajax/libs/angular-ui-select/${ version }/select.min.js'
				},

				// CSS
				{
					file:    'bower_components/bootstrap/**/*.css',
					package: 'bootstrap',
					cdn:     'cdnjs:twitter-bootstrap:css/${ filenameMin }'
				},
				{
					file:    'bower_components/bootswatch/superhero/bootstrap.css',
					package: 'bootswatch',
					cdn:     '//maxcdn.bootstrapcdn.com/bootswatch/${ version }/superhero/bootstrap.min.css'
				}
			]
		} ) )
		.pipe( htmlreplace( {
			application: [
				'js/' + revisions['app.min.js'],
				'js/' + revisions['templates.min.js']
			],
			library:     'js/' + revisions['library.min.js'],
			styles:      'css/' + revisions['styles.min.css']
		} ) )
		.pipe( gulp.dest( 'dist' ) );
} );

gulp.task( 'scripts', ['clean'], function () {
	return gulp.src( ['src/**/*.module.js', 'src/**/*.state.js', 'src/**/*.js'] )
		.pipe( sourcemaps.init() )
		.pipe( concat( 'app.min.js' ) )
		.pipe( ngAnnotate() )
		.pipe( uglify() )
		.pipe( revisionMap() )
		.pipe( sourcemaps.write( '.' ) )
		.pipe( gulp.dest( 'dist/js' ) );
} );

/* Library Task - Script files not available in CDN */
gulp.task( 'library', ['clean', 'bower'], function () {
	return gulp.src( [
			'bower_components/angular-gettext/dist/angular-gettext.js',
			'bower_components/angular-growl-v2/build/angular-growl.js',
			'bower_components/angular-dragdrop/src/angular-dragdrop.js',
			'bower_components/iframe-resizer/src/iframeResizer.contentWindow.js'
		] )
		.pipe( sourcemaps.init() )
		.pipe( concat( 'library.min.js' ) )
		.pipe( uglify() )
		.pipe( revisionMap() )
		.pipe( sourcemaps.write( '.' ) )
		.pipe( gulp.dest( 'dist/js' ) );
} );

gulp.task( 'partials', ['clean'], function () {
	return gulp.src( ['src/**/*.html'] )
		.pipe( sourcemaps.init() )
		.pipe( minifyHTML() )
		.pipe( ngHtml2Js( {
			moduleName:    'mpdCalculator',
			declareModule: false
		} ) )
		.pipe( concat( 'templates.min.js' ) )
		.pipe( uglify() )
		.pipe( revisionMap() )
		.pipe( sourcemaps.write( '.' ) )
		.pipe( gulp.dest( 'dist/js' ) );
} );

gulp.task( 'styles', ['clean', 'less'], function () {
	return gulp.src( ['src/**/*.css'] )
		.pipe( concat( 'styles.min.css' ) )
		.pipe( minifyCSS() )
		.pipe( revisionMap() )
		.pipe( gulp.dest( 'dist/css' ) );
} );

gulp.task( 'images', ['clean'], function () {
	return gulp.src( ['src/img/**/*.png'] )
		.pipe( gulp.dest( 'dist/img' ) );
} );

gulp.task( 'htaccess', ['clean'], function () {
	return gulp.src( 'src/.htaccess' )
		.pipe( gulp.dest( 'dist' ) );
} );

gulp.task( 'bower', function () {
	return bower();
} );

gulp.task( 'build', ['images', 'html'] );

gulp.task( 'default', ['build'] );

gulp.task( 'less', function () {
	return gulp.src( ['src/app.imports.less', 'src/**/*.less'] )
		.pipe( concat( 'app.css' ) )
		.pipe( less() )
		.pipe( gulp.dest( 'src/css' ) );
} );

gulp.task( 'watch', function () {
	gulp.watch( ['src/app.imports.less', 'src/**/*.less'], ['less'] );
} );

gulp.task( 'pot', function () {
	return gulp.src( ['src/**/*.html', 'src/**/*.js'] )
		.pipe( gettext.extract( 'mpd-calculator.pot', {} ) )
		.pipe( gulp.dest( 'src/languages/' ) );
} );

gulp.task( 'onesky', ['pot'], function () {
	return gulp.src( 'src/languages/mpd-calculator.pot' )
		.pipe( uploadToOneSky() );
} );

gulp.task( 'po', function () {
	return gulp.src( 'src/translations/**/*.po' )
		.pipe( gettext.compile( {
			module: 'testing'
//			format: 'json'
		} ) )
		.pipe( gulp.dest( 'src/translations/' ) );
} );
