
new TestSuite("Datasource Tests", {

  testConstructor : function(t){
    var ds = new mushub.client.utils.Datasource();
    t.assert(ds.isLoading === false, "isLoading should be false " + ds.isLoading);
    t.assert(ds.isLoaded === false, "isLoaded should be false " + ds.isLoaded);
    t.assert(ds.isError === false, "isError should be false " + ds.isError);
  },
  
  testUpdate : function(t){
    jack(function(){
      var ds = new mushub.client.utils.Datasource();
      
      jack.expect("mushub.Webservice.url").once().mock(function(){ return "URL";  }).returnValue("URL");
      jack.expect("Utils.signals.signal").whereArgument(1).is("beginUpdate").mock(function(){});;
      jack.expect("Utils.http.scriptRequest").mock(function(){});;

      ds.update();
    
      t.assert(ds.isLoading === true, "isLoading should be true " + ds.isLoading);
      t.assert(ds.isLoaded === false, "isLoaded should be false " + ds.isLoaded);
      t.assert(ds.isError === false, "isError should be false " + ds.isError);
    
    });
  },
  
  testFunctional : function(t){
     var ds = new mushub.client.utils.Datasource({
      service : "echo/echo",
      params : [{name : "message", value : "wooo"}]
     });
     var continuation = t.continueWithTimeout(function(){
      t.assert(ds.isLoaded === true, "isLoaded should be false " + ds.isLoaded);
      t.assert(ds.isLoaded === true, "isLoaded should be true " + ds.isLoaded);
      t.assert(ds.isError === false, "isError should be false " + ds.isError);

      t.assert(ds.data , "ds.data should be defined " + ds.data);
      t.assert(ds.data.message , "ds.datamessage should be 'wooo' " + ds.data.message);
     }, 2500);
     ds.connect("endUpdate", continuation);
     ds.update();
  }

});
