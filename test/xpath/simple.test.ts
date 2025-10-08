import $$ from '../TestHelpers'
import { select, select1 } from 'xpath'

$$.suite('Simple XPath', () => {

  $$.test('select 1', () => {
    const doc = $$.create().ele('book').ele('title').txt('Harry Potter').doc()
    const nodes = select('//title', doc.node as any) as any

    $$.deepEqual(nodes[0].localName, "title")
    $$.deepEqual(nodes[0].firstChild.data, "Harry Potter")
    $$.deepEqual($$.builder(nodes[0]).toString(), "<title>Harry Potter</title>")
  })

  $$.test('select 2', () => {
    const doc = $$.create()
      .ins('book', 'title="Harry Potter"')
      .ins('series', 'title="Harry Potter"')
      .ins('series', 'books="7"')
      .ele('root')
      .com('This is a great book')
      .ele('title')
      .txt('Harry Potter')
      .doc()

      const nodes = select('//title', doc.node as any) as any
      const nodes2 = select('//node()', doc.node as any) as any
      const pis = select("/processing-instruction('series')", doc.node as any) as any

      $$.deepEqual(nodes[0].localName, 'title')
      $$.deepEqual(nodes[0].firstChild.data, 'Harry Potter')
      $$.deepEqual($$.builder(nodes[0]).toString(), '<title>Harry Potter</title>')

      $$.deepEqual(nodes2.length, 7)

      $$.deepEqual(pis.length, 2)
      $$.deepEqual(pis[1].data, 'books="7"')
  })

  $$.test('Select single node', () => {
    const doc = $$.create().ele('book').ele('title').txt('Harry Potter').doc()
    const nodes = select('//title[1]', doc.node as any) as any
    $$.deepEqual(nodes[0].localName, 'title')
  })

  $$.test('Select text node', () => {
    const doc = $$.create().ele('book').ele('title').txt('Harry').up().ele('title').txt('Potter').doc()
    $$.deepEqual(select('local-name(/book)', doc.node as any) as any, 'book')
    $$.deepEqual($$.builder(select('//title/text()', doc.node as any) as any).toString(), 'Harry,Potter')
  })

  $$.test('Select number value', () => {
    const doc = $$.create().ele('book').ele('title').txt('Harry').up().ele('title').txt('Potter').doc()
    $$.deepEqual(select('count(//title)', doc.node as any), 2)
  })

  $$.test('Select attribute', () => {
    const doc = $$.create().ele('author').att('name', 'J. K. Rowling').doc()
    const author = select1('/author/@name', doc.node as any) as any
    $$.deepEqual(author.value, 'J. K. Rowling')
  })

  $$.test('Select with multiple predicates', () => {
    const doc = $$.create().ele('characters')
      .ele('character', { name: "Snape", sex: "M", age: "50" }).up()
      .ele('character', { name: "McGonnagal", sex: "F", age: "65" }).up()
      .doc()

    const characters = select('/*/character[@sex = "M"][@age > 40]/@name', doc.node as any) as any

    $$.deepEqual(characters.length, 1)
    $$.deepEqual(characters[0].textContent, 'Snape')
  })

})
