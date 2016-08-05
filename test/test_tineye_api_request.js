/* test_tineye_api_request.js
 *
 * Test TinEyeApiRequest class.
 *
 * Copyright (c) 2016 TinEye. All rights reserved worldwide.
 */

var buster = require('buster');
var fs = require('fs');
var http = require('http');
var TinEyeApiRequest = require('../lib/tineye_api_request.js');

var assert = buster.assert;
var refute = buster.refute;

buster.testCase("TestTinEyeApiRequest", {

  "test methods": {
    /* Test APIResponse object. */

    "searchUrl callback": {
      setUp: function() {
        this.timeout = 10000;
        this.api = new TinEyeApiRequest("https://api.tineye.com/rest/",
          "LCkn,2K7osVwkX95K4Oy", "6mm60lsCNIB,FwOWjJqA80QZHh9BMwc-ber4u=t^");
      },
      "searchUrl:": function(done) {
        var url = 'http://tineye.com/images/meloncat.jpg';
        var options = {};
        this.api.searchUrl(url, options, function(err, data) {
          assert.equals(data.code, 200);
          assert.equals(data.results.matches.length, 10);
          done();
        });
      }
    },

    "searchUrl promise:": {
      setUp: function() {
        this.timeout = 10000;
        this.api = new TinEyeApiRequest("https://api.tineye.com/rest/",
          "LCkn,2K7osVwkX95K4Oy", "6mm60lsCNIB,FwOWjJqA80QZHh9BMwc-ber4u=t^");
      },
      "searchUrl": function(done) {
        var url = 'http://tineye.com/images/meloncat.jpg';
        var options = {'limit': 10};
        this.api.searchUrl(url, options).then(function(data) {
          assert.equals(data.code, 200);
          assert.equals(data.results.matches.length, 10);
          done();
        });
      }
    },

    "searchData callback": {
      setUp: function() {
        this.timeout = 10000;
        this.api = new TinEyeApiRequest("https://api.tineye.com/rest/",
          "LCkn,2K7osVwkX95K4Oy", "6mm60lsCNIB,FwOWjJqA80QZHh9BMwc-ber4u=t^");
      },
      "searchData:": function(done) {
        var img = fs.readFileSync('./melon_cat.jpg');
        var options = {'limit': 10};
        this.api.searchData(img, options, function(err, data) {
          assert.equals(data.code, 200);
          assert.equals(data.results.matches.length, 10);
          done();
        });
      }
    },

    "searchData promise:": {
      setUp: function() {
        this.timeout = 10000;
        this.api = new TinEyeApiRequest("https://api.tineye.com/rest/",
          "LCkn,2K7osVwkX95K4Oy", "6mm60lsCNIB,FwOWjJqA80QZHh9BMwc-ber4u=t^");
      },
      "searchData": function(done) {
        var img = fs.readFileSync('./melon_cat.jpg');
        var options = {'limit': 10};
        this.api.searchData(img, options).then(function(data) {
          assert.equals(data.code, 200);
          assert.equals(data.results.matches.length, 10);
          done();
        });
      }
    },

    "remainingSearches callback": {
      setUp: function() {
        this.timeout = 10000;
        this.api = new TinEyeApiRequest("https://api.tineye.com/rest/",
          "LCkn,2K7osVwkX95K4Oy", "6mm60lsCNIB,FwOWjJqA80QZHh9BMwc-ber4u=t^");
      },
      "remainingSearches:": function(done) {
        this.api.remainingSearches(function(err, data) {
          assert.equals(data.code, 200);
          assert.equals(data.results.remaining_searches, 5000);
          done();
        });
      }
    },

    "remainingSearches promise:": {
      setUp: function() {
        this.timeout = 10000;
        this.api = new TinEyeApiRequest("https://api.tineye.com/rest/",
          "LCkn,2K7osVwkX95K4Oy", "6mm60lsCNIB,FwOWjJqA80QZHh9BMwc-ber4u=t^");
      },
      "remainingSearches": function(done) {
        this.api.remainingSearches().then(function(data) {
          assert.equals(data.code, 200);
          assert.equals(data.results.remaining_searches, 5000);
          done();
        });
      }
    },

    "imageCount callback:": {
      setUp: function() {
        this.timeout = 10000;
        this.api = new TinEyeApiRequest("https://api.tineye.com/rest/",
          "LCkn,2K7osVwkX95K4Oy", "6mm60lsCNIB,FwOWjJqA80QZHh9BMwc-ber4u=t^");
      },
      "imageCount:": function(done) {
        this.api.imageCount(function (err, data) {
          assert.equals(data.code, 200);
          done();
        });
      }
    },

    "imageCount promise:": {
      setUp: function() {
        this.timeout = 10000;
        this.api = new TinEyeApiRequest("https://api.tineye.com/rest/",
          "LCkn,2K7osVwkX95K4Oy", "6mm60lsCNIB,FwOWjJqA80QZHh9BMwc-ber4u=t^");
      },
      "imageCount:": function(done) {
        this.api.imageCount().then(function(data) {
          assert.equals(data.code, 200);
          done();
        });
      }
    }
  }
});
