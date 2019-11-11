import $$ from '../TestHelpers'

describe('dec()', () => {

  test('version', () => {
    const doc = $$.xml().document().ele('root').dec({ version: "1.1" }).doc()
    expect(doc.end()).toBe('<?xml version="1.1"?><root/>')
  })

  test('all params', () => {
    const doc = $$.xml().document().ele('root').dec({ version: "1.1", encoding: "UTF-8", standalone: false }).doc()
    expect(doc.end()).toBe('<?xml version="1.1" encoding="UTF-8" standalone="no"?><root/>')
  })

})
