SensorEndpoint = ""
window.properties = {"sensor_status":{
		"sensor1" : true,
		"sensor2" : true
	}
}

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

	xhttp.open("GET", window.location + "api/v1/sensor-status", true);
	xhttp.send()
	console.log(window.location)

	console.log(JSON.stringify(window.properties))
}


setTimeout(gameLoop, 250);

