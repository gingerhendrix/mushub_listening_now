Utils.namespace("mushub" , {
   Webservice : {
    SERVER : "http://api.mushub.com",
    url : function(service, options){
      console.log("url: %o, options: %o", service, options);
      var queryString = options.map(function(o){ return o.name + "=" + o.value }).join('&'); //MochiKit.Base.queryString(options);
      return this.SERVER + "/" + service + ".js?" + queryString;
    }
  }
});

