;(function (window, undefined) {

  // Detect free variables "exports" and "global", and create 
  // "functional" namespace
  var freeExports = typeof exports == 'object' && exports
    , freeGlobal = typeof global == 'object' && global
    , _ = Function._ = {}
    , _initialFunctionPrototypeState
    , functional = {}
    , oldFunctional = {};

  // Add slice() method to JavaScript's built-in Array object, if it
  // doesn't already exist.
  if (!Array.slice) { 
    Array.slice = (function (slice) {
      return function (object) {
        return slice.apply(object, slice.call(arguments, 1));
      };
    })(Array.prototype.slice);
  }

  // Add autoCurry() to the Function prototype. The autoCurry() 
  // method is a Function decorator that returns a duplicate of 
  // the function, but which can now be partially applied.
  // curry/autoCurry is from wu.js <http://fitzgen.github.com/wu.js/>
  (function() {
    var toArray = function(x) {
      return Array.prototype.slice.call(x);
    }
    
    var curry = function (fn /* variadic number of args */) {
           var args = Array.prototype.slice.call(arguments, 1);
           var f = function () {
               return fn.apply(this, args.concat(toArray(arguments)));
           };
           return f;
       };

    var autoCurry = function (fn, numArgs) {
           numArgs = numArgs || fn.length;
           var f = function () {
               if (arguments.length < numArgs) {
                   return numArgs - arguments.length > 0 ?
                       autoCurry(curry.apply(this, [fn].concat(toArray(arguments))),
                                    numArgs - arguments.length) :
                       curry.apply(this, [fn].concat(toArray(arguments)));
               }
               else {
                   return fn.apply(this, arguments);
               }
           };
           f.toString = function(){ return fn.toString(); };
           f.curried = true;
           return f;
       };
       
       Function.prototype.autoCurry = function(n) {
         return autoCurry(this, n);
       }
  })();

  function map(fn, sequence) {
    var length = sequence.length
      , result = new Array(length)
      , i;
    fn = Function.toFunction(fn);
    for (i=0; i<length; i++) {
      result[i] = fn.apply(null, [sequence[i], i]);
    }
    return result;
  }
  map = map.autoCurry();

  function compose() {
    var fns = map(Function.toFunction, arguments)
      , arglen = fns.length;
    return function () {
      for (var i = arglen; --i>=0;) {
        arguments = [fns[i].apply(this, arguments)];
      }
      return arguments[0];
    };
  }

  function sequence() {
    var fns = map(Function.toFunction, arguments)
      , arglen = fns.length;
    return function () {
      for(var i = 0; i < arglen; i++) {
        arguments = [fns[i].apply(this, arguments)];
      }
      return arguments[0];
    }
  }

  // setTimeout works for titanium env, which i'm typically in.
  // Switch with different strategies if needed.
  function compose_p() {
    var fns = map(Function.toFunction, arguments)
      , arglen = fns.length;
    return function (x) {
      var i;
      for (i = arglen; --i >= 0;) {
        setTimeout(fns[i].p(x), 100);
      }
      return arguments[0];
    }
  }

  function memoize(fn) {  
    return function () {  
        var args = Array.prototype.slice.call(arguments),  
            hash = "",  
            i = args.length;  
        currentArg = null;  
        while (i--) {  
            currentArg = args[i];  
            hash += (currentArg === Object(currentArg)) ?  
            JSON.stringify(currentArg) : currentArg;  
            fn.memoize || (fn.memoize = {});  
        }  
        return (hash in fn.memoize) ? fn.memoize[hash] :  
        fn.memoize[hash] = fn.apply(this, args);  
    };  
  }

  reduce=function(fn,init,sequence){fn=Function.toFunction(fn);var len=sequence.length,result=init;for(var i=0;i<len;i++)
  result=fn.apply(null,[result,sequence[i]]);return result;}.autoCurry();
  select=function(fn,sequence){fn=Function.toFunction(fn);var len=sequence.length,result=[];for(var i=0;i<len;i++){var x=sequence[i];fn.apply(null,[x,i])&&result.push(x);}
  return result;}.autoCurry();
  guard=function(guard,otherwise,fn){fn=Function.toFunction(fn);guard=Function.toFunction(guard||I);otherwise=Function.toFunction(otherwise||I);return function(){return(guard.apply(this,arguments)?fn:otherwise).apply(this,arguments);}}
  flip = function(f){return f.flip(); }
  filter=select;
  foldl=reduce;
  foldr=function(fn,init,sequence){fn=Function.toFunction(fn);var len=sequence.length,result=init;for(var i=len;--i>=0;)
  result=fn.apply(null,[sequence[i],result]);return result;}
  annd=function(){var args=map(Function.toFunction,arguments),arglen=args.length;return function(){var value=true;for(var i=0;i<arglen;i++)
  if(!(value=args[i].apply(this,arguments)))
  break;return value;}}
  or=function(){var args=map(Function.toFunction,arguments),arglen=args.length;return function(){var value=false;for(var i=0;i<arglen;i++)
  if((value=args[i].apply(this,arguments)))
  break;return value;}}
  some=function(fn,sequence){fn=Function.toFunction(fn);var len=sequence.length,value=false;for(var i=0;i<len;i++)
  if((value=fn.call(null,sequence[i])))
  break;return value;}.autoCurry();
  every=function(fn,sequence){fn=Function.toFunction(fn);var len=sequence.length,value=true;for(var i=0;i<len;i++)
  if(!(value=fn.call(null,sequence[i])))
  break;return value;}.autoCurry();
  not=function(fn){fn=Function.toFunction(fn);return function(){return!fn.apply(null,arguments);}}
  equal=function(){var arglen=arguments.length,args=map(Function.toFunction,arguments);if(!arglen)return K(true);return function(){var value=args[0].apply(this,arguments);for(var i=1;i<arglen;i++)
  if(value!=args[i].apply(this,args))
  return false;return true;}}
  lambda=function(object){return object.toFunction();}
  invoke=function(methodName){var args=Array.slice(arguments,1);return function(object){return object[methodName].apply(object,Array.slice(arguments,1).concat(args));}}
  pluck=function(name){return function(object){return object[name];}}
  until=function(pred,fn){fn=Function.toFunction(fn);pred=Function.toFunction(pred);return function(value){while(!pred.call(null,value))
  value=fn.call(null,value);return value;}}.autoCurry();
  zip=function(){var n=Math.min.apply(null,map('.length',arguments));var results=new Array(n);for(var i=0;i<n;i++){var key=String(i);results[key]=map(pluck(key),arguments);};return results;}


  // Higher order methods 
  // Begin tracking changes to the Function.Prototype
  _initialFunctionPrototypeState = _startRecordingMethodChanges(Function.prototype);
  
  Function.prototype.bind = function (object) {
    var fn = this
      , slice = Array.slice
      , args = slice(arguments, 1);
    return function () {
      return fn.apply(object, args.concat(slice(arguments, 0)));
    };
  }

  Function.prototype.saturate = function () {
    var fn = this
      , args = Array.slice(arguments, 0);
    return function () { return fn.apply(this, args); };
  }

  Function.prototype.aritize = function (n) {
    var fn = this;
    return function () {
      return fn.apply(this, Array.slice(arguments, 0, n));
    };
  }

  Function.prototype.curry = function () {
    var fn = this
      , slice = Array.slice
      , args = slice(arguments, 0);
    return function () {
      return fn.apply(this, args.concat(slice(arguments, 0)));
    };
  }

  Function.prototype.rcurry = function () {
    var fn = this
      , slice = Array.slice
      , args = slice(arguments, 0);
    return function () {
      return fn.apply(this, slice(arguments, 0).concat(args));
    };
  }

  Function.prototype.ncurry = function (n) {
    var fn = this
      , slice = Array.slice
      , largs = slice(arguments, 1);
    return function () {
      var args = largs.concat(slice(arguments, 0));
      if (args.length<n) {
        args.unshift(n);
        return fn.ncurry.apply(fn, args);
      }
      return fn.apply(this, args);
    };
  }

  Function.prototype.rncurry = function (n) {
    var fn = this
      , slice = Array.slice
      , rargs = slice(arguments, 1);
    return function () {
      var args = slice(arguments, 0).concat(rargs);
      if (args.length < n) {
        args.unshift(n);
        return fn.rncurry.apply(fn, args);
      }
      return fn.apply(this, args);
    };
  }

  Function.prototype.partial = function () {
    var fn = this
      , _ = Function._
      , slice = Array.slice
      , args = slice(arguments,0)
      , subpos=[]
      , value
      , i;
    for(i = 0;i < arguments.length; i++) {
      arguments[i] == _ && subpos.push(i);
    }
    return function () {
      var specialized = args.concat(slice(arguments, subpos.length));
      for (var i = 0; i < Math.min(subpos.length, arguments.length); i++) {
        specialized[subpos[i]] = arguments[i];
      }
      for (var i = 0; i < specialized.length; i++) {
        if (specialized[i] === _) {
          return fn.partial.apply(fn, specialized);
        }
      } 
      return fn.apply(this,specialized);
    };
  }
  
  // Alias Function.prototype.partial, for ease of use
  Function.prototype.p = Function.prototype.partial;

  // Combinators
  function I(x) { return x }

  function K(x) { return function () { return x } }
  
  function S(f, g) {
    var toFunction = Function.toFunction;
    f = toFunction(f);
    g = toFunction(g);
    return function () { 
      return f.apply(this, [g.apply(this, arguments)].concat(Array.slice(arguments,0)));
    };
  }
  
  // Combinator Methods
  Function.prototype.flip = function () {
    var fn = this;
    return function () {
      var args = Array.slice(arguments, 0);
      args = args.slice(1, 2).concat(args.slice(0, 1)).concat(args.slice(2));
      return fn.apply(this,args);
    };
  }
  
  Function.prototype.uncurry = function () {
    var fn = this;
    return function () {
      var slice = Array.slice
        , f1 = fn.apply(this, slice(arguments, 0, 1));
      return f1.apply(this, slice(arguments, 1));
    };
  }
  
  // Combinator Filtering Methods
  Function.prototype.prefilterObject = function (filter) {
    var fn = this;
    filter = Function.toFunction(filter);
    return function () {
      return fn.apply(filter(this), arguments);
    };
  }
  
  Function.prototype.prefilterAt = function (index, filter) {
    var fn = this;
    filter = Function.toFunction(filter);
    return function () {
      var args = Array.slice(arguments, 0);
      args[index] = filter.call(this, args[index]);
      return fn.apply(this, args);
    };
  }
  
  Function.prototype.prefilterSlice = function (filter, start, end) {
    var fn = this;
    filter = Function.toFunction(filter);
    start = start || 0;
    return function () {
      var args = Array.slice(arguments, 0)
        , e = end < 0 ? args.length + end : end || args.length;
      args.splice.apply(args, [start, (e || args.length) - start].concat(filter.apply(this, args.slice(start, e))));
      return fn.apply(this,args);
    };
  }

  // Composition Methods
  Function.prototype.compose = function(fn) {
    var self = this
      , fn = Function.toFunction(fn);
    return function () {
      return self.apply(this, [fn.apply(this, arguments)]);
    };
  }
  
  Function.prototype.sequence = function (fn) {
    var self = this;
    fn = Function.toFunction(fn);
    return function () {
      return fn.apply(this, [self.apply(this, arguments)]);
    };
  }
  
  Function.prototype.guard = function (guard, otherwise) {
    var fn = this
      , toFunction = Function.toFunction;
    guard = toFunction(guard || I);
    otherwise = toFunction(otherwise || I);
    return function () {
      return(guard.apply(this, arguments) ? fn : otherwise).apply(this, arguments);
    };
  }
  
  // Utility Methods
  Function.prototype.traced = function (name) {
    var self = this;
    name = name || self;
    return function () {
      window.console && console.info('[', name, 'apply(', this != window && this, ',', arguments, ')' );
      var result = self.apply(this, arguments);
      window.console && console.info(']', name, ' -> ', result);
      return result;
    };
  }
  
  // In case to-function.js isn't loaded.
  Function.toFunction = Function.toFunction || K;
  
  Function.prototype.toFunction = function () { return this; }
  
  Function.toFunction = function (value) { return value.toFunction();}
  
  
  String.prototype.lambda = function () {
    var params=[]
      , expr = this
      , sections = expr.ECMAsplit(/\s*->\s*/m);if(sections.length>1){while(sections.length){expr=sections.pop();params=sections.pop().split(/\s*,\s*|\s+/m);sections.length&&sections.push('(function('+params+'){return ('+expr+')})');}}else if(expr.match(/\b_\b/)){params='_';}else{var leftSection=expr.match(/^\s*(?:[+*\/%&|\^\.=<>]|!=)/m),rightSection=expr.match(/[+\-*\/%&|\^\.=<>!]\s*$/m);if(leftSection||rightSection){if(leftSection){params.push('$1');expr='$1'+expr;}
  if(rightSection){params.push('$2');expr=expr+'$2';}}else{var vars=this.replace(/(?:\b[A-Z]|\.[a-zA-Z_$])[a-zA-Z_$\d]*|[a-zA-Z_$][a-zA-Z_$\d]*\s*:|this|arguments|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g,'').match(/([a-z_$][a-z_$\d]*)/gi)||[];for(var i=0,v;v=vars[i++];)
  params.indexOf(v)>=0||params.push(v);}}
  return new Function(params,'return ('+expr+')');
  }

  String.prototype.lambda.cache = function () {
    var proto = String.prototype
      , cache = {}
      , uncached = proto.lambda
      , cached;
    cached = function () {
      var key = '#' + this;
      return cache[key] || (cache[key] = uncached.call(this));
    };
    cached.cached = function () {};
    cached.uncache = function () { proto.lambda = uncached };
    proto.lambda = cached;
  }
  
  String.prototype.apply = function (thisArg, args) {
    return this.toFunction().apply(thisArg, args);
  }
  
  String.prototype.call = function () {
    return this.toFunction().apply(arguments[0], Array.prototype.slice.call(arguments,1));
  }
  
  String.prototype.toFunction = function () {
    var body = this;
    if (body.match(/\breturn\b/)) {
      return new Function(this);
    }
    return this.lambda();
  }
  
  String.prototype.ECMAsplit = ('ab'.split(/a*/).length>1?String.prototype.split:function(separator,limit){if(typeof limit!='undefined')
  throw"ECMAsplit: limit is unimplemented";var result=this.split.apply(this,arguments),re=RegExp(separator),savedIndex=re.lastIndex,match=re.exec(this);if(match&&match.index==0)
  result.unshift('');re.lastIndex=savedIndex;return result;});

  function _startRecordingMethodChanges(object) {
    var initialMethods = {}, name;
    for (name in object) {
      initialMethods[name] = object[name];
    }
    function getChangedMethods() {
      var changedMethods = {};
      for (var name in object) {
        if (object[name] != initialMethods[name]) {
          changedMethods[name] = object[name];
        }
      }
      return changedMethods;
    }
    return { getChangedMethods: getChangedMethods }
  }

  function _attachMethodDelegates(methods) {
    var name;
    for (name in methods) {
      functional[name] = functional[name] || (function (name) {
        var fn = methods[name];
        return function (object) { 
          return fn.apply(Function.toFunction(object), Array.slice(arguments,1));
        }
      })(name);
    }
  }

  // _attachMethodDelegates(_initialFunctionPrototypeState.getChangedMethods());
  // delete _initialFunctionPrototypeState;

  // Add functions to the "functional" namespace
  functional.map = map;
  functional.compose = compose;
  functional.sequence = sequence;
  functional.compose_p = compose_p;
  functional.memoize = memoize;
  
  // Add alias to "functional" namespace
  functional.id = I;
  functional.constfn = K;

  // Detect free variable "global" and use it as "window"
  if (freeGlobal.global === freeGlobal) {
    window = freeGlobal;
  }

  // Used to restore the original reference in "noConflict()"
  oldFunctional = window.functional;

  // Reverts the "functional" variable to its previous value and 
  // returns a reference to the "functional" function.
  // example:
  //   var functional = functional.noConflict();
  functional.noConflict = function noConflict() {
    window.functional = oldFunctional;
    return this;
  }

  // Expose all functions to the global namespace, or specified environment
  functional.expose = function expose(env) {
    var fn;
    env = env || window;
    for (fn in functional) {
      if (fn !== 'expose' && functional.hasOwnProperty(fn)) {
        env[fn] = functional[fn];
      }
    }
  };

  // Expose FunctionalJS library
  // Some AMD build optimizers, like r.js, check for specific condition
  // patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose FunctionalJs to the global object even when an AMD loader
    // is present, in case FunctionalJS was injected by a third-party
    // script and not intended to be loaded as module. The global
    // assignment can be reverted in the FunctionalJS module via its
    // "noConflict()" method.
    window.functional = functional;

    // Define an anonymous AMD module
    define(function () { return functional; });
  }

  // Check for "exports" after "define", in case a build optimizer adds
  // an "exports" object.
  else if (freeExports) {
    // Node.js or RingoJS v0.8.0+
    if (typeof module == 'object' && module && module.exports == freeExports) {
      module.exports = functional;
    }
    // Narwhal or RingoJS v0.7.0-
    else {
      freeExports.functional = functional;
    }
  }

}(this));
