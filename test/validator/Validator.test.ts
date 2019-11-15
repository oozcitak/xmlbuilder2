import $$ from '../TestHelpers'
import { ValidatorImpl } from '../../src/validator'

describe('Validator', () => {

  test('invalid pubID', () => {
    expect(() => (new ValidatorImpl("1.0")).pubID(`pub\0`, 'O_o'))
      .toThrow(`Invalid character in public identifier string: pub\0. O_o`)
  })

  test('invalid sysID', () => {
    expect(() => (new ValidatorImpl("1.0")).sysID(`sys\0`, 'O_o'))
      .toThrow(`Invalid character in string: sys\0. O_o`)
    expect(() => (new ValidatorImpl("1.0")).sysID(`"sys'`, 'O_o'))
      .toThrow(`System identifier cannot contain both a single and double quote: "sys'. O_o`)
  })

  test('invalid name', () => {
    expect(() => (new ValidatorImpl("1.0")).name(`name\0`, 'O_o'))
      .toThrow(`Invalid character in string: name\0. O_o`)
    expect(() => (new ValidatorImpl("1.0")).name(`.name`, 'O_o'))
      .toThrow(`Invalid character in XML name: .name. O_o`)      
  })

  test('invalid text', () => {
    expect(() => (new ValidatorImpl("1.0")).text(`text\0`, 'O_o'))
      .toThrow(`Invalid character in string: text\0. O_o`)
  })

  test('invalid cdata', () => {
    expect(() => (new ValidatorImpl("1.0")).cdata(`text\0`, 'O_o'))
      .toThrow(`Invalid character in string: text\0. O_o`)
    expect(() => (new ValidatorImpl("1.0")).cdata(`text]]>`, 'O_o'))
      .toThrow(`CDATA content cannot contain "]]>": text]]>. O_o`)
  })

  test('invalid comment', () => {
    expect(() => (new ValidatorImpl("1.0")).comment(`text\0`, 'O_o'))
      .toThrow(`Invalid character in string: text\0. O_o`)
    expect(() => (new ValidatorImpl("1.0")).comment(`te--xt`, 'O_o'))
      .toThrow(`Comment content cannot contain double-hypen or end with a hypen: te--xt. O_o`)
    expect(() => (new ValidatorImpl("1.0")).comment(`text-`, 'O_o'))
      .toThrow(`Comment content cannot contain double-hypen or end with a hypen: text-. O_o`)
  })

  test('invalid attValue', () => {
    expect(() => (new ValidatorImpl("1.0")).attValue(`text\0`, 'O_o'))
      .toThrow(`Invalid character in string: text\0. O_o`)
  })

  test('invalid insTarget', () => {
    expect(() => (new ValidatorImpl("1.0")).insTarget(`text\0`, 'O_o'))
      .toThrow(`Invalid character in string: text\0. O_o`)
    expect(() => (new ValidatorImpl("1.0")).insTarget(`.name`, 'O_o'))
      .toThrow(`Invalid character in XML name: .name. O_o`)      
    expect(() => (new ValidatorImpl("1.0")).insTarget(`na:me`, 'O_o'))
      .toThrow(`Processing instruction target cannot contain ":" or cannot be "xml": na:me. O_o`)      
    expect(() => (new ValidatorImpl("1.0")).insTarget(`xml`, 'O_o'))
      .toThrow(`Processing instruction target cannot contain ":" or cannot be "xml": xml. O_o`)      
  })

  test('invalid insValue', () => {
    expect(() => (new ValidatorImpl("1.0")).insValue(`text\0`, 'O_o'))
      .toThrow(`Invalid character in string: text\0. O_o`)
    expect(() => (new ValidatorImpl("1.0")).insValue(`te?>xt`, 'O_o'))
      .toThrow(`Processing instruction content cannot contain "?>": te?>xt. O_o`)
  })

  test('invalid namespace', () => {
    expect(() => (new ValidatorImpl("1.0")).namespace(`text\0`, 'O_o'))
      .toThrow(`Invalid character in string: text\0. O_o`)
  })

  test('invalid pubID without debug info', () => {
    expect(() => (new ValidatorImpl("1.0")).pubID(`pub\0`))
      .toThrow(`Invalid character in public identifier string: pub\0. `)
  })

  test('invalid sysID without debug info', () => {
    expect(() => (new ValidatorImpl("1.0")).sysID(`sys\0`))
      .toThrow(`Invalid character in string: sys\0. `)
    expect(() => (new ValidatorImpl("1.0")).sysID(`"sys'`))
      .toThrow(`System identifier cannot contain both a single and double quote: "sys'. `)
  })

  test('invalid name without debug info', () => {
    expect(() => (new ValidatorImpl("1.0")).name(`name\0`))
      .toThrow(`Invalid character in string: name\0. `)
    expect(() => (new ValidatorImpl("1.0")).name(`.name`))
      .toThrow(`Invalid character in XML name: .name. `)      
  })

  test('invalid text without debug info', () => {
    expect(() => (new ValidatorImpl("1.0")).text(`text\0`))
      .toThrow(`Invalid character in string: text\0. `)
  })

  test('invalid cdata without debug info', () => {
    expect(() => (new ValidatorImpl("1.0")).cdata(`text\0`))
      .toThrow(`Invalid character in string: text\0. `)
    expect(() => (new ValidatorImpl("1.0")).cdata(`text]]>`))
      .toThrow(`CDATA content cannot contain "]]>": text]]>. `)
  })

  test('invalid comment without debug info', () => {
    expect(() => (new ValidatorImpl("1.0")).comment(`text\0`))
      .toThrow(`Invalid character in string: text\0. `)
    expect(() => (new ValidatorImpl("1.0")).comment(`te--xt`))
      .toThrow(`Comment content cannot contain double-hypen or end with a hypen: te--xt. `)
    expect(() => (new ValidatorImpl("1.0")).comment(`text-`))
      .toThrow(`Comment content cannot contain double-hypen or end with a hypen: text-. `)
  })

  test('invalid attValue without debug info', () => {
    expect(() => (new ValidatorImpl("1.0")).attValue(`text\0`))
      .toThrow(`Invalid character in string: text\0. `)
  })

  test('invalid insTarget without debug info', () => {
    expect(() => (new ValidatorImpl("1.0")).insTarget(`text\0`))
      .toThrow(`Invalid character in string: text\0. `)
    expect(() => (new ValidatorImpl("1.0")).insTarget(`.name`))
      .toThrow(`Invalid character in XML name: .name. `)      
    expect(() => (new ValidatorImpl("1.0")).insTarget(`na:me`))
      .toThrow(`Processing instruction target cannot contain ":" or cannot be "xml": na:me. `)      
    expect(() => (new ValidatorImpl("1.0")).insTarget(`xml`))
      .toThrow(`Processing instruction target cannot contain ":" or cannot be "xml": xml. `)      
  })

  test('invalid insValue without debug info', () => {
    expect(() => (new ValidatorImpl("1.0")).insValue(`text\0`))
      .toThrow(`Invalid character in string: text\0. `)
    expect(() => (new ValidatorImpl("1.0")).insValue(`te?>xt`))
      .toThrow(`Processing instruction content cannot contain "?>": te?>xt. `)
  })

  test('invalid namespace without debug info', () => {
    expect(() => (new ValidatorImpl("1.0")).namespace(`text\0`))
      .toThrow(`Invalid character in string: text\0. `)
  })

})
