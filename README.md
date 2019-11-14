# xmlbuilder2

An XML builder for [node.js](https://nodejs.org/).

[![License](http://img.shields.io/npm/l/xmlbuilder2.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![NPM Version](http://img.shields.io/npm/v/xmlbuilder2.svg?style=flat-square)](https://www.npmjs.com/package/xmlbuilder2)

[![Travis Build Status](http://img.shields.io/travis/oozcitak/xmlbuilder2.svg?style=flat-square)](http://travis-ci.org/oozcitak/xmlbuilder2)
[![AppVeyor Build status](https://ci.appveyor.com/api/projects/status/3cg6w6rkn81qnlo5?svg=true)](https://ci.appveyor.com/project/oozcitak/xmlbuilder2)
[![Dev Dependency Status](http://img.shields.io/david/dev/oozcitak/xmlbuilder2.svg?style=flat-square)](https://david-dm.org/oozcitak/xmlbuilder2)
[![Code Coverage](https://img.shields.io/codecov/c/github/oozcitak/xmlbuilder2?style=flat-square)](https://codecov.io/gh/oozcitak/xmlbuilder2)

### Installation:

``` sh
npm install xmlbuilder2
```

### Usage:

``` js
import { document } from 'xmlbuilder2';

const root = document()
  .ele('topgun')
    .ele('pilots')
      .ele('pilot', { 'callsign': 'Iceman', 'rank': 'Lieutenant' }).txt('Tom Kazansky').up()
      .ele('pilot', { 'callsign': 'Maverick', 'rank': 'Lieutenant' }).txt('Pete Mitchell').up()
      .ele('pilot', { 'callsign': 'Goose', 'rank': 'Lieutenant (j.g.)' }).txt('Nick Bradshaw').up()
    .up()
    .ele('hangar')
      .ele('aircraft').txt('F-14 Tomcat').up()
      .ele('aircraft').txt('MiG-28')
    .up()
  .up()

// convert the XML tree to string
const xml = root.end({ prettyPrint: true });
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

The same XML document can be created by converting a JS object into XML nodes:

``` js
import { document } from 'xmlbuilder2';

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
      aircraft: [
        { '#': 'F-14 Tomcat' },
        { '#': 'MiG-28' }
      ]
    }
  }
}

const doc = document(obj);
const xml = doc.end({ prettyPrint: true });
console.log(xml);
```

If you need to do some processing:

``` js
import { document } from 'xmlbuilder2';

const root = document().ele('squares');
root.com('f(x) = x^2');
for(let i = 1; i <= 5; i++)
{
  const item = root.ele('data');
  item.att('x', i.toString());
  item.att('y', (i * i).toString();
}

const xml = root.end({ prettyPrint: true });
console.log(xml);
```

This will result in:

``` xml
<?xml version="1.0"?>
<squares>
  <!-- f(x) = x^2 -->
  <data x="1" y="1"/>
  <data x="2" y="4"/>
  <data x="3" y="9"/>
  <data x="4" y="16"/>
  <data x="5" y="25"/>
</squares>
```

See the [wiki](https://github.com/oozcitak/xmlbuilder2/wiki) for details.

