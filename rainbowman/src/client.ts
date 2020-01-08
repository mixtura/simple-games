export function createClient(onMessage: (data: string) => void) {
  let socket = new WebSocket("ws://localhost:8080");

  socket.onopen = function(e) {
    console.log("[open] Connection established");
    console.log("Sending to server");
    
    socket.send("My name is John");
  };
  
  socket.onmessage = function(event) {
    console.log(`[message] Data received from server: ${event.data}`);
    console.log("Updating world...");

    onMessage(event.data);
  };
  
  socket.onclose = function(event) {
    if (event.wasClean) {
      console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      // e.g. server process killed or network down
      // event.code is usually 1006 in this case
      console.log('[close] Connection died');
    }
  };
  
  socket.onerror = function(error) {
    console.log(`[error] ${error.type}`);
  };
  
  return socket;
}

export function sendData(client: WebSocket, data: string) {  
  if (client.readyState === client.OPEN) {
    client.send(data);
  }
}
