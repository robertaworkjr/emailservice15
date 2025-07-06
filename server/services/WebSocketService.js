import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // sessionId -> WebSocket connection
  }

  initialize(server) {
    this.wss = new WebSocketServer({ server });
    
    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection established');
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      ws.on('close', () => {
        // Remove client from active connections
        for (const [sessionId, client] of this.clients.entries()) {
          if (client === ws) {
            this.clients.delete(sessionId);
            console.log(`WebSocket client disconnected: ${sessionId}`);
            break;
          }
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    console.log('WebSocket service initialized');
  }

  handleMessage(ws, message) {
    switch (message.type) {
      case 'register':
        if (message.sessionId) {
          this.clients.set(message.sessionId, ws);
          console.log(`Client registered with session: ${message.sessionId}`);
          ws.send(JSON.stringify({
            type: 'registered',
            sessionId: message.sessionId
          }));
        }
        break;
        
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  notifyClient(sessionId, data) {
    const client = this.clients.get(sessionId);
    if (client && client.readyState === client.OPEN) {
      try {
        client.send(JSON.stringify(data));
        console.log(`Notification sent to session ${sessionId}`);
      } catch (error) {
        console.error('Error sending notification:', error);
        this.clients.delete(sessionId);
      }
    }
  }

  broadcast(data) {
    this.clients.forEach((client, sessionId) => {
      if (client.readyState === client.OPEN) {
        try {
          client.send(JSON.stringify(data));
        } catch (error) {
          console.error(`Error broadcasting to ${sessionId}:`, error);
          this.clients.delete(sessionId);
        }
      }
    });
  }
}

export default new WebSocketService();