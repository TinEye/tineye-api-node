tineye-api
==========

TinEye Commercial API Node.js library

Installation
------------

::

    npm install tineye-api

Using the library
-----------------

Once installed, require the library to start using it:

::

    var tineye = require('tineye-api')

Once required, you are ready to start using it with node!

.. code:: javascript

    var api = new tineye('https://api.tineye.com/rest/', public_key, private_key)

Searching
---------

::

    url = 'http://tineye.com/images/meloncat.jpg'
    api.search_url(url, 0, 10, 'score', 'desc', function(data) {
      console.log(data)
    })

    img = fs.openSync('/Users/Mypath')
    api.search_data(img, 0, 10, 'size', 'asc', function(data) {
      console.log(data)
    })

Remaining Searches
------------------

::

    api.remaining_searches(function(data) {
      console.log(data)
    })

Number of Indexed Images
------------------------

::

    api.image_count(function(data) {
      console.log(data)
    })

Release History
---------------

* 0.1.0 Initial release
