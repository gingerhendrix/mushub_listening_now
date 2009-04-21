
Utils.namespace("mushub.model.musicbrainz", { 
  ArtistUrlsDatasource : function(artist){
    this.artist_mbid = artist.mbid;
    Utils.extend(this, new mushub.client.utils.Datasource(
                                       { service : "musicbrainz/artist_urls",
                                         params : [{name : "artist_mbid", value : artist.mbid}]
                                       }));                                      
                    
    this.makeProp("artist_urls");

    this.onUpdate = function(response){
      this.artist_urls(response.urls);
    }

  }
});
  
