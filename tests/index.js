/* bearded-octo-robot / tests / index.js
 * Example usage.
 * (c) 2012 David (daXXog) Volm ><> + + + <><
 * Released under Apache License, Version 2.0:
 * http://www.apache.org/licenses/LICENSE-2.0.html  
 */
 
var pp = require('../lib/bearded-octo-robot.js');
pp.robot('./tests/res/example.js', function(data) {
    console.log(data);
});