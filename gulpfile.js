var gulp        = require('gulp');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');

var paths = {
  js: ['js/**.js']
};

function generateJs() {
  return gulp.src(paths.js)
    .pipe(uglify())
    .pipe(concat('firstpr.js'))
    .pipe(gulp.dest('.'));
}

function watch() {
  gulp.watch(paths.js, generateJs)
}

gulp.task('js', generateJs);
gulp.task('build', generateJs);
gulp.task('watch', watch);
gulp.task('default', gulp.series('build', 'watch'));
