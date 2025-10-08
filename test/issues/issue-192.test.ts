import $$ from '../TestHelpers';

$$.suite('Replicate issue', () => {
  $$.test(`#192 - Attributes being grouped in ObjectWriter in specific case despite group being false`, () => {
    const expectedOutput = {
      mode: {
        '@attr1': "value",
        '@attr2': "value",
        "#": [
          {
            model: {}
          },
          {
            blockers: {}
          },
          {
            model: {}
          }
        ]
      }
    }
    const xml = `<?xml version="1.0"?><mode attr1='value' attr2='value'><model /><blockers /><model /></mode>`;
    const obj = $$.create(xml).end({ format: 'object', group: false });
    $$.deepEqual(obj, expectedOutput)
  });
});
