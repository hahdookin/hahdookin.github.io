'use strict'

import * as Utils from '../utils.js';

const $ = id => { return document.getElementById(id); }

/**
 * @enum {Number} Codes of keys.
 */
const KEY = {
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SHIFT: 16,
    SPACE: 32,
    CTRL: 17,
    Q: 81,
    E: 69,
    F: 70,
    R: 82
}

// 24x32
const map = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,3,0,3,0,0,0,1,1,2,1,1,1,1,1,2,1,1,1,2,1,0,0,0,0,0,0,0,0,1],
	[1,0,0,3,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1,1,1,1,1],
	[1,0,0,3,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,3,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
	[1,0,0,3,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
	[1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,3,1,1,1,1,1],
	[1,0,0,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,4,0,0,4,2,0,2,2,2,2,2,2,2,2,0,2,4,4,0,0,4,0,0,0,0,0,0,0,1],
	[1,0,0,4,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,4,0,0,0,0,0,0,0,1],
	[1,0,0,4,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,4,0,0,0,0,0,0,0,1],
	[1,0,0,4,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,4,0,0,0,0,0,0,0,1],
	[1,0,0,4,3,3,4,2,2,2,2,2,2,2,2,2,2,2,2,2,4,3,3,4,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const twoPI = Math.PI * 2;

let mapWidth = 0;
let mapHeight = 0;
const miniMapScale = 8;

const screenWidth = 320;
const stripWidth = 4;
const fov = 60 * Math.PI / 180;

const numRays = Math.ceil(screenWidth / stripWidth);
const fovHalf = fov / 2;

const viewDist = (screenWidth/2) / Math.tan((fov / 2));

function init() {
    mapWidth = map[0].length;
    mapHeight = map.length;

    bindKeys();

    drawMiniMap();

    gameCycle();
}

function bindKeys() {
    document.onkeydown = function(e) {
        e = e || window.event;
        if (e.keyCode === 87) player.speed = 1;  // w
        if (e.keyCode === 83) player.speed = -1; // s
        if (e.keyCode === 68) player.dir = 1;    // a
        if (e.keyCode === 65) player.dir = -1;   // d
    }
    document.onkeyup = function(e) {
        e = e || window.event;
        if (e.keyCode === 87 || e.keyCode === 83) player.speed = 0;
        if (e.keyCode === 68 || e.keyCode === 65) player.dir = 0;
    }
}

function drawMiniMap() {
    const miniMap = $('minimap');
    const miniMapCtr = $('minimapcontainer');
    const miniMapObjects = $('minimapobjects');

    miniMap.width = mapWidth * miniMapScale;
    miniMap.height = mapHeight * miniMapScale;
    miniMapObjects.width = miniMap.width;
    miniMapObjects.height = miniMap.height;

    let w = (mapWidth * miniMapScale) + 'px';
    let h = (mapHeight * miniMapScale) + 'px';
    miniMap.style.width = miniMapObjects.style.width = miniMapCtr.style.width = w;
    miniMap.style.height = miniMapObjects.style.height = miniMapCtr.style.height = h;

    let ctx = miniMap.getContext('2d');

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            let wall = map[y][x];
            if (wall > 0) {
                ctx.fillStyle = 'rgb(200,200,200)';
                ctx.fillRect(x * miniMapScale, y * miniMapScale, miniMapScale, miniMapScale);
            }
        }
    }
    updateMiniMap();
}

function updateMiniMap() {
    let miniMap = $('minimap');
    let miniMapObjects = $('minimapobjects');

    let ctx = miniMapObjects.getContext('2d');
    ctx.clearRect(0,0,miniMap.width, miniMap.height);

    ctx.fillRect(player.x * miniMapScale - 2, player.y * miniMapScale - 2, 4, 4);

    ctx.beginPath();
    ctx.moveTo(player.x * miniMapScale, player.y * miniMapScale);
    ctx.lineTo(
        (player.x + Math.cos(player.rot) * 4) * miniMapScale,
        (player.y + Math.sin(player.rot) * 4) * miniMapScale
    );
    ctx.closePath();
    ctx.stroke();

}


const player = {
    x: 16,
    y: 10,
    dir: 0,
    rot: 0,
    speed: 0,
    moveSpeed: .18,
    rotSpeed: 6 * Math.PI / 180
}

function isBlocking(x, y) {
    if (y < 0 || y >= mapHeight || x < 0 || x >= mapWidth) return true;
    return (map[Math.floor(y)][Math.floor(x)] !== 0);
}

function move() {
    let moveStep = player.speed * player.moveSpeed;

    player.rot += player.dir * player.rotSpeed;

    while (player.rot < 0) player.rot += twoPI;
    while (player.rot >= twoPI) player.rot -= twoPI;

    let newX = player.x + Math.cos(player.rot) * moveStep;
    let newY = player.y + Math.sin(player.rot) * moveStep;

    if (isBlocking(newX, newY)) return;

    player.x = newX;
    player.y = newY;
}

function castSingleRay(rayAngle, stripIdx) {

	// first make sure the angle is between 0 and 360 degrees
	rayAngle %= twoPI;
	if (rayAngle < 0) rayAngle += twoPI;

	// moving right/left? up/down? Determined by which quadrant the angle is in.
	var right = (rayAngle > twoPI * 0.75 || rayAngle < twoPI * 0.25);
	var up = (rayAngle < 0 || rayAngle > Math.PI);

	// only do these once
	var angleSin = Math.sin(rayAngle);
	var angleCos = Math.cos(rayAngle);

	
	var dist = 0;	// the distance to the block we hit
	var xHit = 0; 	// the x and y coord of where the ray hit the block
	var yHit = 0;

	var textureX;	// the x-coord on the texture of the block, ie. what part of the texture are we going to render
	var wallX;	// the (x,y) map coords of the block
	var wallY;


	// first check against the vertical map/wall lines
	// we do this by moving to the right or left edge of the block we're standing in
	// and then moving in 1 map unit steps horizontally. The amount we have to move vertically
	// is determined by the slope of the ray, which is simply defined as sin(angle) / cos(angle).

	var slope = angleSin / angleCos; 	// the slope of the straight line made by the ray
	var dX = right ? 1 : -1; 	// we move either 1 map unit to the left or right
	var dY = dX * slope; 		// how much to move up or down

	var x = right ? Math.ceil(player.x) : Math.floor(player.x);	// starting horizontal position, at one of the edges of the current map block
	var y = player.y + (x - player.x) * slope;			// starting vertical position. We add the small horizontal step we just made, multiplied by the slope.

	while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
		var wallX = Math.floor(x + (right ? 0 : -1));
		var wallY = Math.floor(y);

		// is this point inside a wall block?
		if (map[wallY][wallX] > 0) {

			var distX = x - player.x;
			var distY = y - player.y;
			dist = distX*distX + distY*distY;	// the distance from the player to this point, squared.

			textureX = y % 1;	// where exactly are we on the wall? textureX is the x coordinate on the texture that we'll use when texturing the wall.
			if (!right) textureX = 1 - textureX; // if we're looking to the left side of the map, the texture should be reversed

			xHit = x;	// save the coordinates of the hit. We only really use these to draw the rays on minimap.
			yHit = y;

			break;
		}
		x += dX;
		y += dY;
	}



	// now check against horizontal lines. It's basically the same, just "turned around".
	// the only difference here is that once we hit a map block, 
	// we check if there we also found one in the earlier, vertical run. We'll know that if dist != 0.
	// If so, we only register this hit if this distance is smaller.

	var slope = angleCos / angleSin;
	var dY = up ? -1 : 1;
	var dX = dY * slope;
	var y = up ? Math.floor(player.y) : Math.ceil(player.y);
	var x = player.x + (y - player.y) * slope;

	while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
		var wallY = Math.floor(y + (up ? -1 : 0));
		var wallX = Math.floor(x);
		if (map[wallY][wallX] > 0) {
			var distX = x - player.x;
			var distY = y - player.y;
			var blockDist = distX*distX + distY*distY;
			if (!dist || blockDist < dist) {
				dist = blockDist;
				xHit = x;
				yHit = y;
				textureX = x % 1;
				if (up) textureX = 1 - textureX;
			}
			break;
		}
		x += dX;
		y += dY;
	}

	if (dist) {
		drawRay(xHit, yHit);
	}

}

function drawRay(rayX, rayY) {
	var miniMapObjects = $("minimapobjects");
	var objectCtx = miniMapObjects.getContext("2d");

	objectCtx.strokeStyle = "rgba(0,100,0,0.3)";
	objectCtx.lineWidth = 0.5;
	objectCtx.beginPath();
	objectCtx.moveTo(player.x * miniMapScale, player.y * miniMapScale);
	objectCtx.lineTo(
		rayX * miniMapScale,
		rayY * miniMapScale
	);
	objectCtx.closePath();
	objectCtx.stroke();
}


function castRays() {
    let stripIdx = 0;
    for (let i = 0; i < numRays; i++) {
        let rayScreenPos = (-numRays/2 + i) * stripWidth;

        let rayViewDist = Math.sqrt(rayScreenPos * rayScreenPos + viewDist * viewDist);

        let rayAngle = Math.asin(rayScreenPos / rayViewDist);

        castSingleRay(player.rot + rayAngle, stripIdx++);
    }
}

function gameCycle() {
    
    move();
    updateMiniMap();
    setTimeout(gameCycle, 1000/30);
}

setTimeout(init, 1);