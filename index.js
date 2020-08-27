const request = require('request')
const BPromise = require('bluebird')

const sendRequest = BPromise.promisify(request)

const username = process.env.KOBITON_USERNAME
const apiKey = process.env.KOBITON_API_KEY
const DEVICE_GROUP = process.env.DEVICE_GROUP || 'cloud'
const UDID = process.env.UDID || '*'
const TIMEOUT = process.env.TIMEOUT || 120 // seconds

const headers = {
    'Accept': 'application/json'
}

async function getOnlineDevice() {
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

  if (UDID === '*') {
    device = await devices[0]
  } else {
    device = await devices.filter((d) => d.udid === udid)
  }
  
  return (Array.isArray(device) && device.length > 0)
}

async function main() {
  if(!username || !apiKey)
  {
    console.log('KOBITON_USERNAME and KOBITON_APIKEY variables are need to execute the script')
    process.exit(1)
  }

  for (let i = 0; i < TIMEOUT; i++) {
    let devices = await getOnlineDevice()
    let result = await filterDevice(devices, DEVICE_GROUP, UDID)
    if (result) {break}
  }
}

main()
