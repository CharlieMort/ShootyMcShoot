class Gun{
	constructor(daddy, dmg, fireRate, bulletSpeed, type, amount, spreadAngle, burstAmount, burstTime) {
		this.daddy = daddy;
		this.dmg = dmg;
		this.fireRate = fireRate;
		this.type = type;
		this.amount = amount;
		this.spreadAngle = spreadAngle;
		this.bulletSpeed = bulletSpeed;
		this.shotCooldown = 0;
		this.burstAmount = burstAmount;
		this.burstTime = burstTime;
	}

	spawnBullet() {
		let midDir = this.daddy.dir.copy().setMag(1);
		let leftDir = midDir.rotate(-this.spreadAngle*Math.floor(this.amount/2));
		for (let i = 0; i<this.amount; i++) {
			let dir = leftDir.copy().rotate(this.spreadAngle*i);
			switch(this.type) {
				case "bullet":
					this.daddy.bullets.push(new Bullet(this, this.daddy.bullets.length, this.daddy.pos.copy(), dir.copy(), this.bulletSpeed));
					break;
				case "laser":
					this.daddy.bullets.push(new Laser(this, this.daddy.bullets.length, this.daddy.pos.copy(), dir.copy(), this.bulletSpeed));
					break;
			}
		}
	}

	shoot() {
		if (this.shotCooldown <= 0) {
			this.spawnBullet();
			this.shotCooldown = this.fireRate;
			if (this.burstAmount) {
				for (let i = 0; i<this.burstAmount; i++) {
					setTimeout(() => this.spawnBullet(), i*this.burstTime);
				}
			}
		}
	}

	update() {
		this.shotCooldown -= deltaTime;
	}
}

class Shotgun extends Gun {
	constructor(daddy) {
		super(daddy,0,500,10,"bullet",3,15);
	}
}

class Minigun extends Gun {
	constructor(daddy) {
		super(daddy, 1, 1000/60, 10, "bullet", 1, 0);
	}
}