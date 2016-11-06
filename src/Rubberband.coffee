
{AnimatedValue} = require "Animated"
{Number} = require "Nan"

ParabolicAnimation = require "ParabolicAnimation"
TimingAnimation = require "TimingAnimation"
emptyFunction = require "emptyFunction"
assertType = require "assertType"
Progress = require "progress"
Easing = require "easing"
isDev = require "isDev"
Type = require "Type"

Elasticity = require "./Elasticity"

type = Type "Rubberband"

type.defineOptions
  maxValue: Number.isRequired
  maxVelocity: Number.isRequired
  elasticity: Number.withDefault 0.8
  restVelocity: Number.withDefault 0.01
  getDuration: Function

type.defineFrozenValues (options) ->

  maxValue: options.maxValue

  maxVelocity: options.maxVelocity

  elasticity: options.elasticity

  restVelocity: options.restVelocity

  _delta: AnimatedValue 0

  _easing: options.easing

  __getDuration: options.getDuration

#
# Prototype
#

type.defineGetters

  isRebounding: -> @_delta.isAnimating

type.definePrototype

  delta:
    get: -> @_delta.get()
    set: (newValue) ->
      @_delta.set newValue

type.defineHooks

  __getDuration: (velocity, delta) ->
    if velocity > 0
      minDuration = 100 + 200 * Math.min 1, delta / 200
      return minDuration + 300 * Math.min 1, velocity / @maxVelocity
    return 400 + 200 * Math.min 1, delta / 200

type.defineMethods

  resist: ->
    Elasticity.apply Math.abs(@delta), @maxValue, @elasticity

  # NOTE: `config.velocity` must be positive when rebounding AWAY from `config.endValue`.
  #       This is due to the Rubberband not having a `startValue`.
  rebound: (config) ->
    return @_anim if @_anim

    isDev and
    assertType config.velocity, Number

    if @restVelocity >= Math.abs config.velocity
      config.velocity = 0

    if config.velocity <= 0
      @_reboundIn config
    else @_reboundOut config

  stopRebounding: ->
    @_delta.stopAnimation()
    return

  _getDuration: (velocity) ->
    duration = @__getDuration velocity, @delta
    assertType duration, Number
    return duration

  _reboundIn: (config) ->
    config.type = TimingAnimation
    config.easing = Easing.bezier 0, 0.3, 0.5, 1
    config.endValue = 0
    config.duration = @_getDuration config.velocity, @_delta._value
    global.$ANIM = @_delta.animate config

  _reboundOut: (config) ->
    config.type = ParabolicAnimation
    config.easing = Easing.bezier 0.15, 0.3, 0.5, 1
    config.endValue = 0
    config.duration = @_getDuration config.velocity, @_delta._value
    global.$ANIM = @_delta.animate config

type.defineStatics {Elasticity}

module.exports = type.build()
