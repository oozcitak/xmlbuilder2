import $$ from '../TestHelpers'

describe('dec()', () => {

  test('version', () => {
    const doc = $$.document().ele('root').dec({ encoding: "UTF-8" }).doc()
    expect(doc.end()).toBe('<?xml version="1.0" encoding="UTF-8"?><root/>')
  })

  test('all params', () => {
    const doc = $$.document().ele('root').dec({ version: "1.0", encoding: "UTF-8", standalone: false }).doc()
    expect(doc.end()).toBe('<?xml version="1.0" encoding="UTF-8" standalone="no"?><root/>')
  })

})
