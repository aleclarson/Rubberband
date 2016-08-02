
Elasticity = require ".."

describe "Elasticity.apply()", ->

  it "reduces the given value", ->
    value = 2
    newValue = Elasticity.apply value, 11, 0.55
    expect(value > newValue).toBe yes
    expect((Math.round newValue * 1000) / 1000).toBe 1

describe "Elasticity.reset()", ->

  it "normalizes the given value", ->
    value = 1
    oldValue = Elasticity.reset value, 11, 0.55
    expect(oldValue > value).toBe yes
    expect(oldValue).toBe 2
