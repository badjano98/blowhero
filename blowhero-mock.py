#!/usr/bin/env python3

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import re
import argparse
import time
from pynput import keyboard
import os

# If 'BLOWHERO_DEBUG' is set to any value ("True", "1", etc)
# the local `main.js` will be loaded from `/js` endpoint.
# Else the Javascript will be fetched from Github
# BLOWHERO_DEBUG=1 python blowhero-mock.py

DEBUG = os.environ.get("BLOWHERO_DEBUG", "")
GAME_URL = "/js" if DEBUG else "https://raw.githubusercontent.com/badjano98/blowhero/main/main.js"

# Dynamically load remote Javascript, exactly as in:
# https://github.com/badjano98/blowhero/blob/main/blowhero.ino#L10
HTML = "<body><script> var xhttp=new XMLHttpRequest;xhttp.onreadystatechange=function(){if(4==this.readyState&&200==this.status){var t=document.createElement(\"script\");t.innerHTML=xhttp.responseText,document.getElementsByTagName(\"body\")[0].appendChild(t)}},xhttp.open(\"GET\",\"GAME_URL\",!0),xhttp.send(); </script></body>".replace("GAME_URL",GAME_URL)

# Simulate Arduino INPUT_PULLUP - inverse inputs
BUTTONS_PULLUP = True

# Vim-friendly bindings
BUTTONS = {
    "j":"BOTTOM",
    "k":"MIDDLE",
    "u":"TOP",
    "h":"LEFT", 
    "l":"RIGHT", 
}

API_SCHEMA = {
  "last-update" : 0,
  "sensors" : {
    "BOTTOM" : 1 if BUTTONS_PULLUP else 0,
    "MIDDLE" : 1 if BUTTONS_PULLUP else 0,
    "TOP"    : 1 if BUTTONS_PULLUP else 0,
    "RIGHT"  : 1 if BUTTONS_PULLUP else 0,
    "LEFT"   : 1 if BUTTONS_PULLUP else 0,
  }
}

#===========================================
# Keyboard monitoring
def on_press(key):
    try:
      API_SCHEMA["sensors"][BUTTONS[key.char]] = 0 if BUTTONS_PULLUP else 1
      print(f"{BUTTONS[key.char]} - pressed")
    except Exception as e:
        # print(e)
        pass

def on_release(key):
    try:
      API_SCHEMA["sensors"][BUTTONS[key.char]] = 1 if BUTTONS_PULLUP else 0
      print(f"{BUTTONS[key.char]} - released")
    except Exception as e:
        # print(e)
        pass

listener = keyboard.Listener(
    on_press=on_press,
    on_release=on_release)
listener.start()

print(f"Keyboard listener initiated. Monitoring for keys: {list(BUTTONS.keys())}")
#===========================================

class HTTPRequestHandler(BaseHTTPRequestHandler):
    # Override HTTP access logging
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        # Serve the state of the pushed buttons
        if re.search('/api/v1/sensor-status', self.path):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()

            # Emulate Arduino 'millis()' function
            millis = time.monotonic()
            millis = int((millis - int(millis))* 10**5)

            API_SCHEMA["last-update"] = millis
            data = json.dumps(API_SCHEMA)
            self.wfile.write(data.encode('utf8'))

        # Serve the JS game from local file (DEBUG mode)
        elif re.search('/js', self.path):
            assert DEBUG # If debug is not set, there is no way to reach the /js endpoint
            with open("main.js") as js:
                game = js.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/plan') # Simulate Github Raw fetch
            self.end_headers()
            self.wfile.write(game.encode('utf8'))

        # Serve the HTML page to load the JS game
        elif self.path == "/" :
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(HTML.encode('utf8'))

        # Nope for all other request paths
        else:
            self.send_response(404, "Not Found!")

def main():
    parser = argparse.ArgumentParser(description='Blowhero Mock Server')
    parser.add_argument('--port', type=int, help='Listening port for HTTP Server', default=8000)
    parser.add_argument('--ip', help='HTTP Server IP', default='localhost')
    args = parser.parse_args()

    server = HTTPServer((args.ip, args.port), HTTPRequestHandler)
    print(f'Blowhero HTTP Server Running on {(args.ip, args.port)}...')
    for key in BUTTONS.keys():
        print(f"{key} -> {BUTTONS[key]}")

    print("Visit to play blowhero:")
    print(f"http://{args.ip}:{args.port}/")
    server.serve_forever()


if __name__ == '__main__':
    main()

