function ollonlat2dms(lonlat) {
    var lat = Math.abs(lonlat.lat);
    var lon = Math.abs(lonlat.lon);

    // Convert to Degree Minutes Seconds Representation      
    var LatDeg = Math.floor(lat);
    var LatMin = Math.floor((lat-LatDeg)*60);
    var LatSec =  (Math.round((((lat - LatDeg) - (LatMin/60)) * 60 * 60) * 100) / 100 ) ;
    var LonDeg = Math.floor(lon);      
    var LonMin = Math.floor((lon-LonDeg)*60);
    var LonSec = (Math.round((((lon - LonDeg) - (LonMin / 60 )) * 60 * 60) * 100 ) / 100);
    return [LatDeg+"°"+ " " +LatMin +"' "+ LatSec+ '&quot; ' + (lonlat.lat > 0 ? "N " : "S "),  
        LonDeg+"°"+ " " +LonMin +"' "+ LonSec+ '&quot; '+(lonlat.lon > 0 ? "E " : "W ") ]; 

}
