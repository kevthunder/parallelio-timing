
BaseUpdater = require('spark-starter').Updater

class Timing
  constructor: (@running = true) ->
    @children=[]

  addChild: (child) ->
    index = @children.indexOf(child)
    if @updater
      child.updater.dispatcher = @updater
    if index == -1
      @children.push(child)
    child.parent = this
    this
    
  removeChild: (child) ->
    index = @children.indexOf(child)
    if index > -1
      @children.splice(index, 1)
    if child.parent == this
      child.parent = null
    this

  toggle: (val)->
    if typeof val == "undefined"
      val = !@running
    @running = val
    @children.forEach (child)->
      child.toggle(val)

  setTimeout: (callback,time)->
    timer = new @constructor.Timer(time,callback,@running)
    @addChild(timer)
    timer

  setInterval: (callback,time)->
    timer = new @constructor.Timer(time,callback,@running,true)
    @addChild(timer)
    timer

  pause: ->
    @toggle(false)

  unpause: ->
    @toggle(true)


class Timing.Timer
  constructor: (@time,callback,@running=true,@repeat=false) ->
    @remainingTime = @time
    @updater = new Timing.Updater(this)
    @dispatcher = new BaseUpdater()
    if callback
      @dispatcher.addCallback(callback)
    if @running
      @_start()
  @now = ->
    if window?.performance?.now?
       window.performance.now()
    else if process?.uptime?
      process.uptime() * 1000
    else
      Date.now()

  toggle: (val)->
    if typeof val == "undefined"
      val = !@running
    if val
      @_start()
    else
      @_stop()
  pause: ->
    @toggle(false)
  unpause: ->
    @toggle(true)
  getElapsedTime: ->
    if @running
      @constructor.now() - @startTime + @time - @remainingTime
    else
      @time - @remainingTime
  setElapsedTime: (val)->
    @_stop()
    @remainingTime = @time - val
    @_start()
  getPrc: ->
    @getElapsedTime()/@time
  setPrc: (val)->
    @setElapsedTime(@time*val)
  _start: ->
    @running = true
    @updater.forwardCallbacks()
    @startTime = @constructor.now()
    if @repeat and !@interupted
      @id = setInterval(@tick.bind(this),@remainingTime)
    else
      @id = setTimeout(@tick.bind(this),@remainingTime)
  _stop: ->
    wasInterupted = @interupted
    @running = false
    @updater.unforwardCallbacks()
    @remainingTime = @time - (@constructor.now() - @startTime)
    @interupted = @remainingTime != @time
    if @repeat and !wasInterupted
      clearInterval(@id)
    else
      clearTimeout(@id)
  tick:->
    wasInterupted = @interupted
    @interupted = false
    if @repeat
      @remainingTime = @time
    else
      @remainingTime = 0
    @dispatcher.update()
    if @repeat
      if wasInterupted
        @_start()
      else
        @startTime = @constructor.now()
    else
      @destroy()
  destroy:->
    if @repeat
      clearInterval(@id)
    else
      clearTimeout(@id)
    @updater.destroy()
    @dispatcher.destroy()
    @running = false
    if @parent
      @parent.removeChild(this)


class Timing.Updater
  constructor: (@parent) ->
    @dispatcher = new BaseUpdater()
    @callbacks = []

  addCallback: (callback)->
    unless @callbacks.includes(callback)
      @callbacks.push(callback)
    if @parent?.running && @dispatcher
      @dispatcher.addCallback(callback)
        
  removeCallback: (callback)->
    index = @callbacks.indexOf(callback)
    if index != -1
      @callbacks.splice(index,1)
    if @dispatcher
      @dispatcher.removeCallback(callback)

  getBinder: ->
    if @dispatcher
      new BaseUpdater.Binder(this)

  forwardCallbacks: ()->
    if @dispatcher
      @callbacks.forEach (callback)=>
        @dispatcher.addCallback(callback)

  unforwardCallbacks: ()->
    if @dispatcher
      @callbacks.forEach (callback)=>
        @dispatcher.removeCallback(callback)

  destroy:->
    @unforwardCallbacks()
    @callbacks = []
    @parent = null


