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

    var tineye = require('tineye-api')

Once required, you are ready to start using it with node!

All methods are aliased to their **snakeCase** equivalent (e.g. `search_url` can
also be invoked as `searchUrl`) and if the callback argument is omitted, the
method will return a **promise** instead.

::

    var api = new tineye('https://api.tineye.com/rest/', public_key, private_key)

Searching
---------

::

    url = 'http://tineye.com/images/meloncat.jpg'
    api.search_url(url, 0, 10, 'score', 'desc', function(err, data) {
      if (err) console.error(err)
      console.log(data)
    })

    img = fs.readFileSync('/Users/Mypath')
    api.search_data(img, 0, 10, 'size', 'asc', function(err, data) {
      if (err) console.error(err)
      console.log(data)
    })

Remaining Searches
------------------

::

    api.remaining_searches(function(err, data) {
      if (err) console.error(err)
      console.log(data)
    })

Number of Indexed Images
------------------------

::

    api.image_count(function(err, data) {
      if (err) console.log(err)
      console.log(data)
    })

Release History
---------------

* 0.2.0 Promise API, error handling and snakeCase API
* 0.1.0 Initial release

