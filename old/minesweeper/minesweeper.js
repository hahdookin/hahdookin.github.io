// TODO:
// - Add pausing to stopwatch
//      - Trigger pausing on modal closing
// - Get rid of mines count
//      - Replace with amount of flags left dynamically
// - Add difficulty levels

'use strict'

import * as Utils from '../utils.js';

class Stopwatch {
    constructor(elem, interval) {
        this.interval = interval;
        this.timer = elem;
        this.total = 0;
        this.now = Date.now();
        this.sw;
        this.isRunning = false;
    }
    start() {
        this.isRunning = true;
        this.sw = setInterval(() => {
            let cur = Date.now();
            this.total = (cur - this.now);
            this.timer.innerHTML = (this.total/1000).toFixed(1);
        }, this.interval)
    }
    stop() {
        this.isRunning = false;
        clearInterval(this.sw);
    }
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
        this.flags = mines;

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
                    if (Utils.getRandomInt(15) === 1 && minesLeft && this.board[i][j] != 'X') {
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
    
}

/**
 * Sets disabled property to true on all button elements in the game div.
 * @param {HTMLDivElement} mainDiv Main div where game is occurring
 */
function disableAllButtons(mainDiv) {
    let thing = mainDiv.children[1].children;
    for (let i = 0; i < thing.length; i++) {
        for (let j = 0; j < thing[i].children.length; j++) {
            thing[i].children[j].disabled = true;
        }
    }
}

/**
 * 
 * @param {HTMLDivElement} mainDiv Main div where game is occurring
 */
function addResetButton(mainDiv) {
    const resetButton = document.createElement('button');
    resetButton.innerHTML = "New Game";
    resetButton.id = 'resetButton';
    resetButton.onclick = () => {
        mainDiv.removeChild(gameStopwatch);
        mainDiv.removeChild(gameDiv);
        mainDiv.removeChild(gameInfo);
        mainDiv.removeChild(resetButton);
        createGame(main);
    }
    mainDiv.appendChild(resetButton);
}



/**
 * Constructs the playing Minesweeper playing board.
 * 
 * Builds sub divs equal to the amount of rows in the board and buttons in each div equal to the amount of columns in the board.
 * @param {HTMLDivElement} mainDiv Main div where the game and elements will be placed
 * @param {Board} board A minesweeper board object
 */
function createGame(mainDiv, board) {
    // Building a board of buttons
    if (!board) board = new Board(10, 10);
    
    // Creating a stopwatch para, div, and info para
    let gSW = document.createElement('p');
    gSW.id = "gameStopwatch";
    gSW.innerHTML = "0.0"
    let gDiv = document.createElement('div');
    gDiv.id = 'gameDiv';
    let gInfo = document.createElement('p');
    gInfo.id = 'gameInfo';

    mainDiv.appendChild(gSW);
    mainDiv.appendChild(gDiv);
    mainDiv.appendChild(gInfo);

    const gameStopwatch = document.getElementById('gameStopwatch');
    const gameDiv = document.getElementById('gameDiv');
    const gameInfo = document.getElementById('gameInfo');

    let stopwatch;

    for (let row = 0; row < board.rows; row++) {
        let div = document.createElement('div');
        gameDiv.appendChild(div);
        for (let column = 0; column < board.columns; column++) {

            let button = document.createElement('button');
            
            button.row = row;
            button.column = column;

            // Initial look: Grey box, transparent text, monospace font
            button.innerHTML = "&nbsp;"
            button.style.color = "transparent";
            button.style.backgroundColor = "lightgrey";
            button.style.fontFamily = "monospace";
            button.onmouseenter = () => { button.style.backgroundColor = "Gainsboro"; }
            button.onmouseleave = () => { button.style.backgroundColor = "lightgrey"; }

            // User clicks on a cell
            button.onclick = () => { 
                if (button.disabled) return;
                if (button.flagged) return;
                
                if (!stopwatch) stopwatch = new Stopwatch(gameStopwatch, 10);
                if (!stopwatch.isRunning) stopwatch.start();

                // After clicked: White box, disabled, color text, displays what was chosen;
                button.style.removeProperty('color');
                button.style.backgroundColor = "white";
                button.disabled = true;
                button.innerHTML = board.board[row][column];

                // If user clicked a mine, user lost
                if (board.board[row][column] === 'X') {
                    stopwatch.stop();
                    disableAllButtons(mainDiv);
                    gameInfo.innerHTML = "You lost!";
                    addResetButton(mainDiv);
                    
                } 
    
                // Check if user won
                if (board.board[row][column] !== 'X') board.cellsClicked++;
                if (board.cellsClicked === board.totalCells - board.mines) {
                    stopwatch.stop();
                    disableAllButtons(mainDiv);
                    gameInfo.innerHTML = "You won!";
                    addResetButton(mainDiv);

                }
    
                // If user clicked a 0, open all other adjacent cells that arent a mine
                if (board.board[row][column] === '0') {
                    button.style.color = "transparent";
                    button.innerHTML = "&nbsp;"; // No need to show that the '0' on the cell
                    
                    let buttons = gameDiv.getElementsByTagName('button');

                    /* Checking Corners */
                    if (row === 0 && column === 0) {                                   // top left corner
                        if (board.board[row][column + 1] !== 'X')     buttons[row * board.rows + column + 1].click();
                        if (board.board[row + 1][column + 1] !== 'X') buttons[(row + 1) * board.rows + column + 1].click();
                        if (board.board[row + 1][column] !== 'X')     buttons[(row + 1) * board.rows + column].click();
                    }
                    else if (row === 0 && column === board.columns - 1) {              // top right corner
                        if (board.board[row][column - 1] !== 'X')     buttons[row * board.rows + column - 1].click();
                        if (board.board[row + 1][column - 1] !== 'X') buttons[(row + 1) * board.rows + column - 1].click();
                        if (board.board[row + 1][column] !== 'X')     buttons[(row + 1) * board.rows + column].click();
                    }
                    else if (row === board.rows - 1 && column === board.columns - 1) { // bottom right corner
                        if (board.board[row - 1][column] !== 'X')     buttons[(row - 1) * board.rows + column].click();
                        if (board.board[row - 1][column - 1] !== 'X') buttons[(row - 1) * board.rows + column - 1].click();
                        if (board.board[row][column - 1] !== 'X')     buttons[row * board.rows + column - 1].click();
                    }
                    else if (row === board.rows - 1 && column === 0) {                 // bottom left corner
                        if (board.board[row - 1][column] !== 'X')     buttons[(row - 1) * board.rows + column].click();
                        if (board.board[row - 1][column + 1] !== 'X') buttons[(row - 1) * board.rows + column + 1].click();
                        if (board.board[row][column + 1] !== 'X')     buttons[row * board.rows + column + 1].click();
                    }
                    
                    /* Checking sides */
                    else if (row === 0) {                                              // top of board
                        if (board.board[row][column - 1] !== 'X')     buttons[row * board.rows + column - 1].click();
                        if (board.board[row + 1][column - 1] !== 'X') buttons[(row + 1) * board.rows + column - 1].click();
                        if (board.board[row + 1][column] !== 'X')     buttons[(row + 1) * board.rows + column].click();
                        if (board.board[row + 1][column + 1] !== 'X') buttons[(row + 1) * board.rows + column + 1].click();
                        if (board.board[row][column + 1] !== 'X')     buttons[row * board.rows + column + 1].click();
                    }
                    else if (row === board.rows - 1) {                                 // bottom of board
                        if (board.board[row][column - 1] !== 'X')     buttons[row * board.rows + column - 1].click();
                        if (board.board[row - 1][column - 1] !== 'X') buttons[(row - 1) * board.rows + column - 1].click();
                        if (board.board[row - 1][column] !== 'X')     buttons[(row - 1) * board.rows + column].click();
                        if (board.board[row - 1][column + 1] !== 'X') buttons[(row - 1) * board.rows + column + 1].click();
                        if (board.board[row][column + 1] !== 'X')     buttons[row * board.rows + column + 1].click();
                    }
                    else if (column === 0) {                                           // left side of board
                        if (board.board[row - 1][column] !== 'X')     buttons[(row - 1) * board.rows + column].click();
                        if (board.board[row - 1][column + 1] !== 'X') buttons[(row - 1) * board.rows + column + 1].click();
                        if (board.board[row][column + 1] !== 'X')     buttons[row * board.rows + column + 1].click();
                        if (board.board[row + 1][column + 1] !== 'X') buttons[(row + 1) * board.rows + column + 1].click();
                        if (board.board[row + 1][column] !== 'X')     buttons[(row + 1) * board.rows + column].click();
                    }
                    else if (column === board.columns - 1) {                           // right side of board
                        if (board.board[row - 1][column] !== 'X')     buttons[(row - 1) * board.rows + column].click();
                        if (board.board[row - 1][column - 1] !== 'X') buttons[(row - 1) * board.rows + column - 1].click();
                        if (board.board[row][column - 1] !== 'X')     buttons[row * board.rows + column - 1].click();
                        if (board.board[row + 1][column - 1] !== 'X') buttons[(row + 1) * board.rows + column - 1].click();
                        if (board.board[row + 1][column] !== 'X')     buttons[(row + 1) * board.rows + column].click();
                    }

                    /* Middle of board */
                    else { 
                        // Cardinals
                        if (board.board[row][column + 1] !== 'X')     buttons[row * board.rows + column + 1].click();
                        if (board.board[row][column - 1] !== 'X')     buttons[row * board.rows + column - 1].click();
                        if (board.board[row + 1][column] !== 'X')     buttons[(row + 1) * board.rows + column].click();
                        if (board.board[row - 1][column] !== 'X')     buttons[(row - 1) * board.rows + column].click();

                        // Ordinals
                        if (board.board[row + 1][column + 1] !== 'X') buttons[(row + 1) * board.rows + column + 1].click();
                        if (board.board[row + 1][column - 1] !== 'X') buttons[(row + 1) * board.rows + column - 1].click();
                        if (board.board[row - 1][column + 1] !== 'X') buttons[(row - 1) * board.rows + column + 1].click();
                        if (board.board[row - 1][column - 1] !== 'X') buttons[(row - 1) * board.rows + column - 1].click();
                    }

                } 
                
            }
            
            // Empty -> F -> ? -> Empty
            button.onauxclick = () => {
                if (button.flagged) { // Sets Question Mark
                    button.style.removeProperty('color');
                    button.innerHTML = "?";
                    button.flagged = false;
                    button.questionable = true;
                } else if (button.questionable) { // Sets back to normal
                    button.style.color = "transparent";
                    button.innerHTML = "&nbsp;";
                    button.questionable = false;
                } else {  // Sets Flag
                    button.style.color = "red";
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

}

// Easy: 10X10 10 mines
// Medium: 15X15 25 mines
// Hard: 20X20 60 mines


const main = document.getElementById('main');
createGame(main);



