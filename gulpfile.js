'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var runSequence = require('run-sequence');
var deploy = require("gulp-gh-pages");
var run = require("gulp-run");
var bower = require('gulp-bower');
var pkg = require('./package.json');
var aws_s3 = require('gulp-aws-s3').setup({bucket: process.env.AWS_SKYGLOBAL_BUCKET});

var paths= {
    "site": [
        "demo/*.html"
    ],
    sass: 'scss',
    "sass-demo": 'demo/scss',
    css: '_site/css'
};


gulp.task('sass', function() {
    browserSync.notify('<span style="color: grey">Running:</span> Sass compiling');
    return gulp.src([paths["sass-demo"] + '/**/*.scss',paths["sass"] + '/*.scss'])
        .pipe(sass({
            includePaths: ['scss','bower_components'],
            outputStyle: 'compressed'
        }))
        .pipe(autoprefixer())
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
    gulp.watch(paths.site, ['create-site']);
    gulp.watch([paths['sass'] + '/**/*.scss',paths['sass-demo'] + '/**/*.scss'], ['sass']);
});

gulp.task('build', function(cb) {
    return runSequence('bower', ['sass', 'create-site'],
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
    gulp.src(paths['css'] + '/buttons.css')
        .pipe(aws_s3.upload({ path:'components/buttons/' + pkg.version + '/'} ));
});

gulp.task('run-release-bower', function(cb) {
    run('git tag -a v'+ pkg.version +' -m "release v' + pkg.version +' for bower"; git push origin master v'+ pkg.version).exec();
});


gulp.task('serve', function(callback) {
    return runSequence(
        'build',
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