optimizely-singleton provides an easy way to setup and import an optimizely client instance without having to worry about instantiating it multiple times.

## Install
todo

## How to setup
Create a file `optimizely-setup.js` where you can define your own settings for Optimizely:

```javascript
import OptimizelySingleton from 'optimizely-singleton'

let optimizelyClientInstance = new OptimizelySingleton({
  // Check https://developers.optimizely.com/x/solutions/sdks/reference/index.html?language=javascript#initialization for more options
  createInstanceParams: {
    skipJSONValidation: true
  },
  url: 'https://cdn.optimizely.com/json/1234567890.json',
  onDataFetchError: (err) => {
    // Use your own error tracker
    // console.log(err)
  },
  onDataFetchSuccess: (data, instance) => {
    // Here you can use the instance returned.
    // For example you can expose optimizelyClientInstance globally so that it can be used for integrations
    window.optimizelyClientInstance = instance
  }
})

export default optimizelyClientInstance
```

## How to use
Once you have a `optimizely-setup.js` file, you can simply import it an use it as you would normally do with `optimizelyClientInstance`
```javascript
import optimizelyClientInstance from './optimizely-setup'

const variationKey = optimizelyClientInstance.activate(experimentName, userId)
if (variationKey === 'variation1') {
  // execute code for variation1
} else if (variationKey === 'variation2') {
  // execute code for variation2
} else {
  // execute default code
}
```
