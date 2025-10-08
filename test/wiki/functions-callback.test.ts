import $$ from '../TestHelpers'
import { createWriteStream, readFile } from 'fs'
import { resolve } from 'path'
import { createCB, fragmentCB } from '../../src'

$$.suite('examples in the callback function reference wiki page', () => {

  $$.test('documentCB()', async () => {
    const filename = resolve(__dirname, 'functions-documentCB.test.out')
    const outFile = createWriteStream(filename)

    const xmlStream = createCB({
      'data': (chunk: string) => outFile.write(chunk),
      'end': () => outFile.end()
    })

    outFile.on('close', () => {
      readFile(filename, 'utf8', (err, result) => {
        $$.deepEqual(result, '<root><foo/><bar fizz="buzz"/></root>')
      })
    })

    xmlStream.ele("root")
      .ele("foo").up()
      .ele("bar").att("fizz", "buzz").up()
      .end()
  })

  $$.test('fragmentCB()', async () => {
    const filename = resolve(__dirname, 'functions-fragmentCB.test.out')
    const outFile = createWriteStream(filename)

    const xmlStream = fragmentCB({
      'data': (chunk: string) => outFile.write(chunk),
      'end': () => outFile.end()
    })

    outFile.on('close', () => {
      readFile(filename, 'utf8', (err, result) => {
        $$.deepEqual(result, '<foo/><foo fizz="buzz"/><foo/>')
      })
    })

    xmlStream.ele("foo").up()
      .ele("foo").att("fizz", "buzz").up()
      .ele("foo").up()
      .end()
  })

  $$.test('EventEmitter', async () => {
    const filename = resolve(__dirname, 'functions-EventEmitter.test.out')
    const outFile = createWriteStream(filename)

    const xmlStream = createCB()
    xmlStream.on('data', (chunk) => outFile.write(chunk))
    xmlStream.on('end', () => outFile.end())

    outFile.on('close', () => {
      readFile(filename, 'utf8', (err, result) => {
        $$.deepEqual(result, '<root><foo/><bar fizz="buzz"/></root>')
      })
    })

    xmlStream.ele("root")
      .ele("foo").up()
      .ele("bar").att("fizz", "buzz").up()
      .end()
  })

})
