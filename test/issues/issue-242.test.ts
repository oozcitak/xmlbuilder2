import $$ from '../TestHelpers'

$$.suite('Object property names (#242)', () => {
  const names = ['toString', 'valueOf', 'constructor', 'hasOwnProperty', '__proto__']

  for (const name of names) {
    $$.test(`preserves ${name} as a single element and after a sibling`, () => {
      for (const prefix of ['', '<x>1</x>']) {
        const xml = `<a>${prefix}<${name}>3</${name}></a>`
        const expected = { a: { ...(prefix ? { x: '1' } : {}), [name]: '3' } }
        $$.deepEqual($$.create(xml).end({ format: 'object' }), expected)
        for (const prettyPrint of [false, true]) {
          $$.deepEqual(JSON.parse($$.create(xml).end({ format: 'json', prettyPrint })), expected)
        }
        $$.deepEqual($$.convert(xml, { format: 'object' }), expected)
      }
    })

    $$.test(`preserves ${name} with nested content, grouping and verbose output`, () => {
      const xml = `<a><x>1</x><${name}><b>2</b></${name}></a>`
      for (const group of [false, true]) {
        $$.deepEqual($$.create(xml).end({ format: 'object', group }),
          { a: { x: '1', [name]: { b: '2' } } })
        $$.deepEqual(JSON.parse($$.create(xml).end({ format: 'json', group, verbose: true, prettyPrint: true })),
          { a: [{ x: ['1'], [name]: [{ b: ['2'] }] }] })
        $$.deepEqual($$.create(xml).end({ format: 'object', group, verbose: true }),
          { a: [{ x: ['1'], [name]: [{ b: ['2'] }] }] })
      }
    })

    $$.test(`preserves repeated ${name} elements and mixed-content order`, () => {
      $$.deepEqual($$.create(`<a><${name}>1</${name}><${name}>2</${name}></a>`)
        .end({ format: 'object' }), { a: { [name]: ['1', '2'] } })
      $$.deepEqual($$.create(`<a><${name}>1</${name}><x>2</x><${name}>3</${name}></a>`)
        .end({ format: 'object' }),
      { a: { '#': [{ [name]: '1' }, { x: '2' }, { [name]: '3' }] } })
    })

    $$.test(`preserves ${name} at the document root without changing prototypes`, () => {
      const obj = $$.create(`<${name}><b>2</b></${name}>`).end({ format: 'object' }) as any
      $$.deepEqual(obj, { [name]: { b: '2' } })
      $$.equal(Object.getPrototypeOf(obj), Object.prototype)
      $$.equal(Object.getPrototypeOf(obj[name]), Object.prototype)
      $$.deepEqual(Object.getOwnPropertyDescriptor(obj, name), {
        value: { b: '2' }, enumerable: true, writable: true, configurable: true
      })
      $$.equal(Object.prototype.hasOwnProperty.call(obj, name), true)
      $$.deepEqual(JSON.parse($$.create(`<${name}><b>2</b></${name}>`)
        .end({ format: 'json', prettyPrint: true })), { [name]: { b: '2' } })
    })
  }
})
