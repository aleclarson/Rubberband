module.exports = {
  apply: function(value, maxValue, elasticity) {
    return elasticity * value * maxValue / (maxValue + value * elasticity);
  },
  reset: function(value, maxValue, elasticity) {
    return 1 / (elasticity / value - elasticity / maxValue);
  }
};

//# sourceMappingURL=map/Elasticity.map
