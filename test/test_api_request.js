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
      "Return 'true'": function() { 
        var signature = this.request.generateHmacSignature('');
        assert.equals(signature, '9e53b30cd6c6eb31c276ade9a29dcf5da7fd0f62');
      },
      "Return 'true'": function() { 
        var signature = this.request.generateHmacSignature(' ');
        assert.equals(signature, 'e84c818e22c0db649537f4015ee13efd34044366');
      },
      "Return 'true'": function() { 
        var signature = this.request.generateHmacSignature('this is a message to convert');
        assert.equals(signature, 'b373bc3be782f86d64421f0f3b1b394e9217f61d');
      },
      "Return 'true'": function() { 
        var signature = this.request.generateHmacSignature('this is another message to convert');
        assert.equals(signature, 'fe0bdcae1763be1dd154c9141e03a956c25a068a');
      }
    },

    "Test generateGetHmacSignature": {
      setUp: function() {
        this.nonce   = 'a_nonce';
        this.date    = 1347910390;
        this.request = new ApiRequest('https://api.tineye.com/', 'public_key', 'private_key');
      },
      "Return 'true'": function() { 
        var signature = this.request.generateGetHmacSignature('image_count', this.nonce, this.date);
        assert.equals(signature, 'c521bfadb124829e85174b7a247e16617238e987');
      },
      "Return 'true'": function() { 
        var signature = this.request.generateGetHmacSignature(
          'remaining_searches', this.nonce, this.date, requestParams = {'param_1' : 'value'});
        assert.equals(signature, '0d3b1bd53e75df15181bb6022fb642a008dc672b');
      }
    },

    "Test generatePostHmacSignature": {
      setUp: function() {
        this.nonce    = 'a_nonce';
        this.date     = 1347910390;
        this.boundary = "--boundary!";
        this.request  = new ApiRequest('https://api.tineye.com/', 'public_key', 'private_key');
      },
      "Return 'true'": function() { 
        var signature = this.request.generatePostHmacSignature(
          'search', this.boundary, this.nonce, this.date, filename = 'file');
        assert.equals(signature, 'b4555c92442f7567561ac869403dcf1b58f30cf9');
      },
      "Return 'true'": function() { 
        var signature = this.request.generatePostHmacSignature(
          'search', this.boundary, this.nonce, this.date,
          filename='file', requestParams = { 'param_1' : 'value' });
        assert.equals(signature, '4fdc93cae93064a515ee88453a500587bac1b7a5') ;
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
