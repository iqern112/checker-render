const socket = io();
const boardElement = document.getElementById('board');

let board = [];
let isMyTurn = false;
let playerColor;

socket.on('startGame', (data) => {
    board = data.board;
    playerColor = data.players[0] === socket.id ? 'r' : 'b';
    isMyTurn = playerColor === 'r';
    renderBoard();
});

socket.on('moveMade', (data) => {
    board = data.board;
    isMyTurn = !isMyTurn;
    renderBoard();
});

socket.on('opponentDisconnected', () => {
    alert('Your opponent has disconnected.');
});

function joinGame() {
    socket.emit('joinGame');
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add((row + col) % 2 === 0 ? 'black' : 'red');

            const piece = board[row][col];
            if (piece !== ' ') {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece', piece);
                cell.appendChild(pieceElement);
            }

            cell.addEventListener('click', () => handleCellClick(row, col));
            boardElement.appendChild(cell);
        }
    }
}

function handleCellClick(row, col) {
    if (!isMyTurn || board[row][col] === ' ' || board[row][col] !== playerColor) {
        return;
    }

    const newBoard = JSON.parse(JSON.stringify(board)); // Deep copy the board
    newBoard[row][col] = ' ';
    newBoard[row + (playerColor === 'r' ? 1 : -1)][col + 1] = playerColor;

    socket.emit('makeMove', { board: newBoard });
}

joinGame();
