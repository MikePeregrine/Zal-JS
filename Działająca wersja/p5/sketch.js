// Tower Defense Game with p5.js

// Game variables
let castleHealth = 5;
let gold = 100;
let towers = [];
let enemies = [];
let enemySpawnInterval = 3000; // 3 seconds
let lastSpawnTime = 0;
let spawnRateMultiplier = 1;
let lastSpawnRateIncreaseTime = 0;
const spawnRateIncreaseInterval = 10000; // 10 seconds

// Path variables
let path = [];
let pathIndex = 0;
let pathStep = 6;

// Tower 1 class
class Tower1 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.range = 100;
    this.damage = 1;
    this.projectiles = [];
    this.shootingDelay = 1000; // 1 second
    this.lastShotTime = 0;
  }

  display() {
    fill(200);
    rect(this.x - 10, this.y - 10, 20, 20);
  }

  shoot(enemy) {
    if (millis() - this.lastShotTime > this.shootingDelay) {
      if (dist(this.x, this.y, enemy.x, enemy.y) <= this.range) {
        let projectile = new Projectile(this.x, this.y, enemy, this.damage);
        this.projectiles.push(projectile);
        this.lastShotTime = millis();
      }
    }
  }

  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      let projectile = this.projectiles[i];
      projectile.update();
      if (projectile.hasReachedTarget()) {
        projectile.hitTarget();
        this.projectiles.splice(i, 1);
      }
    }
  }
}

// Tower 2 class
class Tower2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.range = 120;
    this.damage = 2;
    this.projectiles = [];
    this.shootingDelay = 2000; // 2 seconds
    this.lastShotTime = 0;
  }

  display() {
    fill(100);
    triangle(this.x, this.y - 10, this.x - 10, this.y + 10, this.x + 10, this.y + 10);
  }

  shoot(enemy) {
    if (millis() - this.lastShotTime > this.shootingDelay) {
      if (dist(this.x, this.y, enemy.x, enemy.y) <= this.range) {
        for (let i = 0; i < 3; i++) {
          let angle = TWO_PI * i / 3;
          let offsetX = cos(angle) * 10;
          let offsetY = sin(angle) * 10;
          let projectile = new Projectile(this.x + offsetX, this.y + offsetY, enemy, this.damage);
          this.projectiles.push(projectile);
        }
        this.lastShotTime = millis();
      }
    }
  }

  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      let projectile = this.projectiles[i];
      projectile.update();
      if (projectile.hasReachedTarget()) {
        projectile.hitTarget();
        this.projectiles.splice(i, 1);
      }
    }
  }
}

// Enemy class
class Enemy {
  constructor() {
    this.x = path[0].x;
    this.y = path[0].y;
    this.speed = 0.5; // constant speed
    this.health = 3;
    this.isAlive = true;
    this.currentPathIndex = 0;
  }

  display() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, 20, 20);
  }

  move() {
    if (this.currentPathIndex < path.length - 1) {
      let targetX = path[this.currentPathIndex + 1].x;
      let targetY = path[this.currentPathIndex + 1].y;
      let dx = targetX - this.x;
      let dy = targetY - this.y;
      let distance = sqrt(dx * dx + dy * dy);
      let velocityX = (dx / distance) * this.speed;
      let velocityY = (dy / distance) * this.speed;
      this.x += velocityX;
      this.y += velocityY;

      if (dist(this.x, this.y, targetX, targetY) < pathStep) {
        this.currentPathIndex++;
        this.x = targetX;
        this.y = targetY;
      }
    } else {
      // Reached the castle
      castleHealth--;
      this.isAlive = false;
    }
  }

  takeDamage(damage) {
    this.health -= damage;
    if (this.health <= 0) {
      this.isAlive = false;
      gold += int(random(20,30));
    }
  }
}

// Projectile class
class Projectile {
  constructor(x, y, target, damage) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.speed = 5;
    this.damage = damage;
    this.hasHitTarget = false;
  }

  update() {
    let dx = this.target.x - this.x;
    let dy = this.target.y - this.y;
    let distance = sqrt(dx * dx + dy * dy);
    let velocityX = (dx / distance) * this.speed;
    let velocityY = (dy / distance) * this.speed;
    this.x += velocityX;
    this.y += velocityY;
  }

  display() {
    fill(255);
    ellipse(this.x, this.y, 10, 10);
  }

  hasReachedTarget() {
    return dist(this.x, this.y, this.target.x, this.target.y) < 10;
  }

  hitTarget() {
    this.target.takeDamage(this.damage);
    this.hasHitTarget = true;
  }
}

// Setup function
function setup() {
  createCanvas(800, 400);
  initializePath();
}

// Draw function
function draw() {
  background(220);

  // Check if the game is over
  if (castleHealth <= 0) {
    gameOver();
    return;
  }

  // Spawn enemies
  if (millis() - lastSpawnTime > enemySpawnInterval) {
    enemies.push(new Enemy());
    lastSpawnTime = millis();
  }

  // Increase enemy spawn rate every 10 seconds
  if (millis() - lastSpawnRateIncreaseTime > spawnRateIncreaseInterval) {
    enemySpawnInterval /= 2;
    spawnRateMultiplier *= 2;
    lastSpawnRateIncreaseTime = millis();
  }

  // Display and move enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    let enemy = enemies[i];
    if (enemy.isAlive) {
      enemy.move();
      enemy.display();
    } else {
      enemies.splice(i, 1);
    }
  }

  // Display and shoot towers
  for (let tower of towers) {
    tower.display();
    tower.updateProjectiles();

    for (let enemy of enemies) {
      tower.shoot(enemy);
    }
    for (let projectile of tower.projectiles) {
      projectile.display();
    }
  }

  // Display castle health and gold
  fill(0);
  textSize(20);
  text(`Castle Health: ${castleHealth}`, 10, 30);
  text(`Gold: ${gold}`, 10, 60);

  // Display the path
  noFill();
  stroke(0);
  strokeWeight(2);
  beginShape();
  for (let point of path) {
    vertex(point.x, point.y);
  }
  endShape();
}

// Mouse click function
function mouseClicked() {
  if (gold >= 100) {
    if (mouseButton === LEFT) {
      towers.push(new Tower1(mouseX, mouseY));
    } else if (mouseButton === RIGHT) {
      towers.push(new Tower2(mouseX, mouseY));
    }
    gold -= 100;
  }
}

// Game over function
function gameOver() {
  background(0);
  fill(255);
  textSize(30);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2);
}

// Initialize the path
function initializePath() {
  let startY = height / 2;
  let endY = height / 2;
  let numSegments = 8;
  let segmentWidth = width / numSegments;

  path.push({ x: 0, y: startY });

  for (let i = 1; i < numSegments; i++) {
    let x = i * segmentWidth;
    let y = startY + random(-50, 50);
    path.push({ x: x, y: y });
  }

  path.push({ x: width, y: endY });
}

// Initialize the p5.js sketch
function initializeSketch() {
  setup();
  draw();
}

// Start the game
initializeSketch();
