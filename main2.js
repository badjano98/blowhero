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
ctx = canvas.getContext("2d");

function drawSpot(location, type="TOUCH", text=""){
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
		draw_function = ctx.stroke
		ctx.strokeStyle = "#000000";
	}

	ctx.beginPath();
	if (location == "BOTTOM"){
		x = 150; y = 375
	}
	else if (location == "MIDDLE"){
		x = 150; y = 225
	}
	else if (location == "TOP"){
		x = 150; y = 80
	}
	else if (location == "RIGHT"){
		x = 100; y = 150
	}
	else if (location == "LEFT"){
		x = 200; y = 150
	}
	ctx.arc(x, y, radius, 0, Math.PI * 2, true);
	ctx.fillText(text, x-(radius/2), y+(radius/2))

	if (type == "TOUCH" || type == "CORRECT")
		ctx.fill()
	else if (type == "OBJECTIVE")
		ctx.stroke()
	else if (type == "CLEAR")
		ctx.clearRect(x-40, y-40, 80, 80)
}

function drawClimax(climax = 0, type = "GAUGE"){
	ctx.fillStyle = "rgba(255, 0, 0, 1)";
	if (type == "GAUGE"){
		ctx.rect(7*dildoCanvas.width/8, dildoCanvas.height, dildoCanvas.width/8, -dildoCanvas.height*climax);
		ctx.fill();
	} else if (type == "CLEAR")
		ctx.clearRect(7*dildoCanvas.width/8, dildoCanvas.height, dildoCanvas.width/8, -dildoCanvas.height*1);		
}

function clearSpots() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
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

GAME_LOOP_INTERVAL = 1000/30  

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
	CLIMAX = 0
	UNTOUCHED_COUNTER = 0
	createClimaxCombination()
	STARTED = true
	changeRemark(set=false)
	GAME_LOOP = setInterval(gameLoop, GAME_LOOP_INTERVAL)
}

function stopGame(){
	console.log("Game stopped")
	clearInterval(GAME_LOOP)
	clearInterval(SENSOR_UPDATE)
}

function showTouches(){
	for (const spot of SENSORS){
		// console.log(SENSOR_STATUS['sensors'][spot])
		if (SENSOR_STATUS['sensors'][spot] == TOUCHED){
			// console.log(spot)
			drawSpot(spot, type="TOUCH")
			setTimeout(function(){drawSpot(spot, type="CLEAR")}, POINT_SUSTAIN)
			SENSOR_STATUS['sensors'][spot] == UNTOUCHED
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
	var right_spot = CLIMAX_COMBINATION_LIST[CLIMAX]
	drawSpot(right_spot, type="OBJECTIVE", text=CLIMAX)
}

function checkObjective(){
	var right_spot = CLIMAX_COMBINATION_LIST[CLIMAX]
	var ret = SENSOR_STATUS['sensors'][right_spot] == TOUCHED
	SENSOR_STATUS['sensors'][right_spot] = UNTOUCHED
	return ret
}

function calculateTouchInterval(){
	UNTOUCHED_INTERVAL = UNTOUCHED_INTERVAL_INITIAL - ((CLIMAX_ACCEL * CLIMAX) * UNTOUCHED_INTERVAL_INITIAL)
}

function climaxUp(){
	changeRemark(set=true, remarks=REMARKS_GOOD)
	var right_spot = CLIMAX_COMBINATION_LIST[CLIMAX]
	CLIMAX = CLIMAX + 1
	drawSpot(right_spot, type="CORRECT")
	setTimeout(function(){drawSpot(right_spot, type="CLEAR")}, POINT_SUSTAIN/2)
}

function climaxDown(){
	changeRemark(set=true, remarks=REMARKS_BAD)
	var right_spot = CLIMAX_COMBINATION_LIST[CLIMAX]
	drawSpot(right_spot, type="CLEAR")
	CLIMAX = CLIMAX - 2
	if (CLIMAX <= 0) CLIMAX = 0
}

function climaxZero(){
	changeRemark(set=true, remarks=REMARKS_NOT_TOUCHING)
	right_spot = CLIMAX_COMBINATION_LIST[CLIMAX]
	drawSpot(right_spot, type="CLEAR")
	CLIMAX = 0
	UNTOUCHED_INTERVAL = UNTOUCHED_INTERVAL_INITIAL
}

function getNextUntouchTimeout(){

	if (UNTOUCHED_TIMEOUT == null) return 1
	if (UNTOUCHED_TIME_END == 0) return 1
	var ms = (new Date()).getMilliseconds();
	if (UNTOUCHED_TIME_END < ms) return 1
	// console.log(UNTOUCHED_TIME_END)
	// console.log(ms)
	return (UNTOUCHED_TIME_END - ms) / UNTOUCHED_INTERVAL*10
	
}

function initGame() {
	changeRemark(set=true, remarks=REMARKS_STARTING, permanent=true)
	CLIMAX_COMBINATION_LIST = ["TOP"]
	SENSOR_UPDATE = setInterval(updateSensorStatus, SENSOR_UPDATE_INTERVAL)
}
// ================================================================= Game Loop

function gameLoop(){
	if (SENSOR_STATUS == null){
		stopGame()
		return
	}
	// drawClimax(1, type="CLEAR")
	// drawClimax(getNextUntouchTimeout())

	showObjective()

	showTouches()

	if (!isTouched()){
		if (UNTOUCHED_TIMEOUT == null){
			calculateTouchInterval()
			UNTOUCHED_TIME_END = (new Date()).getMilliseconds()+UNTOUCHED_INTERVAL/10;
			UNTOUCHED_TIMEOUT = setTimeout(
				climaxZero,
				UNTOUCHED_INTERVAL
			)
		}
		return
	}
	clearTimeout(UNTOUCHED_TIMEOUT); UNTOUCHED_TIMEOUT = null; UNTOUCHED_TIME_END = 0;


	if (checkObjective()){
		climaxUp()
		if (checkWin()){
			stopGame()
		}
	} else {
		climaxDown()
	}

}



// ================================================================= Runtime

initGame()
INIT_GAME = setInterval(function(){
		if (checkObjective()){
			clearInterval(INIT_GAME)
			console.log("Init game")
			startGame()
		}
	}, INIT_GAME_INTERVAL)
