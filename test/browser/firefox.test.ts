import { Builder, WebDriver, By, Capabilities } from 'selenium-webdriver'
import { Options, ServiceBuilder } from 'selenium-webdriver/firefox'
// @ts-ignore
import { path as firefoxPath, start as startFirefox, stop as stopFirefox } from 'geckodriver'
import { resolve, join } from 'path'

describe('firefox', () => {
  
  let driver: WebDriver

  beforeAll(async () => {
    driver = await new Builder()
      .forBrowser('firefox')
      .withCapabilities(Capabilities.firefox())
      .setFirefoxOptions(new Options().headless().setBinary(firefoxPath))
      .build()
  }, 10000)

  afterAll(async () => {
    await driver.quit()
  }, 10000)

  test('browser tests', async () => {
    const path = resolve(join(__dirname, 'test.html'))
    await driver.get('file://' + path)
    const element = await driver.findElement(By.id('test-result'))
    return expect(element.getText()).resolves.toBe('PASS')
  }, 10000)

})
