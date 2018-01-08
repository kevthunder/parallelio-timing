(function(definition){Timing=definition(typeof(Parallelio)!=="undefined"?Parallelio:this.Parallelio);Timing.definition=definition;if(typeof(module)!=="undefined"&&module!==null){module.exports=Timing;}else{if(typeof(Parallelio)!=="undefined"&&Parallelio!==null){Parallelio.Timing=Timing;}else{if(this.Parallelio==null){this.Parallelio={};}this.Parallelio.Timing=Timing;}}})(function(dependencies){if(dependencies==null){dependencies={};}
var BaseUpdater = dependencies.hasOwnProperty("BaseUpdater") ? dependencies.BaseUpdater : require('spark-starter').Updater;
var Timing;
Timing = (function() {
  function Timing(running) {
    this.running = running != null ? running : true;
    this.children = [];
  }

  Timing.prototype.addChild = function(child) {
    var index;
    index = this.children.indexOf(child);
    if (this.updater) {
      child.updater.dispatcher = this.updater;
    }
    if (index === -1) {
      this.children.push(child);
    }
    child.parent = this;
    return this;
  };

  Timing.prototype.removeChild = function(child) {
    var index;
    index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    if (child.parent === this) {
      child.parent = null;
    }
    return this;
  };

  Timing.prototype.toggle = function(val) {
    if (typeof val === "undefined") {
      val = !this.running;
    }
    this.running = val;
    return this.children.forEach(function(child) {
      return child.toggle(val);
    });
  };

  Timing.prototype.setTimeout = function(callback, time) {
    var timer;
    timer = new this.constructor.Timer(time, callback, this.running);
    this.addChild(timer);
    return timer;
  };

  Timing.prototype.setInterval = function(callback, time) {
    var timer;
    timer = new this.constructor.Timer(time, callback, this.running, true);
    this.addChild(timer);
    return timer;
  };

  Timing.prototype.pause = function() {
    return this.toggle(false);
  };

  Timing.prototype.unpause = function() {
    return this.toggle(true);
  };

  return Timing;

})();

Timing.Timer = (function() {
  function Timer(time1, callback, running, repeat) {
    this.time = time1;
    this.running = running != null ? running : true;
    this.repeat = repeat != null ? repeat : false;
    this.remainingTime = this.time;
    this.updater = new Timing.Updater(this);
    this.dispatcher = new BaseUpdater();
    if (callback) {
      this.dispatcher.addCallback(callback);
    }
    if (this.running) {
      this._start();
    }
  }

  Timer.now = function() {
    var ref;
    if ((typeof window !== "undefined" && window !== null ? (ref = window.performance) != null ? ref.now : void 0 : void 0) != null) {
      return window.performance.now();
    } else if ((typeof process !== "undefined" && process !== null ? process.uptime : void 0) != null) {
      return process.uptime() * 1000;
    } else {
      return Date.now();
    }
  };

  Timer.prototype.toggle = function(val) {
    if (typeof val === "undefined") {
      val = !this.running;
    }
    if (val) {
      return this._start();
    } else {
      return this._stop();
    }
  };

  Timer.prototype.pause = function() {
    return this.toggle(false);
  };

  Timer.prototype.unpause = function() {
    return this.toggle(true);
  };

  Timer.prototype.getElapsedTime = function() {
    if (this.running) {
      return this.constructor.now() - this.startTime + this.time - this.remainingTime;
    } else {
      return this.time - this.remainingTime;
    }
  };

  Timer.prototype.setElapsedTime = function(val) {
    this._stop();
    this.remainingTime = this.time - val;
    return this._start();
  };

  Timer.prototype.getPrc = function() {
    return this.getElapsedTime() / this.time;
  };

  Timer.prototype.setPrc = function(val) {
    return this.setElapsedTime(this.time * val);
  };

  Timer.prototype._start = function() {
    this.running = true;
    this.updater.forwardCallbacks();
    this.startTime = this.constructor.now();
    if (this.repeat && !this.interupted) {
      return this.id = setInterval(this.tick.bind(this), this.remainingTime);
    } else {
      return this.id = setTimeout(this.tick.bind(this), this.remainingTime);
    }
  };

  Timer.prototype._stop = function() {
    var wasInterupted;
    wasInterupted = this.interupted;
    this.running = false;
    this.updater.unforwardCallbacks();
    this.remainingTime = this.time - (this.constructor.now() - this.startTime);
    this.interupted = this.remainingTime !== this.time;
    if (this.repeat && !wasInterupted) {
      return clearInterval(this.id);
    } else {
      return clearTimeout(this.id);
    }
  };

  Timer.prototype.tick = function() {
    var wasInterupted;
    wasInterupted = this.interupted;
    this.interupted = false;
    if (this.repeat) {
      this.remainingTime = this.time;
    } else {
      this.remainingTime = 0;
    }
    this.dispatcher.update();
    if (this.repeat) {
      if (wasInterupted) {
        return this._start();
      } else {
        return this.startTime = this.constructor.now();
      }
    } else {
      return this.destroy();
    }
  };

  Timer.prototype.destroy = function() {
    if (this.repeat) {
      clearInterval(this.id);
    } else {
      clearTimeout(this.id);
    }
    this.updater.destroy();
    this.dispatcher.destroy();
    this.running = false;
    if (this.parent) {
      return this.parent.removeChild(this);
    }
  };

  return Timer;

})();

Timing.Updater = (function() {
  function Updater(parent) {
    this.parent = parent;
    this.dispatcher = new BaseUpdater();
    this.callbacks = [];
  }

  Updater.prototype.addCallback = function(callback) {
    if (!this.callbacks.includes(callback)) {
      this.callbacks.push(callback);
    }
    if (this.parent.running && this.dispatcher) {
      return this.dispatcher.addCallback(callback);
    }
  };

  Updater.prototype.removeCallback = function(callback) {
    var index;
    index = this.callbacks.indexOf(callback);
    if (index !== -1) {
      this.callbacks.splice(index, 1);
    }
    if (this.dispatcher) {
      return this.dispatcher.removeCallback(callback);
    }
  };

  Updater.prototype.getBinder = function() {
    if (this.dispatcher) {
      return new BaseUpdater.Binder(this);
    }
  };

  Updater.prototype.forwardCallbacks = function() {
    if (this.dispatcher) {
      return this.callbacks.forEach((function(_this) {
        return function(callback) {
          return _this.dispatcher.addCallback(callback);
        };
      })(this));
    }
  };

  Updater.prototype.unforwardCallbacks = function() {
    if (this.dispatcher) {
      return this.callbacks.forEach((function(_this) {
        return function(callback) {
          return _this.dispatcher.removeCallback(callback);
        };
      })(this));
    }
  };

  Updater.prototype.destroy = function() {
    this.unforwardCallbacks();
    this.callbacks = [];
    return this.parent = null;
  };

  return Updater;

})();

return(Timing);});