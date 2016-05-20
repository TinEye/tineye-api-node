/*
 * tineye-api-request.js
 *
 * JavaScript module to ease communication with the TinEye API server.
 *
 * Copyright (c) 2015 Idée Inc. All rights reserved worldwide.
 */

var api_request    = require('./api-request.js')
  , form_data      = require('form-data')
  , request        = require('request')
  , url            = require('url')


module.exports = function(api_url, public_key, private_key) {
  /*

    Class to ease communication with the TinEye API server.

    Establish a connection to the API:

    TinEye = require('tineye')
    api = new TinEye('https://api.tineye.com/rest/', 'your_public_key', 'your_private_key')

    Create your function to read the callback data:

    function callback(data) {
      // Do something with the data...
    }

    Searching for an image using an image URL:

    api.search_url('http://www.tineye.com/images/meloncat.jpg', null, null, null, null, callback)
    { stats: { timestamp: '1435951101.62', query_time: '0.21' },
      code: 200,
      messages: [],
      results:
       { total_backlinks: 23226,
         total_results: 4736,
         total_contributors: 94,
         matches:
          [ [Object],
            [Object] ] } }

    Searching for an image using image data:

    img = fs.readFileSync('./melon_cat.jpg')
    api.search_data(img, null, null, null, null, callback)
    { stats: { timestamp: '1435951101.62', query_time: '0.21' },
      code: 200,
      messages: [],
      results:
       { total_backlinks: 23226,
         total_results: 4736,
         total_contributors: 94,
         matches:
          [ [Object],
            [Object] ] } }

    Getting information about your search bundle:

    api.remaining_searches(callback)
    { stats: { timestamp: '1435951101.42', query_time: '0.02' },
      code: 200,
      messages: [],
      results:
       { remaining_searches: 596112,
         start_date: '2011-09-29 11:11:31 UTC',
         expire_date: '2020-09-28 11:11:31 UTC' } }

    Getting an image count:

    api.image_count(callback)
    { stats: { timestamp: '1435951101.42', query_time: '0.01' },
      code: 200,
      messages: [],
      results: 11800834697 }

  */

  this.api_url     = api_url     || 'https://api.tineye.com/rest/'
  this.public_key  = public_key  || null
  this.private_key = private_key || null

  this.api_request = new api_request(this.api_url, this.public_key, this.private_key)

  this.request = function(method, params, image_file, callback) {
    /*

      Send request to API and process results.

      - `callback`, callback function.
      - `method`, API method to call.
      - `params`, dictionary of fields to send to the API call.
      - `image_file`, tuple containing info (filename, data) about image to send.
      - `callback` request callback function.

    */

    image_file = image_file || null
    params     = params     || {}

    var obj = null

    // If an image file was NOT provided, send a GET request, else send a POST request.
    if (image_file === null) {

      var options = { uri: this.api_request.get_request(method, params)
                    , method: 'GET'
                    }

      request(options, function(error, response, body) {
        if (error) return callback(error)
          var obj
          var parseError
          try {
            obj = JSON.parse(body)
          } catch (err) {
            obj = body
            parseError = err
          }
          callback(parseError, obj)
      })

    } else {

      var form         = new form_data()
      var request_data = this.api_request.post_request(method, image_file[0], params, form.getBoundary())

      form.append( 'image_upload'
                  , image_file[1]
                  , { filename: 'image.jpg'
                    , contentType: 'image/jpeg'
                    }
                  )

      var parsed_url = url.parse(this.api_url)

      form.submit( { host: parsed_url.host
                   , path: request_data
                   , protocol: parsed_url.protocol
                   }
                 , function(err, res) {
                    var resp = res.statusCode
                    var body = ''

                    res.on("data", function(chunk) {
                      body += chunk
                    })

                    res.on("end", function() {
                      var bodyObj
                      var err
                      try {
                        bodyObj = JSON.parse(body)
                      } catch (error) {
                        err = error
                      }
                      callback(err, bodyObj || body)
                    })

                    res.on("error", function(error) {
                      callback(error)
                    })
                  })
    }
  }


  this.search_url = function(url, offset, limit, sort, order, callback) {
    /*

      Perform searches on the TinEye index using an image URL.

      - `url`, the URL of the image that will be searched for, must be urlencoded.
      - `offset`, offset of results from the start, defaults to 0.
      - `limit`, number of results to return, defaults to 10.
      - `sort`, sort results by score, file size (size), or crawl date (crawl_date),
          defaults to score.
      - `order`, sort results by ascending (asc) or descending criteria.
      - `callbackURL`, search_url callback function.

      Returns: a TinEye Response object.

    */

    offset = offset || 0
    limit  = limit  || 10
    sort   = sort   || 'score'
    order  = order  || 'desc'

    var obj = null

    var params = { 'image_url': url
                 , 'offset': offset
                 , 'limit': limit
                 , 'sort': sort
                 , 'order': order
                 }

    this.request('search', params, null, callback)

  }

  this.search_data = function(data, offset, limit, sort, order, callback) {
    /*

      Perform searches on the TinEye index using image data.

      - `data`, image data to use for searching.
      - `offset`, offset of results from the start, defaults to 0.
      - `limit`, number of results to return, defaults to 10.
      - `sort`, sort results by score, file size (size), or crawl date (crawl_date),
          defaults to score.
      - `order`, sort results by ascending (asc) or descending criteria.
      - `callbackSD`, search_data callback function.

      Returns: a TinEye Response object.

    */

    offset = offset || 0
    limit  = limit  || 10
    sort   = sort   || 'score'
    order  = order  || 'desc'

    var obj = null

    var params = { 'offset': offset
                 , 'limit': limit
                 , 'sort': sort
                 , 'order': order
                 }

    var image_file = ["image.jpg", data]

    this.request('search', params, image_file, callback)

  }


  this.remaining_searches = function(callback) {
    /*
      Lists the number of searches you have left in your current active block.

      - `callbackRS`, remaining_searches callback function.

      Returns: a dictionary with remaining searches, start time and end time of block.

    */
    this.request('remaining_searches', null, null, callback)
  }


  this.image_count = function(callback) {
    /*

      Lists the number of indexed images on TinEye.

      - `callbackIC` image_count callback function.

      Returns: TinEye image count.

    */
    this.request('image_count', null, null, callback)
  }

  var self = this
  var methodNames = [
    'image_count',
    'remaining_searches',
    'search_data',
    'search_url',
    'request'
  ]
  // promisify methods
  // if last argument is not a function we return a promise instead
  if (typeof Promise === 'function') {
    methodNames.forEach(function(methodName) {
      const cbMethod = self[methodName]
      self[methodName] = function() {
        if (typeof arguments[arguments.length - 1] === 'function') {
          return cbMethod.apply(self, arguments)
        }
        var args = Array.prototype.slice.call(arguments, 0)
        return new Promise(function (resolve, reject) {
          args.push(function (err, data) {
            if (err) return reject(err)
            resolve(data)
          })
          cbMethod.apply(self, args)
        })
      }
    })
  }
  // alias snake_case methods to camelCase
  methodNames.forEach(function(methodName) {
    var alias = methodName.split('_')
    if (alias.length === 1) return
    alias = alias.map(function (word, index) {
      if (index === 0) return word
      word = word[0].toUpperCase() + word.substring(1)
      return word
    }).join('')
    self[alias] = self[methodName]
  })
}
