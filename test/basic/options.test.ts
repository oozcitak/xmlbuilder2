import $$ from '../TestHelpers'

describe('options()', () => {

  test('get encoding', () => {
    const doc = $$.create({ encoding: "Shift-JIS" }).ele('root').doc()
    expect(doc.options.encoding).toBe('Shift-JIS')
  })

  test('set encoding', () => {
    const doc = $$.create({ encoding: "UTF-8" }).ele('root')
      .set({ encoding: "Shift-JIS" }).doc()
    expect(doc.end()).toBe('<?xml version="1.0" encoding="Shift-JIS"?><root/>')
  })

})
