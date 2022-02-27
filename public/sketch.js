// TODO
// - Give up on camera lerp thing
// - Instead add camera zoom with scroll wheel
// - emit a socket event when player shoots to uno shoot
// - update health as part of socket update in player class
// - tell the server who weve hit when the bullet gets destroyed yeh
// - minigun is cool buts fucks up alot idk not a constant beam cus of something dw bout it tho
// - imma watch snathc cus ive got a headache :|

let state = "game";
let blockWidth = 50;
let player;
let player2;
let walls = [];
let socket;
let pings = [];

const MAP_WIDTH = 1080;
const MAP_HEIGHT = 720;

let data = undefined;

let oldCameraPos;

function setup() 
{
	createCanvas(innerWidth, innerHeight);
	player = new Player();
	player2 = new DummyPlayer(0, 0);
	colorMode(HSB);
	angleMode(DEGREES);
	textAlign(LEFT, TOP)
	// setInterval(() => {
	// 	player2.shoot(p5.Vector.random2D());
	// }, 1000/60);
	// walls.push(new Wall(0,0,MAP_WIDTH,blockWidth))
	// walls.push(new Wall(0,blockWidth,blockWidth,MAP_HEIGHT-blockWidth));
	// walls.push(new Wall(blockWidth, MAP_HEIGHT-blockWidth, MAP_WIDTH-blockWidth, blockWidth));
	// walls.push(new Wall(MAP_WIDTH-blockWidth, blockWidth, blockWidth, MAP_HEIGHT-blockWidth*2));
	
	walls.push(new Wall(MAP_WIDTH/4-blockWidth/2, MAP_HEIGHT/2-blockWidth*5, blockWidth, blockWidth*10))
	walls.push(new Wall(MAP_WIDTH/4-blockWidth/2, blockWidth, blockWidth, blockWidth*5))
	walls.push(new Wall(MAP_WIDTH/4-blockWidth/2, MAP_HEIGHT-blockWidth*6, blockWidth, blockWidth*5))
	walls.push(new Wall(MAP_WIDTH/4*3-blockWidth/2, blockWidth, blockWidth, blockWidth*5))
	walls.push(new Wall(MAP_WIDTH/4*3-blockWidth/2, MAP_HEIGHT-blockWidth*6, blockWidth, blockWidth*5))

	socket = io();
	socket.on("setPos", (pos) => {
		player.pos.set(pos[0],pos[1]);
		oldCameraPos = player.pos.copy();
	})
	socket.on("shootYoShot", (dir) => {
		player2.dir.set(dir[0], dir[1]);
		player2.shoot();
	})
	socket.on("ping", (payload) => {
		data = payload;
		let ping = Date.now()-data.timeSignature;
		if (pings.length < 10) pings.push(ping);
		else {
			pings.pop();
			pings.push(ping);
		}
		if (data.players.length === 2) {
			data.players.map((p) => {
				if (p.id !== socket.id) {
					player2.pos.set(p.pos[0], p.pos[1]);
					player2.health = p.health;
					if (player2.health <= 0) {
						player2.dead = true;
					}
					else {
						player2.dead = false;
					}
				}
				else {
					player.health = p.health;
					if (player.health <= 0) {
						location.reload();
					}
				}
			})
		}
	})
}

function windowResized() {
	resizeCanvas(windowWidth, innerHeight)
}

function draw()
{
	background(0);
	translate(width / 2, height / 2);
	translate(-player.pos.x, -player.pos.y);
	switch(state) {
		case "lobby":
			Lobby();
			break;
		case "game":
			walls.map((wall) => wall.show());
			player.update();
			player2.update();
			player.show();
			player2.show();
			push() 
			fill(0,0,100);
			stroke(0,0,100);
			textSize(30);
			let bulletCount = 0;
			bulletCount = player.bullets.length + player2.bullets.length;
			text(bulletCount + " bullet count",100,0);
			pop();
			break;
	}
	push() 
	fill(0,0,100);
	stroke(0,0,100);
	textSize(30);
	text(Math.floor(frameRate()) + " fps",0,0);
	let avgPing = 0
	pings.map((p) => avgPing+=p);
	avgPing /= pings.length;
	text(Math.floor(avgPing) + "ms", 300, 0)
	pop();
}

class Wall {
	constructor(x, y, w, h) {
		this.pos = createVector(x,y);
		this.w = w;
		this.h = h;
		this.color = [0,0,100];
	}

	show() {
		push();
		noStroke();
		fill(this.color);
		drawingContext.shadowBlur = 32;
		drawingContext.shadowColor = color(this.color);
		rect(this.pos.x, this.pos.y, this.w, this.h);
		pop();
	}
}