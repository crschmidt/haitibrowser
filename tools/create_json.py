import sys
import doctest
import os
import simplejson
def url_to_feat(url):
    """
        >>> feat = url_to_feat("http://geocache.opensgi.net/1571_5F00_183434N0721651W_5F00_14JAN10_5F00_UAV_2D00_G_5F00_225.jpg")
        >>> feat['lat']
        18.576111111111111
        >>> feat['lon']
        -72.280833333333334
   """     
    file = url.split("/")[-1]
    parts = file.split("_")
    loc = parts[0]
    d, m, s = loc[0:2], loc[2:4], loc[4:6]

    lat = float(d)+(float(m)/60)+float(s)/3600
    d, m, s = loc[7:10], loc[10:12], loc[12:14]
    lon = -float(d)-(float(m)/60)-float(s)/3600
    
    feat = {'lat': lat, 'lon': lon, 'url': url}
    return feat

def feat_to_geojson(feat):
    return {'type':'Feature', 'geometry': {
        'type': 'Point',
        'coordinates': [feat['lon'], feat['lat']]
    }, 'properties': {'url': feat['url']}
    }

def iter(dir):
    files = os.listdir(dir)
    fc = {'type':'FeatureCollection',
          'features': []
         } 
    for file in files:
        if not file.endswith(".jpg"): continue
        if file.startswith("s"): continue 
        fc['features'].append(feat_to_geojson(url_to_feat(file)))
    
    print simplejson.dumps(fc)

if (len(sys.argv) > 1 and sys.argv[1] == "-t"):
    doctest.testmod()

iter(".")
