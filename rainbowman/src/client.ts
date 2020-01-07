import {w3cwebsocket as W3CWebSocket} from 'websocket'
 
var client = new W3CWebSocket('ws://localhost:8080/', 'echo-protocol');
 
client.onerror = function() {
    console.log('Connection Error');
};
 
client.onopen = function() {
    console.log('WebSocket Client Connected'); 
};
 
client.onclose = function() {
    console.log('echo-protocol Client Closed');
};
 
client.onmessage = function(e) {
    if (typeof e.data === 'string') {
        console.log("Received: '" + e.data + "'");
    }
};

export function sendAction(data: string) {  
  if (client.readyState === client.OPEN) {
    client.send(data);
  }
}
