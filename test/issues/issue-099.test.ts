import $$ from "../TestHelpers";

$$.suite("Replicate issue", () => {
  // https://github.com/oozcitak/xmlbuilder2/issues/99
  $$.test(`#99 - Most XML entities not being decoded by reader (with unknown entity)`, () => {
    const xmlResponse = $$.create('<ssid>Me &amp; Myself&apos;s WiFi &copy;&#x1D306;</ssid>');
    const networkResponse = xmlResponse.end({format: 'object'});
    $$.deepEqual(networkResponse, {
      ssid: `Me &amp; Myself's WiFi &copy;𝌆`
    })
  })

  $$.test(`#99 - Most XML entities not being decoded by reader (without unknown entity)`, () => {
    const xmlResponse = $$.create('<ssid>Me &amp; Myself&apos;s WiFi &#x1D306;</ssid>');
    const networkResponse = xmlResponse.end({format: 'object'});
    $$.deepEqual(networkResponse, {
      ssid: `Me &amp; Myself's WiFi 𝌆`
    })
  })
})
