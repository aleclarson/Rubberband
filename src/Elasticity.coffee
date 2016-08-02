
# NOTE: Call `Math.abs()` or make sure your
#   `value` and `maxValue` are the same sign!
module.exports =

  apply: (value, maxValue, elasticity) ->
    elasticity * value * maxValue / (maxValue + value * elasticity)

  reset: (value, maxValue, elasticity) ->
    1 / (elasticity / value - elasticity / maxValue)
