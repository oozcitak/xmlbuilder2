import $$ from "../TestHelpers";

$$.suite("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/48
  $$.test("#48 - invalidCharReplacement does not work in a convert scenario", () => {
    const xml = `
    <root>
      <node1\x00/>
      <node2/>
    </root>
    `

    const obj = $$.convert({ invalidCharReplacement: '' }, xml, { format: 'object' })

    $$.deepEqual(obj,
    {
      "root": {
        "node1": {},
        "node2": {}
      }
    })
  })

})
