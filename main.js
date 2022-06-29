SensorEndpoint = ""
window.properties = {
	"sensor_status":{
		"sensor1" : true,
		"sensor2" : true
	}
}

sensors = ["BOTTOM", "MIDDLE", "TOP", "LEFT", "RIGHT"]

window.properties.current_combination = []

var gamewindow = document.createElement("h1");
gamewindow.innerText = "";
document.getElementsByTagName("body")[0].appendChild(gamewindow)

function changeCurrentCombination(){

	window.properties.current_combination = sensors[Math.floor(Math.random() * sensors.length)]
	console.log(window.properties.current_combination)
	gamewindow.innerText = window.properties.current_combination
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



}



setInterval(gameLoop, 250);

setInterval(changeCurrentCombination, 5000);
