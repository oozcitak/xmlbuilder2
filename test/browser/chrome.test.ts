import { Builder, WebDriver, Capabilities, By } from 'selenium-webdriver'
import { Options, ServiceBuilder, setDefaultService } from 'selenium-webdriver/chrome'
import { path as chromePath } from 'chromedriver'
import { resolve, join } from 'path'

describe('chrome', () => {
  
  let driver: WebDriver

  beforeAll(async () => {
    const service = new ServiceBuilder(chromePath).build()
    setDefaultService(service)

    driver = new Builder()
      .forBrowser('chrome')
      .withCapabilities(Capabilities.chrome())
      .setChromeOptions(new Options().headless())
      .build()
  }, 10000)

  afterAll(async () => {
    await driver.quit()
  }, 10000)

  test('browser tests', async () => {
    const path = resolve(join(__dirname, 'test.html'))
    await driver.get(path)
    const element = await driver.findElement(By.id('test-result'))
    return expect(element.getText()).resolves.toBe('PASS')
  }, 10000)

})
