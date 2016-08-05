tineye-api
==========

TinEye Commercial API Node.js library

Installation
------------

::

    $ npm install tineye-api

Using the library
-----------------

Once installed, require the library to start using it:

::

    var TinEye = require('tineye-api')

Once required, you are ready to start using it with Node!

If the callback argument is omitted, the method will return
a **promise** instead.

::

    var api = new TinEye('https://api.tineye.com/rest/', public_key, private_key)

Searching using an image URL
----------------------------

::

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

Searching using image data
--------------------------

::

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

Remaining Searches
------------------

::

    api.remainingSearches()
      .then(function(response) {
        console.log(response);
      })
      .catch(function(error) {
        console.log(error);
      });

Number of Indexed Images
------------------------

::

    api.imageCount()
      .then(function(response) {
        console.log(response);
      })
      .catch(function(error) {
        console.log(error);
      });

Release History
---------------

1.0.0
=====

* Adding promises
* Better error handling
* Switched method names to camelCasing
* `searchUrl` and `searchData` now take an option array

0.1.0
=====

* Initial release
