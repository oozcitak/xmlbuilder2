import { XMLSpec } from '../../../src/dom/spec/XMLSpec'

describe('XMLSpec', function () {

  test('isName()', function () {
    expect(XMLSpec.isName('name')).toBeTruthy()
    expect(XMLSpec.isName('not a name')).toBeFalsy()
  })

  test('isQName()', function () {
    expect(XMLSpec.isQName('prefix:name')).toBeTruthy()
    expect(XMLSpec.isQName('not_a_qname:')).toBeFalsy()
  })

})
