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

/*!! if CONST "HELLO !!*/
console.log(CONSThello);
/*!! endif CONST "HELLO !!*/
```
calling
```javascript
var bor = require('bor');
bor.define('hello', ' world!"').robot('./octo.js', function(data) {
    console.log('//BEARD!!\n' + data);
});
```

Or in HTML
```
<script type="text/javascript">
<!--!! include "inline.js" !!-->
</script>
<!--!! include "include.html" !!-->
```

Features
* Global defines
* Basic if/endif macro that comments out text
* Auto comment style detection
* Inline includes
    * Caches includes for faster processing
* Not just for JavaScript, works in HTML, XML, css, C, etc. Submit a pull request to support more languages :)
* Everything is processed in parallel using [async](https://github.com/caolan/async)
