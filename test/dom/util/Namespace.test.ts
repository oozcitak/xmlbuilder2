import { Namespace } from '../../../src/dom/spec/Namespace'

describe('Namespace', function () {

  test('validateQName()', function () {
    expect(() => Namespace.validateQName('name')).not.toThrow()
    expect(() => Namespace.validateQName('prefix:name')).not.toThrow()
    expect(() => Namespace.validateQName('not_a_qname:')).toThrow()
    expect(() => Namespace.validateQName('not a name')).toThrow()
  })

  test('extractNames()', function () {
    expect(() => { Namespace.extractNames('my ns', 'prefix:name') }).not.toThrow()
    expect(() => { Namespace.extractNames('http://www.w3.org/XML/1998/namespace', 'xml:name') }).not.toThrow()
    expect(() => { Namespace.extractNames('http://www.w3.org/2000/xmlns/', 'xmlns:name') }).not.toThrow()
    expect(() => { Namespace.extractNames('http://www.w3.org/2000/xmlns/', 'xmlns') }).not.toThrow()

    expect(() => { Namespace.extractNames(null, 'prefix:name') }).toThrow()
    expect(() => { Namespace.extractNames('some ns', 'xml:name') }).toThrow()
    expect(() => { Namespace.extractNames('some ns', 'xmlns:name') }).toThrow()
    expect(() => { Namespace.extractNames('some ns', 'xmlns') }).toThrow()
    expect(() => { Namespace.extractNames('http://www.w3.org/2000/xmlns/', 'some:name') }).toThrow()
    expect(() => { Namespace.extractNames('http://www.w3.org/2000/xmlns/', 'somename') }).toThrow()
  })

})
