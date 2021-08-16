const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.style.backgroundColor = "#e2dcf7";

const CANVAS_WIDTH = canvas.width = 600;
const CANVAS_HEIGHT = canvas.height = 200;

const parallaxLayer1 = new Image();
parallaxLayer1.src = "img/parallax-layer-1.png";
const parallaxLayer2 = new Image();
parallaxLayer2.src = "img/parallax-layer-2.png";
const parallaxLayer3 = new Image();
parallaxLayer3.src = "img/parallax-layer-3.png";
const parallaxLayer4 = new Image();
parallaxLayer4.src = "img/parallax-layer-4.png";

let parallaxSpeed = 5;

const horse = new Image(60, 35);
horse.src = "img/horse.png";
const stone = new Image(30, 20);
stone.src = "img/stone.png";

let instructions = document.getElementById("instructions");

let score;
let scoreText;
let highscore;
let highscoreText;
let player;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};

document.addEventListener("keydown", function (evt) {
    keys[evt.code] = true;
});
document.addEventListener("keyup", function (evt) {
    keys[evt.code] = false;
});

class Layer {
    constructor(image, speedModifier) {
        this.x = 0;
        this.y = 0;
        this.width = 600;
        this.height = 200;
        this.x2 = this.width;
        this.image = image;
        this.speedModifier = speedModifier;
        this.speed = parallaxSpeed * this.speedModifier;
    }
    update() {
        this.speed = parallaxSpeed * this.speedModifier;
        if (this.x <= -this.width)
            this.x = this.width + this.x2 - this.speed;
        if (this.x2 <= -this.width)
            this.x2 = this.width + this.x - this.speed;
        this.x = Math.round(this.x - this.speed);
        this.x2 = Math.round(this.x2 - this.speed);
    }
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x2, this.y, this.width, this.height);
    }
}

class Player {
    constructor (x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.dy = 0;
        this.jumpForce = 9;
        this.grounded = false;
        this.jumpTimer = 0;
    }

    Animate () {
        if (keys["Space"]) {
            this.Jump();
            instructions.style.visibility = "hidden";
        } else {
            this.jumpTimer = 0;
        }

        this.y += this.dy;

        if (this.y + this.h < canvas.height) {
            this.dy += gravity;
            this.grounded = false;
        } else {
            this.dy = 0;
            this.grounded = true;
            this.y = canvas.height - this.h;
        }

        this.Draw();
    }

    Jump () {
        if (this.grounded && this.jumpTimer === 0) {
            this.jumpTimer = 1;
            this.dy = -this.jumpForce;
        } else if (this.jumpTimer > 0 && this.jumpTimer < 12) {
            this.jumpTimer++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50);
        }
    }

    Draw () {
        ctx.beginPath();
        ctx.drawImage(horse, this.x, this.y);
        ctx.closePath();
    }
}

class Obstacle {
    constructor (x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.dx = -gameSpeed;
        this.counted = false;
    }

    Update () {
        this.x += this.dx;
        this.Draw();
        this.dx = -gameSpeed;
    }

    Draw () {
        ctx.beginPath();
        ctx.drawImage(stone, this.x, this.y);
        ctx.closePath();
    }
}

class Text {
    constructor (t, x, y, a, c, s) {
        this.t = t;
        this.x = x;
        this.y = y;
        this.a = a;
        this.c = c;
        this.s = s;
    }

    Draw () {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.font = this.s + "px 'VT323', monospace";
        ctx.textAlign = this.a;
        ctx.fillText(this.t, this.x, this.y);
        ctx.closePath();
    }
}

function SpawnObstacle () {
    let obstacle = new Obstacle(CANVAS_WIDTH, CANVAS_HEIGHT - 20, 30, 20);
    obstacles.push(obstacle);
}

function Start () {
    ctx.font = "24px 'VT323', monospace";

    gameSpeed = 5;
    gravity = 1;

    score = 0;
    highscore = 0;
    if (localStorage.getItem("highscore")) {
        highscore = localStorage.getItem("highscore");
    }

    player = new Player(25, 0, 60, 35);

    scoreText = new Text("Score: " + score, 25, 25, "left", "#1e0c2b", "24");
    highscoreText = new Text("Highscore: " + highscore, canvas.width - 25, 25, "right", "#1e0c2b", "24");

    requestAnimationFrame(Update);
}

const layer1 = new Layer(parallaxLayer1, 0.1);
const layer2 = new Layer(parallaxLayer2, 0.3);
const layer3 = new Layer(parallaxLayer3, 0.5);
const layer4 = new Layer(parallaxLayer4, 0.7);

const parallaxLayers = [layer1, layer2, layer3, layer4]

let initialSpawnTimer = 50;
let spawnTimer = initialSpawnTimer;

function randomIntInRange (min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function Update () {
    requestAnimationFrame(Update);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    parallaxLayers.forEach(object => {
        object.update();
        object.draw();
    });

    spawnTimer--;
    if (spawnTimer <= 0) {
        SpawnObstacle();
        spawnTimer = Math.round(initialSpawnTimer + randomIntInRange(0, 100) - gameSpeed * 5);

        if (spawnTimer < 50) {
            spawnTimer = 50;
        }
        console.log(spawnTimer);
    }

    for (let i = 0; i < obstacles.length; i++) {
        let o = obstacles[i];

        if (o.x + o.w < 0) {
            obstacles.splice(i, 1);
        }

        if (player.x + 15 < o.x + o.w && player.x + player.w - 15 > o.x && player.y + player.h > o.y) {
            obstacles = [];
            score = 0;
            spawnTimer = initialSpawnTimer;
            gameSpeed = 3;
            parallaxSpeed = 5;
            window.localStorage.setItem("highscore", highscore);
            instructions.style.visibility = "visible";
        } else if (player.x > o.x + o.w && !o.counted) {
            o.counted = true;
            score++;
        }

        o.Update();
    }

    player.Animate();

    scoreText.t = "Score: " + score;
    scoreText.Draw();

    if (score > highscore) {
        highscore = score;
        highscoreText.t = "Highscore: " + highscore;
    }

    highscoreText.Draw();

    gameSpeed += 0.001;
    parallaxSpeed += 0.001;
}

Start();