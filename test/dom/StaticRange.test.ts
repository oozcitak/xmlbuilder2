import $$ from './TestHelpers'

describe('StaticRange', function () {

  test('constructor throws', function () {
    expect(() => new $$.StaticRange()).toThrow()
  })

})