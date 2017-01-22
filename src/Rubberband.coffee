
{NativeValue} = require "component"

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
  maxOffset: Number
  elasticity: Number.withDefault 0.8
  restVelocity: Number.withDefault 0.01

type.defineFrozenValues

  maxOffset: fromArgs "maxOffset"

  elasticity: fromArgs "elasticity"

  restVelocity: fromArgs "restVelocity"

type.defineValues

  _distance: -> NativeValue 0

type.defineReactiveValues

  _offset: 0

  _rebounding: no

type.defineGetters

  distance: -> @_distance.value

  isRebounding: -> @_distance.isAnimating

type.definePrototype

  offset:
    get: -> @_offset
    set: (offset) ->
      @_offset = Math.abs offset
      @_distance.value = Elasticity.apply @_offset, @maxOffset, @elasticity
      return

type.defineMethods

  rebound: (startVelocity) ->
    return if @_distance.value is 0
    startVelocity = 0 if (Math.abs startVelocity) <= @restVelocity
    if startVelocity > 0
      return @_bounceOut startVelocity
    return @_bounceIn 1200 # TODO: Adjust duration based on velocity.

  stopRebounding: ->
    @_distance.stopAnimation()
    return

  _bounceOut: (startVelocity) ->
    durationPercent = Math.abs startVelocity / 10
    durationRange = { fromValue: 300, toValue: 800, clamp: yes }
    @_visualOffset.animate
      type: BrakeAnimation
      easing: Easing "bounceOut"
      velocity: startVelocity
      duration: Progress.toValue durationPercent, durationRange
      onEnd: (finished) =>
        finished and @_bounceIn duration # * 2.6

  _bounceIn: (duration) ->
    @_visualOffset.animate
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
