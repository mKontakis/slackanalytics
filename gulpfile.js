// grab our gulp packages
var gulp   = require('gulp'),
    jshint = require('gulp-jshint');

gulp.task('default', ['watch']);

// configure the jshint task
gulp.task('jshint', function() {
    return gulp.src('app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', function() {
    gulp.watch('app/**/*.js', ['jshint']);
});