# tineye-api

**tineye-api** is the official Node.js library for the TinEye API. The TinEye API
is TinEye's paid reverse image search search solution for professional, commercial or high-volume users.
See <https://api.tineye.com/> for more information.

# Contents
- [ Installation ](#installation)
- [ Getting started ](#getting-started)
    - [ Search using an image URL ](#search-using-an-image-url)
    - [ Search using image data ](#search-using-image-data)
    - [ Get remaining searches ](#get-remaining-searches)
    - [ Get number of indexed images ](#get-number-of-indexed-images)
- [ Release history ](#release-history)


# Installation
Install the latest version of the library using npm:

```shell
$ npm install tineye-api
```

# Getting started

After installation, `require` the library to start using it:

```
var TinEye = require('tineye-api')
```

Now that you've required the library, you can use it to create an instance of the API object.

```
var api = new TinEye('https://api.tineye.com/rest/', public_key, private_key);
```

Be sure to populate `public_key` and `private_key` with your own keys. You can test your code
with our [API sandbox keys](https://services.tineye.com/developers/tineyeapi/sandbox.html), but
you won't get real search results until you start using your real keys.

Once you have an `api` object, you can start searching. You can submit an image using either an
[image URL](#search-using-an-image-url) or by [submitting image data](#search-using-image-data)
by uploading an image file. You can also [check the number of remaining searches](#get-remaining-searches)
in your account or [check the number of images in the TinEye index](#get-number-of-indexed-images).

## Search using an image URL

```javascript
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
```

## Search using image data

```javascript
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
```

## Get remaining searches

```javascript
api.remainingSearches()
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.log(error);
  });
```

## Get number of indexed images

```javascript
api.imageCount()
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.log(error);
  });
```

# Release history

## 1.0.2

* Switched hashing algorithm from SHA1 to SHA256
* Switched README from reStructuredText to Markdown

## 1.0.1

* Cleaning up some code and comments
* Some error handling fixes

## 1.0.0

* Adding promises
* Better error handling
* Switched method names to camelCasing
* `searchUrl` and `searchData` now take an option array

## 0.1.0

* Initial release
