'use strict';

var gulp = require('gulp');
var componentHelper = require('gulp-component-helper')(gulp);
var paths = componentHelper.paths;
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');