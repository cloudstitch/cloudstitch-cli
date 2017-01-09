'use strict';

var gulp = require('gulp-help')(require('gulp'), process.argv);
var argv = require('minimist')(process.argv.slice(2));
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var merge2 = require('merge2');

// gulp.task('build', function () {
//   var clientProject = ts.createProject({
//     declaration: true,
//     noResolve: true,
//     module: 'system',
//     // typescript: require('typescript'),
//     target: 'es5',
//     outFile: 'inside.js',
//     sourceMap: true,
//     formatCodeOptions: {
//       "indentSize": 2,
//       "tabSize": 2,
//       "convertTabsToSpaces": true,
//       "insertSpaceAfterCommaDelimiter": true,
//       "insertSpaceAfterSemicolonInForStatements": true,
//       "insertSpaceBeforeAndAfterBinaryOperators": true,
//       "insertSpaceAfterKeywordsInControlFlowStatements": true,
//       "insertSpaceAfterFunctionKeywordForAnonymousFunctions": false,
//       "insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis": false,
//       "placeOpenBraceOnNewLineForFunctions": false,
//       "placeOpenBraceOnNewLineForControlBlocks": false
//     }
//   });
  
//   var files = [
//     'lib/**/*.ts'
//   ];

//   var tsResult = gulp.src(files)
//                     // .pipe(sourcemaps.init())
//                     .pipe(clientProject());

//   tsResult.dts.pipe(gulp.dest('./bin'));
  
//   var dependencies = gulp.src([

//   ]);
//   merge2(
//     dependencies,      
//     tsResult.js
//   ).pipe(
//     concat('inside.js')
//   ).pipe(gulp.dest(config.output.clientTypescript));
// });