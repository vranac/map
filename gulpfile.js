var gulp = require('gulp');
var less = require('gulp-less');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var htmlmin = require('gulp-htmlmin');
var clean = require('gulp-clean');
var doxx = require('gulp-doxx');
var replace = require('gulp-replace');
var runSequence = require('run-sequence');
var ga = require('gulp-ga');
var iife = require('gulp-iife');
var inlinesource = require('gulp-inline-source');
var imagemin = require('gulp-imagemin');
var base64 = require('gulp-base64');

var paths = {};

var gaConfig = {
    url: 'auto',
    uid: 'UA-52141130-3',
    sendPageView: true
};

gulp.task('default', function () {
    return runSequence(
        'build'
        ,'inlinesource'
        //,'docs'
    );
});

gulp.task('build', [
    'build:less'
    ,'build:js'
    ,'build:img'
    ,'build:html'
    ,'build:fonts'
]);

gulp.task('inlinesource', function () {
  return runSequence(
    'inlinesource:html'
    ,'inlinesource:clean'
  );
});

gulp.task('inlinesource:html', function () {
  return gulp.src('./dist/index.html')
        .pipe(inlinesource())
        .pipe(base64())
        .pipe(gulp.dest('./dist'));
});

gulp.task('inlinesource:clean', function () {
  return gulp.src('./dist/map.min.*', {read: false})
      .pipe(clean());
});


paths.less = [
    './src/less/*.less'
];

gulp.task('build:less', function () {
    return gulp.src(paths.less)
        .pipe(less())
        .pipe(cssnano())
        .pipe(concat('map.min.css'))
        .pipe(gulp.dest('./dist'));
});

paths.js = [
    'src/js/bootstrap.js'
    ,'src/js/util.js'
    ,'src/js/const/*.js'
    ,'src/js/extend/googleMaps.js'
    ,'map.config.js'
    ,'src/js/model/marker.js'
    ,'src/js/model/track.js'
    ,'src/js/model/kml.js'
    ,'src/js/service/i18n.js'
    ,'src/js/service/chart.js'
    ,'src/js/service/map.js'
    ,'src/js/service/storage.js'
    ,'src/js/loader.js'
    ,'src/js/api.js'
    ,'src/js/init.js'
];

gulp.task('build:js', function () {
    return gulp.src(paths.js)
        .pipe(concat('map.min.js'))
        .pipe(replace(/["']use strict["'];/g, ''))
        .pipe(iife({
            params: ['window', 'document', '$', '_', 'google', 'Promise'],
            args: ['window', 'document', 'jQuery', '_', 'google', 'Promise']
        }))
        .pipe(uglify({
            mangle: true
        }))
        .pipe(gulp.dest('./dist'));
});

paths.html = [
    './src/index.html'
];

gulp.task('build:img', function () {
    return gulp.src('src/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/img'))
});

gulp.task('build:html', function () {
    return gulp.src(paths.html)
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build:fonts', function () {
    return gulp.src('src/fonts/*')
        .pipe(gulp.dest('./dist/fonts'))
});

gulp.task('docs:clean', function () {
    return gulp.src([
        'docs/*'
      ], {read: false})
      .pipe(clean());
});

gulp.task('docs:copy:dist', function () {
    return gulp
        .src([
            'dist/*'
            ,'dist/**/*'
        ])
        .pipe(gulp.dest('docs/dist'));
});

gulp.task('docs:copy:data', function () {
    return gulp
        .src([
            'data/*'
            ,'data/**/*'
        ])
        .pipe(gulp.dest('docs/data'));
});

gulp.task('docs:copy:examples', function () {
    return gulp
        .src([
            'examples/**/*'
        ])
        .pipe(ga(gaConfig))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true,
            minifyCSS: true
        }))
        .pipe(gulp.dest('docs/examples'));
});

gulp.task('docs:copy', [
    'docs:copy:dist'
    ,'docs:copy:data'
    ,'docs:copy:examples'
]);

gulp.task('docs', function () {
    runSequence(
        'docs:clean',
        'docs:copy',
        function () {
            gulp.src([
                './README.md',
                './src/**/*.js'
            ], {base: '.'})
                .pipe(doxx({
                    title: 'ФRuŠKać',
                    urlPrefix: '/map'
                }))
                .pipe(replace(/http:\/\/([^/]+)/g, '//$1')) // fix to allow https
                .pipe(ga(gaConfig))
                .pipe(gulp.dest('docs'));
        }
    );
});

gulp.task('watch', function () {
  return runSequence(
    'build',
    [
        'watch:js'
        ,'watch:less'
        ,'watch:html'
        //,'watch:docs'
    ]
  )
});

gulp.task('watch:js', function () {
    gulp.watch(paths.js, ['build:js']);
});

gulp.task('watch:less', function () {
    gulp.watch(paths.less, ['build:less']);
});

gulp.task('watch:html', function () {
    gulp.watch(paths.html, ['build:html']);
});
