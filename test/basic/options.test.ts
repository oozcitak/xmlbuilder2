import $$ from '../TestHelpers'

describe('options()', () => {

  test('set version', () => {
    const doc = $$.document({ version: "1.0" }).ele('root')
      .set({ version: "1.1" }).doc()
    expect(doc.end()).toBe('<?xml version="1.1"?><root/>')
  })

})
