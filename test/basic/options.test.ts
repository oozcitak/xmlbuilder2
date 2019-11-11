import $$ from '../TestHelpers'

describe('options()', () => {

  test('set version', () => {
    const doc = $$.xml({ version: "1.0" }).document().ele('root')
      .set({ version: "1.1" }).doc()
    expect(doc.end()).toBe('<?xml version="1.1"?><root/>')
  })

})
