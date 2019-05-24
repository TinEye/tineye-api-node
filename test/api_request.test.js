/* test_api.js
 *
 * Test ApiRequest class.
 *
 * Copyright (c) 2019 TinEye. All rights reserved worldwide.
 */

var ApiRequest = require("../lib/api_request.js");

describe("GenerateNonce test 01", () => {
  beforeEach(() => {
    tineye_client = new ApiRequest(
      "https://api.tineye.com/",
      "public_key",
      "private_key"
    );
  });

  // To test the exceptions with jest you have to wrap the tested function in an annon function
  // ie. place '() =>' before the function you wish to test
  test(`Range Error Exception for negatives`, function() {
    expect(() => tineye_client.generateNonce(-1)).toThrowError(RangeError);
  });
  test(`RangeError Exception for less than 24`, function() {
    expect(() => tineye_client.generateNonce(23)).toThrowError(RangeError);
  });
  test(`RangeError Exception for greater than 255`, function() {
    expect(() => tineye_client.generateNonce(256)).toThrowError(RangeError);
  });
  test(`Range Error for non numbers`, function() {
    expect(() => tineye_client.generateNonce("characters")).toThrowError(
      RangeError
    );
  });
  test(`Return a 24 length nonce`, function() {
    expect(tineye_client.generateNonce(24).length).toBe(24);
  });
  test(`Return a 255 length nonce`, function() {
    expect(tineye_client.generateNonce(255).length).toBe(255);
  });
  test(`Return a 36 length nonce`, function() {
    expect(tineye_client.generateNonce(36).length).toBe(36);
  });
});

describe("GenerateNonce test 02", () => {
  test(`Range Error Exception for negatives`, function() {
    nonce = new ApiRequest().generateNonce(36);
    allowableChars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRTSUVWXYZ0123456789-_=.,*^";
    expect(nonce.indexOf("this.allowableChars") === 1).toBeFalsy();
  });
});

describe("Test HMAC signature functions", () => {
  beforeEach(() => {
    nonce = "a_nonce";
    date = 1347910390;
    boundary = "--boundary!";
    tineye_client = new ApiRequest(
      "https://api.tineye.com/",
      "public_key",
      "private_key"
    );
  });

  test(`Test generateHmacSignature`, function() {
    expect(tineye_client.generateHmacSignature("")).toBe(
      "82d5208ddf2b2096c17f879c739a5f440e87155f3308b9cf44a91d9104b10b8c"
    );
    expect(tineye_client.generateHmacSignature(" ")).toBe(
      "1737ed554d845cb8428f75572bfed17e95f7fc06264f82f4c2b0cb7d7a9a2650"
    );
    expect(
      tineye_client.generateHmacSignature("this is a message to convert")
    ).toBe("1a7ca3031f3834b857c933b4349cd988aeb19792e88c504aa58234079593b5be");
    expect(
      tineye_client.generateHmacSignature("this is another message to convert")
    ).toBe("c8535a6742e948498cc819f1e677967de30d7dda98ca40f6be5640d8df1e5da1");
  });

  test(`Test generateGetHmacSignature`, function() {
    expect(
      tineye_client.generateGetHmacSignature("image_count", nonce, date)
    ).toBe("778bdd63a5474573807bf1b12f75525334c0ea2fe1adace77861c82eb3580522");
    expect(
      tineye_client.generateGetHmacSignature(
        "remaining_searches",
        nonce,
        date,
        (requestParams = { param_1: "value" })
      )
    ).toBe("5ab173a4c5237f4819722420000c2febaa18179eb58009899139fec9e32c2246");
  });

  test(`Test generatePostHmacSignature`, function() {
    expect(
      tineye_client.generatePostHmacSignature(
        "search",
        boundary,
        nonce,
        date,
        (filename = "file")
      )
    ).toBe("52428961afca202860f721918ce026dfbff1afc323e9e85297f5ee486de715a0");

    expect(
      tineye_client.generatePostHmacSignature(
        "search",
        boundary,
        nonce,
        date,
        (filename = "file"),
        (requestParams = { param_1: "value" })
      )
    ).toBe("3cb685ac24d3976af220d07627f431b698653aa042ea984377053a1a8da0691e");
  });
});

describe("Test sortParams function", () => {
  beforeEach(() => {
    tineye_client = new ApiRequest(
      "https://api.tineye.com/",
      "public_key",
      "private_key"
    );
  });

  test(`No params`, function() {
    var requestParams = {};
    expect(tineye_client.sortParams(requestParams)).toBe("");
  });

  test(`One Param`, function() {
    var requestParams = { a_param: "value_1" };
    expect(tineye_client.sortParams(requestParams)).toBe("a_param=value_1");
  });

  test(`Two Params`, function() {
    var requestParams = { a_param: "value_1", b_param: "value_2" };
    expect(tineye_client.sortParams(requestParams)).toBe(
      "a_param=value_1&b_param=value_2"
    );
  });

  test(`Three Params`, function() {
    var requestParams = {
      param_1: "value_1",
      a_param: "value_2",
      b_param: "value_3"
    };
    expect(tineye_client.sortParams(requestParams)).toBe(
      "a_param=value_2&b_param=value_3&param_1=value_1"
    );
  });

  test(`Three Params exclude api_key`, function() {
    var requestParams = {
      api_key: "a_key",
      param_1: "value_1",
      a_param: "value_2",
      b_param: "value_3"
    };
    expect(tineye_client.sortParams(requestParams)).toBe(
      "a_param=value_2&b_param=value_3&param_1=value_1"
    );
  });

  test(`Two Params exclude api_key and api_sig`, function() {
    var requestParams = {
      api_key: "a_key",
      param_1: "value_1",
      api_sig: "a_sig",
      a_param: "value_2"
    };
    expect(tineye_client.sortParams(requestParams)).toBe(
      "a_param=value_2&param_1=value_1"
    );
  });

  test(`No Params exclude api_key and api_sig, date and nonce`, function() {
    var requestParams = {
      api_key: "a_key",
      date: "date",
      api_sig: "a_sig",
      nonce: "nonce"
    };
    expect(tineye_client.sortParams(requestParams)).toBe("");
  });

  test(`Encode image_url`, function() {
    var requestParams = { image_url: "valu$_1" };
    expect(tineye_client.sortParams(requestParams)).toBe("image_url=valu%24_1");
  });

  test(`lowercase and encode image_url`, function() {
    var requestParams = { image_url: "CAPS!??!?!" };
    expect(tineye_client.sortParams(requestParams)).toBe(
      "image_url=caps%21%3f%3f%21%3f%21"
    );
  });

  test(`Encode already encoded image_url`, function() {
    var requestParams = { image_url: "CAPS%21%3f%3f%21%3f%21" };
    expect(tineye_client.sortParams(requestParams)).toBe(
      "image_url=caps%21%3f%3f%21%3f%21"
    );
  });

  test(`Maintain Case in param`, function() {
    var requestParams = { Image_Url: "CAPS%21%3f%3f%21%3f%21" };
    expect(tineye_client.sortParams(requestParams)).toBe(
      "Image_Url=caps%21%3f%3f%21%3f%21"
    );
  });
});

describe("Test requestUrl function", () => {
  beforeEach(() => {
    this.request = new ApiRequest(
      "https://api.tineye.com/",
      "public_key",
      "private_key"
    );
    nonce = "a_nonce";
    date = 1345821763;
  });

  test(`One parameter`, function() {
    var requestParams = { a_param: "value_1" };
    expect(
      tineye_client.requestUrl("search", nonce, date, "api_sig", requestParams)
    ).toBe(
      "https://api.tineye.com/search/?api_key=public_key&date=1345821763&nonce=a_nonce&api_sig=api_sig&a_param=value_1"
    );
  });

  test(`Multi parameter`, function() {
    var requestParams = {
      param_1: "value_1",
      a_param: "value_2",
      b_param: "value_3"
    };
    expect(
      tineye_client.requestUrl("search", nonce, date, "api_sig", requestParams)
    ).toBe(
      "https://api.tineye.com/search/?api_key=public_key&date=1345821763&nonce=a_nonce&api_sig=api_sig&a_param=value_2&b_param=value_3&param_1=value_1"
    );
  });

  test(`With Image_url`, function() {
    var requestParams = { image_url: "CAPS?!!?" };
    expect(
      tineye_client.requestUrl("search", nonce, date, "api_sig", requestParams)
    ).toBe(
      "https://api.tineye.com/search/?api_key=public_key&date=1345821763&nonce=a_nonce&api_sig=api_sig&image_url=CAPS%3F%21%21%3F"
    );
  });
});
