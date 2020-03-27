# Change Log

All notable changes to this project are documented in this file. This project adheres to [Semantic Versioning](http://semver.org/#semantic-versioning-200).

## [1.8.1] - 2020-03-27

- Fixed where JS object, map and JSON serializers' `group` setting defaulted to `true`.

## [1.8.0] - 2020-03-25

- Added `EventEmitter` interface to callback builder object.

## [1.7.0] - 2020-03-19

- Added JSON output format to callback API.

## [1.6.0] - 2020-03-17

- Added converter options to callback API similar to regular API.

## [1.5.0] - 2020-03-17

- Added JS object and XML string parser to callback API functions.
- Fixed collection functions to return child node indices not descendant node indices.
- Added tree depth to collection function callbacks.

## [1.4.3] - 2020-03-03

- `keepNullNodes` and `keepNullAttributes` flags now properly keep `null` 
**and** `undefined` values (See [#5](https://github.com/oozcitak/xmlbuilder2/issues/5)).
Without these flags, `null` **and** `undefined` will be silently skipped.

## [1.4.2] - 2020-03-02

- Added `types` to `package.json` to help IDEs infer types (See [#4](https://github.com/oozcitak/xmlbuilder2/issues/4)).

## [1.4.1] - 2020-02-28

- Renamed callback API functions.

## [1.4.0] - 2020-02-28

- Added callback API (See [#2](https://github.com/oozcitak/xmlbuilder2/issues/2)).


## [1.3.0] - 2020-02-18

- Added namespace aliases.

## [1.2.1] - 2020-02-18

- Removed namespace aliases.
- Prevented null namespaces from being converted to the string `"null"`.

## [1.2.0] - 2020-02-17

- Added namespace aliases.

## [1.1.2] - 2020-02-17

- Prevented child element namespaces to be inherited from their parent elements (See [#1](https://github.com/oozcitak/xmlbuilder2/issues/1)).
- Fixed JS object parser to allow namespaces for both element nodes and attributes with the `{ "prefix:name@ns": {} }` notation.

## [1.1.1] - 2020-02-13

- Fixed `width` option to work in pretty-printing mode to wrap attributes.

## [1.1.0] - 2020-02-12

- A CDATA node will not be indented in pretty-printing mode if it is the single child of its parent element.

## 1.0.0 - 2020-02-12

- Initial release

[1.1.0]: https://github.com/oozcitak/xmlbuilder2/compare/v1.0.0...v1.1.0
[1.1.1]: https://github.com/oozcitak/xmlbuilder2/compare/v1.1.0...v1.1.1
[1.1.2]: https://github.com/oozcitak/xmlbuilder2/compare/v1.1.1...v1.1.2
[1.2.0]: https://github.com/oozcitak/xmlbuilder2/compare/v1.1.2...v1.2.0
[1.2.1]: https://github.com/oozcitak/xmlbuilder2/compare/v1.2.0...v1.2.1
[1.3.0]: https://github.com/oozcitak/xmlbuilder2/compare/v1.2.1...v1.3.0
[1.4.0]: https://github.com/oozcitak/xmlbuilder2/compare/v1.3.0...v1.4.0
[1.4.1]: https://github.com/oozcitak/xmlbuilder2/compare/v1.4.0...v1.4.1
[1.4.2]: https://github.com/oozcitak/xmlbuilder2/compare/v1.4.1...v1.4.2
[1.4.3]: https://github.com/oozcitak/xmlbuilder2/compare/v1.4.2...v1.4.3
[1.5.0]: https://github.com/oozcitak/xmlbuilder2/compare/v1.4.3...v1.5.0
[1.6.0]: https://github.com/oozcitak/xmlbuilder2/compare/v1.5.0...v1.6.0
[1.7.0]: https://github.com/oozcitak/xmlbuilder2/compare/v1.6.0...v1.7.0
[1.8.0]: https://github.com/oozcitak/xmlbuilder2/compare/v1.7.0...v1.8.0
[1.8.1]: https://github.com/oozcitak/xmlbuilder2/compare/v1.8.0...v1.8.1
