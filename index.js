const request = require('request')
const BPromise = require('bluebird')
const sendRequest = BPromise.promisify(request)

const headers = {
  'Accept': 'application/json'
}

async function getOnlineDevice(username, apiKey) {
  let response
  try {
    response = await sendRequest({
      url: `https://api.kobiton.com/v1/devices?isOnline=true&isBooked=false`,
      json: true,
      method: 'GET',
      auth: {
        user: username,
        pass: apiKey
      },
      headers
    })
  } catch (err) {
    console.error('Error occured while sending request to Kobiton via API', err)
  }

  if (response.statusCode != 200) {
    console.log('status:', response.statusCode)
    console.log('body:', response.body)
    process.exit(1)
  }

  return response.body
}

async function _filterByDeviceGroup(deviceList, deviceGroup) {
  const {
    cloudDevices,
    privateDevices,
    favoriteDevices
  } = deviceList
  let devices

  switch (deviceGroup.toLowerCase()) {
    case 'private':
      devices = privateDevices
      break
    case 'cloud':
      devices = cloudDevices
      break
    case 'favorite':
      devices = favoriteDevices
      break
    default:
      devices = cloudDevices
      break
  }
  return devices
}

async function _filterByDeviceName(deviceList, deviceGroup, deviceName) {
  let devices = await _filterByDeviceGroup(deviceList, deviceGroup)
  let device = await devices.filter((d) => d.deviceName === deviceName &&
    d.state === 'ACTIVATED')
  return (Array.isArray(device) && device.length > 0)
}

async function _filterByPlatformName(deviceList, deviceGroup, platformName) {
  let devices = await _filterByDeviceGroup(deviceList, deviceGroup)
  let device = await devices.filter((d) => d.platformName.toLowerCase() === platformName.toLowerCase() &&
    d.state === 'ACTIVATED')
  return (Array.isArray(device) && device.length > 0)
}

async function _filterByDeviceUDID(deviceList, deviceGroup, udid) {
  let devices = await _filterByDeviceGroup(deviceList, deviceGroup)

  let device

  if (udid === '*') {
    device = await devices[0]
  } else {
    device = await devices.filter((d) => d.udid === udid &&
      d.state === 'ACTIVATED')
  }

  return (Object.keys(device).length > 0)
}

/**
 * Wait for the device only by Device Name
 * @param username {string} - Username
 * @param apiKey {string} - API Key
 * @param deviceGroup {string} - they are cloud, private, fovorite
 * @param deviceName {string} - Device Name
 * @param timeOut {int} - The default timeout is 500 seconds
 */
async function waitDeviceOnlineByDeviceName(username, apiKey, deviceGroup, deviceName, timeOut = 500) {
  for (let i = 0; i < timeOut; i++) {
    let devices = await getOnlineDevice(username, apiKey)
    let result = await _filterByDeviceName(devices, deviceGroup, deviceName)
    await BPromise.delay(5000)
    if (result) {
      break
    }
  }
}

/**
 * Wait for the device only by Platform Name
 * @param username {string} - Username
 * @param apiKey {string} - API Key
 * @param deviceGroup {string} - they are cloud, private, fovorite
 * @param platformName {string} - Platform Name
 * @param timeOut {int} - The default timeout is 500 seconds
 */
async function waitDeviceOnlineByPlatformName(username, apiKey, deviceGroup, platformName, timeOut = 500) {
  for (let i = 0; i < timeOut; i++) {
    let devices = await getOnlineDevice(username, apiKey)
    let result = await _filterByPlatformName(devices, deviceGroup, platformName)
    await BPromise.delay(5000)
    if (result) break
  }
}

/**
 * Wait for the device only by UDID
 * @param username {string} - Username
 * @param apiKey {string} - API Key
 * @param deviceGroup {string} - they are cloud, private, fovorite
 * @param udid {string} - UDID
 * @param timeOut {int} - The default timeout is 500 seconds
 */
async function waitDeviceOnline(username, apiKey, deviceGroup, udid, timeOut = 500) {
  for (let i = 0; i < timeOut; i++) {
    let devices = await getOnlineDevice(username, apiKey)
    let result = await _filterByDeviceUDID(devices, deviceGroup, udid)
    await BPromise.delay(5000)
    if (result) break
  }
}

module.exports = {
  waitDeviceOnlineByDeviceName,
  waitDeviceOnlineByPlatformName,
  waitDeviceOnline
}
