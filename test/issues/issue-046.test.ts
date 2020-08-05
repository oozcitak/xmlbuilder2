import $$ from "../TestHelpers";
import { XMLBuilder } from "../../src/interfaces";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/46
  test("#46 - Renaming elements through custom parser throws closing tag error", () => {
    const xml = $$.t`
    <root>
      <node1/>
      <node2/>
    </root>
    `

    const obj = $$.convert({
      parser: {
        element: (parent, _, name) => parent.ele("_" + name)
      },
    }, xml, { 
      format: 'object' 
    })

    expect(obj).toEqual(
    {
      "_root": {
        "_node1": {},
        "_node2": {}
      }
    })
  })

})
