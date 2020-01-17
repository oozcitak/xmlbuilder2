import $$ from '../TestHelpers'

describe('builder()', () => {

  test('wrap node', () => {
    const doc = $$.document()
    const root = doc.as.document.createElement('root')
    const builder = $$.builder(root)
    const ele = builder.ele('ele')
    expect(ele.toString()).toBe('<ele/>')
  })

  test('invalid wrapper', () => {
    const doc = $$.document()
    const root = doc.as.document.createElement('root')
    expect(() => $$.builder({ version: "1.0" } as any)).toThrow()
  })

})
