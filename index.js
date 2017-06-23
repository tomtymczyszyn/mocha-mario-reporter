var mocha = require('mocha');
var player = require('play-sound')(opts = {});
var path = require('path');
var fs = require('fs');

/**
 * Mocha variables
 */
var Base = mocha.reporters.Base;
var inherits = mocha.utils.inherits;
var color = Base.color;

/**
 * Sounds directories
 */
var failSound = path.join(__dirname, "..", "mocha-mario-reporter/sounds/fail.wav");
var passSound = path.join(__dirname, "..", "mocha-mario-reporter/sounds/pass.wav");

/**
 * Game over ascii text
 */
var gameOverFile = path.join(__dirname, '..', 'mocha-mario-reporter/gameover.txt');

var gameOverText = '';
fs.readFile(gameOverFile, function (err, data) {
  if (err) throw err;
  gameOverText = data.toString();
});

/**
 * Play sound function
 * 
 * @param {string} sound 
 */
function playSound (sound) {
  player.play(sound, function(err){
    if (err) throw err;
  });
}

/**
 * Initialize `mochaMarioReporter` test reporter
 *
 * @param {runner} runner
 */
function mochaMarioReporter (runner) {
  Base.call(this, runner);

  var self = this;
  var indents = 0;
  var n = 0;
  var failures = 0;

  function indent () {
    return Array(indents).join('  ');
  }

  runner.on('start', function () {
    console.log();
  });

  runner.on('suite', function (suite) {
    ++indents;
    console.log(color('suite', '%s%s'), indent(), suite.title);
  });

  runner.on('suite end', function () {
    --indents;
    if (indents === 1) {
      console.log();
    }
  });

  runner.on('pending', function (test) {
    var fmt = indent() + color('pending', '  - %s');
    console.log(fmt, test.title);
  });

  runner.on('pass', function (test) {
    var fmt;
    if (test.speed === 'fast') {
      fmt = indent() +
        color('checkmark', '  ' + Base.symbols.ok) +
        color('pass', ' %s');
      console.log(fmt, test.title);
    } else {
      fmt = indent() +
        color('checkmark', '  ' + Base.symbols.ok) +
        color('pass', ' %s') +
        color(test.speed, ' (%dms)');
      console.log(fmt, test.title, test.duration);
    }
  });

  runner.on('fail', function (test) {
    failures++;
    console.log(indent() + color('fail', '  %d) %s (╯°□°）╯︵ ┻━┻'), ++n, test.title);
  });

  runner.on('end', function() {
    if (failures > 0){
      console.log(gameOverText);
      playSound(failSound);
    }else{
      playSound(passSound);
    }
    self.epilogue();
  });
}

/**
 * Inherit from `Base.prototype`.
 */
inherits(mochaMarioReporter, Base);

/**
 * Export module `mocha-mario-reporter`
 */
module.exports = mochaMarioReporter;