class Bullet {
	constructor(daddy, id, pos, dir, speed) {
		this.daddy = daddy;
		this.id = id;
		this.pos = pos;
		this.dir = dir.mult(speed);
		this.speed = speed;
		this.timeAlive = 0;
	}

	update() {
		this.timeAlive += deltaTime;
		this.pos.add(this.dir);
		if (this.daddy.daddy !== player2) {
			if (collideRectCircle(player2.pos.x-blockWidth/2, player2.pos.y-blockWidth/2, blockWidth, blockWidth, this.pos.x, this.pos.y, 20) && !player2.dead) {
				this.daddy.daddy.bullets.splice(this.daddy.daddy.bullets.indexOf(this), 1);
				socket.emit("dealDamage", this.daddy.dmg);
			}
		}
		else {
			if (collideRectCircle(player.pos.x-blockWidth/2, player.pos.y-blockWidth/2, blockWidth, blockWidth, this.pos.x, this.pos.y, 20) && !player2.dead) {
				this.daddy.daddy.bullets.splice(this.daddy.daddy.bullets.indexOf(this), 1);
			}
		}
		walls.map((wall) => {
			if (collideRectCircle(wall.pos.x, wall.pos.y, wall.w, wall.h, this.pos.x, this.pos.y, 20)) {
				this.daddy.daddy.bullets.splice(this.daddy.daddy.bullets.indexOf(this), 1);
			}
		})
	}

	show () {
		fill(0,0,100);
		noStroke();
		ellipse(this.pos.x, this.pos.y, 20);
	}
}

class Laser extends Bullet {
	constructor(daddy,id, pos, dir, speed) {
		super(daddy,id, pos, dir, speed);
	}
	
	show() {
		push();
		fill(0,100,100)
		noStroke();
		drawingContext.shadowBlur = 32;
		drawingContext.shadowColor = color(0,100,100);
		translate(this.pos.x, this.pos.y);
		rotate(this.dir.heading());
		rect(0,0,50,5);
		rect(0,0,50,5);
		rect(0,0,50,5);
		rect(0,0,50,5);
		pop();
	}
}