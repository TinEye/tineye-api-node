/*
 * test_api_request.js
 *
 * Test TinEyeAPIRequest class.
 *
 * Copyright (c) 2012 Idee Inc. All rights reserved worldwide.
 *
 */

var fs = require('fs')
  , http = require('http')
  , buster = require('buster')
  , API_Request = require('../lib/api-request.js')
  , TinEyeAPIRequest = require('../lib/tineye-api-request.js')

var assert = buster.assert
var refute = buster.refute

buster.testCase("TestTinEyeAPIRequest", {

  "test_calls": {
  /* Test API_Response object. */

    "Search_URL_tests:": {
      setUp: function() {
        this.timeout = 1000
        this.api = new TinEyeAPIRequest("http://api.tineye.com/rest/", "LCkn,2K7osVwkX95K4Oy", "6mm60lsCNIB,FwOWjJqA80QZHh9BMwc-ber4u=t^")
      },
      "Search_url_A:": function (done) {
        this.api.search_url('http://www.tineye.com/images/meloncat.jpg', null, null, null, null, done(function (err, data) {
            assert.equals(data['code'], 200)
            assert.equals(data['results']['matches'].length, 10)
        }))
      }
    },

    "Search_Data_tests:": {
      setUp: function() {
        this.timeout = 10000
        this.api = new TinEyeAPIRequest("http://api.tineye.com/rest/", "LCkn,2K7osVwkX95K4Oy", "6mm60lsCNIB,FwOWjJqA80QZHh9BMwc-ber4u=t^")
      },
      "Search_data_A:": function (done) {
        var img = fs.readFileSync('./melon_cat.jpg')
        this.api.search_data(img, 10, null, null, null, done(function (err, data) {
            assert.equals(data['results']['matches'].length, 10)
            assert.equals(data['code'], 200)
        }))
      }
    },

    "Remaining_Searches_tests:": {
      setUp: function() {
        this.timeout = 1000
        this.api = new TinEyeAPIRequest("http://api.tineye.com/rest/", "LCkn,2K7osVwkX95K4Oy", "6mm60lsCNIB,FwOWjJqA80QZHh9BMwc-ber4u=t^")
      },
      "Remaining_Searches:": function (done) {
        this.api.remaining_searches(done(function (err, data) {
            assert.equals(data['code'], 200)
            assert.equals(data['results']['remaining_searches'], 5000)
        }))
      }
    },

    "Image_Count_tests:": {
      setUp: function() {
        this.timeout = 1000
        this.api = new TinEyeAPIRequest("http://api.tineye.com/rest/", "LCkn,2K7osVwkX95K4Oy", "6mm60lsCNIB,FwOWjJqA80QZHh9BMwc-ber4u=t^")
      },
      "Image_Count:": function (done) {
        this.api.image_count(done(function (err, data) {
            assert.equals(data['code'], 200)
        }))
      }
    },

    "Image_Count_Promise_tests:": {
      setUp: function() {
        this.timeout = 1000
        this.api = new TinEyeAPIRequest("http://api.tineye.com/rest/", "LCkn,2K7osVwkX95K4Oy", "6mm60lsCNIB,FwOWjJqA80QZHh9BMwc-ber4u=t^")
      },
      "Image_Count:": function (done) {
        this.api.image_count().then(function (data) {
          assert.equals(data['code'], 200)
          done()
        })
      }
    },

    "Image_Count_CamelCase_tests:": {
      setUp: function() {
        this.timeout = 1000
        this.api = new TinEyeAPIRequest("http://api.tineye.com/rest/", "LCkn,2K7osVwkX95K4Oy", "6mm60lsCNIB,FwOWjJqA80QZHh9BMwc-ber4u=t^")
      },
      "ImageCount:": function (done) {
        this.api.imageCount().then(function (data) {
          assert.equals(data['code'], 200)
          done()
        })
      }
    }
  }
});

//61 tests.