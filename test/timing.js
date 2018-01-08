(function() {
  var Timing, assert;

  assert = require('chai').assert;

  Timing = require('../dist/timing');

  Timing = require('../dist/timing');

  describe('Timing.Timer', function() {
    it('trigger a callback after a time', function(done) {
      var callback, calls, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer(200, callback);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 1);
        return done();
      }, 300);
    });
    it('can trigger a callback in loop', function(done) {
      var callback, calls, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer(200, callback, true, true);
      return setTimeout(function() {
        assert.isTrue(timer.running);
        assert.equal(calls, 2);
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
      timer = new Timing.Timer(200, callback);
      timer.dispatcher.addCallback(callback2);
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
      timer = new Timing.Timer(200, callback);
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
      timer = new Timing.Timer(200, callback);
      setTimeout(function() {
        assert.isAbove(timer.getElapsedTime(), 50);
        return assert.isBelow(timer.getElapsedTime(), 150);
      }, 100);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 1);
        return done();
      }, 300);
    });
    it('can get elapsed time with pause', function(done) {
      var callback, calls, mesures, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer(200, callback);
      mesures = [];
      setTimeout(function() {
        assert.equal(calls, 0);
        assert.isTrue(timer.running);
        mesures.push(timer.getElapsedTime());
        assert.isAbove(mesures[mesures.length - 1], 75);
        assert.isBelow(mesures[mesures.length - 1], 125);
        timer.pause();
        return assert.isFalse(timer.running);
      }, 100);
      setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 0);
        timer.unpause();
        mesures.push(timer.getElapsedTime());
        return assert.equal(mesures[mesures.length - 1], mesures[mesures.length - 2]);
      }, 300);
      setTimeout(function() {
        mesures.push(timer.getElapsedTime());
        assert.isAbove(mesures[mesures.length - 1], 125);
        assert.isBelow(mesures[mesures.length - 1], 175);
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
    it('can set elapsed time', function(done) {
      var callback, calls, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer(200, callback);
      setTimeout(function() {
        timer.setElapsedTime(0);
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
    it('can get prc done', function(done) {
      var callback, calls, timer;
      calls = 0;
      callback = function() {
        return calls++;
      };
      timer = new Timing.Timer(200, callback);
      setTimeout(function() {
        assert.isAbove(timer.getPrc(), 0.3);
        return assert.isBelow(timer.getPrc(), 0.7);
      }, 100);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 1);
        return done();
      }, 300);
    });
    return it('can send update events', function(done) {
      var callback, calls, calls2, timer, update;
      calls = 0;
      callback = function() {
        return calls++;
      };
      calls2 = 0;
      update = function() {
        calls2++;
        assert.isAbove(timer.getPrc(), 0.3);
        return assert.isBelow(timer.getPrc(), 0.7);
      };
      timer = new Timing.Timer(200, callback);
      timer.updater.addCallback(update);
      setTimeout(function() {
        return timer.updater.dispatcher.update();
      }, 100);
      return setTimeout(function() {
        assert.isFalse(timer.running);
        assert.equal(calls, 1);
        assert.equal(calls2, 1);
        return done();
      }, 300);
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
      timing = new Timing(false);
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
