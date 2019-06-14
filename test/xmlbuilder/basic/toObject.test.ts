import $$ from '../TestHelpers'

describe('toObject()', () => {

  test('element', () => {
    const root = $$.create('root')
    const obj = root.toObject()
    expect($$.printMap(obj)).toBe('<root/>')
  })

})
