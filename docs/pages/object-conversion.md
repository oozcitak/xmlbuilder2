---
title: "Object Conversion"
keywords: object conversion
sidebar: api_sidebar
permalink: object-conversion.html
toc: false
comments: false
---
`xmlbuilder2` can convert JS objects into XML nodes. Each key/value pair of a JS object is converted into an element node, where object key becomes the node name and object value becomes the node contents.

```js
const { create } = require('xmlbuilder');

const obj = {
  root: 'text'
};
const doc = create().ele(obj);
console.log(doc.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root>text</root>
```
If the object value is another JS object, it will be recursively converted into nodes.
```js
const { create } = require('xmlbuilder');

const obj = {
  root: {
    foo: {
      bar: 'foobar'
    }
  }
};
const doc = create().ele(obj);
console.log(doc.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root>
  <foo>
    <bar>foobar</bar>
  </foo>
</root>
```
If the object value is an array, each array item will be converted into a child node. In that case, name of the child nodes will be the object key.
```js
const { create } = require('xmlbuilder');

const obj = {
  root: {
    child: [
      'one',
      'two',
      'three'
    ]
  }
};
const doc = create().ele(obj);
console.log(doc.end({ prettyPrint: true }));
```
```xml
<?xml version="1.0"?>
<root>
  <child>one</child>
  <child>two</child>
  <child>three</child>
</root>
```

Although this allows element and text nodes to be easily created, a special syntax is needed for other types of nodes and element attributes. This special syntax is provided with converter strings.  Default converter strings and their behavior are as follows.

### Converter Strings

Converter strings can be customized with the `convert` option while initializing the builder; see [builder options](builder-options.html).

#### att

Converts its key-value pair to an element attribute. Defaults to `'@'`. Multiple attributes can also be grouped under the attribute key.
```js
obj1 = { pilot: { '@callsign': 'Maverick', '@rank': 'Lieutenant' } }
obj2 = { pilot: { '@': { 'callsign': 'Maverick', 'rank': 'Lieutenant' } } }
```
are both converted into:
```xml
<pilot callsign="Maverick" rank="Lieutenant"/>
````
___

#### ins

Converts its value to a processing instruction node. Defaults to `'?'`. Instruction target and value should be separated with a single space character.
```js
obj = { 
  '?': 'background classified ref='NAM#123456'',
  pilot: 'Pete Mitchell'
}
```
becomes:
```xml
<?background classified ref="NAM#123456"?>
<pilot>Pete Mitchell</pilot>
````
___

#### text

Converts its value to a text node if it is a string, otherwise expands its value under its parent element node. Defaults to `'#'`.
```js
obj = { monologue: {
  '#': 'Talk to me Goose!',
} }
```
becomes:
```xml
<monologue>Talk to me Goose!</monologue>
````
{% capture cb_note %}
  Since JS objects cannot contain duplicate keys, multiple text nodes can be 
  created by adding some unique text after each object key or grouping node
  contents in an array. Example:
```js
obj1 = { monologue: {
  '#1': 'Talk to me Goose!',
  '#2': 'Talk to me...'
} }
obj2 = { monologue: {
  '#': [
    'Talk to me Goose!',
    'Talk to me...'
  ]
} }
```
both become:
```xml
<monologue>Talk to me Goose!Talk to me...</monologue>
```
{% endcapture %}
{% include note.html content=cb_note markdown=1 %}

{% capture cb_note %}
  `'#'` also allows mixed content. Example:
```js
obj1 = { monologue: {
  '#1': 'Talk to me Goose!',
  'cut': 'dog tag shot',
  '#2': 'Talk to me...'
} }
obj2 = { monologue: {
  '#': [
    'Talk to me Goose!',
    { 'cut': 'dog tag shot' },
    'Talk to me...'
  ]
} }
```
both become:
```xml
<monologue>
  Talk to me Goose!
  <cut>dog tag shot</cut>
  Talk to me...
</monologue>
```
{% endcapture %}
{% include note.html content=cb_note markdown=1 %}
___

#### cdata
Converts its value to a CDATA section node. Defaults to `'$'`.
```js
obj = { 
  '$': '<a href="https://topgun.fandom.com/wiki/MiG-28"/>',
  aircraft: 'MiG-28'
}
```
becomes:
```xml
<![CDATA[<a href="https://topgun.fandom.com/wiki/MiG-28"/>]]>
<aircraft>MiG-28</aircraft>
````
___

#### comment
Converts its value to a comment node. Defaults to `'!'`.
```js
obj = {
  '!': 'Fictional; MiGs use odd numbers for fighters.',
  aircraft: 'MiG-28'
}
```
becomes:
```xml
<!--Fictional; MiGs use odd numbers for fighters.-->
<aircraft>MiG-28</aircraft>
```

### Namespaces

When converting JS objects, element and attribute namespaces can be specified as follows:
```js
obj = {
  'root@http://example.com/ns1': 'foo'
}
```
becomes:
```xml
<root xmlns="http://example.com/ns1">foo</root>
```

