/* bearded-octo-robot.js
 * A fast async JavaScript pre-processor.
 * (c) 2012 David (daXXog) Volm ><> + + + <><
 * Released under Apache License, Version 2.0:
 * http://www.apache.org/licenses/LICENSE-2.0.html  
 */

/* UMD LOADER: https://github.com/umdjs/umd/blob/master/returnExports.js */
(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {
    var fs = require('fs'),
        path = require('path'),
        async = require('async'),
        S = require('string'),
        acorn = require('acorn'),
        sf = require('switch-factory');
    
    S('').__proto__.before = function(str) {
        return S(this.s.substr(0, this.s.indexOf(str)));
    };
    
    S('').__proto__.after = function(str) {
        return S(this.s.substr(this.s.indexOf(str) + str.length, this.s.length));
    };
    
    S('').__proto__.replaceOne = function(_what, _with) {
        var what = _what.split(''),
            that = this.split(''),
            found = false,
            skip = 0,
            _new = [];
        
        that.forEach(function(v, i, a) {
            var fail = false;
            
            if(skip > 0) {
               skip--;
            } else {
                if((found === false) && (v === what[0])) {
                    skip = -1;
                    for(var k = 0; k<what.length; k++) {
                        skip++;
                        if(that[i + k] !== what[k]) {
                            fail = true;
                            break;
                        }
                    }
                    
                    if(fail === false) {
                        found = true;
                        _new.push(_with);
                    } else {
                        skip = 0;
                        _new.push(v);
                    }
                } else {
                    _new.push(v);
                }
            }
        });
        
        return S(_new.join(''));
    };
    
    var pp = {};
    
    pp = function() {
        this.data = '';
        this.parseMap = [];
        this.parseMapFu = {};
        this.parseConst = [];
        this.constMap = [];
        this.gConst = [];
        this.gConstMap = [];
        this._refactor = [];
        this.comment(pp.cStyleComment);
        this.newData = '';
        this._cd = '.';
        this._ext = '';
        this._fn = '';
    };
    
    pp.cStyleComment = [
        '/*',
        '*/'
    ];
    
    pp.xmlStyleComment = [
        '<!--',
        '-->'
    ];
    
    pp._extComments = {
        /* C STYLE */
        "js": pp.cStyleComment,
        "css": pp.cStyleComment,
        "less": pp.cStyleComment,
        "json": pp.cStyleComment,
        "c": pp.cStyleComment,
        "php": pp.cStyleComment,
        "cpp": pp.cStyleComment,
        "h": pp.cStyleComment,
        "java": pp.cStyleComment,
        
        /* XML STYLE */
        "html": pp.xmlStyleComment,
        "xml": pp.xmlStyleComment
    };
    
    pp.comment = function(c) {
        return (new pp()).comment(c);
    };
    
    pp._gConst = function(what) {
        return (new pp())._gConst(what);
    };
    
    pp.define = function(what, val) {
        return (new pp()).define(what, val);
    };
    
    pp.robot = function(src, cb) {
        return (new pp()).robot(src, cb);
    };
    
    pp.prototype.comment = function(c) {
        this._comment = c;
        
        this.parseLeft = this._comment[0] + '!! ';
        this.parseRight = ' !!' + this._comment[1];
        this.parsedLeft = this._comment[0] + '!- ';
        this.parsedRight = ' -!' + this._comment[1];
        
        return this;
    };
    
    pp.prototype._gConst = function(what) {
        this.gConst = what.gConst;
        this.gConstMap = what.gConstMap;
        
        return this;
    };
    
    pp.prototype.define = function(what, val) {
        this.gConstMap[what] = val;
        this.gConst.push({
            key: what,
            value: val
        });
        
        return this;
    };
    
    pp._robotCache = {};
    pp._robotLock = {};
    pp._robotUnlock = {};
    pp.__robotUnlock = {};
    pp.prototype.robot = function(src, _cb) {
        var _ext = path.extname(src).split('.')[1];
        this._ext = _ext;
        this._fn = src;
        
        if(typeof pp._extComments[_ext] != 'undefined') {
            this.comment(pp._extComments[_ext]);
        }
        
        if((typeof pp._robotCache[src] == 'undefined')) {
            if(pp._robotLock[src] === true) {
                pp._robotUnlock[src](function() {
                    _cb(pp._robotCache[src]);
                });
            } else {
                pp._robotLock[src] = true;
                pp.__robotUnlock[src] = [];
                pp._robotUnlock[src] = function(unlock) {
                    pp.__robotUnlock[src].push(unlock);
                };
                
                var cb = function(data) {
                    pp._robotCache[src] = data;
                    pp._robotLock[src] = false;
                    
                    async.forEach(pp.__robotUnlock[src], function(v, cb) {
                        v();
                        cb();
                    });
                    
                    _cb(data);
                };
                
                this.data = fs.readFileSync(src, 'utf8');
                this.cd(path.dirname(src));
                this.parse(cb);
            }
        } else {
            _cb(pp._robotCache[src]);
        }
        
        return this;
    };
    
    pp.prototype.cd = function(dir) {
        if(typeof dir == 'string') {
            this._cd = dir;
        }
        
        return this._cd;
    };
    
    pp.prototype.parse = function(cb) {
        var that = this;
        var functionStack = [];
        
        this.data.split(this.parseLeft).forEach(function(v, i, a) {
            if(S(v).contains(that.parseRight)) {                
                var parseFu = function(i) {
                    if(typeof that.parseMapFu[i] == 'function') {
                        that.parseMapFu[i]();
                    } else {
                        setTimeout(parseFu, 1);
                    }
                };
                
                var parseId = that.parseLine(S(v).before(that.parseRight), parseFu);
                
                var fu = function(cb) {
                    that.parseMapFu[parseId] = function() {
                        cb(null);
                    };
                };
                functionStack.push(fu);
                
                that.newData += that.parsedLeft + parseId + that.parsedRight + S(v).after(that.parseRight);
            } else {
                that.newData += v;
            }
        });
        
        async.parallel(functionStack, function(err, data) {
            that.replace(function(data) {
                that.refactor(data, function(data) {
                    cb(data);
                });
            });
        });
    };
    
    pp._factorFind = [
        'VariableDeclaration',
        'VariableDeclarator',
        'Identifier'
    ];
    
    pp.prototype.isFactorType = sf.is(pp._factorFind);
    
    pp.prototype.walkFactor = function(ast, _tree) {
        var tree = [],
            dupeTree = [],
            that = this;
        
        if(typeof _tree != 'undefined') {
            tree = _tree;
        }
        
        if(tree.toString() === pp._factorFind.toString()) {
            for(var to in that._refactorTo) {
                var fx = that._refactorTo[to];
                if(fx(ast.name)) {
                    ast.name = to;
                }
            }
            
            //console.log(ast);
            
            tree = [];
        }
        
        if(typeof ast == 'object') {
            for(var key in ast) {
                var val = ast[key];
                
                if((typeof val != 'undefined') && (val !== null) && (typeof val.type == 'string')) {
                    if(that.isFactorType(val.type)) {
                        dupeTree = JSON.parse(JSON.stringify(tree));
                        dupeTree.push(val.type);
                        ast[key] = that.walkFactor(val, dupeTree);
                    }
                } else {
                    ast[key] = that.walkFactor(val, tree);
                }
            }
        }
        
        return ast;
    };
    
    pp.prototype.refactor = function(data, cb) {
        var that = this;
        
        if(that._refactor.length > 0) {
            that._refactorTo = {};
            that._refactor.forEach(function(v, i, a) {
                if(typeof v.short == 'string') {
                    that._refactorTo[v.dest] = sf.is([v.source, v.short]);
                } else {
                    that._refactorTo[v.dest] = (function(src) {
                        return function(val) {
                            return (val === src);
                        };
                    }(v.source));
                }
            });
            
            that.walkFactor(acorn.parse(data));
        }
        
        cb(data);
    };
    
    pp.prototype.replace = function(cb) {
        var that = this;
        that.newData = S(that.newData);
        
        async.parallel([function(cb) { //massively parallel
            async.forEach(that.parseConst, function(v, cb) {
                that.newData = that.newData.replaceAll(v.key, v.value);
                cb();
            }, function() {
                cb();
            });
        }, function(cb) {
            async.forEach(that.gConst, function(v, cb) {
                that.newData = that.newData.replaceAll(v.key, v.value);
                cb();
            }, function() {
                cb();
            });
        }, function(cb) {
            that.parseMap.forEach(function(v, i, a) {
                that.newData = that.newData.replaceOne(that.parsedLeft + (i+1) + that.parsedRight, v);
            });
            
            cb();
        }], function() {
            cb(that.newData.toString());
        });
    };
    
    pp.prototype.warn = function(msg) {
        console.log('BOR: WARN: [' + this._fn + ']: ' + msg);
    };
    
    pp.prototype.parseLine = function(line, cb) {
        var ind = this.parseMap.push(''),
            that = this,
            what = '',
            val = '';
        
        setTimeout(function() {
            if(S(line).startsWith('define ')) {
                line.split(' ').forEach(function(v, i, a) {
                    if(i === 1) {
                        what = v;
                    } else if (i === 2) {
                        val = v;
                    } else if(i >= 3) {
                        val += ' ' + v;
                    }
                });
                
                that.constMap[what] = val;
                that.parseConst.push({
                    key: what,
                    value: val,
                });
                
                cb(ind);
            } else if(S(line).startsWith('gdefine ')) {
                line.split(' ').forEach(function(v, i, a) {
                    if(i === 1) {
                        what = v;
                    } else if (i === 2) {
                        val = v;
                    } else if(i >= 3) {
                        val += ' ' + v;
                    }
                });
                
                that.gConstMap[what] = val;
                that.gConst.push({
                    key: what,
                    value: val,
                });
                
                cb(ind);
            } else if(S(line).startsWith('include ')) {
                line.split('"').forEach(function(v, i, a) {
                    if(i === 1) {
                        pp._gConst(that).robot(path.resolve(that.cd(), v), function(data) {
                            that.parseMap[ind - 1] = data;
                            cb(ind);
                        });
                    }
                });
            } else if(S(line).startsWith('if ')) {
                line.split(' ').forEach(function(v, i, a) {
                    if(i === 1) {
                        what = v;
                    } else if (i === 2) {
                        val = v;
                    } else if(i >= 3) {
                        val += ' ' + v;
                    }
                });
                
                if((!((typeof that.gConstMap[what] != 'undefined') && that.gConstMap[what] === val)) && (!((typeof that.constMap[what] != 'undefined') && that.constMap[what] === val))) {
                    that.parseMap[ind - 1] = that._comment[0];
                }
                
                cb(ind);
            } else if(S(line).startsWith('endif')) {
                line.split(' ').forEach(function(v, i, a) {
                    if(i === 1) {
                        what = v;
                    } else if (i === 2) {
                        val = v;
                    } else if(i >= 3) {
                        val += ' ' + v;
                    }
                });
                
                if((!((typeof that.gConstMap[what] != 'undefined') && that.gConstMap[what] === val)) && (!((typeof that.constMap[what] != 'undefined') && that.constMap[what] === val))) {
                    that.parseMap[ind - 1] = that._comment[1];
                }
                
                cb(ind);
            } else if(S(line).startsWith('refactor')) {
                (function() {
                    var args = line.split(' ');
                    switch(args.length) {
                        case 4:
                            (function(){
                                that._refactor.push({
                                    source: args[1],
                                    short: args[2],
                                    dest: args[3]
                                });
                            }()); break;
                        case 3:
                            (function(){
                                that._refactor.push({
                                    source: args[1],
                                    dest: args[2]
                                });
                            }()); break;
                        default: 
                            that.warn('invalid number of arguments for refactor');
                    }
                }());
                cb(ind);
            } else {
                that.warn('invalid parser option: ' + line);
                cb(ind);
            }
        });
        
        return ind;
    };
    
    return pp;
}));