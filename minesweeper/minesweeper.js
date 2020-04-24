'use strict'

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


class Cell {
    constructor(val) {
        this.value = val;
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
    placeMines(mines) { // 'x' indicates mine
        let minesLeft = mines;
        while (minesLeft) {
            for (let i = 0; i < this.board.length; i++) 
                for (let j = 0; j < this.board[i].length; j++) {
                    if (getRandomInt(15) === 5 && minesLeft && this.board[i][j] != 'x') {
                        this.board[i][j] = 'x';
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

                if (this.board[i][j] === 'x') continue;

                let minesFound = 0;

                /* Checking Corners */
                if (i === 0 && j === 0) {                               // top left corner
                    if (this.board[i][j + 1]     === 'x') minesFound++; // 1  
                    if (this.board[i + 1][j + 1] === 'x') minesFound++; // 2   C  1
                    if (this.board[i + 1][j]     === 'x') minesFound++; // 3   3  2       
                }
                else if (i === 0 && j === this.board[i].length - 1) {   // top right corner
                    if (this.board[i][j - 1]     === 'x') minesFound++; // 1
                    if (this.board[i + 1][j - 1] === 'x') minesFound++; // 2   1  C
                    if (this.board[i + 1][j]     === 'x') minesFound++; // 3   2  3           
                }
                else if (i === this.board.length - 1 && j === this.board[i].length - 1) { // bottom right corner
                    if (this.board[i - 1][j]     === 'x') minesFound++; // 1
                    if (this.board[i - 1][j - 1] === 'x') minesFound++; // 2   2  1 
                    if (this.board[i][j - 1]     === 'x') minesFound++; // 3   3  C  
                }
                else if (i === this.board.length - 1 && j === 0) { // bottom left corner
                    if (this.board[i - 1][j]     === 'x') minesFound++; // 1                  
                    if (this.board[i - 1][j + 1] === 'x') minesFound++; // 2   1  2
                    if (this.board[i][j + 1]     === 'x') minesFound++; // 3   C  3
                }
                
                /* Checking sides */
                else if (i === 0) {                                     // top of board
                    if (this.board[i][j - 1]     === 'x') minesFound++; // 1
                    if (this.board[i + 1][j - 1] === 'x') minesFound++; // 2   1  C  5
                    if (this.board[i + 1][j]     === 'x') minesFound++; // 3   2  3  4
                    if (this.board[i + 1][j + 1] === 'x') minesFound++; // 4    
                    if (this.board[i][j + 1]     === 'x') minesFound++; // 5  
                }
                else if (i === this.board.length - 1) {                 // bottom of board
                    if (this.board[i][j - 1]     === 'x') minesFound++; // 1
                    if (this.board[i - 1][j - 1] === 'x') minesFound++; // 2   2  3  4
                    if (this.board[i - 1][j]     === 'x') minesFound++; // 3   1  C  5
                    if (this.board[i - 1][j + 1] === 'x') minesFound++; // 4
                    if (this.board[i][j + 1]     === 'x') minesFound++; // 5
                }
                else if (j === 0) {                                     // left side of board
                    if (this.board[i - 1][j]     === 'x') minesFound++; // 1
                    if (this.board[i - 1][j + 1] === 'x') minesFound++; // 2   1  2
                    if (this.board[i][j + 1]     === 'x') minesFound++; // 3   C  3
                    if (this.board[i + 1][j + 1] === 'x') minesFound++; // 4   5  4
                    if (this.board[i + 1][j]     === 'x') minesFound++; // 5               
                }
                else if (j === this.board[i].length - 1) {              // right side of board
                    if (this.board[i - 1][j]     === 'x') minesFound++; // 1
                    if (this.board[i - 1][j - 1] === 'x') minesFound++; // 2   2  1
                    if (this.board[i][j - 1]     === 'x') minesFound++; // 3   3  C
                    if (this.board[i + 1][j - 1] === 'x') minesFound++; // 4   4  5
                    if (this.board[i + 1][j]     === 'x') minesFound++; // 5                    
                }

                /* Middle of board */
                else { 
                    if (this.board[i - 1][j]     === 'x') minesFound++; // 1
                    if (this.board[i - 1][j + 1] === 'x') minesFound++; // 2
                    if (this.board[i][j + 1]     === 'x') minesFound++; // 3   8  1  2
                    if (this.board[i + 1][j + 1] === 'x') minesFound++; // 4   7  C  3
                    if (this.board[i + 1][j]     === 'x') minesFound++; // 5   6  5  4
                    if (this.board[i + 1][j - 1] === 'x') minesFound++; // 6
                    if (this.board[i][j - 1]     === 'x') minesFound++; // 7
                    if (this.board[i - 1][j - 1] === 'x') minesFound++; // 8
                }

                this.board[i][j] = minesFound.toString();  

            }
        }
    }

    
    drawBoard(canvas, cellSize=50) {
        canvas.style = "background-color:lightgrey;border:1px solid black;";

        canvas.width = this.columns * cellSize;
        canvas.height = this.rows * cellSize;

        let ctx = canvas.getContext("2d");
              
        for (let y = 0; y <= canvas.height; y += cellSize) {
            for (let x = 0; x <= canvas.width; x += cellSize) {
                ctx.fillStyle = "#000000";
                ctx.rect(x , y , x + cellSize, y + cellSize);
                ctx.stroke();                    
            } 
        }
        
        // Please fix these ;(
        for (let y = 0, vert=0; y < this.rows; y++, vert+=cellSize) {
            for (let x = 0, horiz = 0; x < this.columns; x++, horiz+=cellSize) {
                ctx.font = "15px Arial"
                ctx.fillStyle = "#000000";
                ctx.fillText(this.board[y][x], horiz + 25, vert + 25);
            }
        }
    }
}

// Our canvas element
const canvas = document.getElementById('canvas');
let b1 = new Board(7, 7);

console.log(b1);
b1.drawBoard(canvas, 50);

canvas.addEventListener('click', event => {
    console.log(event.x, event.y);
})




