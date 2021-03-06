#!/usr/bin/env node

require('colorful').colorful();

var program = require('commander');

program.on('--help', () => {
  console.log('  Usage:'.to.bold.blue.color);
  console.log();
  console.log('    $', 'hilo-tools run lint'.to.magenta.color, 'lint source within lib');
  console.log('    $', 'hilo-tools run pub'.to.magenta.color, 'publish component');
  console.log('    $', 'hilo-tools run server'.to.magenta.color, 'start server');
  console.log('    $', 'hilo-tools run chrome-test'.to.magenta.color, 'run chrome tests');
  console.log();
});

program.parse(process.argv);

var task = program.args[0];

if (!task) {
  program.help();
} else if (task === 'server') {
  var port = process.env.npm_package_config_port || 8000;
  console.log(`Listening at http://localhost:${port}`);
  var app = require('../server/')();
  app.listen(port);
} else {
  console.log('hilo-tools run', task);
  var gulp = require('gulp');
  require('../gulpfile');
  gulp.start(task);
}
