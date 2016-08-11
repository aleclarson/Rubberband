
{NativeValue} = require "modx/native"

TimingAnimation = require "TimingAnimation"
BrakeAnimation = require "BrakeAnimation"
fromArgs = require "fromArgs"
Progress = require "progress"
Easing = require "easing"
Type = require "Type"

Elasticity = require "./Elasticity"

Easing.register "bounceOut",
  value: Easing.bezier 0, 0.65, 0.35, 0.9

Easing.register "bounceIn",
  value: Easing.bezier 0.4, 0.2, 0.5, 1
  # value: Easing.flipY "bounceOut"

type = Type "Rubberband"

type.defineOptions
  value: NativeValue
  maxValue: Number.isRequired
  elasticity: Number.withDefault 0.8
  restVelocity: Number.withDefault 0.01

type.defineFrozenValues

  maxValue: fromArgs "maxValue"

  elasticity: fromArgs "elasticity"

  restVelocity: fromArgs "restVelocity"

  _delta: (options) ->
    options.value or NativeValue 0

type.defineReactiveValues

  _rebounding: no

type.defineGetters

  isRebounding: -> @_delta.isAnimating

type.definePrototype

  delta:
    get: -> @_delta.value
    set: (newValue) ->
      @_delta.value = newValue
      return

type.defineMethods

  resist: ->
    Elasticity.apply Math.abs(@delta), @maxValue, @elasticity

  rebound: (startVelocity) ->
    return if @delta is 0
    startVelocity = 0 if (Math.abs startVelocity) <= @restVelocity
    if startVelocity > 0
      return @_bounceOut startVelocity
    return @_bounceIn 700 # TODO: Adjust duration based on velocity.

  stopRebounding: ->
    @_delta.stopAnimation()
    return

  _bounceOut: (startVelocity) ->
    durationPercent = Math.abs startVelocity / 10
    durationRange = { fromValue: 300, toValue: 800, clamp: yes }
    @_delta.animate
      type: BrakeAnimation
      easing: Easing "bounceOut"
      velocity: startVelocity
      duration: Progress.toValue durationPercent, durationRange
      onEnd: (finished) =>
        finished and @_bounceIn 700 # * 2.6

  _bounceIn: (duration) ->
    @_delta.animate
      type: TimingAnimation
      easing: Easing "bounceIn"
      endValue: 0
      duration: duration
      # captureFrames: yes

type.defineStatics {
  Elasticity
  # Animation: require "./Animation"
}

module.exports = type.build()
