import $$ from "../TestHelpers";
import { XMLBuilder } from "../../src/interfaces";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/48
  test("#48 - invalidCharReplacement does not work in a convert scenario", () => {
    const xml = `
    <root>
      <node1\x00/>
      <node2/>
    </root>
    `

    const obj = $$.convert({ invalidCharReplacement: '' }, xml, { format: 'object' })

    expect(obj).toEqual(
    {
      "root": {
        "node1": {},
        "node2": {}
      }
    })
  })

})
