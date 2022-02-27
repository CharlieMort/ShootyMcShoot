class Player {
	constructor() {
		this.pos = createVector(MAP_WIDTH/8*7, MAP_HEIGHT/2);
		this.speed = 5;
		this.vel = createVector(0,0);
		this.color = [180,100,100];
		this.colorDir = 2;
		this.dir = createVector(0,0);
		this.bullets = [];
		this.gun = new Minigun(this);
		this.maxHealth = 100;
		this.health = this.maxHealth;
	}

	show() {
		this.bullets.map((bullet) => bullet.show());
		
		push();
		stroke(this.color)
		strokeWeight(5)
		this.color[0] += this.colorDir;
		if (this.color[0] >= 360 || this.color[0] <= 0) this.colorDir = -this.colorDir;
		fill(0);
		drawingContext.shadowBlur = 32;
		drawingContext.shadowColor = color(this.color);
		rect(this.pos.x-blockWidth/2, this.pos.y-blockWidth/2, blockWidth, blockWidth, blockWidth/8);
		pop();

		this.dir.set(mouseX-width/2, mouseY-height/2);
		push();
		fill(this.color);
		translate(this.pos.x, this.pos.y);
		this.dir.setMag(50);
		rotate(this.dir.heading());
		let arrowSize = 20;
		translate(this.dir.mag(), 0);
		triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
		pop();

		push();
		noStroke();
		fill(0,0,45);
		rect(this.pos.x-blockWidth, this.pos.y-2*blockWidth/2, 2*blockWidth, blockWidth/5, 10);
		if (this.health >= 50) fill(120,100,100);
		else if (this.health >= 15) fill(30,100,100);
		else fill(0,100,100);
		rect(this.pos.x-blockWidth, this.pos.y-2*blockWidth/2, (2*blockWidth)*(this.health/this.maxHealth), blockWidth/5, 10);
		pop();
	}

	update() {
		if (keyIsDown(87)) this.vel.set(this.vel.x, this.vel.y-1); // w
		if (keyIsDown(65)) this.vel.set(this.vel.x-1, this.vel.y); // a
		if (keyIsDown(83)) this.vel.set(this.vel.x, this.vel.y+1); // s
		if (keyIsDown(68)) this.vel.set(this.vel.x+1, this.vel.y); // d

		this.vel.normalize();
		this.vel.mult(this.speed);
        let newPos = this.pos.copy().add(this.vel);
        let overLappingWall = false;
        let touching = "";
        walls.map((wall) => {
            if (collideRectRect(newPos.x-blockWidth/2, newPos.y-blockWidth/2, blockWidth, blockWidth, wall.pos.x, wall.pos.y, wall.w, wall.h)) {
                overLappingWall = true;
                if (this.pos.y+blockWidth/2<=wall.pos.y) touching="top";
                else if (this.pos.y-blockWidth/2>=wall.pos.y+wall.h) touching="bottom";
                else if (this.pos.x+blockWidth/2<=wall.pos.x) touching="leftSide";
                else if (this.pos.x-blockWidth/2>=wall.pos.x) touching="rightSide";
            }
        })
        if (overLappingWall) {
            switch(touching) {
                case "bottom":
                case "top":
                    this.vel.set(this.vel.x, 0);
                    break;
                case "leftSide":
                case "rightSide":
                    this.vel.set(0, this.vel.y);
                    break;
            }
        }
        this.pos.add(this.vel);
		this.vel.set(0,0);

		this.gun.update();

		if (mouseIsPressed) {
			this.shoot();
		}

		this.bullets.map((bullet) => {
			bullet.update()
		});
		this.bullets.map((bullet,idx) => {
			if (bullet.timeAlive >= 10000) this.bullets.splice(idx, 1);
		});

        socket.emit("update", [this.pos.x, this.pos.y]);
	}

	shoot() {
		socket.emit("shoot", [this.dir.x, this.dir.y]);
		this.gun.shoot();
	}
}

class DummyPlayer {
	constructor(x, y) {
		this.pos = createVector(x,y);
		this.color = [Math.random()*360, 100, 100];
		this.gun = new Minigun(this);
		this.dir = createVector(0,0);
		this.bullets = [];
		this.maxHealth = 100;
		this.health = this.maxHealth;
		this.dead = false;
	}

	show() {
		if (this.dead) return;
		this.bullets.map((bullet) => bullet.show());
		push();
		stroke(this.color)
		strokeWeight(5)
		fill(0);
		drawingContext.shadowBlur = 32;
		drawingContext.shadowColor = color(this.color);
		rect(this.pos.x-blockWidth/2, this.pos.y-blockWidth/2, blockWidth, blockWidth, blockWidth/8);
		pop();

		push();
		fill(this.color);
		translate(this.pos.x, this.pos.y);
		this.dir.setMag(50);
		rotate(this.dir.heading());
		let arrowSize = 20;
		translate(this.dir.mag(), 0);
		triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
		pop();

		push();
		noStroke();
		fill(0,0,45);
		rect(this.pos.x-blockWidth, this.pos.y-2*blockWidth/2, 2*blockWidth, blockWidth/5, 10);
		if (this.health >= 50) fill(120,100,100);
		else if (this.health >= 15) fill(30,100,100);
		else fill(0,100,100);
		rect(this.pos.x-blockWidth, this.pos.y-2*blockWidth/2, (2*blockWidth)*(this.health/this.maxHealth), blockWidth/5, 10);
		pop();
	}

	update() {
		if (this.health <= 0) {
			this.dead = true;
			return;
		}
		this.gun.update();

		this.bullets.map((bullet) => {
			bullet.update()
		});
		this.bullets.map((bullet,idx) => {
			if (bullet.timeAlive >= 10000) this.bullets.splice(idx, 1);
		})
	}
	

	shoot() {
		this.gun.shoot();
	}
}