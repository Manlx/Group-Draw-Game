import { WebSocketServer } from 'ws';

const server = new WebSocketServer({ port: 3000 });

server.on('connection', function connection(newConnection) {

  newConnection.on('message', function message(data) {
    
    server.clients.forEach((clientConnection)=>{

      if (clientConnection !== newConnection){

        clientConnection.send(data)
      }
    })
  });
});