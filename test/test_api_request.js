/* test_api.js
 *
 * Test ApiRequest class.
 * 
 * Copyright (c) 2016 TinEye. All rights reserved worldwide.
 */

var ApiRequest = require('../lib/api_request.js');
var buster = require('buster');

var assert = buster.assert;

buster.testCase("TestApiRequest", {

  "Test generateNonce": {
    /* Test ApiRequest.generateNonce(). */

    "generateNonce test 01": {
      setUp: function() {
        this.request = new ApiRequest('https://api.tineye.com/', 'public_key', 'private_key');
      },
      "Return 'RangeError'": function() { 
        assert.exception(function() {
          this.request.generateNonce(-1);
        }, 'RangeError');
      },
      "Return a 24 length nonce": function() { 
        assert.equals(((this.request.generateNonce(0)).length), 24);
      },
      "Return 'RangeError'": function() { 
        assert.exception(function() {
          this.request.generateNonce(23);
        }, 'RangeError');
      },
      "Return 'RangeError'": function() { 
        assert.exception(function() {
          this.request.generateNonce(256);
        }, 'RangeError');
      },
      "Return a 24 length nonce": function() { 
        assert.equals(((this.request.generateNonce(24)).length), 24);
      },
      "Return a 255 length nonce": function() { 
        assert.equals(((this.request.generateNonce(255)).length), 255);
      },
      "Return a 36 length nonce": function() { 
        assert.equals(((this.request.generateNonce(36)).length), 36);
      },
      "Return 'RangeError'": function() { 
        assert.exception(function() {
          this.request.generateNonce(256);
        }, 'RangeError');
      },
      "Return 'RangeError'": function() { 
        assert.exception(function() {
          this.request.generateNonce("character");
        }, 'RangeError');
      }
    },

    "generateNonce test 02":{
      "Return 'false'": function() { 
        this.nonce           = new ApiRequest().generateNonce(36);
        this.allowableChars  = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRTSUVWXYZ0123456789-_=.,*^";
          assert.isFalse(this.nonce.indexOf('this.allowableChars') === 1);
        }
      }    
    },


  "Test HMAC signature functions": {
    /*
      Test APIRequest.generateGetHmacSignature(),
      Test APIRequest.generatePostHmacSignature(), and
      Test APIRequest.generateHmacSignature().
    */

    "Test generateHmacSignature":{
      setUp: function() {
        this.request = new ApiRequest('https://api.tineye.com/', 'public_key', 'private_key');
      },
      "1 - Return 'true'": function() { 
        var signature = this.request.generateHmacSignature('');
        assert.equals(signature, '82d5208ddf2b2096c17f879c739a5f440e87155f3308b9cf44a91d9104b10b8c');
      },
      "2 - Return 'true'": function() { 
        var signature = this.request.generateHmacSignature(' ');
        assert.equals(signature, '1737ed554d845cb8428f75572bfed17e95f7fc06264f82f4c2b0cb7d7a9a2650');
      },
      "3 - Return 'true'": function() { 
        var signature = this.request.generateHmacSignature('this is a message to convert');
        assert.equals(signature, '1a7ca3031f3834b857c933b4349cd988aeb19792e88c504aa58234079593b5be');
      },
      "4 - Return 'true'": function() { 
        var signature = this.request.generateHmacSignature('this is another message to convert');
        assert.equals(signature, 'c8535a6742e948498cc819f1e677967de30d7dda98ca40f6be5640d8df1e5da1');
      }
    },

    "Test generateGetHmacSignature": {
      setUp: function() {
        this.nonce   = 'a_nonce';
        this.date    = 1347910390;
        this.request = new ApiRequest('https://api.tineye.com/', 'public_key', 'private_key');
      },
      "1 - Return 'true'": function() { 
        var signature = this.request.generateGetHmacSignature('image_count', this.nonce, this.date);
        assert.equals(signature, '778bdd63a5474573807bf1b12f75525334c0ea2fe1adace77861c82eb3580522');
      },
      "2 - Return 'true'": function() { 
        var signature = this.request.generateGetHmacSignature(
          'remaining_searches', this.nonce, this.date, requestParams = {'param_1' : 'value'});
        assert.equals(signature, '5ab173a4c5237f4819722420000c2febaa18179eb58009899139fec9e32c2246');
      }
    },

    "Test generatePostHmacSignature": {
      setUp: function() {
        this.nonce    = 'a_nonce';
        this.date     = 1347910390;
        this.boundary = "--boundary!";
        this.request  = new ApiRequest('https://api.tineye.com/', 'public_key', 'private_key');
      },
      "1 - Return 'true'": function() { 
        var signature = this.request.generatePostHmacSignature(
          'search', this.boundary, this.nonce, this.date, filename = 'file');
        assert.equals(signature, '52428961afca202860f721918ce026dfbff1afc323e9e85297f5ee486de715a0');
      },
      "2 - Return 'true'": function() { 
        var signature = this.request.generatePostHmacSignature(
          'search', this.boundary, this.nonce, this.date,
          filename='file', requestParams = { 'param_1' : 'value' });
        assert.equals(signature, '3cb685ac24d3976af220d07627f431b698653aa042ea984377053a1a8da0691e') ;
      }
    },
  },

  "Test sortParams": {
    /* Test APIRequest.sortParams().  */

    "sortParams":{
      setUp: function() {
        this.request = new ApiRequest('https://api.tineye.com/', 'public_key', 'private_key');
      },
      "a:": function() {
        var requestParams = {};
        var sortedParams  = this.request.sortParams(requestParams);
        assert.equals(sortedParams, '');
      },
      "b": function() {
        var requestParams = {'a_param': 'value_1'};
        var sortedParams  = this.request.sortParams(requestParams);
        assert.equals(sortedParams, 'a_param=value_1');
      },
      "c": function() {
        var requestParams = {'a_param': 'value_1', 'b_param': 'value_2'};
        var sortedParams  = this.request.sortParams(requestParams);
        assert.equals(sortedParams, 'a_param=value_1&b_param=value_2');
      },
      "d": function() {
        var requestParams = {'param_1': 'value_1', 'a_param': 'value_2', 'b_param': 'value_3'};
        var sortedParams  = this.request.sortParams(requestParams);
        assert.equals(sortedParams, 'a_param=value_2&b_param=value_3&param_1=value_1');
      },
      "e": function() {
        var requestParams = {'api_key' : 'a_key', 'param_1' : 'value_1',
          'a_param' : 'value_2', 'b_param' : 'value_3'};
        var sortedParams  = this.request.sortParams(requestParams);
        assert.equals(sortedParams, 'a_param=value_2&b_param=value_3&param_1=value_1');
      },
      "f": function() {
        var requestParams = {'api_key': 'a_key', 'param_1': 'value_1',
          'api_sig': 'a_sig', 'a_param' : 'value_2'};
        var sortedParams  = this.request.sortParams(requestParams);
        assert.equals(sortedParams, 'a_param=value_2&param_1=value_1');
      },
      "g": function() {
        var requestParams = {'api_key': 'a_key', 'date': 'date',
          'api_sig': 'a_sig', 'nonce': 'nonce'};
        var sortedParams  = this.request.sortParams(requestParams);
        assert.equals(sortedParams, '');
      },
      "h": function() {
        var requestParams = { 'image_url' : 'valu$_1' };
        var sortedParams  = this.request.sortParams(requestParams);
        assert.equals(sortedParams, 'image_url=valu%24_1');
      },
      "i": function() {
        var requestParams = { 'image_url' : 'CAPS!??!?!' };
        var sortedParams  = this.request.sortParams(requestParams);
        assert.equals(sortedParams, 'image_url=caps%21%3f%3f%21%3f%21');
      },
      "j": function() {
        var requestParams = { 'image_url' : 'CAPS%21%3f%3f%21%3f%21' };
        var sortedParams  = this.request.sortParams(requestParams);
        assert.equals(sortedParams, 'image_url=caps%21%3f%3f%21%3f%21');
      },
      "k": function() {
        var requestParams = { 'Image_Url' : 'CAPS%21%3f%3f%21%3f%21' };
        var sortedParams  = this.request.sortParams(requestParams);
        assert.equals(sortedParams, 'Image_Url=caps%21%3f%3f%21%3f%21');
      }
    }
  },

  "Test requestUrl": {   
    /* Test ApiRequest.requestUrl(). */

    "requestUrl":{
      setUp: function() {
        this.request = new ApiRequest('https://api.tineye.com/', 'public_key', 'private_key');
        this.nonce   = 'a_nonce';
        this.date    = 1345821763;
      },
      "One parameter": function() {
        url = this.request.requestUrl('search', this.nonce, this.date,
          'api_sig', {'a_param': 'value_1'});
        assert.equals(url,
          'https://api.tineye.com/search/?api_key=public_key&date=1345821763&nonce=a_nonce&api_sig=api_sig&a_param=value_1');
      },
      "Multiple parameter": function() {
        url = this.request.requestUrl('search', this.nonce, this.date, 'api_sig',
          {'param_1' : 'value_1', 'a_param' : 'value_2', 'b_param' : 'value_3'});
        assert.equals(url,
          'https://api.tineye.com/search/?api_key=public_key&date=1345821763&nonce=a_nonce&api_sig=api_sig&a_param=value_2&b_param=value_3&param_1=value_1');
      },
      "With image_url": function() {
        url = this.request.requestUrl('search', this.nonce, this.date, 'api_sig', {'image_url' : 'CAPS?!!?'}) ;
        assert.equals(url,
          'https://api.tineye.com/search/?api_key=public_key&date=1345821763&nonce=a_nonce&api_sig=api_sig&image_url=CAPS%3F%21%21%3F');
      }
    }
  }
});
