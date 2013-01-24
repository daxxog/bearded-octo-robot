/*!! define CONST "HELLO WORLD" !!*/

/*!! if CONST "HELLO WORLD" !!*/
console.log('!');
/*!! endif CONST "HELLO WORLD" !!*/

/*!! if global undefined !!*/
console.log(CONST);
console.log(global);
console.log(hello + 'world');
/*!! endif global undefined !!*/

/*!! include "includeme.js" !!*/
/*!! include "includeme.js" !!*/