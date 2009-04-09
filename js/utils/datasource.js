Utils.namespace("Utils", {
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
    Utils.extend(this, new Utils.DataBean());
    
    this.isLoading = false;
    this.isLoaded = false;
     
    function makeParams(self, params){
      var paramObj = {}
      params.forEach(function(param){
        if(typeof param == "string"){
          paramObj[param] = self[param];
        }else{
          paramObj[param.name] = self[param.prop];
        }
      });
      return paramObj;
    }
    
    this.update = function(){
      console.log("Datasource.update : %o ", this);
      if(this.isLoading){
        return;
      }
      Utils.signals.signal(this, "beginUpdate");
      this.isLoading = true;
      try{
        params = makeParams(this, config.params);
      }catch(e){
        return;
      }
      var url = Utils.Webservice.url(config.service, params);
      var d = sendJSONPRequest(url, "jsonp");
      var self = this;
      d.addCallback(function(response){
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
      });
      d.addErrback(function(response){
        self.isError = true;
        self.isLoading = false;
        Utils.signals.signal(self, "onError", response);
        //self.onUpdate(response);
        console.error("Datasource[anon errback] : %o : %o", self, response);
      });
      return d;
    }

  }
});
