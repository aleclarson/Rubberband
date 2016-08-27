var Easing, Elasticity, NativeValue, Number, ParabolicAnimation, Progress, TimingAnimation, Type, assertType, emptyFunction, type;

require("isDev");

NativeValue = require("modx/native").NativeValue;

Number = require("Nan").Number;

ParabolicAnimation = require("ParabolicAnimation");

TimingAnimation = require("TimingAnimation");

emptyFunction = require("emptyFunction");

assertType = require("assertType");

Progress = require("progress");

Easing = require("easing");

Type = require("Type");

Elasticity = require("./Elasticity");

type = Type("Rubberband");

type.defineOptions({
  maxValue: Number.isRequired,
  maxVelocity: Number.isRequired,
  elasticity: Number.withDefault(0.8),
  restVelocity: Number.withDefault(0.01),
  getDuration: Function
});

type.defineFrozenValues(function(options) {
  return {
    maxValue: options.maxValue,
    maxVelocity: options.maxVelocity,
    elasticity: options.elasticity,
    restVelocity: options.restVelocity,
    _delta: NativeValue(0),
    _easing: options.easing,
    __getDuration: options.getDuration
  };
});

type.defineGetters({
  isRebounding: function() {
    return this._delta.isAnimating;
  }
});

type.definePrototype({
  delta: {
    get: function() {
      return this._delta.value;
    },
    set: function(newValue) {
      this._delta.value = newValue;
    }
  }
});

type.defineHooks({
  __getDuration: function(velocity, delta) {
    var minDuration;
    if (velocity > 0) {
      minDuration = 100 + 200 * Math.min(1, delta / 200);
      return minDuration + 300 * Math.min(1, velocity / this.maxVelocity);
    }
    return 400 + 200 * Math.min(1, delta / 200);
  }
});

type.defineMethods({
  resist: function() {
    return Elasticity.apply(Math.abs(this.delta), this.maxValue, this.elasticity);
  },
  rebound: function(config) {
    if (this._anim) {
      return this._anim;
    }
    isDev && assertType(config.velocity, Number);
    if (this.restVelocity >= Math.abs(config.velocity)) {
      config.velocity = 0;
    }
    if (config.velocity <= 0) {
      return this._reboundIn(config);
    } else {
      return this._reboundOut(config);
    }
  },
  stopRebounding: function() {
    this._delta.stopAnimation();
  },
  _getDuration: function(velocity) {
    var duration;
    duration = this.__getDuration(velocity, this.delta);
    assertType(duration, Number);
    return duration;
  },
  _reboundIn: function(config) {
    config.type = TimingAnimation;
    config.easing = Easing.bezier(0, 0.3, 0.5, 1);
    config.endValue = 0;
    config.duration = this._getDuration(config.velocity, this._delta._value);
    return global.$ANIM = this._delta.animate(config);
  },
  _reboundOut: function(config) {
    config.type = ParabolicAnimation;
    config.easing = Easing.bezier(0.15, 0.3, 0.5, 1);
    config.endValue = 0;
    config.duration = this._getDuration(config.velocity, this._delta._value);
    return global.$ANIM = this._delta.animate(config);
  }
});

type.defineStatics({
  Elasticity: Elasticity
});

module.exports = type.build();

//# sourceMappingURL=map/Rubberband.map
