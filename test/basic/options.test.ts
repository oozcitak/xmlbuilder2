import $$ from '../TestHelpers'

$$.suite('options()', () => {

  $$.test('get encoding', () => {
    const doc = $$.create({ encoding: "Shift-JIS" }).ele('root').doc()
    $$.deepEqual(doc.options.encoding, 'Shift-JIS')
  })

  $$.test('set encoding', () => {
    const doc = $$.create({ encoding: "UTF-8" }).ele('root')
      .set({ encoding: "Shift-JIS" }).doc()
    $$.deepEqual(doc.end(), '<?xml version="1.0" encoding="Shift-JIS"?><root/>')
  })

})
