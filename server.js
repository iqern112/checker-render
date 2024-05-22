const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let players = {};
let games = {};

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('joinGame', () => {
        let room = 'room' + Math.floor(Object.keys(players).length / 2);
        socket.join(room);
        players[socket.id] = room;
        
        if (!games[room]) {
            games[room] = { players: [], board: initialBoard() };
        }
        games[room].players.push(socket.id);
        
        if (games[room].players.length === 2) {
            io.to(room).emit('startGame', { board: games[room].board, players: games[room].players });
        }
    });

    socket.on('makeMove', (data) => {
        const room = players[socket.id];
        if (room && games[room]) {
            games[room].board = data.board;
            socket.to(room).emit('moveMade', data);
        }
    });

    socket.on('disconnect', () => {
        const room = players[socket.id];
        if (room) {
            delete players[socket.id];
            socket.to(room).emit('opponentDisconnected');
            games[room] = { players: games[room].players.filter(id => id !== socket.id), board: initialBoard() };
        }
        console.log('user disconnected:', socket.id);
    });
});

function initialBoard() {
    return [
        ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
        [' ', 'b', ' ', 'b', ' ', 'b', ' ', 'b'],
        ['b', ' ', 'b', ' ', 'b', ' ', 'b', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', 'r', ' ', 'r', ' ', 'r', ' ', 'r'],
        ['r', ' ', 'r', ' ', 'r', ' ', 'r', ' '],
        [' ', 'r', ' ', 'r', ' ', 'r', ' ', 'r']
    ];
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`listening on *:${port}`);
});
