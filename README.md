[bearded-octo-robot](https://github.com/daxxog/bearded-octo-robot)
==================

A crazy fast async JavaScript pre-processor with an even crazier name.

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