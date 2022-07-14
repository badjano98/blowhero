#include <ESP8266WiFi.h>          //https://github.com/esp8266/Arduino

//needed for library
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>         //https://github.com/tzapu/WiFiManager

#include <Arduino_JSON.h>

ESP8266WebServer server(80);

const char* game = "<body><script> var xhttp=new XMLHttpRequest;xhttp.onreadystatechange=function(){if(4==this.readyState&&200==this.status){var t=document.createElement(\"script\");t.innerHTML=xhttp.responseText,document.getElementsByTagName(\"body\")[0].appendChild(t)}},xhttp.open(\"GET\",\"https://raw.githubusercontent.com/badjano98/blowhero/main/main.js\",!0),xhttp.send(); </script></body>";

int BOTTOM = 13; // D7
int MIDDLE = 14; // D5
int TOP = 16;    // D0
int LEFT = 4;    // D2
int RIGHT = 5;    // D1


void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);

  // Pins
  pinMode(BOTTOM, INPUT);
  pinMode(MIDDLE, INPUT);
  pinMode(TOP, INPUT);
  pinMode(LEFT, INPUT);
  pinMode(RIGHT, INPUT);

  //WiFiManager
  //Local intialization. Once its business is done, there is no need to keep it around
  WiFiManager wifiManager;
  //reset saved settings
  //wifiManager.resetSettings();

  //set custom ip for portal
  //wifiManager.setAPConfig(IPAddress(10,0,1,1), IPAddress(10,0,1,1), IPAddress(255,255,255,0));

  //fetches ssid and pass from eeprom and tries to connect
  //if it does not connect it starts an access point with the specified name
  //here  "AutoConnectAP"
  //and goes into a blocking loop awaiting configuration
  wifiManager.autoConnect("ACAP", "blowhero");
  //or use this for auto generated name ESP + ChipID
  //wifiManager.autoConnect();


  //if you get here you have connected to the WiFi
  Serial.println("connected...yeey :)");

  server.begin(); //start the server
  server.on("/", handle_index); //Handle Index page
  server.on("/api/v1/sensor-status", handle_sensor_status);

}

void loop() {
  // put your main code here, to run repeatedly:
  
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
  sensorStatus["sensors"]["LEFT"] = digitalRead(LEFT);
  sensorStatus["sensors"]["RIGHT"] = digitalRead(RIGHT);

  String jsonString = JSON.stringify(sensorStatus);
  server.send(200, "application/json", jsonString.c_str());
  

}
