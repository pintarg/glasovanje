// Opis: Koda, ki se izvaja na ESP8266 in skrbi za vzpostavitev WiFi povezave z routerjem, zajem glasov in komunikacijo s spletno stranjo.
// Verzija: 2016.12.28d
// ====================================================================================================

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include "WebSocketsServer.h"
#include <Hash.h>
WebSocketsServer webSocket = WebSocketsServer(81);
const char* ssid = "glasovanje"; // replace "SSID" with wireless name (SSID)
const char* password = "DontPanic!42"; // replace "PWD" eith wireless password
boolean empty = true;
unsigned long lastBtnPressTime = 0;
unsigned long debounceDelay = 1000;

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t lenght) {

  switch(type) {
    case WStype_DISCONNECTED: {
      break;
    }
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      break;
    }
    case WStype_TEXT: {
      String text = String((char *) &payload [0]);
      if (text == "3") {
        digitalWrite(13, 1); //D7
        delay(500);
        digitalWrite(13, 0);
      } else if (text == "2") { //D6
        digitalWrite(12, 1);
        delay(500);
        digitalWrite(12, 0);
      } else if (text == "1") { //D5
        digitalWrite(14, 1);
        delay(500);
        digitalWrite(14, 0);
      } else if (text == "0") {
        webSocket.sendTXT(num, "42");
        // webSocket.broadcastTXT("42");
      }
      // webSocket.sendTXT(num, payload, lenght);
      break;
    }
    case WStype_BIN: {
      hexdump(payload, lenght);
      webSocket.sendBIN(num, payload, lenght);
      break;
    }
  }
}

void setup() {
  pinMode(0, INPUT_PULLUP); // D3
  pinMode(4, INPUT_PULLUP); // D2
  pinMode(5, INPUT_PULLUP); // D1
  pinMode(12, OUTPUT); // D6
  pinMode(13, OUTPUT); // D7
  pinMode(14, OUTPUT); // D5

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

  if (digitalRead(2) == 0) { // D4-proti (13)
    if((millis()-lastBtnPressTime)>debounceDelay) {
      webSocket.broadcastTXT("3");
      lastBtnPressTime=millis();
    }
  } else if (digitalRead(4) == 0) { // D2-nedolocen (12)
    if((millis()-lastBtnPressTime)>debounceDelay) {
      webSocket.broadcastTXT("2");
      lastBtnPressTime=millis();
    }
  } else if (digitalRead(5) == 0) { // D1-za (14)
    if((millis()-lastBtnPressTime)>debounceDelay) {
      webSocket.broadcastTXT("1");
      lastBtnPressTime=millis();
    }
  }
}
