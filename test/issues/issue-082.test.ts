import $$ from "../TestHelpers";

$$.suite("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/82
  $$.test(`#82 - convert does not respect encoding`, () => {
    const obj = {
      xliff: {
        "@version": "1.2",
        file: {
          "@datatype": "plaintext",
          "@source-language": "en",
          body: {
            "@id": "test",
            source: "<this> test </this>"
          },
        },
      },
    }
    const objProcessed = {
      xliff: {
        "@version": "1.2",
        file: {
          "@datatype": "plaintext",
          "@source-language": "en",
          body: {
            "@id": "test",
            source: "&lt;this&gt; test &lt;/this&gt;"
          },
        },
      },
    }

    const str = $$.convert(obj, { prettyPrint: true })
    const obj2 = $$.convert(str, { format: "object" })
    $$.deepEqual(obj2, objProcessed)
  })

})
