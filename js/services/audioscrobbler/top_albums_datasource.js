Utils.namespace("mushub.model.audioscrobbler", {
  TopAlbumsDatasource : function(artist){
    this.artist = artist.name;
    Utils.extend(this, new mushub.client.utils.Datasource(
                                       { service : "audioscrobbler/top_albums",
                                         params : [{name : "artist", value : artist.name}]
                                       }));  
 
    this.makeProp("top_albums");
   
    this.onUpdate = function(response){
      //alert("TopAlbums : " + this.artist + ".onUpdate " + response);
      this.top_albums(response.top_albums);
    }
    
    this.toString = function(){
      return "TopAlbumsDatasource[" + this.artist + "]";
    }
  }
});

