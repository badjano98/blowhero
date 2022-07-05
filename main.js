// ==============================================================
window.intervals = {}
window.properties = {}
window.properties.sensor_status = {
	"last-updated" : 0,
	"sensors" : []
}

PULLUP = true
TOUCHED = PULLUP ? 0 : 1
UNTOUCHED = PULLUP ? 1 : 0

sensors = [
	"BOTTOM",
	"MIDDLE",
	"TOP",
	"LEFT",
	"RIGHT"
	]
LastUpdated = 0

function getRandomSpot(){
	return sensors[Math.floor(Math.random() * sensors.length)]
}


good_remarks = [
	"Ahhh",
	"Yeah",
	"Mmmmm...",
	"That's the spot!",
	"Don't stop",
]

bad_remarks  = [
	"Oh nooo",
	"Not that",
	"Not like this",
	"Oh please",
]

starting_remarks = ["Lick the tip to start :)"]

// Create the combination
combination_n = 10
combination = Array.from({length: combination_n}, () => getRandomSpot())
console.log(combination)
index = 0
window.properties.current_combination = {}


// ==============================================================

var gamewindow = document.createElement("h1");
gamewindow.innerText = "";
document.getElementsByTagName("body")[0].appendChild(gamewindow)

var remarkwindow = document.createElement("h1");
remarkwindow.innerText = "";
document.getElementsByTagName("body")[0].appendChild(remarkwindow)

var climaxwindow = document.createElement("h1");
document.getElementsByTagName("body")[0].appendChild(climaxwindow)
function updateClimax(){
	climaxwindow.innerText = index.toString();
}
updateClimax()

// ==============================================================
window.intervals.gameLoopInterval = null
window.intervals.combinationInterval = null
window.intervals.remarkInterval = null
var started = false

function getRandomSpot(){
	return sensors[Math.floor(Math.random() * sensors.length)]
}

function changeCurrentCombination(touched=false){
	// If it goes untouched for X seconds (called from Interval)
	// make it soft again ;)
	if (! touched || index < 0){
		index = 0
	}
	window.properties.current_combination = combination[index]
	gamewindow.innerText = window.properties.current_combination
}

function changeCurrentRemark(set=false, remarks=good_remarks){
	//console.log("Setting remark")
	if (set)
		remark = remarks[Math.floor(Math.random() * remarks.length)]
	else
		remark = ""
	remarkwindow.innerText = remark
}

function startGame(){
	
	changeCurrentRemark(set=false)
	started = true
	changeCurrentCombination()
	window.intervals.combinationInterval = setInterval(changeCurrentCombination, 5000)
}

function isTouched(){

	touches = Object.values(window.properties.sensor_status.sensors)
	for (const touch of touches) {
		if (touch == TOUCHED)
			return true
	}
	return false
}

// Display the initial message
changeCurrentRemark(set=true, remarks=starting_remarks)

// ==============================================================
function gameLoop(){

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
    	if (this.readyState == 4 && this.status == 200) {
 		// Update sensor status
    		window.properties.sensor_status = JSON.parse(xhttp.responseText);
    		}
	};
	xhttp.open("GET", window.location + "api/v1/sensor-status", true);
	xhttp.send()


    console.log(window.properties.sensor_status);
    if (started == false && window.properties.sensor_status.sensors["TOP"] == TOUCHED){
	    startGame()
    }

    var last_updated_tmp = LastUpdated
    LastUpdated = window.properties.sensor_status["last-updated"]

    // if (last_updated_tmp <= LastUpdated){
    // 	console.log("disconnected")
    // 	clearInterval(gameLoopInterval)
    // 	return;
    // }

    // if (window.properties.sensor_status.sensors == null){
    // 	console.log("disconnected")
    // 	clearInterval(gameLoopInterval)
    // 	return;
    // }

    if (! isTouched()) {
	    return
    }

    console.log(window.properties.sensor_status.sensors[window.properties.current_combination] == TOUCHED)
    // If the touch is right, proceed on giving pleasure
    if (window.properties.sensor_status.sensors[window.properties.current_combination] == TOUCHED){
	// Consume the touch
	window.properties.sensor_status.sensors[window.properties.current_combination] == UNTOUCHED

	// Say a good remark
	clearTimeout(window.intervals.remarkInterval)
	changeCurrentRemark(set=true)
	window.intervals.remarkInterval = setTimeout(changeCurrentRemark, 1000)

	// Move to next touch
	index = index + 1

    }
    // If the touch is wrong
    else {
	// Say a bad remark
	clearTimeout(window.intervals.remarkInterval)
	changeCurrentRemark(set=true, remarks=bad_remarks)
	window.intervals.remarkInterval = setTimeout(changeCurrentRemark, 1000)
	
	// climax down some touches
	index = index - 2
    }
    // Change combination
    clearInterval(window.intervals.combinationInterval)
    changeCurrentCombination(touched=true);
    window.intervals.combinationInterval = setInterval(changeCurrentCombination, 5000);
}



window.intervals.gameLoopInterval = setInterval(gameLoop, 200);
window.intervals.climaxInterval = setInterval(updateClimax, 200);

