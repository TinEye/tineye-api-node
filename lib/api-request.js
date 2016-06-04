/*
 * api-request.js
 *
 * Provides authentication with the TinEye API server.
 *
 * For more information see https://api.tineye.com/documentation/authentication
 *
 * Copyright (c) 2015 Idée Inc. All rights reserved worldwide.
 *
 */

var crypto = require('crypto')


module.exports = function (api_url, public_key, private_key) {

  /* Class providing authetication with the TinEye API server. */

  this.api_url          = api_url
  this.public_key       = public_key
  this.private_key      = private_key
  min_nonce_length      = 24
  max_nonce_length      = 255
  nonce_allowable_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRTSUVWXYZ0123456789-_=.,*^"


  this.generate_nonce = function(nonce_length) {
    /*

      Generate a nonce used to make a request unique.

      - `nonce_length`, length of the generated nonce.

      Returns: a nonce.

    */

    var nonce_length = nonce_length || 24

    if ((isNaN(parseInt(nonce_length))) || ((nonce_length < min_nonce_length) || (nonce_length > max_nonce_length))) {
        throw RangeError("Nonce length must be an int between " + min_nonce_length + " and " + max_nonce_length + " chars")
    }

    var nonce = ""

    for(var i = 0; i < nonce_length; i ++) {
      nonce += nonce_allowable_chars.charAt(Math.floor(Math.random() * nonce_allowable_chars.length))
    }

    return nonce
  }


  this.generate_get_hmac_signature = function(method, nonce, date, request_params) {
    /*

      Generate the HMAC signature hash for a GET request.

      - `method`, the API method being called.
      - `nonce`, a nonce.
      - `date`, UNIX timestamp of the request.
      - `request_params`, other search parameters.

      Returns: an HMAC signature hash.

    */

    var request_params = request_params || {}
    var http_verb      = 'GET'

    var param_str   = this.sort_params(request_params)
    var request_url = (this.api_url + method + '/')
    var to_sign     = (this.private_key + http_verb + String(date) + nonce + request_url + param_str)

    return this.generate_hmac_signature(to_sign)
  }


  this.generate_post_hmac_signature = function(method, boundary, nonce, date, filename, request_params) {
    /*

      Generate the HMAC signature hash for a POST request.

      - `method`, the API method being called.
      - `boundary`, the HTTP request's boundary string.
      - `nonce`, a nonce.
      - `date`, UNIX timestamp of the request.
      - `filename`, filename of the image being uploaded.
      - `request_params`, dictionary of other search parameters.

      Returns: an HMAC signature hash.

    */

    var http_verb    = "POST"
    var content_type = "multipart/form-data; boundary=" + boundary
    var param_str    = this.sort_params(request_params)
    var request_url  = this.api_url + method + '/'
    var to_sign      = (this.private_key + http_verb + content_type + encodeURIComponent(filename).replace(/%20/g,'+').toLowerCase() + String(date)
                        + nonce + request_url + param_str)

    return this.generate_hmac_signature(to_sign)
  }

  this.generate_hmac_signature = function(to_sign) {
    /*

      Generate the HMAC signature hash given a message to sign.

      - `to_sign`, the message to sign.

      Returns: HMAC signature hash.

    */
    return crypto.createHmac('sha1', this.private_key).update(to_sign).digest('hex')
  }

  this.sort_params = function(request_params, lowercase) {
  /*

    Helper method to sort request parameters.
    If request_params has the image_url parameter it is URL
    encoded and then lowercased.

    - `request_params`, list of extra search parameters.

    Returns: the search parameters in alphabetical order in query
    string params.

  */

    var lowercase       = typeof lowercase === 'undefined' ? true : lowercase
    var keys            = []
    var unsorted_params = []

    var special_keys = [ "api_key"
                       , "api_sig"
                       , "date"
                       , "nonce"
                       , "image_upload"
                       ]

    for (var key in request_params) {

      var lc_key = String(key).toLowerCase()

      if (!((special_keys.indexOf(lc_key))> -1)) {

        if (lc_key == "image_url") {
          var value = request_params[key]

          if (!( value.indexOf("%") > -1 )) {
            value = encodeURIComponent(value).replace(/!/g,'%21').replace(/%20/g,'+')
          }

          unsorted_params[lc_key] = value

          if (lowercase){
            unsorted_params[lc_key] = value.toLowerCase()
          }

        } else {
          unsorted_params[lc_key] = String(request_params[key])
          }

      keys.push(String(key))
      }
    }

    keys.sort()
    var sorted_pairs = []

    //Return a query string
    for (var i = 0; i < keys.length; i ++){
      sorted_pairs.push("" + keys[i] +"="+ unsorted_params[""+String(keys[i].toLowerCase())+""] +"")
    }

    return sorted_pairs.join("&")
  }

  this.request_url = function(method, nonce, date, api_signature, request_params) {
    /*

      Helper method to generate a URL to call given a method,
      a signature and parameters.

      - `method`, API method being called.
      - `nonce`, a nonce.
      - `date`, UNIX timestamp of the request.
      - `api_signature`, the signature to be included with the URL.
      - `request_params`, the parameters to be included with the URL.

      Returns: The API URL to send a request to.

    */

    var base_url    = this.api_url + method + '/'
    var request_url = (base_url + "?api_key=" + this.public_key + "&date=" + String(date)
                       + "&nonce=" + nonce + "&api_sig=" + api_signature)

    // Need to sort all other parameters
    console.log(request_params)
    var extra_params = this.sort_params(request_params, false)
    console.log(extra_params)

    if (extra_params != "")
      request_url += "&" + extra_params

    return request_url
  }


  this.get_request = function(method, request_params) {
    /*

      Generate an API GET request string.

      - `method`, API method being called.
      - `request_params`, the list of search parameters.

      Returns: a URL to send the search request to including the search parameters.

    */

    var request_params = request_params || {}

    //Have to generate a nonce and date to use in generating a GET request signature.
    var nonce = this.generate_nonce()
    var date  = new Date()
    var date  = parseInt(new Date().getTime() / 1000)

    var api_signature = this.generate_get_hmac_signature(method, nonce, date, request_params)

    return this.request_url(method, nonce, date, api_signature, request_params)
 }


  this.post_request = function(method, filename, request_params, boundary) {
    /*

      Generate an API POST request string for an image upload search.
      The POST request string can be sent as is to issue the POST
      request to the API server.

      - `method`, API method being called.
      - `filename`, the filename of the image that is being searched for.
      - `request_params`, the list of search parameters.

      Returns:
      - `request_url`, the URL to send the search to.

    */

    if ((filename == null) || (String(filename).replace(/^\s+|\s+$/g, '').length) == 0) {
      throw exception("400", "Must specify an image to search for.")
    }

    var nonce = this.generate_nonce()
    var date  = parseInt(new Date().getTime() / 1000)

    var api_signature = this.generate_post_hmac_signature( "search"
                                                          , boundary
                                                          , nonce, date
                                                          , filename
                                                          , request_params=request_params
                                                          )

    return this.request_url( method
                           , nonce
                           , date
                           , api_signature
                           , request_params
                           )
  }
}
