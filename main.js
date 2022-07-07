// ================================================================= DOM
var dildoWindow = document.createElement("img");
dildoWindow.id = "dildoWindow"
dildoWindow.src = "https://github.com/badjano98/blowhero/raw/main/images/dildo.png";
document.getElementsByTagName("body")[0].appendChild(dildoWindow)

var dildoCanvas = document.createElement("canvas");
dildoCanvas.width = 294;
dildoCanvas.height = 597;
dildoCanvas.id = "dildoCanvas"
document.getElementsByTagName("body")[0].appendChild(dildoCanvas)

var remarkText = document.createElement("h1");
remarkText.id = "remarkText"
document.getElementsByTagName("body")[0].appendChild(remarkText)

// ================================================================= Canvas

var img = document.getElementById("dildoWindow");
var canvas = document.getElementById("dildoCanvas");
canvas.style.position = "absolute";
canvas.style.left = img.offsetLeft;
canvas.style.top = img.offsetTop;
// ctx = canvas.getContext("2d");

function drawSpot(location, type="TOUCH", text=""){
	var ctx = canvas.getContext("2d");
	ctx.lineWidth = 3
	ctx.font = "56px Arial";
	ctx.strokeStyle = "#000000";
	ctx.fillStyle = "#000000";

	radius = 38
	if (type == "TOUCH"){
		ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
		radius = 35
	}
	else if (type == "CORRECT")
		ctx.fillStyle = "#00ff00";
	else if (type == "OBJECTIVE"){
		ctx.strokeStyle = "#000000";
		ctx.fillStyle = "#000000";
	}

	ctx.beginPath();
	if (location == "BOTTOM"){		x = 150; y = 375}
	else if (location == "MIDDLE"){	x = 150; y = 225}
	else if (location == "TOP"){	x = 150; y = 80}
	else if (location == "RIGHT"){	x = 100; y = 150}
	else if (location == "LEFT"){	x = 200; y = 150}

	ctx.arc(x, y, radius, 0, Math.PI * 2, true);
	ctx.fillText(text, x-(radius/2), y+(radius/2))

	if (type == "TOUCH" || type == "CORRECT")
		ctx.fill()
	else if (type == "OBJECTIVE")
		ctx.stroke()
	else if (type == "CLEAR")
		ctx.clearRect(x-(radius+ctx.lineWidth), y-(radius+ctx.lineWidth), (radius+ctx.lineWidth)*2, (radius+ctx.lineWidth)*2)
	ctx.closePath()
}

function drawClimax(climax = 0, type = "TOUCH"){
	var ctx = canvas.getContext("2d");
	var grd = ctx.createLinearGradient(0, 0, 200, 0);
	grd.addColorStop(0, "red");
	grd.addColorStop(1, "white");
	ctx.fillStyle = null; // grd
	if (type == "TOUCH"){
		ctx.fillStyle = "rgba(255, 0, 0, 0.3)"; // grd
		ctx.rect(7*dildoCanvas.width/8, dildoCanvas.height, dildoCanvas.width/8, -dildoCanvas.height*climax);
		ctx.fill();
	} else if (type == "CLIMAX"){
		ctx.fillStyle = "rgba(0, 255, 0, 0.3)"; // grd
		ctx.rect(0*dildoCanvas.width/8, dildoCanvas.height, dildoCanvas.width/8, -dildoCanvas.height*climax/10);
		ctx.fill();
	} else if (type == "CLEAR")
		ctx.clearRect(7*dildoCanvas.width/8, dildoCanvas.height, dildoCanvas.width/8, -dildoCanvas.height*1);
	// ctx.closePath()
}

function clearSpots() {
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// ctx.closePath()
}
clearSpots();

// =================================================================


// ================================================================= Constants

SENSOR_STATUS = {
	"last-updated" : 0,
	"sensors" : {},
}

PULLUP = false
TOUCHED = PULLUP ? 0 : 1
UNTOUCHED = PULLUP ? 1 : 0

SENSORS = [
	"BOTTOM",
	"MIDDLE",
	"TOP",
	"LEFT",
	"RIGHT"
]

REMARKS_GOOD = [
	"Ahhh",
	"Yeah",
	"Mmmmm...",
	"That's the spot!",
	"Don't stop",
]
REMARKS_BAD = [
	"Oh nooo",
	"Not that",
	"Not like this",
	"Oh please",
]
REMARKS_STOP_GAME = [
	"Don't worry, it happens to everyone!",

]
REMARKS_NOT_TOUCHING = [
	"You need to touch it!"
]
REMARKS_STARTING = ["Lick the tip to start :)"]

REMARKS_SUSTAIN = 800

CLIMAX_MAX = 10
CLIMAX_ACCEL = 0.05

UNTOUCHED_INTERVAL_INITIAL = 4000

POINT_SUSTAIN = 500

GAME_LOOP_INTERVAL = 1000/24

SENSOR_UPDATE_INTERVAL = 200

INIT_GAME_INTERVAL = 300

// ================================================================= Variables
CLIMAX = 0
CLIMAX_COMBINATION_CURRENT = null
CLIMAX_COMBINATION_LIST = []

UNTOUCHED_INTERVAL = UNTOUCHED_INTERVAL_INITIAL
UNTOUCHED_TIME_END = 0
UNTOUCHED_TIMEOUT = null

GAME_LOOP = null

STARTED = false
SENSOR_UPDATE = null

// ================================================================= Functions

function getRandomSpot(){
	return SENSORS[Math.floor(Math.random() * SENSORS.length)]
}

function createClimaxCombination(){
	CLIMAX_COMBINATION_LIST = Array.from({length: CLIMAX_MAX}, () => getRandomSpot())
}

function setClimax(index){
	CLIMAX = index
	if (CLIMAX <= 0) CLIMAX = 0
	CLIMAX_COMBINATION_CURRENT = CLIMAX_COMBINATION_LIST[CLIMAX]
}

function checkWin(){
	if (CLIMAX < CLIMAX_MAX) return false;
	return true
}

function changeRemark(set=false, remarks=REMARKS_GOOD, permanent=false){
	if (set)
		remark = remarks[Math.floor(Math.random() * remarks.length)]
	else
		remark = ""
	remarkText.innerText = remark
	if (!permanent)
		setTimeout(function() {
			if (remarkText.innerText == remark) remarkText.innerText = ""
		},
		REMARKS_SUSTAIN)
}

function updateSensorStatus(){
	var xhttp = new XMLHttpRequest();
	xhttp.onload = function() {
		SENSOR_STATUS = JSON.parse(xhttp.responseText);
		console.log(xhttp.responseText);
	};
	xhttp.onerror = function(){
		SENSOR_STATUS = null
	}
	xhttp.open("GET", window.location + "api/v1/sensor-status", true);
	xhttp.send()
}

function startGame(){
	createClimaxCombination()
	setClimax(0)
	UNTOUCHED_COUNTER = 0
	STARTED = true
	changeRemark(set=false)
	GAME_LOOP = setInterval(gameLoop, GAME_LOOP_INTERVAL)
}

function stopGame(){
	console.log("Game stopped")
	clearInterval(GAME_LOOP)
	clearInterval(SENSOR_UPDATE)
}

function showTouches(consume=false){
	for (const spot of SENSORS){
		if (SENSOR_STATUS['sensors'][spot] == TOUCHED){
			drawSpot(spot, type="TOUCH")
			// setTimeout(function(){drawSpot(spot, type="CLEAR")}, POINT_SUSTAIN)
			if (consume)
				SENSOR_STATUS['sensors'][spot] = UNTOUCHED
		}
	}	
}

function isTouched(){
	for (const spot of Object.values(SENSOR_STATUS['sensors'])) {
		if (spot == TOUCHED)
			return true
	}
	return false
}

function showObjective(){
	drawSpot(CLIMAX_COMBINATION_CURRENT, type="OBJECTIVE", text=CLIMAX)
	// for (const sensor in SENSORS){
	// 	if (CLIMAX_COMBINATION_CURRENT == sensor)
	// 	else
	// 		drawSpot(CLIMAX_COMBINATION_CURRENT, type="CLEAR")
	// }
}

function checkObjective(consume=true){
	var ret = (SENSOR_STATUS['sensors'][CLIMAX_COMBINATION_CURRENT] == TOUCHED)
	if (consume)
		SENSOR_STATUS['sensors'][CLIMAX_COMBINATION_CURRENT] = UNTOUCHED
	return ret
}

function calculateTouchInterval(){
	UNTOUCHED_INTERVAL = UNTOUCHED_INTERVAL_INITIAL - ((CLIMAX_ACCEL * CLIMAX) * UNTOUCHED_INTERVAL_INITIAL)
}

function climaxUp(){
	changeRemark(set=true, remarks=REMARKS_GOOD)
	var comb_previous = CLIMAX_COMBINATION_CURRENT
	drawSpot(CLIMAX_COMBINATION_CURRENT, type="CORRECT")
	drawSpot(CLIMAX_COMBINATION_CURRENT, type="CLEAR")
	// setTimeout(function(){drawSpot(comb_previous, type="CLEAR")}, POINT_SUSTAIN)
	setClimax(CLIMAX + 1)
}

function climaxDown(){
	changeRemark(set=true, remarks=REMARKS_BAD)
	drawSpot(CLIMAX_COMBINATION_CURRENT, type="CLEAR")
	setClimax(CLIMAX - 2)
}

function climaxZero(){
	changeRemark(set=true, remarks=REMARKS_NOT_TOUCHING)
	drawSpot(CLIMAX_COMBINATION_CURRENT, type="CLEAR")
	setClimax(0)
	UNTOUCHED_INTERVAL = UNTOUCHED_INTERVAL_INITIAL
}

function getNextUntouchTimeout(){

	if (UNTOUCHED_TIMEOUT == null) return 1
	if (UNTOUCHED_TIME_END == 0) return 1
	var ms = Date.now();
	if (UNTOUCHED_TIME_END < ms) return 1
	// Return 0.0 to 1.0 - 1 no timer - 0 maximum untouched
	return (UNTOUCHED_TIME_END - ms) / UNTOUCHED_INTERVAL	
}

function initGame() {
	changeRemark(set=true, remarks=REMARKS_STARTING, permanent=true)
	CLIMAX_COMBINATION_LIST = ["TOP"]
	setClimax(0)
	SENSOR_UPDATE = setInterval(updateSensorStatus, SENSOR_UPDATE_INTERVAL)
}


function untouchedTimerReset(){
	clearTimeout(UNTOUCHED_TIMEOUT);
	UNTOUCHED_TIMEOUT = null;
	UNTOUCHED_TIME_END = 0;
}

function untouchedTimerStart(){
	calculateTouchInterval()
	UNTOUCHED_TIME_END = Date.now() + UNTOUCHED_INTERVAL;
	UNTOUCHED_TIMEOUT = setTimeout(
		function() {
			climaxZero()
			untouchedTimerReset()
		},
		UNTOUCHED_INTERVAL
	)
}

function untouchedTimerActive(){
	return UNTOUCHED_TIME_END == 0
}
// ================================================================= Game Loop

function gameLoop(){
	if (SENSOR_STATUS == null){
		stopGame()
		return
	}
	clearSpots()
	// drawClimax(1, type="CLEAR")
	drawClimax(getNextUntouchTimeout(), type="TOUCH")
	// drawClimax(CLIMAX, type="CLIMAX")

	showObjective()
	console.log(CLIMAX_COMBINATION_CURRENT)
	showTouches(consume=false)

	if (!isTouched()){
		if (untouchedTimerActive())
			untouchedTimerStart()
		return
	}
	untouchedTimerReset()

	if (checkObjective(consume=true)){
		console.log("CLIMAX UP")
		console.log(CLIMAX)
		climaxUp()
		if (checkWin()){
			stopGame()
		}
	} else {
		console.log("CLIMAX DOWN")
		console.log(CLIMAX)
		climaxDown()
	}

}



// ================================================================= Runtime

initGame()
// startGame()
INIT_GAME = setInterval(function(){
		if (!STARTED && checkObjective(consume=false)){
			clearInterval(INIT_GAME)
			console.log("Init game")
			startGame()
		}
	}, INIT_GAME_INTERVAL)
