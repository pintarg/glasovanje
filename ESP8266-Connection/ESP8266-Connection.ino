// Opis: Koda, ki se izvaja na ESP8266 in skrbi za vzpostavitev WiFi povezave z routerjem, zajem glasov in komunikacijo s spletno stranjo.
// Verzija: 2016.08.21c
// ====================================================================================================

// 470 ohm

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include "WebSocketsServer.h"
#include <Hash.h>
WebSocketsServer webSocket = WebSocketsServer(81);
const char* ssid = "glasovanje"; // replace "SSID" with wireless name (SSID)
const char* password = "DontPanic!42"; // replace "PWD" eith wireless password

volatile int Signal = 1;                // holds the incoming raw data
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
          if (digitalRead(12) == 0) {
            Signal = 3;
          } else if (digitalRead(13) == 0) {
            Signal = 2;
          } else if (digitalRead(15) == 0) {
            Signal = 9;
          } else if (digitalRead(14) == 0) {
            Signal = 4;
          } else if (digitalRead(2) == 0) {
            Signal = 5;
          } else if (digitalRead(0) == 0) {
            Signal = 6;
          } else if (digitalRead(4) == 0) {
            Signal = 7;
          } else if (digitalRead(5) == 0) {
            Signal = 8;
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
    pinMode(2, INPUT_PULLUP); // D4 rdeca
    pinMode(14, INPUT_PULLUP); // D5 oranzna
    pinMode(12, INPUT_PULLUP); // D6 bela
    pinMode(13, INPUT_PULLUP); // D7 rumena
    pinMode(15, INPUT_PULLUP); // D8 zelena
    pinMode(0, INPUT_PULLUP); // D3 zelena
    pinMode(4, INPUT_PULLUP); // D2 zelena
    pinMode(5, INPUT_PULLUP); // D1 zelena

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
