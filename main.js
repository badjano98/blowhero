SensorEndpoint = ""
window.properties = {
	"last-updated" : 0,
	"sensors" : null
}

sensors = [
	"BOTTOM",
	"MIDDLE",
	"TOP",
	"LEFT",
	"RIGHT"
	]
LastUpdated = 0

window.properties.current_combination = {}
window.properties.sensor_status = {}

var gamewindow = document.createElement("h1");
gamewindow.innerText = "";
document.getElementsByTagName("body")[0].appendChild(gamewindow)

var gameLoopInterval = null
var combinationInterval = null

function changeCurrentCombination(){

	window.properties.current_combination = sensors[Math.floor(Math.random() * sensors.length)]
	// console.log(window.properties.current_combination)
	gamewindow.innerText = window.properties.current_combination
}


function gameLoop(){

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
 		// Update sensor status
    	   window.properties.sensor_status = xhttp.responseText;
    	}
	};

	xhttp.open("GET", window.location + "api/v1/sensor-status", true);
	xhttp.send()


    // console.log(window.properties.sensor_status);

    var last_updated_tmp = LastUpdated
    LastUpdated = window.properties.sensor_status["last-updated"]

    if (last_updated_tmp <= LastUpdated){
    	console.log("disconnected")
    	clearInterval(gameLoopInterval)
    	return;
    }

    if (window.properties.sensor_status.sensors == null){
    	console.log("disconnected")
    	clearInterval(gameLoopInterval)
    	return;
    }

    if (window.properties.sensor_status.sensors[window.properties.current_combination] == 1){
    	log.console("Success!!!")
    	clearInterval(combinationInterval)
		combinationInterval = setInterval(changeCurrentCombination, 5000);
    }

}



gameLoopInterval = setInterval(gameLoop, 250);

combinationInterval = setInterval(changeCurrentCombination, 5000);
