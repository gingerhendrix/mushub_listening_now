/**
  * JSUtils is a lightweight javascript utilities library.
  *
  * @module utils
  */
(function(){

  /**
  * The main jsUtils utility class.
  *
  * @class Utils
  * @static
  * @global
  */

  var _savedNamespaces = {}
  if(window.Utils){ _savedNamespaces["Utils"] = window.Utils; }
  Utils = {};

  function getNamespace(nameParts){
    var root = window;
    for(var i=0; i<nameParts.length; i++){
      root = root[nameParts[i]];
    }
    return root;
  }

  /**
    * <code>namespace</code> creates a new global namespace object.
    * It takes a namespace argument which is a dot separated string containing the name of the namespace to be created eg.
    * <pre>
    *   Utils.namespace("some.name.space").
    * </pre>
    * If the named global object or any of the objects in the chain are not defined, it will create an empty object with
    * that name i.e. if no objects are defined the above code is equivalent to
    * <pre>
    *   var some = {};
    *   some.name = {};
    *   some.name.space = {};
    * </pre>
    * Any additional arguments are passed to <code>Utils.extend</code> which is called with the namespace object as the source.
    *
    * @method namespace
    * @param name {String} A dot separated namespace name eg. 'Utils.some.namespace'
    * @param extensions {Object*} An object containing attributes to be added to the namespace.
    * @return {Object} the namespace object
    */

  Utils.namespace = function(name /*, extensions */){
    var nameParts = name.split(".");
    var root = (this != Utils) ? this : window;
    var extend =  Array.prototype.slice.call(arguments, 1)

    for(var i=0; i<nameParts.length; i++){
      if(typeof(root[nameParts[i]]) == "undefined"){
        root[nameParts[i]] = {};
      }
      Utils.extend(root[nameParts[i]], {__NAMESPACE__ : name}, extend);
      root = root[nameParts[i]];
    }
    return root;
  }

  /**
   replaceNamespace is a destructive version of namespace. replaceNamespace will replace the namespace
   object (but not it's predecessors in the chain) if it is already defined. replaceNamespace also records
   the original value of the namespace object, so that it can be recovered with revertNamespace.

   @method replaceNamespace
   @param name {String} A dot separated namespace name eg. 'Utils.some.namespace'
   @param extensions {Object*} An object containing attributes to be added to the namespace.
   @return {Object} the namespace object
  */

  Utils.replaceNamespace = function(name /*, extensions */){
    Utils.namespace(name);

    var head = name.split(".").slice(0, -1);
    var tail = name.split(".").slice(-1)[0];

    var parent = getNamespace(head);
    _savedNamespaces[name] = parent[tail];
    parent[tail] = {};
    Utils.extend(parent[tail], {__NAMESPACE__ : name}, Array.prototype.slice.call(arguments, 1));

    return parent[tail];
  }
  /**
    revertNamespace allows the namespace to be renamed in case of conflict.  This method only works if the
    namespace was initially created with replaceNamespace.
    <pre>
    var NewNamespace = Utils.revertNamespace("SomeNamespace")
    </pre>

    @method revertNamespace
    @param name {String} A dot separated namespace name eg. 'Utils.some.namespace'
    @return {Object} the namespace object
  */
  Utils.revertNamespace = function(name){
    if(arguments.length==0){
      name = "Utils";
    }
    var head = name.split(".").slice(0, -1);
    var tail = name.split(".").slice(-1);
    var parent = getNamespace(head);
    var namespace = parent[tail]
    parent[tail] = _savedNamespaces[name];
    return namespace;
  }

  /**
    extend takes a source argument which is the object to be extended, and at least one extension argument.
    If the extension argument is an Object then the properties of the extension are copied to the source argument.
    If the extension argument is a Function then the the function is called and the source is extended with the
    return value of the function.  If the extension argument is an Array or there are more than one extension
    arguments, the source is extended with each of the elements in the array.

    @method extend
    @param {object} source the object to be extended
    @param {object* or Array} extensions

   */
  Utils.extend = function(obj, extension /*, extensions */){
    if(arguments.length > 2){
      for(var i=1; i<arguments.length; i++){
        Utils.extend(obj, arguments[i])
      }
      return;
    }
    if(extension.constructor == Array){
      for(var i=0; i<extension.length; i++){
        Utils.extend(obj, extension[i])
      }
      return;
    }
    if(typeof(extension) == "function"){
      Utils.extend(obj, extension.call())
    }

    for(var prop in extension){
      obj[prop] = extension[prop];
    }
    return obj;
  }

  /**
    Extendable is a mixin object which adds extend abilities to any object.
    @class Extendable
    @namespace Utils
    @for Utils
    @static
  */
  Utils.Extendable = {
    /**
      Synonym for Utils.extend(this, extensions)

      @method extend
      @param {object* | Array} extensions
    */
    extend : function(extension /*, extensions */){
      return Utils.extend(this,  Array.prototype.slice.call(arguments));
    }
  }

  /**
    Namespaceable is a mixin object which adds namespace abilities to any object.
    @class Namespaceable
    @namespace Utils
    @for Utils
    @static
  */
  Utils.Namespaceable = {
    /**
      Creates a namespace with the current object as it's root.

      <pre>
      Utils.namespace("SomeNamespace", Utils.Namespaceable)
      SomeNamespace.namespace("Utils")
      </pre>
      This will create the namespace <code>SomeNamespace.Utils</code>

      @method namespace
      @param name {String} A dot separated namespace name eg. 'Utils.some.namespace'
      @param extensions {Object*} An object containing attributes to be added to the namespace.
      @return {Object} the namespace object
      */

    namespace : function(namespace /*, extensions */){
     return  Utils.namespace.apply(this, Array.prototype.slice.call(arguments));
    }
  }

  /**
    Revertable is a mixin object which adds revertNamespace to a namespace object created with replaceNamespace.

    @class Revertable
    @namespace Utils
    @for Utils
    @static
  */
  Utils.Revertable = {
  /**
      Reverts the current namespace.

      <pre>
      Utils.replaceNamespace("SomeNamespace", Utils.Revertable)
      var NewNamespace = SomeNamespace.revertNamespace()
      </pre>
      This will rename <code>SomeNamespace</code> as <code>NewNameSpace</code> and restore the previous contents of <code>SomeNamespace</code>.

      @method revertNamespace
      @return {Object} the namespace object
    */
    revertNamespace : function(){
      return Utils.revertNamespace(this.__NAMESPACE__);
    }
  }
  /**
  * The main jsUtils signals helpers namespace.
  * Signals are a method for asynchronous notification.
  * Signals are sent to a slot which is made up of a source object
  * and a signal name.  Listeners can connect to slot to receive any
  * signals sent there.
  *
  * @class Utils.signals
  * @static
  * @global
  */
Utils.namespace("Utils.signals", (function(){

  var observers = [];

  return {

  /**
  * Send an asynchronous signal to a slot.
  *
  * @method signal
  * @param src {Object} the source of the slot
  * @param signal {String} the name of the slot
  */
    signal : function(src, signal){
      for(var i=0; i<observers.length; i++){
        var ob = observers[i];
        if(ob.source === src && ob.signal == signal){
          (function(observer){//Get a new scope
            window.setTimeout(function(){
              observer.listener.apply(observer.src);
            }, 0);
          })(ob);
        }
      }
    },

    /**
     * Connect a listener to a slot.
     *
     * @method connect
     * @param src {Object} the source of the slot
     * @param signal {String} the name of the slot
     * @param listener {Function} the function to be called when a signal is sent to this slot.
     */
    connect : function(src, signal, listener){
      var ident = { source : src, signal :  signal, listener : listener};
     observers.push(ident);
    }
   }
})() );
  /**
  * The main jsUtils http helpers namespace.
  *
  * @class Utils.http
  * @static
  * @global
  */

Utils.namespace("Utils.http");

/**
  * A low-level utility method for obtaining a new XMLHttpRequest
  * in a cross-browser manner.
  *
  * @method createXMLHttpRequst
  * @return {XMLHttpRequest} an implementation of XMLHttpRequest
*/
Utils.http.createXMLHttpRequest = function(){
  //Borrowed form Ajax Cookbook - http://ajaxcookbook.org/xmlhttprequest/
  //Might be better off a fully-fledged wrapper like Sergey Illinsky's

  if (typeof XMLHttpRequest != "undefined") {
      return new XMLHttpRequest();
  } else if (typeof ActiveXObject != "undefined") {
      return new ActiveXObject("Microsoft.XMLHTTP");
  } else {
      throw new Error("XMLHttpRequest not supported");
  }
};

/**
  * A simple method for performing an asynchonous GET request via xhr
  *
  * @method get
  * @param uri {String} the uri to retrieve
  * @param callback {Function} the function to call when the data is available, the function will be called with xhr object as its first argument.
  * @param errback {Function} the function to call an error occurs or the request.status != 200, the function will be called with xhr object as its first argument.
*/
Utils.http.get = function(uri, callback, errback){
  var req = Utils.http.createXMLHttpRequest();
  req.open('GET', uri, true);
  req.onreadystatechange = function (aEvt) {
    if (req.readyState == 4) {
      if(req.status == 200){
        // Utils.log.info("Loaded " + uri);
         if(callback && ((typeof callback) == "function")){
           callback(req);
        }
      }else{
        // Utils.log.info("Error loading " + uri);
        if(errback && ((typeof errback) == "function")){
          errback(req);
        }
      }
    }
  };
  req.send(null);
};

(function(){

  var counter = 0;
  var scriptRequests = {};

  Utils.http.scriptRequestCallback = function(scriptId){
    var scriptEl = document.getElementById(scriptId);
    scriptEl.parentNode.removeChild(scriptEl);
    window.clearTimeout(scriptRequests[scriptId].errTimer);
    return scriptRequests[scriptId].callback;
  };

  Utils.http.scriptRequestErrback = function(scriptId){
    var scriptEl = document.getElementById(scriptId);
    scriptEl.parentNode.removeChild(scriptEl);
    scriptRequests[scriptId].errback();
  };

/**
  * A simple method for performing an asynchonous jsonp GET request via the script tag.
  * This can be used for loading data cross-domain.  The data provider must support json requests.
  *
  * @method scriptRequest
  * @param uri {String} the uri to retrieve
  * @param jsonp {String} the request-parameter to use to provide the jsonp callback to the service
  * @param callback {Function} the function to call when the data is available, the function will be called with the deserialized json as its first argument.
  * @param errback {Function} the function to call when an error occurs
  * @param timeout an optional time before the scriptRequest gives up and calls the errback.
*/
  Utils.http.scriptRequest =  function(uri, jsonp, callback, errback, timeout){
    timeout = timeout || 2000;
    var scriptEl = document.createElement("script");
    var scriptId = "scriptRequest_" + "" + Date.now() + "_" + counter++;
    var fullUri = uri + "&"+jsonp+"=Utils.http.scriptRequestCallback(\"" + scriptId + "\")"; //TODO: Support urls without query string

    scriptEl.setAttribute("id", scriptId);
    scriptEl.setAttribute("type", "text/javascript");
    scriptEl.setAttribute("src", fullUri);

    var errTimer = window.setTimeout(function(){Utils.http.scriptRequestErrback(scriptId);}, timeout);

    scriptRequests[scriptId] =
      { callback : callback,
        errback : errback,
        errTimer : errTimer };

    document.getElementsByTagName("head")[0].appendChild(scriptEl);

    return scriptId;
 }

})();


Utils.namespace("Utils", {
 /**
  * A simple value-object, with functions for property accessors and mutators.
  * Mutator also fires a signal when the property changes.
  *
  * @class Utils.DataBean
  * @constructor
  * @global
  */
 DataBean : function(){
    this.properties = {};

    /**
     * Connect to a properties slot.
     *
     * @method connect
     * @param name {String} the name of the property
     * @param listener {Function} the function to call when the signal is fired.
     */
    this.connect = function(name, method){
      Utils.signals.connect(this, name, method);
    }

    /**
     * Add a property to this object.
     * After calling dataBean.makeProp('attribute'), the dataBean will have a new method dataBean.attribute(),
     * this method when called with no-args acts as an accessor, and when called with args it acts like a mutator.
     * The mutator will also fire a signal (with the name of the attribute) when the value changes.
     *
     * @method makeProp
     * @param attribute {String} the name of the attribute to create
     */
    this.makeProp = function(prop){

      this[prop] = function(val){
        if(arguments.length > 0 && val != this.properties[prop]){
          this.properties[prop] = val;
          Utils.signals.signal(this, prop, val);
        }
        return this.properties[prop];
      }

    }
  }
});


})();