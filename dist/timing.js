(function(definition){var Timing=definition(typeof Parallelio!=="undefined"?Parallelio:this.Parallelio);Timing.definition=definition;if(typeof module!=="undefined"&&module!==null){module.exports=Timing;}else{if(typeof Parallelio!=="undefined"&&Parallelio!==null){Parallelio.Timing=Timing;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Timing=Timing;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var Element = dependencies.hasOwnProperty("Element") ? dependencies.Element : require('spark-starter').Element;
var Timing;
Timing = (function() {
  class Timing extends Element {
    toggle(val) {
      if (typeof val === "undefined") {
        val = !this.running;
      }
      return this.running = val;
    }

    setTimeout(callback, time) {
      return new this.constructor.Timer({
        time: time,
        callback: callback,
        timing: this
      });
    }

    setInterval(callback, time) {
      return new this.constructor.Timer({
        time: time,
        callback: callback,
        repeat: true,
        timing: this
      });
    }

    pause() {
      return this.toggle(false);
    }

    unpause() {
      return this.toggle(true);
    }

  };

  Timing.properties({
    running: {
      default: true
    }
  });

  return Timing;

}).call(this);

Timing.Timer = (function() {
  class Timer extends Element {
    toggle(val) {
      if (typeof val === "undefined") {
        val = !this.paused;
      }
      return this.paused = val;
    }

    pause() {
      return this.toggle(true);
    }

    unpause() {
      return this.toggle(false);
    }

    start() {
      this.startTime = this.constructor.now();
      if (this.repeat) {
        return this.id = setInterval(this.tick.bind(this), this.remainingTime);
      } else {
        return this.id = setTimeout(this.tick.bind(this), this.remainingTime);
      }
    }

    stop() {
      this.remainingTime = this.time - (this.constructor.now() - this.startTime);
      if (this.repeat) {
        return clearInterval(this.id);
      } else {
        return clearTimeout(this.id);
      }
    }

    static now() {
      var ref;
      if ((typeof window !== "undefined" && window !== null ? (ref = window.performance) != null ? ref.now : void 0 : void 0) != null) {
        return window.performance.now();
      } else if ((typeof process !== "undefined" && process !== null ? process.uptime : void 0) != null) {
        return process.uptime() * 1000;
      } else {
        return Date.now();
      }
    }

    tick() {
      this.repetition += 1;
      if (this.callback != null) {
        this.callback();
      }
      if (this.repeat) {
        this.startTime = this.constructor.now();
        return this.remainingTime = this.time;
      } else {
        this.running = false;
        return this.remainingTime = 0;
      }
    }

    destroy() {
      if (this.repeat) {
        clearInterval(this.id);
      } else {
        clearTimeout(this.id);
      }
      this.running = false;
      return this.propertiesManager.destroy();
    }

  };

  Timer.properties({
    time: {
      default: 1000
    },
    paused: {
      default: false
    },
    running: {
      calcul: function(invalidator) {
        return !invalidator.prop(this.pausedProperty) && invalidator.propPath('timing.running') !== false;
      },
      change: function(val, old) {
        if (val) {
          return this.start();
        } else if (old) {
          return this.stop();
        }
      }
    },
    timing: {
      default: null
    },
    elapsedTime: {
      calcul: function(invalidator) {
        if (invalidator.prop(this.runningProperty)) {
          setImmediate(() => {
            return this.elapsedTimeProperty.invalidate({
              preventImmediate: true,
              origin: this
            });
          });
          return this.constructor.now() - this.startTime + this.time - this.remainingTime;
        } else {
          return this.time - this.remainingTime;
        }
      },
      set: function(val) {
        if (this.running) {
          this.stop();
          this.remainingTime = this.time - val;
          if (this.remainingTime <= 0) {
            return this.tick();
          } else {
            return this.start();
          }
        } else {
          this.remainingTime = this.time - val;
          return this.elapsedTimeProperty.invalidate();
        }
      }
    },
    prc: {
      calcul: function(invalidator) {
        return invalidator.prop(this.elapsedTimeProperty) / this.time;
      },
      set: function(val) {
        return this.elapsedTime = this.time * val;
      }
    },
    remainingTime: {
      calcul: function(invalidator) {
        return this.time;
      }
    },
    repeat: {
      default: false
    },
    repetition: {
      default: 0
    },
    callback: {
      default: null
    }
  });

  return Timer;

}).call(this);

return(Timing);});