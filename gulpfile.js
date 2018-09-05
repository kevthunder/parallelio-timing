var gulp = require('gulp');
var rename = require("gulp-rename");
var coffee = require('gulp-coffee');
var uglify = require('gulp-uglify-es').default;
var mocha = require('gulp-mocha');
var wrapper = require('spark-wrapper');

gulp.task('coffee', function() {
  return gulp.src('./src/*.coffee')
    .pipe(coffee({bare: true}))
    .pipe(wrapper({namespace:'Parallelio'}))
    .pipe(rename('timing.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('coffeeTest', function() {
  return gulp.src('./test/src/*.coffee')
    .pipe(coffee())
    .pipe(gulp.dest('./test/'));
});

gulp.task('compress', gulp.series('coffee', function () {
  return gulp.src('./dist/timing.js')
    .pipe(uglify())
    .pipe(rename('timing.min.js'))
    .pipe(gulp.dest('./dist/'));
}));

var build
gulp.task('build', build = gulp.series('coffee', 'compress', function () {
    console.log('Build Complete');
}));

gulp.task('test', gulp.series('coffee','coffeeTest', function() {
  return gulp.src('./test/tests.js')
    .pipe(mocha());
}));

gulp.task('default', build);