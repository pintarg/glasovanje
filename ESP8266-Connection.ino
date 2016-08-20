// 470 ohm

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include "WebSocketsServer.h"
#include <Hash.h>
WebSocketsServer webSocket = WebSocketsServer(81);
const char* ssid = "SSID"; // replace "SSID" with wireless name (SSID)
const char* password = "PWD"; // replace "PWD" eith wireless password

volatile int Signal = 500;                // holds the incoming raw data
char buffer[10];

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t lenght) {

    switch(type) {
        case WStype_DISCONNECTED:
        {
            break;
        }
        case WStype_CONNECTED:
        {
            IPAddress ip = webSocket.remoteIP(num);
            break;
        }

        case WStype_TEXT: // listening on pin 12 (D6)
        {
            Signal = digitalRead(12);
            itoa(Signal,buffer,10);
            webSocket.sendTXT(num, buffer);
            //webSocket.sendTXT(num, payload, lenght);
            break;
        }

        case WStype_BIN:
        {
            hexdump(payload, lenght);

            // echo data back to browser
            webSocket.sendBIN(num, payload, lenght);
            break;
        }
    }

}

void setup() {
    pinMode(12, INPUT_PULLUP);
    Serial.begin(115200);
    WiFi.begin(ssid, password);
    while(WiFi.status() != WL_CONNECTED) {
        delay(100);
    }
    Serial.println(WiFi.localIP());
    webSocket.begin();
    webSocket.onEvent(webSocketEvent);
}

void loop() {
    webSocket.loop();
}
