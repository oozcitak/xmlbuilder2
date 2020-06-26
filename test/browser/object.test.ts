import { Builder, WebDriver, Capabilities } from 'selenium-webdriver'
import { ServiceBuilder, setDefaultService } from 'selenium-webdriver/chrome'
import { path as chromePath } from 'chromedriver'
import { resolve, join } from "path"
describe('object', () => {
  
  let driver: WebDriver

  beforeAll(async () => {
    const service = new ServiceBuilder(chromePath).addArguments('--allow-file-access-from-files') .build()
    setDefaultService(service)

    driver = await new Builder()
      .withCapabilities(Capabilities.chrome())
      .build()
    await driver.getWindowHandle()
  }, 10000)

  afterAll(async () => {
    await driver.quit()
  })

  beforeEach(async () => {
    const path = resolve(join(__dirname, 'test.html'))
    await driver.get(path)
  })

  test('from JS object with decorators', async () => {
    const result = await driver.executeScript(`var root = xmlbuilder2.create().ele('root'); return root.end();`)
    expect(result).toBe(`<?xml version=\"1.0\"?><root/>`)
  })

})
