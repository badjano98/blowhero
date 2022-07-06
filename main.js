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

disconnect_remarks = [
	"Don't worry, it happens to everyone!",

]

not_touching_remarks = [
	"You need to touch it!"
]

starting_remarks = ["Lick the tip to start :)"]

// Create the combination
combination_n = 10
combination = Array.from({length: combination_n}, () => getRandomSpot())
console.log(combination)
index = 0
climaxAccel = 0.10
window.properties.current_combination = {}
combinationTime = 5000
untouchedCounter = 0
untouchedCounterMax = 30 // updates untouched
// ==============================================================

var gamewindow = document.createElement("h1");
gamewindow.innerText = "";
document.getElementsByTagName("body")[0].appendChild(gamewindow)

var climaxwindow = document.createElement("h1");
document.getElementsByTagName("body")[0].appendChild(climaxwindow)
function updateClimax(){
	if (index < 0) index = 0;
	climaxwindow.innerText = index.toString();
}
updateClimax()

var remarkwindow = document.createElement("h1");
remarkwindow.innerText = "";
document.getElementsByTagName("body")[0].appendChild(remarkwindow)


// ==============================================================
window.intervals.gameLoopInterval = null
window.intervals.combinationInterval = null
window.intervals.remarkInterval = null
var started = false

function getRandomSpot(){
	return sensors[Math.floor(Math.random() * sensors.length)]
}

function changeCurrentCombination(){
	window.properties.current_combination = combination[index]
	gamewindow.innerText = window.properties.current_combination

	// window.intervals.combinationInterval = setTimeout(changeCurrentCombination, combinationTime - combinationTime * climaxAccel);	
}

function changeCurrentRemark(set=false, remarks=good_remarks, permanent=false){
	//console.log("Setting remark")
	if (set)
		remark = remarks[Math.floor(Math.random() * remarks.length)]
	else
		remark = ""
	remarkwindow.innerText = remark
	if (!permanent)
		setTimeout(function() {if (remarkwindow.innerText == remark) remarkwindow.innerText = ""}, 1600)
}

function startGame(){
	
	changeCurrentCombination()
	changeCurrentRemark(set=false)
	started = true
	// window.intervals.combinationInterval = setInterval(changeCurrentCombination, combinationTime)
}

function isTouched(){

	touches = Object.values(window.properties.sensor_status.sensors)
	for (const touch of touches) {
		if (touch == TOUCHED)
			return true
	}
	return false
}

function checkWin(){
	if (index < combination_n) return false;
	return true
}

function winRestart(){
	// Display the initial message
	clearInterval(window.intervals.gameLoopInterval)
	changeCurrentRemark(set=true, remarks=starting_remarks, permanent=true)
	index = 0
	started = false
	gamewindow.innerText = ""
	window.intervals.gameLoopInterval = setInterval(gameLoop, 200)
}



// ==============================================================
function gameLoop(){

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
 		// Update sensor status
			window.properties.sensor_status = JSON.parse(xhttp.responseText);
			}
	};
	xhttp.onerror = function(){
		console.log("Disconnected")
		clearInterval(window.intervals.gameLoopInterval)
		changeCurrentRemark(set=true, remarks=disconnect_remarks, permanent=true)
	}
	xhttp.open("GET", window.location + "api/v1/sensor-status", true);
	xhttp.send()

	console.log(window.properties.sensor_status);

	if (started == false){
   		if (window.properties.sensor_status.sensors["TOP"] == TOUCHED)
			startGame()
		return
	}

	if (!isTouched()){
		untouchedCounter = untouchedCounter + 1
		if (untouchedCounter >= untouchedCounterMax){
			index = 0
			untouchedCounter = 0
			changeCurrentCombination()
			changeCurrentRemark(set=true, remarks=not_touching_remarks)
			updateClimax()
		}
		return
	}
	untouchedCounter = 0

	console.log(window.properties.sensor_status.sensors[window.properties.current_combination] == TOUCHED)

	// If the touch is right, proceed on giving pleasure
	if (window.properties.sensor_status.sensors[window.properties.current_combination] == TOUCHED){


		// Pick a good remark
		remarks = good_remarks

		// Move to next touch
		index = index + 1
		untouchedCounter = untouchedCounterMax * climaxAccel

	} else { // If the touch is wrong

		// Pick a bad remark
		remarks = bad_remarks
		
		// climax down some touches
		index = index - 2
	}
	updateClimax()

	// Consume the touch
	s = Object.keys(window.properties.sensor_status.sensors)
	for (const sensor of s)
		window.properties.sensor_status.sensors[sensor] = UNTOUCHED
	
	if (checkWin()){
		winRestart()
		return
	}

	// Say remark
//	clearTimeout(window.intervals.remarkInterval)
	changeCurrentRemark(set=true, remarks=remarks)
//	window.intervals.remarkInterval = setTimeout(changeCurrentRemark, 1000)

	// Change combination
	// clearTimeout(window.intervals.combinationInterval)
	changeCurrentCombination();

	// Make the next combination come a little faster
	// window.intervals.combinationInterval = setTimeout(changeCurrentCombination, combinationTime - combinationTime * climaxAccel);



}

winRestart()

