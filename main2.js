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

function drawSpot(location, type="TOUCH"){
	ctx.lineWidth = 3

	if (type == "TOUCH")
		ctx.fillStyle = "#ff0000";
	else if (type == "CLEAR")
		ctx.fillStyle = "transparent";
	else if (type == "OBJECTIVE"){
		draw_function = ctx.stroke
		ctx.strokeStyle = "#000000";
	}

	ctx.beginPath();
	if (location == "BOTTOM"){
		ctx.arc(150, 375, 40, 0, Math.PI * 2, true);
	}
	else if (location == "MIDDLE"){
		ctx.arc(150, 225, 40, 0, Math.PI * 2, true);
	}
	else if (location == "TOP"){
		ctx.arc(150, 80, 40, 0, Math.PI * 2, true);
	}
	else if (location == "RIGHT"){
		ctx.arc(100, 150, 40, 0, Math.PI * 2, true);
	}
	else if (location == "LEFT"){
		ctx.arc(200, 150, 40, 0, Math.PI * 2, true);
	}

	if (type == "TOUCH" || type == "CLEAR")
		ctx.fill()
	else if (type == "OBJECTIVE"){
		ctx.fill()
	}
}
// drawSpot("BOTTOM")
// drawSpot("MIDDLE")
// drawSpot("TOP", touch=true)
// drawSpot("RIGHT")
// drawSpot("LEFT")

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

REMARKS_SUSTAIN = 1600

CLIMAX_MAX = 10
CLIMAX_ACCEL = 0.05
CLIMAX = 0
CLIMAX_COMBINATION_LIST = []
CLIMAX_COMBINATION_CURRENT = null

POINT_SUSTAIN = 200

UNTOUCHED_COUNTER = 0
UNTOUCHED_COUNTER_MAX = 60 // updates untouched

GAME_LOOP_INTERVAL = 200 		 // miliseconds
GAME_LOOP = null

STARTED = false

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

function stopGame(){
	console.log("Game stopped")
	clearInterval(GAME_LOOP)
}

function gameLoop(){
	updateSensorStatus()
	if (SENSOR_STATUS == null){
		stopGame()
		return
	}

	changeRemark(set=true)
	for (const spot of SENSORS){
		console.log(SENSOR_STATUS['sensors'][spot])
		if (SENSOR_STATUS['sensors'][spot] == TOUCHED){
			// console.log(spot)
			drawSpot(spot, type="TOUCH")
			setTimeout(drawSpot(spot, type="CLEAR"), POINT_SUSTAIN)
		}
	}

	// clearSpots()
}

function startGame(){
	CLIMAX = 0
	UNTOUCHED_COUNTER = 0
	createClimaxCombination()
	STARTED = true
	GAME_LOOP = setInterval(gameLoop, GAME_LOOP_INTERVAL)
}


// ================================================================= Runtime

startGame()
