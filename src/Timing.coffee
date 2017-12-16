


class Timing
  constructor: (@running = true) ->
    @children=[]

  addChild: (child) ->
    index = @children.indexOf(child)
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
  constructor: (@time,@callback,@running=true,@repeat=false) ->
    @remainingTime = @time
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
      @constructor.now() - @startTime
    else
      @time - @remainingTime
  getPrc: ->
    @getElapsedTime()/@time
  _start: ->
    @running = true
    @startTime = @constructor.now()
    if @repeat and !@interupted
      @id = setInterval(@tick.bind(this),@remainingTime)
    else
      @id = setTimeout(@tick.bind(this),@remainingTime)
  _stop: ->
    wasInterupted = @interupted
    @running = false
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
    if @callback?
      @callback()
    if @repeat
      if wasInterupted
        @_start()
      else
        @startTime = @constructor.now()
    else
      @destroy()
  destroy:->
    @running = false
    if @parent
      @parent.removeChild(this)