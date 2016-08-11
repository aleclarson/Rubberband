var BrakeAnimation, Easing, Elasticity, NativeValue, Progress, TimingAnimation, Type, fromArgs, type;

NativeValue = require("modx/native").NativeValue;

TimingAnimation = require("TimingAnimation");

BrakeAnimation = require("BrakeAnimation");

fromArgs = require("fromArgs");

Progress = require("progress");

Easing = require("easing");

Type = require("Type");

Elasticity = require("./Elasticity");

Easing.register("bounceOut", {
  value: Easing.bezier(0, 0.65, 0.35, 0.9)
});

Easing.register("bounceIn", {
  value: Easing.bezier(0.4, 0.2, 0.5, 1)
});

type = Type("Rubberband");

type.defineOptions({
  value: NativeValue,
  maxValue: Number.isRequired,
  elasticity: Number.withDefault(0.8),
  restVelocity: Number.withDefault(0.01)
});

type.defineFrozenValues({
  maxValue: fromArgs("maxValue"),
  elasticity: fromArgs("elasticity"),
  restVelocity: fromArgs("restVelocity"),
  _delta: function(options) {
    return options.value || NativeValue(0);
  }
});

type.defineReactiveValues({
  _rebounding: false
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

type.defineMethods({
  resist: function() {
    return Elasticity.apply(Math.abs(this.delta), this.maxValue, this.elasticity);
  },
  rebound: function(startVelocity) {
    if (this.delta === 0) {
      return;
    }
    if ((Math.abs(startVelocity)) <= this.restVelocity) {
      startVelocity = 0;
    }
    if (startVelocity > 0) {
      return this._bounceOut(startVelocity);
    }
    return this._bounceIn(700);
  },
  stopRebounding: function() {
    this._delta.stopAnimation();
  },
  _bounceOut: function(startVelocity) {
    var durationPercent, durationRange;
    durationPercent = Math.abs(startVelocity / 10);
    durationRange = {
      fromValue: 300,
      toValue: 800,
      clamp: true
    };
    return this._delta.animate({
      type: BrakeAnimation,
      easing: Easing("bounceOut"),
      velocity: startVelocity,
      duration: Progress.toValue(durationPercent, durationRange),
      onEnd: (function(_this) {
        return function(finished) {
          return finished && _this._bounceIn(700);
        };
      })(this)
    });
  },
  _bounceIn: function(duration) {
    return this._delta.animate({
      type: TimingAnimation,
      easing: Easing("bounceIn"),
      endValue: 0,
      duration: duration
    });
  }
});

type.defineStatics({
  Elasticity: Elasticity
});

module.exports = type.build();

//# sourceMappingURL=map/Rubberband.map
