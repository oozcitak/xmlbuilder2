import $$ from "../TestHelpers";

$$.suite("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/21
  $$.test("#21 - Number 0 is omitted when converting object to xml", () => {
    $$.deepEqual($$.create().ele({ value: 0 }).end({ headless: true }), '<value>0</value>')
  })

})
