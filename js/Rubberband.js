var BrakeAnimation, Easing, Elasticity, NativeValue, Progress, TimingAnimation, Type, fromArgs, type;

NativeValue = require("component").NativeValue;

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
  maxOffset: Number,
  elasticity: Number.withDefault(0.8),
  restVelocity: Number.withDefault(0.01)
});

type.defineFrozenValues({
  maxOffset: fromArgs("maxOffset"),
  elasticity: fromArgs("elasticity"),
  restVelocity: fromArgs("restVelocity")
});

type.defineValues({
  _distance: function() {
    return NativeValue(0);
  }
});

type.defineReactiveValues({
  _offset: 0,
  _rebounding: false
});

type.defineGetters({
  distance: function() {
    return this._distance.value;
  },
  isRebounding: function() {
    return this._distance.isAnimating;
  }
});

type.definePrototype({
  offset: {
    get: function() {
      return this._offset;
    },
    set: function(offset) {
      this._offset = Math.abs(offset);
      this._distance.value = Elasticity.apply(this._offset, this.maxOffset, this.elasticity);
    }
  }
});

type.defineMethods({
  rebound: function(startVelocity) {
    if (this._distance.value === 0) {
      return;
    }
    if ((Math.abs(startVelocity)) <= this.restVelocity) {
      startVelocity = 0;
    }
    if (startVelocity > 0) {
      return this._bounceOut(startVelocity);
    }
    return this._bounceIn(1200);
  },
  stopRebounding: function() {
    this._distance.stopAnimation();
  },
  _bounceOut: function(startVelocity) {
    var durationPercent, durationRange;
    durationPercent = Math.abs(startVelocity / 10);
    durationRange = {
      fromValue: 300,
      toValue: 800,
      clamp: true
    };
    return this._visualOffset.animate({
      type: BrakeAnimation,
      easing: Easing("bounceOut"),
      velocity: startVelocity,
      duration: Progress.toValue(durationPercent, durationRange),
      onEnd: (function(_this) {
        return function(finished) {
          return finished && _this._bounceIn(duration);
        };
      })(this)
    });
  },
  _bounceIn: function(duration) {
    return this._visualOffset.animate({
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
