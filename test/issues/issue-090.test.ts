import $$ from "../TestHelpers";

describe("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/90
  test(`#90 - The Mixed Content example for Text Object Conversion does not work.`, () => {
    const obj2 = {
      monologue: {
        '#': [
          'Talk to me Goose!',
          { 'cut': 'dog tag shot' },
          'Talk to me...'
        ]
      }
    };
    const doc = $$.create().ele(obj2);
    expect(doc.end({ headless: true, prettyPrint: true})).toBe($$.t`
    <monologue>
      Talk to me Goose!
      <cut>dog tag shot</cut>
      Talk to me...
    </monologue>
    `);
  })

})
