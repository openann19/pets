// Socket.io namespace for Local Pulse real-time pins
module.exports = function attachPulseNamespace(io) {
  const nsp = io.of('/pulse');

  nsp.on('connection', (socket) => {
    console.log('Pulse client connected', socket.id);

    // Client may join geo-grid room (e.g., "grid:37_122")
    socket.on('joinGrid', (gridId) => {
      socket.join(gridId);
    });

    socket.on('disconnect', () => {
      console.log('Pulse client disconnected', socket.id);
    });
  });

  // Helper to broadcast pin updates to specific grid
  function broadcastPin(gridId, pin) {
    nsp.to(gridId).emit('pin:update', pin);
  }

  return { broadcastPin };
};
