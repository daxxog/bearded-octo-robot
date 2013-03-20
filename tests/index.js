/* bearded-octo-robot / tests / index.js
 * Example usage.
 * (c) 2012 David (daXXog) Volm ><> + + + <><
 * Released under Apache License, Version 2.0:
 * http://www.apache.org/licenses/LICENSE-2.0.html  
 */
 
var pp = require('../lib/bearded-octo-robot.js');

var ms = +new Date();

pp.define('global', '"global test"').define('super', 'man').robot('./tests/res/example.html', function(data) {
    //console.log(data);
    console.log('<!-- Finished in '+ ((+ new Date()) - ms) + 'ms -->');
})