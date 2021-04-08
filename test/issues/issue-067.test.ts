import $$ from "../TestHelpers";
import { select } from "xpath";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/67
  test(`#67 - Xpath examples in documentation`, () => {
    const obj = {
      prop1: {
        prop2: 'Prop2Value',
        prop3: 'Prop3Value'
      }
    }

    let doc = $$.create({ encoding: "UTF-8" }, obj);

    let selected = select('//prop3', doc.node as any);
    expect((selected[0] as any).nodeName).toBe('prop3');
  })

})
