# Change Log

All notable changes to this project are documented in this file. This project adheres to [Semantic Versioning](http://semver.org/#semantic-versioning-200).


## [1.3.0] - 2020-02-18

- Added namespace aliases.

## [1.2.1] - 2020-02-18

- Removed namespace aliases.
- Prevented null namespaces from being converted to the string `"null"`.

## [1.2.0] - 2020-02-17

- Added namespace aliases.

## [1.1.2] - 2020-02-17

- Prevented child element namespaces to be inherited from their parent elements (issue #1).
- Fixed JS object parser to allow namespaces for both element nodes and attributes with the `{ "prefix:name@ns": {} }` notation.

## [1.1.1] - 2020-02-13

- Fixed `width` option to work in pretty-printing mode to wrap attributes.

## [1.1.0] - 2020-02-12

- A CDATA node will not be indented in pretty-printing mode if it is the single child of its parent element.

## 1.0.0 - 2020-02-12

- Initial release

[1.3.0]: https://github.com/oozcitak/xmlbuilder2/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/oozcitak/xmlbuilder2/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/oozcitak/xmlbuilder2/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/oozcitak/xmlbuilder2/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/oozcitak/xmlbuilder2/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/oozcitak/xmlbuilder2/compare/v1.0.0...v1.1.0