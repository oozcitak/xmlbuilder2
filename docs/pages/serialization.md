---
title: "Serialization"
keywords: serialization
sidebar: api_sidebar
permalink: serialization.html
toc: false
comments: false
---
`xmlbuilder2` can serialize an XML document into a number of different formats by using the [`end`]({{ site.baseurl }}{% link pages/conversion-functions.md %}#end),
[`toObject`]({{ site.baseurl }}{% link pages/conversion-functions.md %}#toObject) and
[`toString`]({{ site.baseurl }}{% link pages/conversion-functions.md %}#toString) functions. Examples on this page work on the XML document representation below stored in the variable `doc`:

```js
const { create } = require('xmlbuilder2');

const xmlString = `
<?xml version="1.0"?>
<topgun>
  <pilots>
    <pilot callsign="Iceman" rank="Lieutenant">Tom Kazansky</pilot>
    <pilot callsign="Maverick" rank="Lieutenant">Pete Mitchell</pilot>
    <pilot callsign="Goose" rank="Lieutenant (j.g.)">Nick Bradshaw</pilot>
  </pilots>
  <hangar>
    <aircraft>F-14 Tomcat</aircraft>
    <aircraft>MiG-28</aircraft>
  </hangar>
</topgun>`;

const doc = create(xmlString);
```

### JS Object

Above document representation stored in the variable `doc` can be serialized into a JS object by calling the [`end`]({{ site.baseurl }}{% link pages/conversion-functions.md %}#end) function with the `format` argument set to `"object"`:
```js
const obj = doc.end({ format: 'object' });
```
which will result in the following JS object:
```js
{
  topgun: {
    pilots: {
      pilot: [
        { '@callsign': 'Iceman', '@rank': 'Lieutenant', '#': 'Tom Kazansky' },
        { '@callsign': 'Maverick', '@rank': 'Lieutenant', '#': 'Pete Mitchell' },
        { '@callsign': 'Goose', '@rank': 'Lieutenant (j.g.)', '#': 'Nick Bradshaw' }
      ]
    },
    hangar: {
      aircraft: [
        'F-14 Tomcat',
        'MiG-28'
      ]
    }
  }
}
```

### XML String

Similarly, the document can be serialized into an XML string by setting the `format` to `"xml"`:
```js
const serializedXML = doc.end({ format: 'xml', prettyPrint: true });
```
which will result in the following string:
```xml
<?xml version="1.0"?>
<topgun>
  <pilots>
    <pilot callsign="Iceman" rank="Lieutenant">Tom Kazansky</pilot>
    <pilot callsign="Maverick" rank="Lieutenant">Pete Mitchell</pilot>
    <pilot callsign="Goose" rank="Lieutenant (j.g.)">Nick Bradshaw</pilot>
  </pilots>
  <hangar>
    <aircraft>F-14 Tomcat</aircraft>
    <aircraft>MiG-28</aircraft>
  </hangar>
</topgun>
```
Here `prettyPrint` is an optional argument which indents the output string according to the depth of the XML tree. See the end of this page for different pretty printing settings. Also note that `"xml"` is the default serialization format, hence can be omitted in this case.

### JSON

The document can be serialized into a JSON string by setting the `format` to `"json"`:
```js
const jsonString = doc.end({ format: 'json', prettyPrint: true });
```
which will result in the following string:
```js
`{
  "topgun": {
    "pilots": {
      "pilot": [
        {
          "@callsign": "Iceman",
          "@rank": "Lieutenant",
          "#": "Tom Kazansky"
        },
        {
          "@callsign": "Maverick",
          "@rank": "Lieutenant",
          "#": "Pete Mitchell"
        },
        {
          "@callsign": "Goose",
          "@rank": "Lieutenant (j.g.)",
          "#": "Nick Bradshaw"
        }
      ]
    },
    "hangar": {
      "aircraft": [
        "F-14 Tomcat",
        "MiG-28"
      ]
    }
  }
}`
```

### YAML

The document can be serialized into a YAML string by setting the `format` to `"yaml"`:
```js
const jsonString = doc.end({ format: 'yaml', prettyPrint: true });
```
which will result in the following string:
```js
`---
"topgun":
  "pilots":
    "pilot":
    - "@callsign": "Iceman"
      "@rank": "Lieutenant"
      "#": "Tom Kazansky"
    - "@callsign": "Maverick"
      "@rank": "Lieutenant"
      "#": "Pete Mitchell"
    - "@callsign": "Goose"
      "@rank": "Lieutenant (j.g.)"
      "#": "Nick Bradshaw"
  "hangar":
    "aircraft":
    - "F-14 Tomcat"
    - "MiG-28"`
```

### Map

This format is similar to JS object, however ES6 maps are used. The `format` argument is `"map"`:
```js
const obj = doc.end({ format: 'map' });
```
which will result in the following object:
```js
new Map([
  [ "topgun", new Map([
    [ "pilots", new Map([
      [ "pilot", [
        new Map([['@callsign', 'Iceman'], ['@rank', 'Lieutenant'], ['#', 'Tom Kazansky']]),
        new Map([['@callsign', 'Maverick'], ['@rank', 'Lieutenant'], ['#', 'Pete Mitchell']]),
        new Map([['@callsign', 'Goose'], ['@rank', 'Lieutenant (j.g.)'], ['#', 'Nick Bradshaw']])
      ] ]
    ]) ],
    [ "hangar", new Map([
      [ "aircraft", [ 'F-14 Tomcat', 'MiG-28' ] ]
    ]) ]
  ]) ]
])
```

### Serialization Settings

These settings are common to all serializers.

* `format` - Output format. Either `"object"`, `"xml"`, `"json"`, `"yaml"` or `"map"`. Defaults to `"xml"`.
* `wellFormed` - Ensures that the document adheres to the syntax rules specified by the XML specification. If this flag is set and the document is not well-formed errors will be thrown. Defaults to `false`.
* `noDoubleEncoding` - Prevents existing html entities from being re-encoded when serialized. Defaults to `false`.

#### XML String Serializer

* `headless` - Suppresses the XML declaration from the output. Defaults to `false`.
* `prettyPrint` - Pretty-prints the XML tree. Defaults to `false`.
* `indent` - Determines the indentation string for pretty printing. Defaults to two space characters.
* `newline` - Determines the newline string for pretty printing. Defaults to `"\n"`.
* `offset` - Defines a fixed number of indentations to add to every line. Defaults to `0`.
* `width` - Determines the maximum column width. Defaults to `0`.
* `allowEmptyTags` - Produces closing tags for empty element nodes. With this option set to `true`, closing tags will be produced for element nodes without child nodes, e.g. `<node></node>`. Otherwise, empty element nodes will be self-closed, e.g. `<node/>`. Defaults to `false`.
* `indentTextOnlyNodes` - Indents contents of text-only element nodes. Defaults to `false` which keeps a text node on the same line with its containing element node, e.g. `<node>some text</node>`. Otherwise, it will be printed on a new line.
{% include note.html content="Element nodes with mixed content are always indented regardless of this setting." %}
* `spaceBeforeSlash` - Inserts a space character before the slash character of self-closing tags. With this options set to `true`, a space character will be inserted before the slash character of self-closing tags, e.g. `<node />`. Defaults to `false`.

#### JS Object and Map Serializers

* `group` - Groups consecutive nodes of same type under a single object. Defaults to `false`.

with group set to `true`:
```js
const { create } = require('xmlbuilder2');

const doc = create().ele('root').att({ foo: 'bar', fizz: 'buzz' });
console.log(doc.end({ format: 'object', group: true }));
```
```js
{
  root: { '@': { foo: 'bar', fizz: 'buzz' }}
}
```
with group set to `false`:
```js
const { create } = require('xmlbuilder2');

const doc = create().ele('root').att({ foo: 'bar', fizz: 'buzz' });
console.log(doc.end({ format: 'object', group: false }));
```
```js
{
  root: { '@foo': 'bar', '@fizz': 'buzz' }
}
```

* `verbose` -  Outputs child nodes as an array, even if the parent node only one child node. Defaults to `false`.

with verbose set to `true`:
```js
const { create } = require('xmlbuilder2');

const doc = create().ele('root').ele('node').txt('text').up().ele('node');
console.log(doc.end({ format: 'object', verbose: true }));
```
```js
{
  root: [
    { 
      node: [
        "text",
        {}
      ]
    }
  ]
}
```
with verbose set to `false`:
```js
const { create } = require('xmlbuilder2');

const doc = create().ele('root').ele('node').txt('text').up().ele('node');
console.log(doc.end({ format: 'object', verbose: false }));
```
```js
{
  root: {
    node: [
      "text",
      {}
    ]
  }
}
```
{% capture verbose_tip %}
  The `verbose` option is useful for processing the resulting JS object. A processor can assume that an element node will always have an array of child nodes.
  Without using the `verbose` option, the processor has to check whether object value is an object or an array and branch accordingly.
{% endcapture %}
{% include tip.html content=verbose_tip %}

#### JSON Serializer

* `prettyPrint` - Pretty-prints the XML tree. Defaults to `false`.
* `indent` - Determines the indentation string for pretty printing. Defaults to two space characters.
* `newline` - Determines the newline string for pretty printing. Defaults to `"\n"`.
* `offset` - Defines a fixed number of indentations to add to every line. Defaults to `0`.
* `group` - Groups consecutive nodes of same type under a single object. Defaults to `false`. See [JS object serializer]({{ site.baseurl }}{% link pages/serialization.md %}#js-object-and-map-serializers) for usage example.
* `verbose` -  Outputs child nodes as an array, even if the parent node has zero or one child nodes. Defaults to `false`. See [JS object serializer]({{ site.baseurl }}{% link pages/serialization.md %}#js-object-and-map-serializers) for usage example.

#### YAML Serializer

* `indent` - Determines the indentation string for pretty printing. Defaults to two space characters.
* `newline` - Determines the newline string for pretty printing. Defaults to `"\n"`.
* `offset` - Defines a fixed number of indentations to add to every line. Defaults to `0`.
* `group` - Groups consecutive nodes of same type under a single object. Defaults to `false`. See [JS object serializer]({{ site.baseurl }}{% link pages/serialization.md %}#js-object-and-map-serializers) for usage example.
* `verbose` -  Outputs child nodes as an array, even if the parent node has zero or one child nodes. Defaults to `false`. See [JS object serializer]({{ site.baseurl }}{% link pages/serialization.md %}#js-object-and-map-serializers) for usage example.

{% capture yaml_note %}
  YAML flow styles are not currently supported.
{% endcapture %}
{% include note.html content=yaml_note markdown=1 %}
