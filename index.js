const request = require('request')
const BPromise = require('bluebird')
const sendRequest = BPromise.promisify(request)

const TIMEOUT = process.env.TIMEOUT || 120 // seconds

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
  }
  catch (err) {
    console.error('Error occured while sending request to Kobiton via API', err)
  }

  if (response.statusCode != 200) {
    console.log('status:', response.statusCode)
    console.log('body:', response.body)
    process.exit(1)
  }

  return response.body
}

async function filterDevice(deviceList, deviceGroup, udid) {

  const {cloudDevices, privateDevices, favoriteDevices} = deviceList
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
  let device

  if (udid === '*') {
    device = devices[0]
  } else {
    device = devices.filter((d) => d.udid === udid)
  }
  
  return (Object.keys(device).length > 0)
}

async function waitDeviceOnline(username, apiKey, deviceGroup, udid) {
  for (let i = 0; i < TIMEOUT; i++) {
    let devices = await getOnlineDevice(username, apiKey)
    let result = filterDevice(devices, deviceGroup, udid)
    BPromise.delay(1000)
    if (result) {break}
  }
}

module.exports = {waitDeviceOnline}
