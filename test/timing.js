(function() {
  var Property, PropertyWatcher, TimedWatcher, Timing, assert;

  assert = require('chai').assert;

  Timing = require('../dist/timing');

  PropertyWatcher = require('spark-starter').watchers.PropertyWatcher;

  Property = require('spark-starter').Property;

  TimedWatcher = class TimedWatcher extends PropertyWatcher {
    validContext() {
      return true;
    }

  };

  describe('Timing.Timer', function() {
    it('trigger a callback after a time', function(done) {
      var callback, calls, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer({
        time: 200,
        callback: callback
      });
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 1);
        assert.equal(timer.repetition, 1);
        return done();
      }, 300);
    });
    it('can trigger a callback in loop', function(done) {
      var callback, calls, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer({
        time: 200,
        callback: callback,
        repeat: true
      });
      return setTimeout(function() {
        assert.isTrue(timer.running);
        assert.equal(calls, 2);
        assert.equal(timer.repetition, 2);
        timer.destroy();
        return done();
      }, 500);
    });
    it('trigger multiple callbacks', function(done) {
      var callback, callback2, calls, calls2, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      calls2 = 0;
      callback2 = function() {
        return calls2++;
      };
      timer = new Timing.Timer({
        time: 200,
        callback: callback
      });
      timer.repetitionProperty.events.on('changed', callback2);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 1);
        assert.equal(calls2, 1);
        return done();
      }, 300);
    });
    it('can pause', function(done) {
      var callback, calls, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer({
        time: 200,
        callback: callback
      });
      setTimeout(function() {
        assert.equal(calls, 0);
        assert.isTrue(timer.running);
        timer.pause();
        return assert.isFalse(timer.running);
      }, 100);
      setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 0);
        return timer.unpause();
      }, 300);
      setTimeout(function() {
        assert.isTrue(timer.running);
        return assert.equal(calls, 0);
      }, 350);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 1);
        return done();
      }, 600);
    });
    it('can get elapsed time', function(done) {
      var callback, calls, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer({
        time: 300,
        callback: callback
      });
      setTimeout(function() {
        assert.isAbove(timer.elapsedTime, 80);
        return assert.isBelow(timer.elapsedTime, 120);
      }, 100);
      setTimeout(function() {
        assert.isAbove(timer.elapsedTime, 180);
        return assert.isBelow(timer.elapsedTime, 220);
      }, 200);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(timer.elapsedTime, 300);
        assert.equal(calls, 1);
        return done();
      }, 400);
    });
    it('can get elapsed time with pause', function(done) {
      var callback, calls, mesures, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer({
        time: 200,
        callback: callback
      });
      mesures = [];
      setTimeout(function() {
        assert.equal(calls, 0);
        assert.isTrue(timer.running);
        assert.isAbove(timer.elapsedTime, 75);
        assert.isBelow(timer.elapsedTime, 125);
        timer.pause();
        mesures.push(timer.elapsedTime);
        return assert.isFalse(timer.running);
      }, 100);
      setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 0);
        mesures.push(timer.elapsedTime);
        assert.equal(mesures[mesures.length - 1], mesures[mesures.length - 2]);
        return timer.unpause();
      }, 300);
      setTimeout(function() {
        mesures.push(timer.elapsedTime);
        assert.isAbove(mesures[mesures.length - 1], 125);
        assert.isBelow(mesures[mesures.length - 1], 175);
        assert.isAbove(mesures[mesures.length - 1], mesures[mesures.length - 2]);
        assert.isTrue(timer.running);
        return assert.equal(calls, 0);
      }, 350);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(timer.elapsedTime, 200);
        assert.equal(calls, 1);
        return done();
      }, 600);
    });
    it('can set elapsed time', function(done) {
      var callback, calls, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer({
        time: 200,
        callback: callback
      });
      setTimeout(function() {
        timer.elapsedTime = 0;
        assert.equal(calls, 0);
        return assert.isTrue(timer.running);
      }, 100);
      setTimeout(function() {
        assert.equal(calls, 0);
        return assert.isTrue(timer.running);
      }, 250);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 1);
        return done();
      }, 350);
    });
    it('can set elapsed time to end', function(done) {
      var callback, calls, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer({
        time: 1000,
        callback: callback
      });
      return setTimeout(function() {
        timer.elapsedTime = 1000;
        assert.equal(timer.elapsedTime, 1000);
        assert.equal(calls, 1);
        return done();
      }, 100);
    });
    it('can get prc done', function(done) {
      var callback, calls, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer({
        time: 200,
        callback: callback
      });
      setTimeout(function() {
        assert.isAbove(timer.prc, 0.3);
        return assert.isBelow(timer.prc, 0.7);
      }, 100);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 1);
        return done();
      }, 300);
    });
    it('can get prc done when not running', function() {
      var timer;
      timer = new Timing.Timer({
        timing: {
          running: false
        }
      });
      assert.equal(timer.elapsedTime, 0);
      return assert.equal(timer.prc, 0);
    });
    it('can set prc when not running', function() {
      var timer;
      timer = new Timing.Timer({
        timing: {
          running: false
        }
      });
      assert.equal(timer.elapsedTime, 0);
      assert.equal(timer.prc, 0);
      timer.prc = 0.5;
      assert.equal(timer.elapsedTime, 500);
      return assert.equal(timer.prc, 0.5);
    });
    it('can send update events', function(done) {
      var callback, calls, calls2, timer, update;
      calls = 0;
      callback = function() {
        return calls++;
      };
      calls2 = 0;
      update = function() {
        return calls2++;
      };
      timer = new Timing.Timer({
        time: 200,
        callback: callback
      });
      (new TimedWatcher({
        scope: timer,
        property: 'elapsedTime',
        callback: update
      })).bind();
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 1);
        assert.isAbove(calls2, 10);
        return done();
      }, 300);
    });
    it('stop sending update events while paused', function(done) {
      var callback, calls, calls2, mesures, timer, update;
      calls = 0;
      callback = function() {
        return calls++;
      };
      calls2 = 0;
      update = function() {
        return calls2++;
      };
      timer = new Timing.Timer({
        time: 200,
        callback: callback
      });
      (new TimedWatcher({
        scope: timer,
        property: 'elapsedTime',
        callback: update
      })).bind();
      mesures = [];
      setTimeout(function() {
        assert.equal(calls, 0);
        assert.isAbove(calls2, 10);
        assert.isTrue(timer.running);
        timer.pause();
        mesures.push(calls2);
        return assert.isFalse(timer.running);
      }, 100);
      setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 0);
        mesures.push(calls2);
        assert.equal(mesures[mesures.length - 1], mesures[mesures.length - 2]);
        return timer.unpause();
      }, 300);
      setTimeout(function() {
        mesures.push(calls2);
        assert.isAbove(mesures[mesures.length - 1], mesures[mesures.length - 2]);
        assert.isTrue(timer.running);
        return assert.equal(calls, 0);
      }, 350);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 1);
        return done();
      }, 600);
    });
    return it('does not immediatly trigger change option of property', function(done) {
      var calls, prop, timer;
      calls = 0;
      timer = new Timing.Timer({
        time: 200
      });
      prop = new Property({
        calcul: function(invalidator) {
          return invalidator.prop(timer.prcProperty);
        },
        change: function(old) {
          debugger;
          return calls++;
        }
      });
      assert.equal(calls, 1);
      return setTimeout(function() {
        timer.destroy();
        assert.equal(calls, 1);
        return done();
      }, 100);
    });
  });

  describe('Timing', function() {
    it('can start 1 timer', function(done) {
      var callback, calls, timer, timing;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timing = new Timing();
      timer = timing.setTimeout(callback, 200);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 1);
        return done();
      }, 300);
    });
    it('can start paused', function(done) {
      var callback, calls, timer, timing;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timing = new Timing({
        running: false
      });
      timer = timing.setTimeout(callback, 200);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 0);
        return done();
      }, 300);
    });
    it('can start many timers', function(done) {
      var callback, calls, timer1, timer2, timer3, timing;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timing = new Timing();
      timer1 = timing.setTimeout(callback, 200);
      timer2 = timing.setTimeout(callback, 200);
      timer3 = timing.setTimeout(callback, 200);
      return setTimeout(function() {
        assert.isFalse(timer1.running);
        assert.isFalse(timer2.running);
        assert.isFalse(timer3.running);
        assert.equal(calls, 3);
        return done();
      }, 300);
    });
    return it('can pause many timers', function(done) {
      var callback, calls, timer1, timer2, timer3, timing;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timing = new Timing();
      timer1 = timing.setTimeout(callback, 200);
      timer2 = timing.setTimeout(callback, 200);
      timer3 = timing.setTimeout(callback, 200);
      setTimeout(function() {
        assert.equal(calls, 0);
        assert.isTrue(timer1.running, 'timer1 before pause');
        assert.isTrue(timer2.running, 'timer2 before pause');
        assert.isTrue(timer3.running, 'timer3 before pause');
        timing.pause();
        assert.isFalse(timer1.running, 'timer1 after pause');
        assert.isFalse(timer2.running, 'timer2 after pause');
        return assert.isFalse(timer3.running, 'timer3 after pause');
      }, 100);
      setTimeout(function() {
        assert.isFalse(timer1.running, 'timer1 at 300');
        assert.isFalse(timer2.running, 'timer2 at 300');
        assert.isFalse(timer3.running, 'timer3 at 300');
        assert.equal(calls, 0);
        return timing.unpause();
      }, 300);
      setTimeout(function() {
        assert.isTrue(timer1.running, 'timer1 at 350');
        assert.isTrue(timer2.running, 'timer2 at 350');
        assert.isTrue(timer3.running, 'timer3 at 350');
        return assert.equal(calls, 0);
      }, 350);
      return setTimeout(function() {
        assert.isFalse(timer1.running, 'timer1 at 600');
        assert.isFalse(timer2.running, 'timer2 at 600');
        assert.isFalse(timer3.running, 'timer3 at 600');
        assert.equal(calls, 3);
        return done();
      }, 600);
    });
  });

}).call(this);
