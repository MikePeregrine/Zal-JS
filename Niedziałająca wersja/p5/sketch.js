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
    this.speed = 0.5; // pixels per millisecond
    this.health = 5;
    this.isAlive = true;
    this.currentPathIndex = 0;
  }

  display() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, 20, 20);
  }

  move() {
    let targetX = path[this.currentPathIndex + 1].x;
    let targetY = path[this.currentPathIndex + 1].y;
    let distanceToTarget = dist(this.x, this.y, targetX, targetY);
    let directionX = (targetX - this.x) / distanceToTarget;
    let directionY = (targetY - this.y) / distanceToTarget;
    let deltaX = directionX * this.speed;
    let deltaY = directionY * this.speed;

    if (distanceToTarget < this.speed) {
      this.currentPathIndex++;
      if (this.currentPathIndex >= path.length - 1) {
        this.reachCastle();
      }
    } else {
      this.x += deltaX;
      this.y += deltaY;
    }
  }

  reachCastle() {
    castleHealth--;
    this.isAlive = false;
  }
}

// Projectile class
class Projectile {
  constructor(x, y, target, damage) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.speed = 1; // pixels per millisecond
    this.damage = damage;
  }

  update() {
    let distanceToTarget = dist(this.x, this.y, this.target.x, this.target.y);
    let directionX = (this.target.x - this.x) / distanceToTarget;
    let directionY = (this.target.y - this.y) / distanceToTarget;
    let deltaX = directionX * this.speed;
    let deltaY = directionY * this.speed;
    this.x += deltaX;
    this.y += deltaY;
  }

  hasReachedTarget() {
    let distanceToTarget = dist(this.x, this.y, this.target.x, this.target.y);
    return distanceToTarget < 5;
  }

  hitTarget() {
    this.target.health -= this.damage;
    if (this.target.health <= 0) {
      this.target.isAlive = false;
      gold += 10;
    }
  }
}

// Initialize the game
function setup() {
  createCanvas(800, 600);
  initializePath();
  loadImage("https://i.imgur.com/qZVqfs6.png", imageLoaded);
}

// Handle image loading completion
function imageLoaded(img) {
  // Draw the game
  function drawGame() {
    background(220);

    // Display path
    for (let i = 0; i < path.length - 1; i++) {
      let start = path[i];
      let end = path[i + 1];
      stroke(0);
      line(start.x, start.y, end.x, end.y);
    }

    // Spawn enemies
    if (millis() - lastSpawnTime >= enemySpawnInterval) {
      let enemy = new Enemy();
      enemies.push(enemy);
      lastSpawnTime = millis();
    }

    // Increase spawn rate over time
    if (millis() - lastSpawnRateIncreaseTime >= spawnRateIncreaseInterval) {
      enemySpawnInterval /= spawnRateMultiplier;
      lastSpawnRateIncreaseTime = millis();
    }

    // Display and update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
      let enemy = enemies[i];
      if (enemy.isAlive) {
        enemy.display();
        enemy.move();
        // Check if the enemy reaches the castle
        if (!enemy.isAlive) {
          enemies.splice(i, 1);
        }
      } else {
        enemies.splice(i, 1);
      }
    }

    // Display and update towers
    for (let tower of towers) {
      tower.display();
      tower.updateProjectiles();
    }

    // Display castle health
    textSize(24);
    fill(0);
    text(`Castle Health: ${castleHealth}`, 20, 40);

    // Display gold
    textSize(24);
    fill(0);
    text(`Gold: ${gold}`, 20, 70);
  }

  // Handle mouse click event
  function mouseClicked() {
    let tower1Cost = 50;
    let tower2Cost = 100;
    let mouseX = event.clientX - canvas.getBoundingClientRect().left;
    let mouseY = event.clientY - canvas.getBoundingClientRect().top;

    // Check if there is enough gold to place a tower
    if (gold >= tower1Cost && mouseY < height - 50) {
      towers.push(new Tower1(mouseX, mouseY));
      gold -= tower1Cost;
    } else if (gold >= tower2Cost && mouseY < height - 50) {
      towers.push(new Tower2(mouseX, mouseY));
      gold -= tower2Cost;
    }
  }

  // Draw the game every frame
  draw = drawGame;
  mouseClicked = mouseClicked;
}

// Initialize the path
function initializePath() {
  path.push(createVector(0, height / 2));
  path.push(createVector(width / 3, height / 2));
  path.push(createVector(width / 3, height / 3));
  path.push(createVector(width / 2, height / 3));
  path.push(createVector(width / 2, height / 2));
  path.push(createVector(2 * width / 3, height / 2));
  path.push(createVector(2 * width / 3, 2 * height / 3));
  path.push(createVector(width, 2 * height / 3));
}

// Run the game
function draw() {
  // Display "Loading..." while the image is being loaded
  background(220);
  textSize(32);
  fill(0);
  textAlign(CENTER, CENTER);
  text("Loading...", width / 2, height / 2);
}

// Run the game
function draw() {
  // Display "Loading..." while the image is being loaded
  background(220);
  textSize(32);
  fill(0);
  textAlign(CENTER, CENTER);
  text("Loading...", width / 2, height / 2);
}

