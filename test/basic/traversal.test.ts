import $$ from '../TestHelpers'

$$.suite('traversal', () => {

  $$.test('root()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    $$.deepEqual(root.first().root(), root)
    const emptyDoc = $$.create()
    $$.throws(() => emptyDoc.root())
  })

  $$.test('up()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    $$.deepEqual(root.first().up(), root)
    $$.throws(() => root.first().up().up().up())
  })

  $$.test('prev()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    $$.deepEqual(root.last().prev().node.nodeName, 'node1')
    $$.throws(() => root.first().prev())
  })

  $$.test('next()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    $$.deepEqual(root.first().next().node.nodeName, 'node2')
    $$.throws(() => root.last().next())
  })

  $$.test('first()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    $$.deepEqual(root.first().node.nodeName, 'node1')
    $$.throws(() => root.first().first())
  })

  $$.test('last()', () => {
    const root = $$.create().ele('root')
      .ele('node1').up()
      .ele('node2').up()

    $$.deepEqual(root.last().node.nodeName, 'node2')
    $$.throws(() => root.last().last())
  })

})
