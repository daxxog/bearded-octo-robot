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
source file
```javascript
/*!! include "includeme.js" !!*/
/*!! include "includeme.js" !!*/
/*!! define CONST "HELLO WORLD" !!*/

console.log(CONST);
```
calling
```javascript
var bor = require('bor');
bor.robot('./octo.js', function(data) {
    console.log('BEARD!!\n' + data);
});
```