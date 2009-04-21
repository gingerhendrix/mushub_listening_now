
Utils.namespace("mushub.model.audioscrobbler", { 
  SimilarArtistsDatasource : function(artist){
    this.artist = artist.name;
    Utils.extend(this, new mushub.client.utils.Datasource(
                                       { service : "audioscrobbler/similar_artists",
                                         params : [{name: "artist", value : artist.name}]
                                       }));   

    this.makeProp("similar_artists");
    

    this.onUpdate = function(response){
      this.similar_artists(response.similar_artists);
    }

  }
});

