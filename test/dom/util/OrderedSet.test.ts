import { OrderedSet } from '../../../src/dom/util/OrderedSet'

describe('OrderedSet', function () {

  test('parse()', function () {
    const set = OrderedSet.parse('a b c a')
    expect(set.size).toBe(3)
    const vals = ['a', 'b', 'c']
    let i = 0
    for (const val of set)
    {
      expect(val).toBe(vals[i++])
    }
  })

  test('serialize()', function () {
    const set = new Set(['a', 'b', 'c', 'a'])
    expect(OrderedSet.serialize(set)).toBe('a b c')
  })

  test('sanitize()', function () {
    expect(OrderedSet.sanitize('a  b   c   a')).toBe('a b c')
  })

})
