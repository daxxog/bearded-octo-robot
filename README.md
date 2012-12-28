[bearded-octo-robot](https://github.com/daxxog/bearded-octo-robot)
==================

A fast async JavaScript pre-processor.

Install
-------
```bash
npm install https://github.com/daxxog/bearded-octo-robot/tarball/master
```

Usage
------
```javascript
var pp = require('bearded-octo-robot');
pp.robot('./octo.js', function(data) {
    console.log('BEARD!!\n' + data);
});
```