function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {//Adding a basemap; can be changed later as there is a basemap already provided
    zoom: 8,
    center: { lat: 40.731, lng: -73.997 }, //Giving example coordinates 
  });
  const geocoder = new google.maps.Geocoder(); //A Google maps function that can give longitude or latitude
  const infowindow = new google.maps.InfoWindow(); // a graphical pop-up or overlay that displays additional information when a marker or some other interactive element on a map is clicked. 

  document.getElementById("enter").addEventListener("click", () => { //Calls the enter/submit button in HTML to allow user to convert the coordinates
     LatLong(geocoder, map, infowindow);
  });
}

function LatLong(geocoder, map, infowindow) { //Function allows user to type in the longitudes and latitudes 
   const input = document.getElementById("latlong").value;//calls the the HTML function for long/lat
  const latlngStr = input.split(",", 2); //Function to split a string into an array of substrings based on a specified separator
 const latlong = {
    lat: parseFloat(latlngStr[0]),
    lng: parseFloat(latlngStr[1]),
  };
    

  geocoder 
    .geocode({ location: latlong }) //Function is associated with geocoding
    .then((response) => { //Function is a method that can be called on a promise object, which are a mechanism for handling asynchronous operations. 
       if (response.results[0]) { //First option in a IF condition where user correctly enters the coordinates and the resultant location on map is shown, with a marker
        map.setZoom(11);
        const marker = new google.maps.Marker({ //Adds a marker on the resultant address
         position: latlong,
          map: map,
        });
         infowindow.setContent(response.results[0].formatted_address); //A Google Maps pop up window which displays additional information about a specfic location that user interacts with 
        infowindow.open(map, marker);
      } else {
        window.alert("No results found"); //Second option where user has incorrectly written the coordinates, or in the wrong format
      }
    })
    .catch((e) => window.alert("Geocoder failed due to: " + e)); //error object containing details about the error
}

window.initMap = initMap; //acts as the top-level object for the browser's tab.