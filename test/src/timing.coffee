assert = require('chai').assert
Timing = require('../dist/timing')
PropertyWatcher = require('spark-starter').Invalidated.PropertyWatcher

describe 'Timing.Timer', ->
  it 'trigger a callback after a time', (done)->
    calls = 0
    callback = ->
      calls++
    timer = new Timing.Timer(time:200, callback:callback)
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 1
      assert.equal timer.repetition, 1
      done()
    , 300
  it 'can trigger a callback in loop', (done)->
    calls = 0
    callback = ->
      calls++
    timer = new Timing.Timer(time:200, callback:callback, repeat:true)
    setTimeout ->
      assert.isTrue timer.running
      assert.equal calls, 2
      assert.equal timer.repetition, 2
      timer.destroy()
      done()
    ,500
  it 'trigger multiple callbacks', (done)->
    calls = 0
    callback = ->
      calls++
    calls2 = 0
    callback2 = ->
      calls2++
    timer = new Timing.Timer(time:200, callback:callback)
    timer.getPropertyInstance('repetition').on('changed',callback2)
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 1
      assert.equal calls2, 1
      done()
    ,300

  it 'can pause', (done)->
    calls = 0
    callback = ->
      calls++
    timer = new Timing.Timer(time:200, callback:callback)
    setTimeout ->
      assert.equal calls, 0
      assert.isTrue timer.running
      timer.pause()
      assert.isFalse timer.running
    ,100
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 0
      timer.unpause()
    ,300
    setTimeout ->
      assert.isTrue timer.running
      assert.equal calls, 0
    ,350
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 1
      done()
    ,600

  it 'can get elapsed time', (done)->
    calls = 0
    callback = ->
      calls++
    timer = new Timing.Timer(time:300, callback:callback)
    setTimeout ->
      assert.isAbove timer.getElapsedTime(), 80
      assert.isBelow timer.getElapsedTime(), 120
    ,100
    setTimeout ->
      assert.isAbove timer.getElapsedTime(), 180
      assert.isBelow timer.getElapsedTime(), 220
    ,200
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 1
      done()
    ,400

  it 'can get elapsed time with pause', (done)->
    calls = 0
    callback = ->
      calls++
    timer = new Timing.Timer(time:200, callback:callback)
    mesures = [];
    setTimeout ->
      assert.equal calls, 0
      assert.isTrue timer.running
      assert.isAbove timer.getElapsedTime(), 75
      assert.isBelow timer.getElapsedTime(), 125
      timer.pause()
      mesures.push(timer.getElapsedTime())
      assert.isFalse timer.running
    ,100
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 0
      mesures.push(timer.getElapsedTime())
      assert.equal mesures[mesures.length-1], mesures[mesures.length-2]
      timer.unpause()
    ,300
    setTimeout ->
      mesures.push(timer.getElapsedTime())
      assert.isAbove mesures[mesures.length-1], 125
      assert.isBelow mesures[mesures.length-1], 175
      assert.isAbove mesures[mesures.length-1], mesures[mesures.length-2]
      assert.isTrue timer.running
      assert.equal calls, 0
    ,350
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 1
      done()
    ,600

  it 'can set elapsed time', (done)->
    calls = 0
    callback = ->
      calls++
    timer = new Timing.Timer(time:200, callback:callback)
    setTimeout ->
      timer.setElapsedTime(0)
      assert.equal calls, 0
      assert.isTrue timer.running
    ,100
    setTimeout ->
      assert.equal calls, 0
      assert.isTrue timer.running
    ,250
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 1
      done()
    ,350

  it 'can get prc done', (done)->
    calls = 0
    callback = ->
      calls++
    timer = new Timing.Timer(time:200, callback:callback)
    setTimeout ->
      assert.isAbove timer.getPrc(), 0.3
      assert.isBelow timer.getPrc(), 0.7
    ,100
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 1
      done()
    ,300

  it 'can send update events', (done)->
    calls = 0
    callback = ->
      calls++
    calls2 = 0
    update = ->
      calls2++
    timer = new Timing.Timer(time:200, callback:callback)
    (new PropertyWatcher(scope:timer,property:'elapsedTime',callback:update)).bind()
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 1
      assert.isAbove calls2, 10
      done()
    ,300

  it 'stop sending update events while paused', (done)->
    calls = 0
    callback = ->
      calls++
    calls2 = 0
    update = ->
      calls2++
    timer = new Timing.Timer(time:200, callback:callback)
    (new PropertyWatcher(scope:timer,property:'elapsedTime',callback:update)).bind()
    mesures = [];
    setTimeout ->
      assert.equal calls, 0
      assert.isAbove calls2, 10
      assert.isTrue timer.running
      timer.pause()
      mesures.push(calls2)
      assert.isFalse timer.running
    ,100
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 0
      mesures.push(calls2)
      assert.equal mesures[mesures.length-1], mesures[mesures.length-2]
      timer.unpause()
    ,300
    setTimeout ->
      mesures.push(calls2)
      assert.isAbove mesures[mesures.length-1], mesures[mesures.length-2]
      assert.isTrue timer.running
      assert.equal calls, 0
    ,350
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 1
      done()
    ,600

describe 'Timing', ->
  it 'can start 1 timer', (done)->
    calls = 0
    callback = ->
      calls++
    timing = new Timing()
    timer = timing.setTimeout(callback,200)
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 1
      done()
    ,300
  it 'can start paused', (done)->
    calls = 0
    callback = ->
      calls++
    timing = new Timing(running:false)
    timer = timing.setTimeout(callback,200)
    setTimeout ->
      assert.isFalse timer.running
      assert.equal calls, 0
      done()
    ,300

  it 'can start many timers', (done)->
    calls = 0
    callback = ->
      calls++
    timing = new Timing()
    timer1 = timing.setTimeout(callback,200)
    timer2 = timing.setTimeout(callback,200)
    timer3 = timing.setTimeout(callback,200)
    setTimeout ->
      assert.isFalse timer1.running
      assert.isFalse timer2.running
      assert.isFalse timer3.running
      assert.equal calls, 3
      done()
    ,300

  it 'can pause many timers', (done)->
    calls = 0
    callback = ->
      calls++
    timing = new Timing()
    timer1 = timing.setTimeout(callback,200)
    timer2 = timing.setTimeout(callback,200)
    timer3 = timing.setTimeout(callback,200)
    setTimeout ->
      assert.equal calls, 0
      assert.isTrue timer1.running, 'timer1 before pause'
      assert.isTrue timer2.running, 'timer2 before pause'
      assert.isTrue timer3.running, 'timer3 before pause'
      timing.pause()
      assert.isFalse timer1.running, 'timer1 after pause'
      assert.isFalse timer2.running, 'timer2 after pause'
      assert.isFalse timer3.running, 'timer3 after pause'
    ,100
    setTimeout ->
      assert.isFalse timer1.running, 'timer1 at 300'
      assert.isFalse timer2.running, 'timer2 at 300'
      assert.isFalse timer3.running, 'timer3 at 300'
      assert.equal calls, 0
      timing.unpause()
    ,300
    setTimeout ->
      assert.isTrue timer1.running, 'timer1 at 350'
      assert.isTrue timer2.running, 'timer2 at 350'
      assert.isTrue timer3.running, 'timer3 at 350'
      assert.equal calls, 0
    ,350
    setTimeout ->
      assert.isFalse timer1.running, 'timer1 at 600'
      assert.isFalse timer2.running, 'timer2 at 600'
      assert.isFalse timer3.running, 'timer3 at 600'
      assert.equal calls, 3
      done()
    ,600