'use strict'

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function between(x, min, max) {
    return x >= min && x <= max;
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

        //this.locations = {};
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
    
    
    // NO GOOD
    // drawBoard(canvas, cellSize=50) {
    //     canvas.style = "background-color:lightgrey;border:1px solid black";

    //     canvas.width = this.columns * cellSize;
    //     canvas.height = this.rows * cellSize;

    //     let ctx = canvas.getContext("2d");
        
    //     // Draws the grey rectangles
    //     for (let y = 0; y <= canvas.height; y += cellSize) {
    //         for (let x = 0; x <= canvas.width; x += cellSize) {
    //             ctx.fillStyle = "#000000";
    //             ctx.rect(x , y , x + cellSize, y + cellSize);
    //             ctx.stroke();              
    //         } 
    //     }
        
    //     // Please fix these ;(
    //     let counter = 0;
    //     for (let y = 0, vert=0; y < this.rows; y++, vert+=cellSize) {
    //         for (let x = 0, horiz = 0; x < this.columns; x++, horiz+=cellSize) {
                
    //             this.locations[counter] = {
    //                 "val": this.board[y][x],
    //                 "x": horiz + 10,
    //                 "y": vert + 10,
    //                 "xmax": horiz + cellSize + 10,
    //                 "ymax": vert + cellSize + 10,
    //                 "visible": false,
    //                 "alreadyFound": false
    //             }

    //             counter++;
    //         }
    //     }
    //     console.log(this.locations);
    // }

    // openMultiple() {

    // }

    // // Need to show multiple if cells are 0 or a value recursively.
    // showHidden(canvas, cellSize=50) {
    //     let ctx = canvas.getContext("2d");
    //     let counter = 0;
    //     for (let y = 0, vert=0; y < this.rows; y++, vert+=cellSize) {
    //         for (let x = 0, horiz = 0; x < this.columns; x++, horiz+=cellSize) {
    //             if (this.locations[counter]["visible"] && !this.locations[counter]["alreadyFound"]) {
                    
    //                 // Draws text of value on screen
    //                 ctx.font = `${cellSize * 0.3}px Arial`
    //                 ctx.fillStyle = "#000000";
    //                 ctx.fillText(this.board[y][x], horiz + cellSize/2, vert + cellSize/2);

    //                 if (this.locations[counter]["val"] === 'X') window.alert("You lose!");

    //                 // Only draw string once
    //                 this.locations[counter]["alreadyFound"] = true;
    //             }

    //             counter++
    //         }
    //     }
    // }

}

// function createGame(canvas, p, rows, columns, cellSize) {
    
    
//     // let rows = Number(window.prompt("Rows?"));
//     // let columns = Number(window.prompt("Columns?"));
    
//     if (!(rows || columns)) return;

//     let b1 = new Board(rows, columns);
//     p.innerHTML = "Mines: " + b1.mines;
    
//     console.log(b1);
    
//     b1.drawBoard(canvas, cellSize);
    
//     canvas.addEventListener('click', event => {
        
//         for (let key in b1.locations) {
//             if ( // mouse click is in a cell's range
//                 between(event.x, b1.locations[key]["x"], b1.locations[key]["xmax"]) && 
//                 between(event.y, b1.locations[key]["y"], b1.locations[key]["ymax"])
//                 ) {
//                 b1.locations[key]["visible"] = true; // show cell
//                 // if val is 0, call method to show others
//                 b1.showHidden(canvas, cellSize);
                                     
//                 break;
//             }
//         }
//     })
//     window.addEventListener('keypress', event => {
//         if (event.key === 'r') {
//             b1.locations = {};
//             b1.mines = 0;
//             b1.board = [];
//             createGame(canvas, gameInfo, 5, 5, 75);
//         }
//     })
// }


// const gameInfo = document.getElementById('res')
// const canvas = document.getElementById('canvas');
// createGame(canvas, gameInfo, 5, 5, 75)


const board = new Board(10, 6);
console.log(board);

// Building a board of buttons
const mainDiv = document.getElementById('new');
for (let row = 0; row < board.rows; row++) {
    let div = document.createElement('div');
    mainDiv.appendChild(div);
    for (let column = 0; column < board.columns; column++) {
        let button = document.createElement('button');
        button.innerHTML = "&nbsp;"

        button.style = "color: transparent; background-color: lightgrey;font-family:monospace;";

        // User clicks on a cell
        button.onclick = event => { 
            button.style = "background-color:white;disabled:true;font-family:monospace;";
            button.innerHTML = board.board[row][column];
            console.log(row, column);

            // If user clicked a 0, open all other adjacent cells that arent a mine
            if (board.board[row][column] === '0') {
                console.log("ZERO");
                // openMany();
            } 

            // If user clicked a mine, user lost
            if (board.board[row][column] === 'X') {
                console.log("MINE");
                // Show game stats, other things
            } 
        }

        div.appendChild(button);
        
    }
}











