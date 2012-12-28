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
        S = require('string');
    
    S('').__proto__.before = function(str) {
        return S(this.s.substr(0, this.s.indexOf(str)));
    };
    
    S('').__proto__.after = function(str) {
        return S(this.s.substr(this.s.indexOf(str) + str.length, this.s.length));
    };
    
    var pp = {};
    
    pp = function(data) {
        this.data = data;
    };
    
    pp.robot = function(src, cb) {
        var _new = new pp(fs.readFileSync(src, 'utf8'));
        _new.cd(path.dirname(src));
        _new.parse(cb);
    };
    
    pp.prototype._cd = '.';
    pp.prototype.cd = function(dir) {
        if(typeof dir == 'string') {
            this._cd = dir;
        }
        
        return this._cd;
    };
    
    pp.prototype.parseMap = [];
    pp.prototype.parseMapFu = {};
    pp.prototype.parseConst = [];
    pp.prototype.parseLeft = '/*!! ';
    pp.prototype.parseRight = ' !!*/';
    pp.prototype.parsedLeft = '/*!- ';
    pp.prototype.parsedRight = ' -!*/';
    pp.prototype.newData = '';
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
            cb(that.replace());
        });
    };
    
    pp.prototype.replace = function() {
        var that = this;
        
        this.parseConst.forEach(function(v, i, a) {
            that.newData = S(that.newData).replaceAll(v.key, v.value);
        });
        
        this.parseMap.forEach(function(v, i, a) {
            that.newData = S(that.newData).replace(that.parsedLeft + (i+1) + that.parsedRight, v);
        });
        
        return that.newData.toString();
    };
    
    pp.prototype.parseLine = function(line, cb) {
        var ind = this.parseMap.push('');
        var that = this;
        
        setTimeout(function() {
            if(S(line).startsWith('define ')) {
                var what = '';
                var val = '';
                
                line.split(' ').forEach(function(v, i, a) {
                    if(i === 1) {
                        what = v;
                    } else if (i === 2) {
                        val = v;
                    } else if(i >= 3) {
                        val += v;
                    }
                });
                
                that.parseConst.push({
                    key: what,
                    value: val,
                });
                
                cb(ind);
            } else if(S(line).startsWith('include ')) {
                line.split('"').forEach(function(v, i, a) {
                    if(i === 1) {
                        pp.robot(path.resolve(that.cd(), v), function(data) {
                            that.parseMap[ind - 1] = data;
                            cb(ind);
                        });
                    }
                });
            }
        }, 1);
        
        return ind;
    };
    
    return pp;
}));