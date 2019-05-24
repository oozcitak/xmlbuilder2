/**
 * Contains productions defined in the HTML standard
 * (https://html.spec.whatwg.org/).
 */
export class HTMLSpec {
  static readonly PotentialCustomElementName = /[a-z]([\0-\t\x2D\._a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*-([\0-\t\x2D\._a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*/

  static readonly NamesWithHyphen = ['annotation-xml', 'color-profile',
    'font-face', 'font-face-src', 'font-face-uri', 'font-face-format',
    'font-face-name', 'missing-glyph']

  static readonly ElementNames = ['article', 'aside', 'blockquote',
    'body', 'div', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'header', 'main', 'nav', 'p', 'section', 'span']

  static readonly VoidElementNames = ['area', 'base', 'basefont',
    'bgsound', 'br', 'col', 'embed', 'frame', 'hr', 'img', 'input', 'keygen',
    'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr']

  static isValidCustomElementName(name: string): boolean {
    if (!name.match(HTMLSpec.PotentialCustomElementName))
      return false

    if (HTMLSpec.NamesWithHyphen.includes(name))
      return false

    return true
  }

  static isValidElementName(name: string): boolean {
    return (HTMLSpec.ElementNames.includes(name))
  }

  static isVoidElementName(name: string): boolean {
    return (HTMLSpec.VoidElementNames.includes(name))
  }
}
