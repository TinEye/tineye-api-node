/* tineye_api_request.js
 *
 * JavaScript module to ease communication with the TinEye API.
 *
 * Copyright (c) 2021 TinEye. All rights reserved worldwide.
 */

/* jslint node: true */

"use strict";

var FormData = require("form-data");
const url = require("url");
const axios = require("axios");

module.exports = TinEyeApi;

function TinEyeApi(apiUrl, apiKey) {
  /*
    Class to ease communication with the TinEye API.

    Establish a connection to the API:

    var TinEye = require('tineye-api');
    var api = new TinEye('https://api.tineye.com/rest/', 'yourApiKey');

    Create your callback function to read the data and pass it in as the last parameter:

    function callback(error, data) {
      // Do something with the data...
    };

    or use promises to get the API response.

    Searching using an image URL:

    var url = 'https://tineye.com/images/meloncat.jpg';
    var params = {
      'offset': 0,
      'limit': 10,
      'sort': 'score',
      'order': 'desc'
    };
    api.searchUrl(url, params)
      .then(function(response) {
        console.log(response);
      })
      .catch(function(error) {
        console.log(error);
      });
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

    Searching using image data:

    var img = fs.readFileSync('/Users/Mypath/image.jpg');
    var params = {
      'offset': 0,
      'limit': 10,
      'sort': 'size',
      'order': 'asc'
    };
    api.searchData(img, params)
      .then(function(response) {
        console.log(response);
      })
      .catch(function(error) {
        console.log(error);
      });
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

    api.remainingSearches()
      .then(function(response) {
        console.log(response);
      })
      .catch(function(error) {
        console.log(error);
      });
    { stats: { timestamp: '1435951101.42', query_time: '0.02' },
      code: 200,
      messages: [],
      results:
       { remaining_searches: 596112,
         start_date: '2020-09-29 11:11:31 UTC',
         expire_date: '2022-09-28 11:11:31 UTC' } }

    Getting an image count:

    api.imageCount()
      .then(function(response) {
        console.log(response);
      })
      .catch(function(error) {
        console.log(error);
      });
    { stats: { timestamp: '1435951101.42', query_time: '0.01' },
      code: 200,
      messages: [],
      results: 15785696786 }
  */

  this.apiUrl = apiUrl || "https://api.tineye.com/rest/";
  this.apiKey = apiKey || null;
}

TinEyeApi.prototype.request = function (method, params, imageFile, callback) {
  /*
  Send request to API and process results.

  - `method`, API method to call.
  - `params`, dictionary of fields to send to the API call.
  - `imageFile`, tuple containing info (filename, data) about image to send.
  - `callback`, callback function.
  */

  imageFile = imageFile || null;
  params = params || {};
  var obj = null;

  let p = new Promise((resolve, reject) => {
    // If an image file was NOT provided, send a GET request, else send a POST request.

    var headers = {
      "X-API-Key": this.apiKey,
    };
    var queryParams = new url.URLSearchParams(params);
    var parsedUrl = new URL(
      `${this.apiUrl}/${method}/?${queryParams.toString()}`
    );

    if (imageFile === null) {
      // No image file, A simple GET will suffice
      axios
        .get(parsedUrl.toString(), {
          headers: headers,
        })
        .then(function (response) {
          resolve(response.data);
        })
        .catch(function (error) {
          reject(error);
        });
    } else {
      // There is an image file, compose a form and submit
      var form = new FormData();

      form.append("image_upload", imageFile[1], {
        filename: "image.jpg",
        contentType: "image/jpeg",
      });

      form.submit(
        {
          host: parsedUrl.host,
          path: `${parsedUrl.pathname}?${parsedUrl.searchParams.toString()}`,
          protocol: parsedUrl.protocol,
          headers: headers,
        },
        function (error, res) {
          var body = "";

          if (error) {
            reject(error);
          }

          res.on("data", function (chunk) {
            body += chunk;
          });

          res.on("end", function () {
            try {
              obj = JSON.parse(body);
              resolve(obj);
            } catch (error) {
              reject(error);
            }
          });

          res.on("error", function (error) {
            reject(error);
          });
        }
      );
    }
  });

  // If there if a callback supplied then call it, otherwise return the promise
  if (callback) {
    p.then(
      (data) => {
        callback(null, data);
      },
      (error) => {
        callback(error);
      }
    );
  }

  return p;
};

TinEyeApi.prototype.searchOptions = function (options) {
  /*
    Parse search options from array.

    - `options`, array of search options such as 'offset', 'limit', 'sort' and 'order'.

    Returns: search options.
  */
  options = options || {};

  if (!("offset" in options)) {
    options.offset = 0;
  }
  if (!("limit" in options)) {
    options.limit = 10;
  }
  if (!("sort" in options)) {
    options.sort = "score";
  }
  if (!("order" in options)) {
    options.order = "desc";
  }

  return options;
};

TinEyeApi.prototype.searchUrl = function (url, options, callback) {
  /*
    Perform searches on the TinEye index using an image URL.

    - `url`, the URL of the image that will be searched for, must be urlencoded.
    - `options`, array of search options such as 'offset', 'limit', 'sort' and 'order'.
    - `callback`, callback function.

    Returns: a TinEye Response object.
  */
  options = this.searchOptions(options);
  options.image_url = url;
  return this.request("search", options, null, callback);
};

TinEyeApi.prototype.searchData = function (data, options, callback) {
  /*
    Perform searches on the TinEye index using image data.

    - `data`, image data to use for searching.
    - `options`, array of search options such as 'offset', 'limit', 'sort' and 'order'.
    - `callback`, callback function.

    Returns: a TinEye Response object.
  */
  options = this.searchOptions(options);
  var imageFile = ["image.jpg", data];
  return this.request("search", options, imageFile, callback);
};

TinEyeApi.prototype.remainingSearches = function (callback) {
  /*
    Lists the number of searches you have left in your current active block.

    - `callback`, callback function.

    Returns: a dictionary with remaining searches, start time and end time of block.
  */
  var options = {};
  return this.request("remaining_searches", options, null, callback);
};

TinEyeApi.prototype.imageCount = function (callback) {
  /*
    Lists the number of indexed images on TinEye.

    - `callback`, callback function.

    Returns: TinEye image count.
  */
  var options = {};
  return this.request("image_count", options, null, callback);
};
