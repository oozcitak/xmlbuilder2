import $$ from "../TestHelpers";
import { XMLBuilder } from "../../src/interfaces";

$$.suite("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/45
  $$.test("#45 - How to convert an Json Array into Xml Array like this", () => {
    const obj = {
      'root': {
        'items': [
          { '@id': 1 },
          { '@id': 2 },
          { '@id': 3 }
        ]
      }
    }

    const elementParser = function (parent: XMLBuilder, namespace: any, name: string) {
      // check if we have a plural name
      if (name.endsWith('s')) {
        // check if we have a parent node with the same name
        // otherwise create one
        let itemsNode = parent.find(n => n.node.nodeName === name)
        if (itemsNode === undefined) {
          itemsNode = parent.ele(name)
        }

        let childName = name.slice(0, -1)
        return itemsNode.ele(childName)
      } else {
        return parent.ele(name)
      }
    }

    const doc = $$.create({ parser: { element: elementParser } }, obj)

    $$.deepEqual(doc.end({ headless: true, prettyPrint: true }), $$.t`
      <root>
        <items>
          <item id="1"/>
          <item id="2"/>
          <item id="3"/>
        </items>
      </root>
    `)
  })

})
