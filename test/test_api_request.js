/*
 * test_api_request.js
 *
 * Test TinEyeAPIRequest class.
 * 
 * Copyright (c) 2012 Idee Inc. All rights reserved worldwide.
 *
 */

var buster      = require('buster');
var API_Request = require('../lib/api-request.js');

var assert = buster.assert;

buster.testCase("TestAPI_Request", {


  "testgenerate_nonce": {
  /* Test API_Request.generate_nonce(). */

  	"Generate_Nonce_Test_01": {
      setUp: function () {
        this.request = new API_Request('http://api.tineye.com/', 'public_key', 'private_key')
      },
   	  "Generate_Nonce_Test_01a: Return 'RangeError'": function () { 
	      assert.exception(function() {
          this.request.generate_nonce(-1) 
        }, 'RangeError')
	    },
      "Generate_Nonce_Test_01b: Return a 24 length nonce": function () { 
        assert.equals(((this.request.generate_nonce(0)).length), 24)
      },
      "Generate_Nonce_Test_01c: Return 'RangeError'": function () { 
        assert.exception(function() {
          this.request.generate_nonce(23);
        }, 'RangeError');
      },
      "Generate_Nonce_Test_01d: Return 'RangeError'": function () { 
        assert.exception(function() {
          this.request.generate_nonce(256)
        }, 'RangeError')
      },
      "Generate_Nonce_Test_01e: Return a 24 length nonce": function () { 
        assert.equals(((this.request.generate_nonce(24)).length), 24)
      },
      "Generate_Nonce_Test_01f: Return a 255 length nonce": function () { 
        assert.equals(((this.request.generate_nonce(255)).length), 255)
      },
      "Generate_Nonce_Test_01g: Return a 36 length nonce": function () { 
        assert.equals(((this.request.generate_nonce(36)).length), 36)
      },
      "Generate_Nonce_Test_01h: Return 'RangeError'": function () { 
        assert.exception(function() {
          this.request.generate_nonce(256)
        }, 'RangeError');
      },
      "Generate_Nonce_Test_01i: Return 'RangeError'": function () { 
        assert.exception(function() {
          this.request.generate_nonce("character")
        }, 'RangeError')
      }
	  },

    "Generate_Nonce_Test_02":{
      "Generate_Nonce_Test_02: Return 'false'": function () { 
        this.nonce           = new API_Request().generate_nonce(36)
        this.allowable_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRTSUVWXYZ0123456789-_=.,*^"
          assert.isFalse(this.nonce.indexOf('this.allowable_chars') === 1)
        }
      }    
    },


  "test_hmac_signature": {
  /*    

    Test APIRequest.generate_get_hmac_signature(),
    TestAPIRequest.generate_post_hmac_signature(), and
    TestAPIRequest.generate_hmac_signature().

  */

    "Generate_hmac_signature":{
      setUp: function () {
        this.request = new API_Request('http://api.tineye.com/', 'public_key', 'private_key')
      },
      "Generate_hmac_signature_a: Return 'true'": function () { 
        var signature = this.request.generate_hmac_signature('')
        assert.equals(signature, '9e53b30cd6c6eb31c276ade9a29dcf5da7fd0f62')  
      },
      "Generate_hmac_signature_b: Return 'true'": function () { 
        var signature = this.request.generate_hmac_signature(' ')
        assert.equals(signature, 'e84c818e22c0db649537f4015ee13efd34044366')
      },
      "Generate_hmac_signature_c: Return 'true'": function () { 
        var signature = this.request.generate_hmac_signature('this is a message to convert')
        assert.equals(signature, 'b373bc3be782f86d64421f0f3b1b394e9217f61d')
      },
      "Generate_hmac_signature_d: Return 'true'": function () { 
        var signature = this.request.generate_hmac_signature('this is another message to convert')
        assert.equals(signature, 'fe0bdcae1763be1dd154c9141e03a956c25a068a')
      }
    },

    "Generate_GET_hmac_signature":{
      setUp: function () {
        this.nonce   = 'a_nonce'
        this.date    = 1347910390
        this.request = new API_Request('http://api.tineye.com/', 'public_key', 'private_key')
      },
      "Generate_GET_hmac_signature_A: Return 'true'": function () { 
        var signature = this.request.generate_get_hmac_signature( 'image_count'
                                                                 , this.nonce
                                                                 , this.date
                                                                 )
        assert.equals(signature, '75acee6ab58785fa04448df232e6f171cd4db819')
      },
      "Generate_GET_hmac_signature_B: Return 'true'": function () { 
        var signature = this.request.generate_get_hmac_signature( 'remaining_searches'
                                                                 , this.nonce
                                                                 , this.date
                                                                 , request_params = {'param_1' : 'value'}
                                                                 )
        assert.equals(signature, '7e6f8ff5c24d10e03d0c962f3d4a7e6df1ade352')
      }
    },


    "Generate_POST_hmac_signature":{
      setUp: function () {
        this.nonce    = 'a_nonce'
        this.date     = 1347910390
        this.boundary = "--boundary!"
        this.request  = new API_Request('http://api.tineye.com/', 'public_key', 'private_key')
      },
      "Generate_POST_hmac_signature_A: Return 'true'": function () { 
        var signature = this.request.generate_post_hmac_signature( 'search'
                                                                  , this.boundary
                                                                  , this.nonce
                                                                  , this.date
                                                                  , filename = 'file'
                                                                  )
        assert.equals(signature, 'caeae30f197efeca6766e546168bc942597dd7a5')
      },
      "Generate_POST_hmac_signature_B: Return 'true'": function () { 
        var signature = this.request.generate_post_hmac_signature( 'search'
                                                                  , this.boundary
                                                                  , this.nonce
                                                                  , this.date
                                                                  , filename='file'
                                                                  , request_params = { 'param_1' : 'value' }
                                                                  )
        assert.equals(signature, '0c5f2091631d4ad76207565b0cf9e9daf8e68465') 
      }
    },
  },

  "testsort_params": {
  /* Test APIRequest.sort_params().  */

    "Sort_Params":{
      setUp: function () {
        this.request = new API_Request('http://api.tineye.com/', 'public_key', 'private_key')
      },
      "Sort_params_A:": function() {
        var request_params = {}
        var sorted_params  = this.request.sort_params(request_params)
        assert.equals(sorted_params, '')
      },
      "Sort_params_B": function() {
        var request_params = {'a_param': 'value_1'}
        var sorted_params  = this.request.sort_params(request_params)
        assert.equals(sorted_params, 'a_param=value_1')
      },
      "Sort_params_C": function() {
        var request_params = { 'a_param' : 'value_1'
                             , 'b_param' : 'value_2'
                             }
        var sorted_params  = this.request.sort_params(request_params)
        assert.equals(sorted_params, 'a_param=value_1&b_param=value_2')
      },
      "Sort_params_D": function() {
        var request_params = { 'param_1' : 'value_1'
                             , 'a_param' : 'value_2'
                             , 'b_param' : 'value_3'
                             }
        var sorted_params  = this.request.sort_params(request_params)
        assert.equals(sorted_params, 'a_param=value_2&b_param=value_3&param_1=value_1')
      },
      "Sort_params_E": function() {
        var request_params = { 'api_key' : 'a_key'
                             , 'param_1' : 'value_1'
                             , 'a_param' : 'value_2'
                             , 'b_param' : 'value_3'
                             }
        var sorted_params  = this.request.sort_params(request_params)
        assert.equals(sorted_params, 'a_param=value_2&b_param=value_3&param_1=value_1')
      },
      "Sort_params_F": function() {
        var request_params = { 'api_key' : 'a_key'
                             , 'param_1' : 'value_1'
                             , 'api_sig' : 'a_sig'
                             , 'a_param' : 'value_2'
                             }
        var sorted_params  = this.request.sort_params(request_params)
        assert.equals(sorted_params, 'a_param=value_2&param_1=value_1')
      },
      "Sort_params_G": function() {
        var request_params = { 'api_key' : 'a_key'
                             , 'date'    : 'date'
                             , 'api_sig' : 'a_sig'
                             , 'nonce'   : 'nonce'
                             }
        var sorted_params  = this.request.sort_params(request_params)
        assert.equals(sorted_params, '')
      },
      "Sort_params_H": function() {
        var request_params = { 'image_url' : 'valu$_1' }
        var sorted_params  = this.request.sort_params(request_params)
        assert.equals(sorted_params, 'image_url=valu%24_1')
      },
      "Sort_params_I": function() {
        var request_params = { 'image_url' : 'CAPS!??!?!' }
        var sorted_params  = this.request.sort_params(request_params)
        assert.equals(sorted_params, 'image_url=caps%21%3f%3f%21%3f%21')
      },
      "Sort_params_J": function() {
        var request_params = { 'image_url' : 'CAPS%21%3f%3f%21%3f%21' }
        var sorted_params  = this.request.sort_params(request_params)
        assert.equals(sorted_params, 'image_url=caps%21%3f%3f%21%3f%21')
      },
      "Sort_params_K": function() {
        var request_params = { 'Image_Url' : 'CAPS%21%3f%3f%21%3f%21' }
        var sorted_params  = this.request.sort_params(request_params)
        assert.equals(sorted_params, 'Image_Url=caps%21%3f%3f%21%3f%21')
      }
    }
  },

  "testrequest_url": {   
  /* Test APIRequest.request_url(). */

    "Sort_Params":{
      setUp: function () {
        this.request = new API_Request('http://api.tineye.com/', 'public_key', 'private_key')
        this.nonce   = 'a_nonce'
        this.date    = 1345821763
      },
      "Request_URL_A: Return ": function() {
        url = this.request.request_url('search', this.nonce, this.date, 'api_sig', { 'a_param': 'value_1' } );
        assert.equals(url, 'http://api.tineye.com/search/?api_key=public_key&date=1345821763&nonce=a_nonce&api_sig=api_sig&a_param=value_1')
      },
      "Request_URL_B: Return ": function() {
        url = this.request.request_url('search', this.nonce, this.date, 'api_sig', { 'param_1' : 'value_1'
                                                                                    , 'a_param' : 'value_2'
                                                                                    , 'b_param' : 'value_3'
                                                                                    }
                                        )
        assert.equals(url, 'http://api.tineye.com/search/?api_key=public_key&date=1345821763&nonce=a_nonce&api_sig=api_sig&a_param=value_2&b_param=value_3&param_1=value_1');
      },
      "Request_URL_C: Return ": function() {
        url = this.request.request_url('search', this.nonce, this.date, 'api_sig', { 'image_url' : 'CAPS?!!?' } ) 
        assert.equals(url, 'http://api.tineye.com/search/?api_key=public_key&date=1345821763&nonce=a_nonce&api_sig=api_sig&image_url=caps%3f%21%21%3f')
      }
    }
  }
});

//32 tests.