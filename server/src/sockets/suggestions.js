// Socket.io namespace for proactive chat suggestions
module.exports = function attachSuggestionNamespace(io) {
  const nsp = io.of('/suggestions');

  nsp.on('connection', (socket) => {
    console.log('Suggestions client connected', socket.id);

    socket.on('joinMatch', (matchId) => {
      socket.join(matchId);
    });

    socket.on('disconnect', () => {
      console.log('Suggestions client disconnected', socket.id);
    });
  });

  function pushSuggestion(matchId, suggestionEvent) {
    nsp.to(matchId).emit('suggestion', suggestionEvent);
  }

  return { pushSuggestion };
};
