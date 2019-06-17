import $$ from '../TestHelpers'

describe('toObject()', () => {

  test('element', () => {
    const root = $$.create('root', { "att": "val", "att2": "val2" })
      .ele('node1').up()
      .ele('node2').root()
    const obj = root.toObject()
    expect($$.printMap(obj)).toBe($$.t`
      {
        root: {
          @att: val,
          @att2: val2,
          node1: {
          },
          node2: {
          }
        }
      }
    `)
  })

})
