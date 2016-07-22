'use strict';

var gulp = require('gulp'),
	path = require('path'),
	del = require('del'),
	crypto = require('crypto'),
	url = require('url'),
	request = require('request'),
	fs= require('fs');

var $ = require('gulp-load-plugins')({
	pattern: ['gulp-*']
});

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

function downloadFromOneSky(callback) {
	var onesky = require('./onesky.json'),
		async = require('async'),
		ts = Math.floor(new Date() / 1000);

	// Fetch list of project languages
	request.get({
			url: url.format({
				protocol: 'https',
				host: 'platform.api.onesky.io',
				pathname: '/1/projects/' + onesky.project_id + '/languages',
				query: {
					api_key: onesky.api_key,
					timestamp: ts,
					dev_hash: crypto.createHash('md5').update(ts + onesky.api_secret).digest('hex')
				}
			})
		},
		function (error, response, body) {
			var languages = JSON.parse(body);

			// Do not download "is_base_language" true
			// Do not download "translation_progress" 0.0%
			// Download each language that "is_ready_to_publish"
			async.each(languages.data, function (language, cb) {
				if (language.is_base_language === true || language.translation_progress === '0.0%' || language.is_ready_to_publish === false) {
					cb();
				} else {
					var ts = Math.floor(new Date() / 1000),
						options = {
							url: url.format({
								protocol: 'https',
								host: 'platform.api.onesky.io',
								pathname: '/1/projects/' + onesky.project_id + '/translations',
								query: {
									api_key: onesky.api_key,
									timestamp: ts,
									dev_hash: crypto.createHash('md5').update(ts + onesky.api_secret).digest('hex'),
									locale: language.code,
									source_file_name: 'mpd-calculator.pot',
									export_file_name: language.code + '.po'
								}
							})
						};
					request
						.get(options)
						.pipe(fs.createWriteStream('src/languages/' + language.code + '.po').on('finish', cb))
				}
			}, callback);
		})
}

gulp.task( 'clean', function ( callback ) {
	del( ['dist', '.tmp'], callback );
} );

gulp.task( 'html', ['clean', 'bower', 'copyIframeResizer', 'copyShims', 'fonts', 'partials', 'languages'], function () {
	var partialsInjectFile = gulp.src('.tmp/partials/templateCacheHtml.js', { read: false });
	var partialsInjectOptions = {
		starttag: '<!-- inject:partials -->',
		addPrefix: '..',
		addRootSlash: false
	};

	var htmlFilter = $.filter('*.html', {restore: true});
	var jsFilter = $.filter('**/*.js', {restore: true});
	var cssFilter = $.filter('**/*.css', {restore: true});
	var notIndexFilter = $.filter(['*', '!index.html'], {restore: true});

	return gulp.src( 'src/*.html' )
		.pipe($.inject(partialsInjectFile, partialsInjectOptions))
		.pipe($.useref())
		.pipe(jsFilter)
		.pipe($.sourcemaps.init() )
		.pipe($.ngAnnotate())
		.pipe($.uglify({ preserveComments: $.uglifySaveLicense }))
		.pipe($.sourcemaps.write( '.' ) )
		.pipe(jsFilter.restore)
		.pipe(cssFilter)
		.pipe($.replace('../../bower_components/bootstrap/fonts/', '../fonts/'))
		.pipe($.csso())
		.pipe(cssFilter.restore)
		.pipe(notIndexFilter)
		.pipe($.rev())
		.pipe(notIndexFilter.restore)
		.pipe($.revReplace())
		.pipe(htmlFilter)
		.pipe($.htmlmin({
			removeEmptyAttributes: true
		}))
		.pipe(htmlFilter.restore)
		.pipe( gulp.dest( 'dist' ) );
} );

gulp.task('partials', function () {
	return gulp.src(['src/**/*.html'])
		.pipe($.htmlmin({
			removeEmptyAttributes: true
		}))
		.pipe($.angularTemplatecache('templateCacheHtml.js', {
			module: 'mpdCalculator'
		}))
		.pipe(gulp.dest('.tmp/partials/'));
});

gulp.task( 'copyIframeResizer', ['clean'], function () {
	return gulp.src( ['bower_components/iframe-resizer/js/iframeResizer.min.js'] )
		.pipe( gulp.dest( 'dist' ) );
} );

gulp.task( 'copyShims', ['clean'], function () {
	return gulp.src( ['bower_components/webshim/js-webshim/minified/shims/**/*'] )
		.pipe( gulp.dest( 'dist/js/shims' ) );
} );

gulp.task('fonts', ['clean'], function () {
	return gulp.src( ['bower_components/bootstrap/fonts/*'] )
		.pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
		.pipe($.flatten())
		.pipe(gulp.dest('dist/fonts/'));
});

gulp.task( 'images', ['clean'], function () {
	return gulp.src( ['src/img/**/*.png'] )
		.pipe( gulp.dest( 'dist/img' ) );
} );

gulp.task( 'bower', function () {
	return $.bower();
} );

gulp.task( 'build', ['images', 'html'] );

gulp.task( 'default', ['build'] );

gulp.task( 'less', function () {
	return gulp.src( ['src/app.imports.less', 'src/**/*.less'] )
		.pipe($.concat( 'app.css' ) )
		.pipe($.less() )
		.pipe( gulp.dest( 'src/css' ) );
} );

gulp.task( 'watch', function () {
	gulp.watch( ['src/app.imports.less', 'src/**/*.less'], ['less'] );
} );

gulp.task( 'pot', function () {
	return gulp.src( ['src/**/*.html', 'src/**/*.js'] )
		.pipe($.angularGettext.extract( 'mpd-calculator.pot', {} ) )
		.pipe( gulp.dest( 'src/languages/' ) );
} );

gulp.task( 'oneskyup', ['pot'], function () {
	return gulp.src( 'src/languages/mpd-calculator.pot' )
		.pipe( uploadToOneSky() );
} );

gulp.task( 'oneskydown', function ( callback ) {
	downloadFromOneSky( callback );
});

gulp.task('po', ['oneskydown'], function () {
	return gulp.src('src/languages/**/*.po')
		.pipe($.angularGettext.compile({
			format: 'json'
		}))
		.pipe(gulp.dest('src/languages/'));
});

gulp.task('languages', ['clean'], function () {
	return gulp.src( ['src/languages/**/*.json'] )
		.pipe( gulp.dest( 'dist/languages' ) );
} );
