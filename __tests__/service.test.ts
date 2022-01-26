import { getTag, forcePull } from '../src/service'
import * as fs from 'fs/promises'

describe('getTag function', () => {

  it ('integrates version checks with docker hub and a default library',async () => {
    const tag = await getTag('mysql', '5')
    expect(tag).toEqual('5')
  })

  it ('works when latest semver is in the form of "0.7.0"', async () => {
    const jsonData = await getJSONTestData()
    const tag = await getTag('benbusby/whoogle-search', '0', jsonData)
    expect(tag).toBe('0.7.0')
  })

  it ('works when the latest semver is in the form of "0.7"', async () => {
    const jsonData = await getJSONTestData()
    const tag = await getTag('benbusby/whoogle-search', '0', jsonData)
    expect(tag).toBe('0.7.0')
  })

  it ('finds exact major version only tag', async () => {
    const jsonData = await getJSONTestData()
    const tag = await getTag('benbusby/whoogle-search', '1', jsonData)
    expect(tag).toBe('1')
  })

  it ('finds one qualifying tag', async () => {
    const jsonData = await getJSONTestData()
    const tag = await getTag('benbusby/whoogle-search', '0', jsonData)
    expect(tag).toBe('0.7.0')
  })

  it ('finds latest semver when pattern is in the form of "0.7"', async () => {
    const jsonData = await getJSONTestData()
    const tag = await getTag('benbusby/whoogle-search', '0.7', jsonData)
    expect(tag).toBe('0.7.0')
  })

  it ('finds latest semver when pattern is in the form of "0.6"', async () => {
    const jsonData = await getJSONTestData()
    const tag = await getTag('benbusby/whoogle-search', '0.6', jsonData)
    expect(tag).toBe('0.6.0')
  })

  it ('finds latest semver when pattern is in the form of "0.6.0"', async () => {
    const jsonData = await getJSONTestData()
    const tag = await getTag('benbusby/whoogle-search', '0.6.0', jsonData)
    expect(tag).toBe('0.6.0')
  })

  it ('doesnt find any semver tags',async () => {
    const jsonData = await getJSONTestData('no-semver-tags')
    const tag = await getTag('benbusby/whoogle-search', '0.6.0', jsonData)
    expect(tag).toBe(null)
  })

  it ('doesnt find a tag because pattern is not semver',async () => {
    const jsonData = await getJSONTestData()
    const tag = await getTag('benbusby/whoogle-search', 'foobar', jsonData)
    expect(tag).toBe(null)    
  })

  it ('should not consider the tag to force pull', () => {
    expect(forcePull("1.2.3")).toBe(false)
  })

  it ('should consider the tag to force pull', () => {
    expect(forcePull("latest")).toBe(true)
  })
})

const getJSONTestData = async (testName = "comprehensive") => {
  const testDataFolder = `${__dirname}/test_data`
  const contents = await fs.readFile(`${testDataFolder}/${testName}.json`, 'utf8')
  const json: string[] = JSON.parse(contents)
  return json
}