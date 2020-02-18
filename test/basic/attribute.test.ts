import $$ from '../TestHelpers'

describe('att()', () => {

  test('add attribute', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    node1.att('att1', 'val1').att('att2', 'val2').ele('node1-2')
    const node2 = root.ele('node2')

    expect($$.printTree(root.doc().node)).toBe($$.t`
      root
        node1 att1="val1" att2="val2"
          node1-2
        node2
      `)
  })

  test('add attribute - undefined namespace', () => {
    const root = $$.create().ele('root')
    expect(() => root.att(undefined as any, 'att', 'val')).toThrow()
  })

  test('add multiple attributes', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    node1.att({ 'att1': 'val1', 'att2': 'val2'}).ele('node1-2')
    const node2 = root.ele('node2')

    expect($$.printTree(root.doc().node)).toBe($$.t`
      root
        node1 att1="val1" att2="val2"
          node1-2
        node2
      `)
  })

  test('replace attribute', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    node1.att('att1', 'val1').att('att1', 'val2').ele('node1-2')
    const node2 = root.ele('node2')

    expect($$.printTree(root.doc().node)).toBe($$.t`
      root
        node1 att1="val2"
          node1-2
        node2
      `)
  })

  test('remove attribute', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    node1.att('att1', 'val1')
      .att('att2', 'val2')
      .att('att3', 'val3')
      .att('att4', 'val4')
    node1.ele('node1-2')
    const node2 = root.ele('node2')
    node1.removeAtt('att2')
    node1.removeAtt(['att1', 'att2', 'att4'])

    expect($$.printTree(root.doc().node)).toBe($$.t`
      root
        node1 att3="val3"
          node1-2
        node2
      `)
  })

  test('remove attribute - invalid arguments', () => {
    const root = $$.create().ele('root')
    expect(() => (root as any).removeAtt(['ns1', 'ns2'], ['att1', 'att2', 'att4'])).toThrow()
  })

  test('attribute from JS object', () => {
    const root = $$.create().ele('root')
    root.ele('node').ele({ '@att1': 'val1', '@att2': 'val2' })

    expect($$.printTree(root.doc().node)).toBe($$.t`
      root
        node att1="val1" att2="val2"
      `)
  })

  test('attribute from JS object alternate notation', () => {
    const root = $$.create().ele('root')
    root.ele('node').ele({ '@': { 'att1': 'val1', 'att2': 'val2' } })

    expect($$.printTree(root.doc().node)).toBe($$.t`
      root
        node att1="val1" att2="val2"
      `)
  })

  test('skip null attribute', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    node1.ele({ '@att1': null, '@att2': 'val2' }).ele('node1-2')
    const node2 = root.ele('node2')

    expect($$.printTree(root.doc().node)).toBe($$.t`
      root
        node1 att2="val2"
          node1-2
        node2
      `)
  })

  test('keep null attribute', () => {
    const root = $$.create({ keepNullAttributes: true }).ele('root')
    const node1 = root.ele('node1')
    node1.ele({ '@att1': null, '@att2': 'val2' }).ele('node1-2')
    const node2 = root.ele('node2')

    expect($$.printTree(root.doc().node)).toBe($$.t`
      root
        node1 att1="" att2="val2"
          node1-2
        node2
      `)
  })

  test('invalid attribute value', () => {
    const root = $$.create().ele('root')
    const node1 = root.ele('node1')
    expect(() => node1.ele({ '@att1': undefined })).toThrow()
  })

})
