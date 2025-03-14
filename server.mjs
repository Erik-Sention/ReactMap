import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  const io = new Server(server);

  // Store active users and their editing status
  const activeEdits = new Map();

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle cell editing
    socket.on('startEditing', ({ itemId, userId }) => {
      // Lock the item for editing
      activeEdits.set(itemId, {
        userId,
        socketId: socket.id,
        timestamp: Date.now()
      });
      
      // Broadcast to all other users that this item is being edited
      socket.broadcast.emit('itemLocked', { 
        itemId, 
        userId,
        lockedUntil: Date.now() + 30000 // Lock for 30 seconds
      });
    });

    socket.on('finishEditing', ({ itemId, text }) => {
      // Remove the lock
      activeEdits.delete(itemId);
      
      // Broadcast the updated text to all clients
      io.emit('itemUpdated', { itemId, text });
    });

    socket.on('cancelEditing', ({ itemId }) => {
      // Remove the lock
      activeEdits.delete(itemId);
      
      // Broadcast that the item is no longer being edited
      socket.broadcast.emit('itemUnlocked', { itemId });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Find and remove any locks held by this socket
      for (const [itemId, edit] of activeEdits.entries()) {
        if (edit.socketId === socket.id) {
          activeEdits.delete(itemId);
          io.emit('itemUnlocked', { itemId });
        }
      }
    });
  });

  // Clean up expired locks every minute
  setInterval(() => {
    const now = Date.now();
    for (const [itemId, edit] of activeEdits.entries()) {
      // If lock is older than 30 seconds, remove it
      if (now - edit.timestamp > 30000) {
        activeEdits.delete(itemId);
        io.emit('itemUnlocked', { itemId });
      }
    }
  }, 60000);

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
}); 