// Opis: Koda, ki se izvaja na ESP8266 in skrbi za vzpostavitev WiFi povezave z routerjem, zajem glasov in komunikacijo s spletno stranjo.
// Verzija: 2016.08.24b
// ====================================================================================================

// 470 ohm

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include "WebSocketsServer.h"
#include <Hash.h>
WebSocketsServer webSocket = WebSocketsServer(81);
const char* ssid = "glasovanje"; // replace "SSID" with wireless name (SSID)
const char* password = "DontPanic!42"; // replace "PWD" eith wireless password

volatile int Signal = 0;                // holds the incoming raw data
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

        case WStype_TEXT:
        {
          if (digitalRead(13) == 0) { // D7-ZE
            Signal = 5;
          } else if (digitalRead(12) == 0) { // D6-RU
            Signal = 4;
          } else if (digitalRead(0) == 0) { // D3-BE
            Signal = 3;
          } else if (digitalRead(4) == 0) { // D2-OR
            Signal = 2;
          } else if (digitalRead(5) == 0) { // D1-RD
            Signal = 1;
          } else {
            Signal = 0;
          }

            itoa(Signal,buffer,10);
            webSocket.sendTXT(num, buffer);
            // webSocket.sendTXT(char, buffer);
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
    pinMode(13, INPUT_PULLUP); // D7 zelena
    pinMode(12, INPUT_PULLUP); // D6 rumena
    pinMode(0, INPUT_PULLUP); // D3 bela
    pinMode(4, INPUT_PULLUP); // D2 oranžna
    pinMode(5, INPUT_PULLUP); // D1 rdeča

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
