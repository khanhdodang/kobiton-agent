# kobiton-agent

# How to run

## Install the package
`npm install kobiton-agent --save`

## Import methods

```javascript
const {
  waitDeviceOnlineByDeviceName,
  waitDeviceOnlineByPlatformName,
  waitDeviceOnline
} = require('kobiton-agent')
```

## Execute the wait methods

```javascript
const username = ''
const apiKey = ''
await waitDeviceOnline(username, apiKey, 'cloud', 'LGD724e1099033', 500)
await waitDeviceOnlineByDeviceName(username, apiKey, 'cloud', 'Galaxy C5', 500)
await waitDeviceOnlineByPlatformName(username, apiKey, 'cloud', 'android', 500)
```

### Note:
+ The deviceGroup is `cloud, private, or favorite`
+ The default timeout is `500` seconds