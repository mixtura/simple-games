import http from "http"
import handler from "serve-handler"
import { server as WebSocketServer } from "websocket"
import { initWorld } from "./init";
import { serialize } from "./serializer";

function createServer(onRequest: (data: string) => void) {
  let server = http.createServer(async function(request, response) {
    await handler(request, response);
  });
  
  server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
  });
  
  let wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
  });
  
  function originIsAllowed(origin: string) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
  }
  
  wsServer.on('request', function(request) {
    // Make sure we only accept requests from an allowed origin
    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept();
  
    console.log((new Date()) + ' Connection accepted.');
    
    connection.on('message', function(message) {
      if (message.type === 'utf8' && message.utf8Data) {
        onRequest(message.utf8Data);
      }
    });
    
    connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
  });

  return wsServer;
}

let world = initWorld(400, 500);
let server = createServer((data) => {
  // TODO: apply actions
});

setInterval(() => {
  for(let connection of server.connections) {
    connection.send(serialize(world));
  }
}, 5000)