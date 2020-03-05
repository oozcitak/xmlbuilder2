---
title: "Parsing"
keywords: parsing
sidebar: api_sidebar
permalink: parsing.html
toc: false
comments: false
---
`xmlbuilder2` can create an XML document by parsing a number of different formats. Parsers are transparently used by the [`create`]({{ site.baseurl }}{% link pages/builder-functions.md %}#create) and
[`fragment`]({{ site.baseurl }}{% link pages/builder-functions.md %}#fragment) functions exported by the module.

### JS Objects

JS objects are expanded by creating child element nodes from object keys.

```js
const { create } = require('xmlbuilder2');

const obj = {
  topgun: {
    pilots: {
      pilot: [
        { '@callsign': 'Iceman', '@rank': 'Lieutenant', '#': 'Tom Kazansky' },
        { '@callsign': 'Maverick', '@rank': 'Lieutenant', '#': 'Pete Mitchell' },
        { '@callsign': 'Goose', '@rank': 'Lieutenant (j.g.)', '#': 'Nick Bradshaw' }
      ]
    },
    hangar: {
      aircraft: [ 'F-14 Tomcat', 'MiG-28' ]
    }
  }
}

const doc = create(obj);
const xml = doc.end({ prettyPrint: true });
console.log(xml);
```
will result in:

``` xml
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

### XML Strings

A string containing the serialization of an XML document is parsed into an XML document tree.

```js
const { create } = require('xmlbuilder2');

const serializedXML = `
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

const doc = create(serializedXML);
const xml = doc.end({ prettyPrint: true });
console.log(xml);
```
This will result in the same XML document given above.

### JSON

JSON strings representing the XML document tree are expanded by creating child element nodes from object keys.

```js
const { create } = require('xmlbuilder2');

const jsonString = `{
  "topgun": {
    "pilots": {
      "pilot": [
        { "@callsign": "Iceman", "@rank": "Lieutenant", "#": "Tom Kazansky" },
        { "@callsign": "Maverick", "@rank": "Lieutenant", "#": "Pete Mitchell" },
        { "@callsign": "Goose", "@rank": "Lieutenant (j.g.)", "#": "Nick Bradshaw" }
      ]
    },
    "hangar": {
      "aircraft": [ "F-14 Tomcat", "MiG-28" ]
    }
  }
}`

const doc = create(jsonString);
const xml = doc.end({ prettyPrint: true });
console.log(xml);
```
This will result in the same XML document given above.

### Maps

In addition to plain JS objects, ES6 maps are also converted into XML nodes.

```js
const { create } = require('xmlbuilder2');

const pilots = new Map();
pilots.set("pilot", [
  new Map([['@callsign', 'Iceman'], ['@rank', 'Lieutenant'], ['#', 'Tom Kazansky']]),
  new Map([['@callsign', 'Maverick'], ['@rank', 'Lieutenant'], ['#', 'Pete Mitchell']]),
  new Map([['@callsign', 'Goose'], ['@rank', 'Lieutenant (j.g.)'], ['#', 'Nick Bradshaw']])
]);

const hangar = new Map();
hangar.set("aircraft", ['F-14 Tomcat', 'MiG-28']);

const topgun = new Map();
topgun.set("pilots", pilots);
topgun.set("hangar", hangar);

const obj = new Map();
obj.set("topgun", topgun);

const doc = create(obj);
const xml = doc.end({ prettyPrint: true });
console.log(xml);
```
This will result in the same XML document given above.
