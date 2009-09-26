Utils.namespace("mushub.client.utils", {
  /**
   * Datasource is a wrapper around a json resource.
   * It has a single update method that should be called be client, 
   * and it generates a message "endUpdate" when the data is ready.
   * The data is stored by default in the data property but this can 
   * be overrided by implementing an onUpdate(response) method in 
   * the subclass.
   *
   */
  Datasource : function(config){
    config = config || {params : []};
    
    Utils.extend(this, new Utils.DataBean());
    
    this.isLoading = false;
    this.isLoaded = false;
    this.isError = false;
     
    function makeParams(self, ps){
      var params = [];
      ps.forEach(function(param){
        var paramObj = {}
        if(typeof param == "string"){
          paramObj.name = param;
          paramObj.value = self[param];
        }else{
          paramObj.name = param.name;
          if(param.prop){
            paramObj.value = self[param.prop];
          }else{
            paramObj.value = param.value;
          }
        }
        params.push(paramObj)
      });
      return params;
    }
    
    this.update = function(){
      console.log("Datasource.update : %o ", this);
      if(this.isLoading){
        return;
      }
      Utils.signals.signal(this, "beginUpdate");
      this.isLoading = true;
      var params = makeParams(this, config.params);
      console.log("Params : %o => %o ", config.params, params);
      var url = mushub.Webservice.url(config.service, params);
      var self = this;
      var callback = function(response){
          console.log("Datasource[anonymous callback] : %o : %o", self, response);
          if(response.status==202){
             window.setTimeout(function(){ self.isLoading = false; self.update();}, 1000);
          }else if(response.errors && response.errors.length > 0){
            self.isLoading = false;    
            self.isError = true;
            Utils.signals.signal(self, "onError", response.errors);
          }else{
            self.isLoading = false;    
            self.isError = false;
            self.isLoaded = true;
            self.onUpdate(response.data);
            Utils.signals.signal(self, "endUpdate");
          }
      };
      
      var errback = function(response){
        self.isError = true;
        self.isLoading = false;
        Utils.signals.signal(self, "onError", response);
        //self.onUpdate(response);
        console.error("Datasource[anon errback] : %o : %o", self, response);
      };
      Utils.http.scriptRequest(url, "jsonp", callback, errback);
    }
    
    this.onUpdate = function(response){
      this.data = response;
    }

  }
});
