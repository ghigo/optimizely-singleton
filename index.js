import optimizely from 'optimizely-client-sdk'
import request from 'xhr-request'

export const OPTIMIZELY_IS_FETCHING = 'OPTIMIZELY_IS_FETCHING'

const OptimizelySingleton = (function () {
  // The singleton instance
  let instance
  // Default instance returned while waiting for the optimizely data to be fetched
  const defaultInstance = {
    activate: (experimentName, userId, userAttributes, callback) => {
      // Return a constant that represents a loading state.
      // If the data from Optimizely is not loaded yet, then this loading state is retuned. This method is replaced once the optimizelyInstance is created
      // todo:marco add callback to an array of callbacks to invoke when fetchData is done
      return OPTIMIZELY_IS_FETCHING
    }
  }
  // Config parameters
  let instanceParams

  /**
   * Constructor
   * @param  {Object} params Config params
   * @return {Object}        A default instance of the optimizely client
   */
  function createInstance (params) {
    instanceParams = params
    instanceParams.optimizelyInstanceExtender = instanceParams.optimizelyInstanceExtender || {}

    fetchData()

    return defaultInstance
  }

  /**
   * Fetch the Optimizely json
   * Calls the onDataFetchError in case of errors, otherwise call createOptimizelyInstance
   */
  function fetchData () {
    request(instanceParams.url, {
      json: true
    }, (err, data) => {
      if (err || !data) {
        if (instanceParams.onDataFetchError) {
          instanceParams.onDataFetchError(err)
        }
      } else {
        // save data in local storage
        createOptimizelyInstance(data)
      }
    })
  }

  /**
   * Create an Optimizely instance, extend it with additional parameters and override the local instance with Optimizely instance
   * @param  {Object} data the json fetched
   */
  function createOptimizelyInstance (data) {
    // Include any additional parameter that can be passed to `createInstance`
    const params = Object.assign(
      {},
      {datafile: data},
      instanceParams.createInstanceParams
    )
    const optimizelyInstance = optimizely.createInstance(params)

    // Assign all the properties of optimizelyInstance to `instance`, so that `instance` could be used as it was an optimizelyInstance
    for (let key in optimizelyInstance) {
      if (typeof optimizelyInstance[key] === 'function') {
        const optimizelyInstanceExtender = typeof instanceParams.optimizelyInstanceExtender[key] === 'function' ? instanceParams.optimizelyInstanceExtender[key] : () => {}
        instance[key] = function () {
          const variation = optimizelyInstance[key].apply(optimizelyInstance, arguments)
          // Invoke the function extender if specified in params.optimizelyInstanceExtender
          optimizelyInstanceExtender(variation, arguments)
          return variation
        }
      }
    }

    // Invoke onDataFetchSuccess if any. This func could be used to use the optimizely instance and eventually expose it to the global `window` object. This could be useful in case integrations with Optimizely need so.
    if (instanceParams.onDataFetchSuccess) {
      instanceParams.onDataFetchSuccess(data, optimizelyInstance, instance)
    }
  }

  return {
    getInstance: function (params) {
      if (!instance) {
        instance = createInstance(params)
      }
      return instance
    }
  }
})()

export default OptimizelySingleton
