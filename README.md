[bearded-octo-robot](https://github.com/daxxog/bearded-octo-robot)
==================

A crazy fast async JavaScript pre-processor with an even crazier name.

Install
-------
stable
```bash
npm install bor
```

edge
```bash
npm install https://github.com/daxxog/bearded-octo-robot/tarball/master
```

Usage
------
source file
```javascript
/*!! include "includeme.js" !!*/
/*!! include "includeme.js" !!*/
/*!! define CONST "HELLO !!*/

console.log(CONSThello);
```
calling
```javascript
var bor = require('bor');
bor.define('hello', ' world!"').robot('./octo.js', function(data) {
    console.log('//BEARD!!\n' + data);
});
```