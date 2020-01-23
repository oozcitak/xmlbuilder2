import $$ from '../TestHelpers'

describe('options()', () => {

  test('set encoding', () => {
    const doc = $$.document({ encoding: "UTF-8" }).ele('root')
      .set({ encoding: "Shift-JIS" }).doc()
    expect(doc.end()).toBe('<?xml version="1.0" encoding="Shift-JIS"?><root/>')
  })

})
