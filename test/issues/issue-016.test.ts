import $$ from "../TestHelpers";

$$.suite("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/16
  $$.test("#16 - Named entities produce invalid XML", () => {
    $$.deepEqual(
      $$.convert(
        { example: "&lt;p&gt;Hello&nbsp;World&lt;/p&gt;" },
        { format: "xml" }
      )
    ,
      '<?xml version="1.0"?><example>&lt;p&gt;Hello&nbsp;World&lt;/p&gt;</example>'
    );
    $$.deepEqual(
      $$.convert(
        { example: "&notanentity&lt;" },
        { format: "xml" }
      )
    , '<?xml version="1.0"?><example>&amp;notanentity&lt;</example>')
  })
})
