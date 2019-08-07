
Element = require('spark-starter').Element

class Timing extends Element
  @properties
    running:
      default: true

  toggle: (val)->
    if typeof val == "undefined"
      val = !@running
    @running = val

  setTimeout: (callback,time)->
    new @constructor.Timer(time:time,callback:callback,timing:this)

  setInterval: (callback,time)->
    new @constructor.Timer(time:time,callback:callback,repeat:true,timing:this)

  pause: ->
    @toggle(false)

  unpause: ->
    @toggle(true)


class Timing.Timer extends Element
  @properties
    time:
      default: 1000
    paused:
      default: false
    running:
      calcul: (invalidator)->
        !invalidator.prop('paused') and invalidator.propPath('timing.running') != false
      change: (old)->
        if @running
          @start()
        else if old
          @stop()
    timing:
      default: null
    elapsedTime:
      calcul: (invalidator)->
        if invalidator.prop('running')
          setImmediate =>
            @invalidateElapsedTime()
          @constructor.now() - @startTime + @time - @remainingTime
        else
          @time - @remainingTime
      set: (val)->
        @stop()
        @remainingTime = @time - val
        @start()
    prc:
      calcul: (invalidator)->
        invalidator.prop('elapsedTime')/@time
      set: (val)->
        @setElapsedTime(@time*val)
    repeat:
      default: false
    repetition:
      default: 0
    callback:
      default: null
  
  init: ->
    @remainingTime = @time

  toggle: (val)->
    if typeof val == "undefined"
      val = !@paused
    @paused = val

  pause: ->
    @toggle(true)

  unpause: ->
    @toggle(false)

  start: ->
    @startTime = @constructor.now()
    if @repeat
      @id = setInterval(@tick.bind(this),@remainingTime)
    else
      @id = setTimeout(@tick.bind(this),@remainingTime)

  stop: ->
    @remainingTime = @time - (@constructor.now() - @startTime)
    if @repeat
      clearInterval(@id)
    else
      clearTimeout(@id)

  @now = ->
    if window?.performance?.now?
       window.performance.now()
    else if process?.uptime?
      process.uptime() * 1000
    else
      Date.now()

  tick:->
    @repetition += 1
    if @callback?
      @callback()
    if @repeat
      @startTime = @constructor.now()
      @remainingTime = @time
    else
      @running = false
      @remainingTime = 0

  destroy:->
    if @repeat
      clearInterval(@id)
    else
      clearTimeout(@id)
    @running = false
    @destroyProperties()