#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <Arduino_JSON.h>

ESP8266WebServer server(80);

const char* ssid     = "5G_Beta_Test_Tower";
const char* password = "l@siest@";

const char* game = "<body><script> var xhttp=new XMLHttpRequest;xhttp.onreadystatechange=function(){if(4==this.readyState&&200==this.status){var t=document.createElement(\"script\");t.innerHTML=xhttp.responseText,document.getElementsByTagName(\"body\")[0].appendChild(t)}},xhttp.open(\"GET\",\"https://raw.githubusercontent.com/badjano98/blowhero/main/main.js\",!0),xhttp.send(); </script></body>";

int BOTTOM = 0; // D3
int MIDDLE = 5; // D2
int TOP = 4;    // D1

void setup() {
  Serial.begin(115200); //Begin Serial at 115200 Baud
  WiFi.begin(ssid, password);  //Connect to the WiFi network

  // Pins
  pinMode(BOTTOM, INPUT_PULLUP);
  pinMode(MIDDLE, INPUT_PULLUP);
  pinMode(TOP, INPUT_PULLUP);
  
  while (WiFi.status() != WL_CONNECTED) {  //Wait for connection
      delay(500);
      Serial.println("Waiting to connect...");
  }
  
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());  //Print the local IP
  
  server.on("/", handle_index); //Handle Index page
  server.on("/api/v1/sensor-status", handle_sensor_status);

  
  server.begin(); //Start the server
  Serial.println("Server listening");
}

void loop() {
  server.handleClient(); //Handling of incoming client requests
}

void handle_index() {
  //Print Hello at opening homepage
  server.send(200, "text/html", game);
}

void handle_sensor_status() {
  JSONVar sensorStatus;
//  JSONVar sensorStatus["sensors"];
  sensorStatus["last-update"] = millis();
  sensorStatus["sensors"]["BOTTOM"] = digitalRead(BOTTOM);
  sensorStatus["sensors"]["MIDDLE"] = digitalRead(MIDDLE);
  sensorStatus["sensors"]["TOP"] = digitalRead(TOP);
  sensorStatus["sensors"]["LEFT"] = false;
  sensorStatus["sensors"]["RIGHT"] = false;

  String jsonString = JSON.stringify(sensorStatus);
  server.send(200, "application/json", jsonString.c_str());
  
}
