'use strict'

import * as Utils from '../utils.js';

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function between(x, min, max) {
    return x >= min && x <= max;
}

// board[row][column]
class Board {

    /**
     * Constructs a Minesweeper board.
     * @param {Number} rows     Rows of board
     * @param {Number} columns  Columns of board
     * @param {Number} mines    Amount of mines on board
     */
    constructor(rows, columns, mines=Math.max(rows, columns)) {
        if (!rows || !columns) return;

        this.cellsClicked = 0;
        this.board = [];
        this.totalCells = rows * columns;
        this.rows = rows;
        this.columns = columns;

        if (mines > this.totalCells) mines = this.totalCells;
        this.mines = mines;

        for (let i = 0; i < rows; i++) {
            this.board[i] = new Array(columns);
        }

        this.placeMines(mines); // Could improve randomness
        this.fillCells(); 
    }

    /**
     * Fills board with mines randomly.
     * @param {Number} mines - Amount of mines to be placed
     */
    placeMines(mines) { // 'X' indicates mine
        let minesLeft = mines;
        while (minesLeft) {
            for (let i = 0; i < this.board.length; i++) 
                for (let j = 0; j < this.board[i].length; j++) {
                    if (getRandomInt(15) === 1 && minesLeft && this.board[i][j] != 'X') {
                        this.board[i][j] = 'X';
                        minesLeft--;
                    }
                }
        }
        
    }
    
    /**
     * Fills empty spots of board with cells with corresponding mine values.
     */
    fillCells() {
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {

                if (this.board[i][j] === 'X') continue;

                let minesFound = 0;

                /* Checking Corners */
                if (i === 0 && j === 0) {                               // top left corner
                    if (this.board[i][j + 1]     === 'X') minesFound++; // 1  
                    if (this.board[i + 1][j + 1] === 'X') minesFound++; // 2   C  1
                    if (this.board[i + 1][j]     === 'X') minesFound++; // 3   3  2       
                }
                else if (i === 0 && j === this.board[i].length - 1) {   // top right corner
                    if (this.board[i][j - 1]     === 'X') minesFound++; // 1
                    if (this.board[i + 1][j - 1] === 'X') minesFound++; // 2   1  C
                    if (this.board[i + 1][j]     === 'X') minesFound++; // 3   2  3           
                }
                else if (i === this.board.length - 1 && j === this.board[i].length - 1) { // bottom right corner
                    if (this.board[i - 1][j]     === 'X') minesFound++; // 1
                    if (this.board[i - 1][j - 1] === 'X') minesFound++; // 2   2  1 
                    if (this.board[i][j - 1]     === 'X') minesFound++; // 3   3  C  
                }
                else if (i === this.board.length - 1 && j === 0) {      // bottom left corner
                    if (this.board[i - 1][j]     === 'X') minesFound++; // 1                  
                    if (this.board[i - 1][j + 1] === 'X') minesFound++; // 2   1  2
                    if (this.board[i][j + 1]     === 'X') minesFound++; // 3   C  3
                }
                
                /* Checking sides */
                else if (i === 0) {                                     // top of board
                    if (this.board[i][j - 1]     === 'X') minesFound++; // 1
                    if (this.board[i + 1][j - 1] === 'X') minesFound++; // 2   1  C  5
                    if (this.board[i + 1][j]     === 'X') minesFound++; // 3   2  3  4
                    if (this.board[i + 1][j + 1] === 'X') minesFound++; // 4    
                    if (this.board[i][j + 1]     === 'X') minesFound++; // 5  
                }
                else if (i === this.board.length - 1) {                 // bottom of board
                    if (this.board[i][j - 1]     === 'X') minesFound++; // 1
                    if (this.board[i - 1][j - 1] === 'X') minesFound++; // 2   2  3  4
                    if (this.board[i - 1][j]     === 'X') minesFound++; // 3   1  C  5
                    if (this.board[i - 1][j + 1] === 'X') minesFound++; // 4
                    if (this.board[i][j + 1]     === 'X') minesFound++; // 5
                }
                else if (j === 0) {                                     // left side of board
                    if (this.board[i - 1][j]     === 'X') minesFound++; // 1
                    if (this.board[i - 1][j + 1] === 'X') minesFound++; // 2   1  2
                    if (this.board[i][j + 1]     === 'X') minesFound++; // 3   C  3
                    if (this.board[i + 1][j + 1] === 'X') minesFound++; // 4   5  4
                    if (this.board[i + 1][j]     === 'X') minesFound++; // 5               
                }
                else if (j === this.board[i].length - 1) {              // right side of board
                    if (this.board[i - 1][j]     === 'X') minesFound++; // 1
                    if (this.board[i - 1][j - 1] === 'X') minesFound++; // 2   2  1
                    if (this.board[i][j - 1]     === 'X') minesFound++; // 3   3  C
                    if (this.board[i + 1][j - 1] === 'X') minesFound++; // 4   4  5
                    if (this.board[i + 1][j]     === 'X') minesFound++; // 5                    
                }

                /* Middle of board */
                else { 
                    if (this.board[i - 1][j]     === 'X') minesFound++; // 1
                    if (this.board[i - 1][j + 1] === 'X') minesFound++; // 2
                    if (this.board[i][j + 1]     === 'X') minesFound++; // 3   8  1  2
                    if (this.board[i + 1][j + 1] === 'X') minesFound++; // 4   7  C  3
                    if (this.board[i + 1][j]     === 'X') minesFound++; // 5   6  5  4
                    if (this.board[i + 1][j - 1] === 'X') minesFound++; // 6
                    if (this.board[i][j - 1]     === 'X') minesFound++; // 7
                    if (this.board[i - 1][j - 1] === 'X') minesFound++; // 8
                }

                this.board[i][j] = minesFound.toString();  
            }
        }
    }

    openMany(row, column) {
        if (row) {};
    }
}

// Temp function
async function loss() {
    await Utils.sleep(100);
    
    
    alert('You lost!');
    await Utils.sleep(500);
    return true;
}

const main = document.getElementById('main');

function createGame() {
    // Building a board of buttons
    
    // Creating a div and info para
    let gDiv = document.createElement('div');
    gDiv.id = 'gameDiv';
    let gInfo = document.createElement('p');
    gInfo.id = 'gameInfo';

    main.appendChild(gDiv);
    main.appendChild(gInfo);

    const gameDiv = document.getElementById('gameDiv');
    const gameInfo = document.getElementById('gameInfo');

    // Our board object
    const board = new Board(getRandomInt(5) + 3, getRandomInt(5) + 3);

    for (let row = 0; row < board.rows; row++) {
        let div = document.createElement('div');
        gameDiv.appendChild(div);
        for (let column = 0; column < board.columns; column++) {
            let button = document.createElement('button');
            button.innerHTML = "&nbsp;"
    
            button.style = "color: transparent; background-color: lightgrey;font-family:monospace;";
    
            // User clicks on a cell
            button.onclick = () => { 
                if (button.flagged) return;
    
                board.cellsClicked++;
    
                // If user clicked a mine, user lost
                if (board.board[row][column] === 'X') {
                    button.innerHTML = board.board[row][column];
                    loss();
                    main.removeChild(gameDiv);
                    main.removeChild(gameInfo);
                    createGame();
                } 
    
                // Check if user won
                if (board.cellsClicked === board.totalCells - board.mines) console.log("You won!");
    
                button.style = "background-color:white;font-family:monospace;";
                button.disabled = true;
                button.innerHTML = board.board[row][column];
    
                //console.log(row, column);
    
                // If user clicked a 0, open all other adjacent cells that arent a mine
                if (board.board[row][column] === '0') {
                    console.log("ZERO");
                    // openMany();
                } 
    
            }
    
            // Empty -> F -> ? -> Empty
            button.onauxclick = () => {
                if (button.flagged) { // Sets Question Mark
                    button.style = "background-color:lightgrey;font-family:monospace;"
                    button.innerHTML = "?";
                    button.flagged = false;
                    button.questionable = true;
                } else if (button.questionable) { // Sets back to normal
                    button.style = "color: transparent; background-color: lightgrey;font-family:monospace;";
                    button.innerHTML = "&nbsp;";
                    button.questionable = false;
                } else {  // Sets Flag
                    button.style = "background-color:lightgrey;font-family:monospace;color:red";
                    button.innerHTML = "F";
                    button.flagged = true;
                }
                
            }
    
            // Disable context menu on buttons
            button.addEventListener('contextmenu', event => { event.preventDefault(); }, false);
    
            div.appendChild(button);
            
        }
    }
    gameInfo.innerHTML = "Mines: " + board.mines;

    // Pressing 'r' resets the game
    document.addEventListener('keypress', event => {
        if (event.key === 'r') {
            main.removeChild(gameDiv);
            main.removeChild(gameInfo);
            createGame();
        }
    }, false)

    console.log(document.childNodes);
}


createGame();
