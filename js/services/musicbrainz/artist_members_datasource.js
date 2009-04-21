
Utils.namespace("mushub.model.musicbrainz", { 
  ArtistMembersDatasource : function(artist){
    this.artist_mbid = artist.mbid;
    Utils.extend(this, new mushub.client.utils.Datasource(
                                       { service : "musicbrainz/artist_members",
                                         params : [{ name : "artist_mbid", value : artist.mbid }]
                                       }));                                      
                    
    this.makeProp("artist_relations");

    this.onUpdate = function(response){
      this.artist_relations(response.relations);
    }

  }
});

