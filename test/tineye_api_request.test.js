/* test_tineye_api_request.js
 *
 * Test TinEyeApiRequest class.
 *
 * Copyright (c) 2016 TinEye. All rights reserved worldwide.
 */

/**
 * @jest-environment node
 */

var fs = require("fs");
var TinEyeApiRequest = require("../lib/tineye_api_request.js");

describe("TestTinEyeApiRequest test", () => {
  jest.setTimeout(30000);

  beforeEach(() => {
    tineye_api = new TinEyeApiRequest(
      "https://api.tineye.com/rest/",
      "LCkn,2K7osVwkX95K4Oy",
      "6mm60lsCNIB,FwOWjJqA80QZHh9BMwc-ber4u=t^"
    );
  });

  test(`searchUrl callback`, done => {
    var url = "http://tineye.com/images/meloncat.jpg";
    var options = {};
    tineye_api.searchUrl(url, options, function(err, data) {
      expect(err).toBe(null);
      expect(data.code).toBe(200);
      expect(data.results.matches.length).toBe(10);
      done();
    });
  });

  test(`searchUrl promise`, done => {
    var url = "http://tineye.com/images/meloncat.jpg";
    var options = { limit: 10 };
    tineye_api.searchUrl(url, options).then(function(data) {
      expect(data.code).toBe(200);
      expect(data.results.matches.length).toBe(10);
      done();
    });
  });

  test(`searchData callback`, done => {
    var img = fs.readFileSync("test/melon_cat.jpg");
    var options = { limit: 10 };
    tineye_api.searchData(img, options, function(err, data) {
      expect(data.code).toBe(200);
      expect(data.results.matches.length).toBe(10);
      done();
    });
  });

  test(`searchData promise`, done => {
    var img = fs.readFileSync("test/melon_cat.jpg");
    var options = { limit: 10 };
    tineye_api.searchData(img, options).then(function(data) {
      expect(data.code).toBe(200);
      expect(data.results.matches.length).toBe(10);
      done();
    });
  });

  test(`remainingSearches callback`, done => {
    tineye_api.remainingSearches(function(err, data) {
      expect(data.code).toBe(200);
      expect(data.results.bundles[0].remaining_searches).toBe(5000);
      expect(data.results.total_remaining_searches).toBe(5000);
      done();
    });
  });

  test(`remainingSearches promise`, done => {
    tineye_api.remainingSearches().then(function(data) {
      expect(data.code).toBe(200);
      expect(data.results.bundles[0].remaining_searches).toBe(5000);
      expect(data.results.total_remaining_searches).toBe(5000);
      done();
    });
  });

  test(`imageCount callback`, done => {
    tineye_api.imageCount(function(err, data) {
      expect(data.code).toBe(200);
      expect(data.results).toBeGreaterThan(30000000000);
      done();
    });
  });

  test(`imageCount promise`, done => {
    tineye_api.imageCount().then(function(data) {
      expect(data.code).toBe(200);
      expect(data.results).toBeGreaterThan(30000000000);
      done();
    });
  });
});
