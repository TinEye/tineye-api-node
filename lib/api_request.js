/* api_request.js
 *
 * Provides authentication with the TinEye API server.
 *
 * For more information see https://api.tineye.com/documentation/authentication
 *
 * Copyright (c) 2016 TinEye. All rights reserved worldwide.
 */

var crypto  = require('crypto');

module.exports = ApiRequest;

function ApiRequest(apiUrl, publicKey, privateKey) {

  /* Class providing authetication with the TinEye API server. */

  this.apiUrl              = apiUrl;
  this.publicKey           = publicKey;
  this.privateKey          = privateKey;
  this.minNonceLength      = 24;
  this.maxNonceLength      = 255;
  this.nonceAllowableChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRTSUVWXYZ0123456789-_=.,*^";
}

ApiRequest.prototype.generateNonce = function(nonceLength) {
  /*

    Generate a nonce used to make a request unique.

    - `nonceLength`, length of the generated nonce.

    Returns: a nonce.

  */

  nonceLength = nonceLength || 24;

  if ((isNaN(parseInt(nonceLength))) || ((nonceLength < this.minNonceLength) || (nonceLength > this.maxNonceLength))) {
    throw RangeError("Nonce length must be an int between " + minNonceLength + " and " + maxNonceLength + " chars");
  }

  var nonce = "";

  for(var i = 0; i < nonceLength; i ++) {
    nonce += this.nonceAllowableChars.charAt(Math.floor(Math.random() * this.nonceAllowableChars.length));
  }

  return nonce;
};

ApiRequest.prototype.generateGetHmacSignature = function(method, nonce, date, requestParams) {
  /*
    Generate the HMAC signature hash for a GET request.

    - `method`, the API method being called.
    - `nonce`, a nonce.
    - `date`, UNIX timestamp of the request.
    - `requestParams`, other search parameters.

    Returns: an HMAC signature hash.
  */

  requestParams     = requestParams || {};
  var httpVerb      = 'GET';
  var paramStr      = this.sortParams(requestParams);
  var requestUrl    = (this.apiUrl + method + '/');
  var toSign        = (this.privateKey + httpVerb + String(date) + nonce + requestUrl + paramStr);

  return this.generateHmacSignature(toSign);
};

ApiRequest.prototype.generatePostHmacSignature = function(
    method, boundary, nonce, date, filename, requestParams) {
  /*

    Generate the HMAC signature hash for a POST request.

    - `method`, the API method being called.
    - `boundary`, the HTTP request's boundary string.
    - `nonce`, a nonce.
    - `date`, UNIX timestamp of the request.
    - `filename`, filename of the image being uploaded.
    - `requestParams`, dictionary of other search parameters.

    Returns: an HMAC signature hash.

  */

  var httpVerb    = "POST";
  var contentType = "multipart/form-data; boundary=" + boundary;
  var paramStr    = this.sortParams(requestParams);
  var requestUrl  = this.apiUrl + method + '/';
  var toSign      = (this.privateKey + httpVerb + contentType +
    encodeURIComponent(filename).replace(/%20/g,'+').toLowerCase() + String(date) +
    nonce + requestUrl + paramStr);

  return this.generateHmacSignature(toSign);
};

ApiRequest.prototype.generateHmacSignature = function(toSign) {
  /*

    Generate the HMAC signature hash given a message to sign.

    - `toSign`, the message to sign.

    Returns: HMAC signature hash.

  */
  return crypto.createHmac('sha1', this.privateKey).update(toSign).digest('hex');
};

ApiRequest.prototype.sortParams = function(requestParams, lowercase) {
  /*

    Helper method to sort request parameters.
    If requestParams has the imageUrl parameter it is URL
    encoded and then lowercased.

    - `requestParams`, list of extra search parameters.

    Returns: the search parameters in alphabetical order in query
    string params.

  */

  lowercase           = typeof lowercase === 'undefined' ? true : lowercase;
  var keys            = [];
  var unsortedParams  = [];
  var specialKeys     = ["api_key", "api_sig", "date", "nonce", "image_upload"];

  for (var key in requestParams) {

    var lowerCaseKey = String(key).toLowerCase();

    if (!(specialKeys.indexOf(lowerCaseKey) > -1)) {

      if (lowerCaseKey == "image_url") {
        var value = requestParams[key];

        if (!(value.indexOf("%") > -1)) {
          value = encodeURIComponent(value).replace(/!/g, '%21').replace(/%20/g, '+');
        }

        unsortedParams[lowerCaseKey] = value;

        if (lowercase) {
          unsortedParams[lowerCaseKey] = value.toLowerCase();
        }

      } else {
        unsortedParams[lowerCaseKey] = String(requestParams[key]);
      }

    keys.push(String(key));
    }
  }

  keys.sort();
  var sortedPairs = [];

  // Return a query string
  for (var i = 0; i < keys.length; i ++) {
    sortedPairs.push(keys[i] + "=" + unsortedParams[String(keys[i].toLowerCase())]);
  }

  return sortedPairs.join("&");
};

ApiRequest.prototype.requestUrl = function(method, nonce, date, apiSignature, requestParams) {
  /*

    Helper method to generate a URL to call given a method,
    a signature and parameters.

    - `method`, API method being called.
    - `nonce`, a nonce.
    - `date`, UNIX timestamp of the request.
    - `apiSignature`, the signature to be included with the URL.
    - `requestParams`, the parameters to be included with the URL.

    Returns: The API URL to send a request to.

  */

  var baseUrl    = this.apiUrl + method + '/';
  var requestUrl = (baseUrl + "?api_key=" + this.publicKey + "&date=" + String(date) +
    "&nonce=" + nonce + "&api_sig=" + apiSignature);

  // Need to sort all other parameters
  var extraParams = this.sortParams(requestParams, false);

  if (extraParams !== "")
    requestUrl += "&" + extraParams;

  return requestUrl;
};

ApiRequest.prototype.getRequest = function(method, requestParams) {
  /*
    Generate an API GET request string.

    - `method`, API method being called.
    - `requestParams`, the list of search parameters.

    Returns: a URL to send the search request to including the search parameters.
  */

  requestParams = requestParams || {};

  //Have to generate a nonce and date to use in generating a GET request signature.
  var nonce = this.generateNonce();
  var date  = parseInt(new Date().getTime() / 1000);
  var apiSignature = this.generateGetHmacSignature(method, nonce, date, requestParams);

  return this.requestUrl(method, nonce, date, apiSignature, requestParams);
};

ApiRequest.prototype.postRequest = function(method, filename, requestParams, boundary) {
  /*
    Generate an API POST request string for an image upload search.
    The POST request string can be sent as is to issue the POST
    request to the API server.

    - `method`, API method being called.
    - `filename`, the filename of the image that is being searched for.
    - `requestParams`, the list of search parameters.

    Returns:
    - `requestUrl`, the URL to send the search to.
  */

  if ((filename === null) || (String(filename).replace(/^\s+|\s+$/g, '').length) === 0) {
    throw exception("400", "Must specify an image to search for.");
  }

  var nonce = this.generateNonce();
  var date  = parseInt(new Date().getTime() / 1000);
  var apiSignature = this.generatePostHmacSignature("search", boundary, nonce,
    date, filename, requestParams=requestParams);

  return this.requestUrl(method, nonce, date, apiSignature, requestParams);
};
