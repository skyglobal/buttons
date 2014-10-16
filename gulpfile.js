'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var compass = require('gulp-compass');
var prefix = require('gulp-autoprefixer');
var childProcess = require('child_process');
var runSequence = require('run-sequence');
var deploy = require("gulp-gh-pages");
var run = require("gulp-run");
var bower = require('gulp-bower');

var paths= {
    "deploy-remote": "origin",
    "deploy-branch": "gh-pages",
    "imagesSrc": "_images",
    "assets": "_site/assets",
    "jekyll": [
        "**/*.html",
        "**/*.md",
        "!_site/**/*.html",
        "!node_modules/**/*"
    ],
    sass: 'scss',
    "sass-demo": 'demo/scss',
    css: '_site/css'
};


gulp.task('sass-demo', function() {
    browserSync.notify('<span style="color: grey">Running:</span> Sass compiling');
    return gulp.src(paths["sass-demo"] + '/**/*.scss')
        .pipe(compass({
            config_file: 'config.rb',
            css: paths.css,
            sass: paths["sass-demo"],
            bundle_exec: true,
            time: true
        }))
        .pipe(prefix("last 2 versions", "> 1%"))
        .pipe(gulp.dest(paths.css))
        .pipe(browserSync.reload({stream:true}));
});


gulp.task('sass', function() {
    browserSync.notify('<span style="color: grey">Running:</span> Sass compiling');
    return gulp.src(paths["sass"] + '/*.scss')
        .pipe(compass({
            config_file: 'config.rb',
            css: paths.css,
            sass: paths["sass"],
            bundle_exec: true,
            time: true
        }))
        .pipe(prefix("last 2 versions", "> 1%"))
        .pipe(gulp.dest(paths.css))
        .pipe(browserSync.reload({stream:true}));
});


gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: "_site"
        }
    });
});



gulp.task('watch', function() {
    gulp.watch(paths.jekyll, ['jekyll-rebuild']);
    gulp.watch(paths.sass + '/**/*.scss', ['sass']);
    gulp.watch(paths['sass-demo'] + '/**/*.scss', ['sass-demo']);
});



gulp.task('jekyll-build', function (done) {
    return childProcess.spawn('bundle', ['exec', 'jekyll', 'build'], {stdio: 'inherit'})
        .on('close', done);
});

gulp.task('jekyll-rebuild', function() {
    return runSequence(['jekyll-build','sass'], function () {
        browserSync.reload();
    });
});

gulp.task('build', function(cb) {
    return runSequence(['jekyll-build','bower'], ['sass', 'sass-demo'],
        cb
    );
});


gulp.task('gh-pages', function () {
    gulp.src("./_site/**/*")
        .pipe(deploy({
            cacheDir: '.tmp'
        })).pipe(gulp.dest('/tmp/gh-pages'));
});


gulp.task('bower', function() {
    return bower()
});

gulp.task('run-release-bower', function(cb) {
    run('git tag -a v'+ pkg.version +' -m "release v' + pkg.version +' for bower"; git push origin master v'+ pkg.version).exec();
});


gulp.task('serve', function(callback) {
    return runSequence(
        'build',
        ['sass-demo','sass'],
        ['browserSync', 'watch'],
        callback
    );
});


gulp.task('release:gh-pages', function(cb) {
    return runSequence(
        'build',
        'gh-pages',
        cb
    );
});

gulp.task('release:bower', function(cb) {
    return runSequence(
        'build',
        'run-release-bower',
        cb
    );
});