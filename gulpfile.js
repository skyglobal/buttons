'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var compass = require('gulp-compass');
var prefix = require('gulp-autoprefixer');
var runSequence = require('run-sequence');
var deploy = require("gulp-gh-pages");
var run = require("gulp-run");
var bower = require('gulp-bower');
var pkg = require('./package.json');
var aws_s3 = require('gulp-aws-s3').setup({bucket: process.env.AWS_SKYGLOBAL_BUCKET});

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
        port: 3456,
        server: {
            baseDir: "_site"
        }
    });
});



gulp.task('watch', function() {
//    gulp.watch(paths.jekyll, ['jekyll-rebuild']);
    gulp.watch(paths.sass + '/**/*.scss', ['sass']);
    gulp.watch(paths['sass-demo'] + '/**/*.scss', ['sass-demo']);
});



//gulp.task('jekyll-build', function (done) {
//    return childProcess.spawn('bundle', ['exec', 'jekyll', 'build'], {stdio: 'inherit'})
//        .on('close', done);
//});
//
//gulp.task('jekyll-rebuild', function() {
//    return runSequence(['jekyll-build','sass'], function () {
//        browserSync.reload();
//    });
//});


gulp.task('build', function(cb) {
    return runSequence(['sass', 'sass-demo','create-site'],
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

gulp.task('create-site', function() {
    gulp.src(['demo/*.html'])
        .pipe(gulp.dest('_site'))
});

gulp.task('aws', function() {
    gulp.src(['scss/buttons.scss','_site/css/buttons.css']).pipe(
        aws_s3.upload({ path:'components/buttons/' + pkg.version + '/'} ));
});

gulp.task('run-release-bower', function(cb) {
    run('git tag -a v'+ pkg.version +' -m "release v' + pkg.version +' for bower"; git push origin master v'+ pkg.version).exec();
});

gulp.task('connect', function() {
    connect.server({
        root: '_site',
        port: 3456,
        livereload: true
    });
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

gulp.task('release:cdn', function(cb) {
    return runSequence(
        'build',
        'aws',
        cb
    );
});