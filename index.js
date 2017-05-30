import optimizely from 'optimizely-client-sdk'
import request from 'xhr-request'

export const OPTIMIZELY_IS_FETCHING = 'OPTIMIZELY_IS_FETCHING'

export default class OptimizelySingleton {

  constructor (params) {
    if (this.instance) {
      return this.instance
    }

    this.params = params
    // optimizelyInstanceExtender is an object of functions. If present each function will be executed after the corresponding optimizelyClientInstance method is invoked
    this.params.optimizelyInstanceExtender = this.params.optimizelyInstanceExtender || {}
    this.instance = this

    this.fetchData()
  }

  fetchData () {
    request(this.params.url, {
      json: true
    }, (err, data) => {
      if (err || !data) {
        if (this.params.onDataFetchError) {
          this.params.onDataFetchError(err)
        }
      }

      // Include any additional parameter that can be passed to `createInstance`
      const instanceParams = Object.assign(
        {},
        {datafile: data},
        this.params.createInstanceParams
      )
      let optimizelyInstance = optimizely.createInstance(instanceParams)

      // Assign all the properties of optimizelyInstance to this, so that this object could be used as it was an optimizelyInstance
      for (let key in optimizelyInstance) {
        if (typeof optimizelyInstance[key] === 'function') {
          const optimizelyInstanceExtender = typeof this.params.optimizelyInstanceExtender[key] === 'function' ? this.params.optimizelyInstanceExtender[key] : () => {}
          this[key] = function () {
            const variation = optimizelyInstance[key].apply(optimizelyInstance, arguments)
            // Invoke the function extender if specified in params.optimizelyInstanceExtender
            optimizelyInstanceExtender(variation, arguments)
            return variation
          }
        }
      }

      // Invoke onDataFetchSuccess if any. This func could be used to use the optimizely instance and eventually expose it to the global `window` object. This could be useful in case integrations with Optimizely need so.
      if (this.params.onDataFetchSuccess) {
        this.params.onDataFetchSuccess(data, optimizelyInstance)
      }
    })
  }

  activate (experiment) {
    // Return a constant that represents a loading state.
    // If the data from Optimizely is not loaded yet, then this loading state is retuned. This method is replaced once the optimizelyInstance is created
    return OPTIMIZELY_IS_FETCHING
  }
}
