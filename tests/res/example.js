/*!! define CONST "HELLO WORLD" !!*/
/*!! gdefine GCONST "HELLO WORLD" !!*/
/*!! refactor lib _ L !!*/

var lib = {},
    _;
    
    _ = lib;
    
    lib.longVarName = 0;
    lib.longVarTwo = 2;
    
    
lib.test = function() {
    lib.longVarTwo = 3;
    lib.longVarThree = lib.longVarName + lib.longVarTwo;
    console.log(lib.test, _.longVarName);
};

lib.test();


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