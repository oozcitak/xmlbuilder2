import $$ from "../TestHelpers"
import { Element } from "@oozcitak/dom/lib/dom/interfaces"

$$.suite("#237 - Decode each entity reference once", () => {
  const readValue = (value: string, location: "text" | "attribute"): string | null => {
    const xml = location === "text" ? `<wrapper>${value}</wrapper>` : `<wrapper value="${value}"/>`
    const root = $$.create({ skipWhitespaceOnlyText: false }, xml).root().node as Element
    return location === "text" ? root.firstChild?.nodeValue ?? null : root.getAttribute("value")
  }

  for (const location of ["text", "attribute"] as const) {
    for (const [input, expected] of [
      ["&amp;#128512;", "&#128512;"],
      ["&amp;#x1F600;", "&#x1F600;"],
      ["&amp;#x110000;", "&#x110000;"],
      ["&amp;#1114112;", "&#1114112;"],
      ["before &amp;#65; &#65; &amp;#x1F600; after", "before &#65; A &#x1F600; after"]
    ]) {
      $$.test(`does not decode escaped numeric references twice in ${location}: ${input}`, () => {
        $$.equal(readValue(input, location), expected)
      })
    }

    for (const [input, expected] of [
      ["&amp;&lt;&gt;&apos;&quot;", "&<>'\""],
      ["&#65;&#x41;&#128512;&#x1F600;", "AA😀😀"],
      ["&#38;#128512; &#x26;#x1F600; &#38;amp;", "&#128512; &#x1F600; &amp;"],
      ["&amp;lt; &amp;amp;", "&lt; &amp;"],
      ["&unknown; &#xZZ; &#X41; &#-1;", "&unknown; &#xZZ; &#X41; &#-1;"]
    ]) {
      $$.test(`preserves existing reference handling in ${location}: ${input}`, () => {
        $$.equal(readValue(input, location), expected)
      })
    }

    for (const input of ["&#x110000;", "&#1114112;"]) {
      $$.test(`preserves out-of-range numeric reference errors in ${location}: ${input}`, () => {
        $$.throws(() => readValue(input, location), RangeError)
      })
    }
  }

  $$.test("does not decode CDATA, comments or processing instructions", () => {
    const root = $$.create("<wrapper><![CDATA[&amp;#65;]]><!--&amp;#65;--><?pi &amp;#65;?></wrapper>").root().node
    $$.deepEqual(Array.from(root.childNodes, node => node.nodeValue), ["&amp;#65;", "&amp;#65;", "&amp;#65;"])
  })

  $$.test("decodes object-reader text and attributes once", () => {
    const root = $$.create({ wrapper: { "@value": "&amp;#65;", "#": "&amp;#65;" } }).root().node as Element
    $$.equal(root.firstChild?.nodeValue, "&#65;")
    $$.equal(root.getAttribute("value"), "&#65;")
  })

  $$.test("preserves null text and attribute handling", () => {
    const root = $$.create({ keepNullNodes: true, keepNullAttributes: true }, {
      wrapper: { "@value": null, "#": null }
    }).root().node as Element
    $$.equal(root.firstChild?.nodeValue, "")
    $$.equal(root.getAttribute("value"), "")
  })

  $$.test("sanitizes input before decoding references", () => {
    const root = $$.create({ invalidCharReplacement: "" },
      "<wrapper value=\"\x00&amp;#65;\">\x00&amp;#65;</wrapper>").root().node as Element
    $$.equal(root.firstChild?.nodeValue, "&#65;")
    $$.equal(root.getAttribute("value"), "&#65;")
  })

  $$.test("passes once-decoded values to custom parsers", () => {
    const seen: string[] = []
    const root = $$.create({
      parser: {
        text: (parent, value) => {
          seen.push(value)
          return parent.txt(value)
        },
        attribute: (parent, _namespace, name, value) => {
          seen.push(value)
          return parent.att(name, value)
        }
      }
    }, "<wrapper value=\"&amp;#65;\">&amp;#65;</wrapper>").root().node as Element
    $$.deepEqual(seen, ["&#65;", "&#65;"])
    $$.equal(root.firstChild?.nodeValue, "&#65;")
    $$.equal(root.getAttribute("value"), "&#65;")
  })
})
