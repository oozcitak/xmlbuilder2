import $$ from "../TestHelpers";

$$.suite("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/90
  $$.test(`#90 - The Mixed Content example for Text Object Conversion does not work.`, () => {
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
    $$.deepEqual(doc.end({ headless: true, prettyPrint: true}), $$.t`
    <monologue>
      Talk to me Goose!
      <cut>dog tag shot</cut>
      Talk to me...
    </monologue>
    `);
  })

})
