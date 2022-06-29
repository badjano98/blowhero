SensorEndpoint = ""
window.properties = {}

function gameLoop(){

	console.log("update")
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
 		// Update sensor status
    	   window.properties.sensor_status = xhttp.responseText;
    	}
	};
    console.log(window.properties.sensor_status);
    console.log("Freezing...");

	// while (window.properties.sensor_status == null){
	xhttp.open("GET", window.location + "api/v1/sensor-status", false);
	xhttp.send()
	// }
    console.log("Unfroze...");
	console.log(window.location)
	

}


setTimeout(gameLoop, 250);

