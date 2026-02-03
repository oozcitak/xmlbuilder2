import $$ from '../TestHelpers';

$$.suite('Replicate issue', () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/189
  $$.test(`#189 - Line Feed hex character entity in attributes is missing`, () => {
    const expectedOutput = {
      content: {
        Label: {
          '@text': 'SUPPLY&#10;AIR'
        }
      }
    }
    const xml = `
<content>
  <Label text="SUPPLY
AIR"/>
</content>
    `;
    const obj = $$.create(xml).end({ format: 'object' });
    $$.deepEqual(obj, expectedOutput)
  });
});
