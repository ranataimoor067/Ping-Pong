// capture a reference to our "canvas" using its ID
const canvas = document.getElementById("canvas");
// get a "context". Without "context" we cannot draw on canvas 
const ctx = canvas.getContext("2d");

canvas.width = 625;
canvas.height = 375;
document.body.appendChild(canvas);

// sounds
const hitSound = new Audio("HitPingPong.mp3");
const winSound = new Audio("WinPingPong.mp3");
const loseSound = new Audio("LosePingPong.mp3");
const wallHitSound = new Audio("WallPingPong.mp3");

// net
const netWidth = 4;
const netHeight = canvas.height;

const paddleWidth = 10;
const paddleHeight = 100;

let upArrowPressed = false;
let downArrowPressed = false;


// objects 
const net = {
	x: canvas.width / 2 - netWidth / 2,
	y: 0,
	width: netWidth,
	height: netHeight,
	color: "#fff"
};

// user paddle
const user = {
	x: 10,
	y: canvas.height / 2 - paddleHeight / 2,
	width: paddleWidth,
	height: paddleHeight,
	color: "#fff",
	score: 0
};

const com = {
	x: canvas.width - (paddleWidth + 10),
	y: canvas.height / 2 - paddleHeight / 2,
	width: paddleWidth,
	height: paddleHeight,
	color: "#000",
	score: 0
};

// ball
const ball = {
	x: canvas.width / 2,
	y: canvas.height / 2,
	radius: 7,
	speed: 9,
	velocityX: 5,
	velocityY: 5,
	color: "#f6ee0e"
};

// the declaration of the objects ends

// drawing functions
// function to draw the net
function drawNet() {
	//  set the color of net
	ctx.fillStyle = net.color;

	// syntax --> fillRect(x, y, width, height)
	ctx.fillRect(net.x, net.y, net.width, net.height);
}

// function for drawing points
function drawScore(x, y, score) {
	ctx.fillStyle = "#fff";
	ctx.font = "60px Verdana sans-serif";

	// syntax --> fillText(text, x, y)
	ctx.fillText(score, x, y);
}

// function to draw the paddle
function drawPaddle(x, y, width, height, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, width, height);
}

// function to draw the balls
function drawBall(x, y, radius, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	// syntax --> arc(x, y, radius, startAngle, endAngle, antiClockwise_or_not)
	ctx.arc(x, y, radius, 0, Math.PI * 2, true); // π * 2 Radians = 360 degrees
	ctx.closePath();
	ctx.fill();
}

// drawing functions end

// move paddles
// adding an EventListener to the browser
window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);

// is activated when we press a key
function keyDownHandler(event) {
	// get the keyCode
	switch (event.keyCode) {
		// "up arrow" key
		case 38:
			// set upArrowPressed = true
			upArrowPressed = true;
			break;
		// "down arrow" key
		case 40:
			downArrowPressed = true;
			break;
	}
}

// is activated when we release the key
function keyUpHandler(event) {
	switch (event.keyCode) {
		// "up arraow" key
		case 38:
			upArrowPressed = false;
			break;
		// "down arrow" key
		case 40:
			downArrowPressed = false;
			break;
	}
}

// moving paddles section end

// reset the ball
function reset() {
	// reset the value of the ball to older values
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.speed = 9;

	// changes the direction of the ball
	ball.velocityX = -ball.velocityX;
	ball.velocityY = -ball.velocityY;
}

// collision detect function
function collisionDetect(player, ball) {
	// returns true or false
	player.top = player.y;
	player.right = player.x + player.width;
	player.bottom = player.y + player.height;
	player.left = player.x;

	ball.top = ball.y - ball.radius;
	ball.right = ball.x + ball.radius;
	ball.bottom = ball.y + ball.radius;
	ball.left = ball.x - ball.radius;

	return ball.left < player.right && ball.top < player.bottom && ball.right > player.left && ball.bottom > player.top;
}

// update function to update the position
function update() {
	// move the paddle
	if (upArrowPressed && user.y > 0) {
		user.y -= 8;
	} else if (downArrowPressed && (user.y < canvas.height - user.height)) {
		user.y += 8;
	}

	// check if the ball hits the upper or lower wall
	if (ball.y + ball.radius >= canvas.height || ball.y - ball.radius <= 0) {
		// play wallHitSound
		wallHitSound.play();
		ball.velocityY = -ball.velocityY;
	}

	// if the ball hits the right wall
	if (ball.x + ball.radius >= canvas.width) {
		// play winSound
		winSound.play();
		// then the user gets 1 point
		user.score += 1;
		reset();
	}

	// if the ball hits the left wall
	if (ball.x - ball.radius <= 0) {
		// play loseSound
		loseSound.play();
		// then computer has scored 1 point
		com.score += 1;
		reset();
	}

	// move ball
	ball.x += ball.velocityX;
	ball.y += ball.velocityY;

	// computer paddle move
	com.y += ((ball.y - (com.y + com.height / 2))) * 0.2;

	// paddle collision detection
	let player = (ball.x < canvas.width / 2) ? user : com;

	if (collisionDetect(player, ball)) {
		// play hitSound
		hitSound.play();
		// default angle is 0 deg in radius
		let angle = 0;

    // if the ball hits the top of the paddle
    if (ball.y < (player.y + player.height / 2)) {
		// then -1 * Math.PI / 4 = -45deg
		angle = -1 * Math.PI / 4;
	} else if (ball.y > (player.y + player.height / 2)) {
		// when it hits the bottom of the paddle
		// then the angle Math.PI / 4 = 45deg
		angle = Math.PI / 4;
    }

	// change the speed of the ball depending on which paddle hit the ball
	ball.velocityX = (player === user ? 1 : -1) * ball.speed * Math.cos(angle);
	ball.velocityY = ball.speed * Math.sin(angle);

	// increase ball speed
	ball.speed += 0.2;
	}
}

// the render function draws everything on canvas
function render() {
	// set a style
	ctx.fillStyle = "#2aac2a"; // everything below it gets the color black (#000)
	// draws the board
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// pull net
	drawNet();
	// determine user-score
	drawScore(canvas.width / 4, canvas.height / 6, user.score);
	// determine computer score
	drawScore(3 * canvas.width / 4, canvas.height / 6, com.score);
	// draw user paddle
	drawPaddle(user.x, user.y, user.width, user.height, user.color);
	// computer paddle drawing
	drawPaddle(com.x, com.y, com.width, com.height, com.color);
	// draw ball
	drawBall(ball.x, ball.y, ball.radius, ball.color);
}


// touchscreen
function moveup() {
	upArrowPressed = 1;
}

function movedown() {
	downArrowPressed = 1;
}

function clearmove() {
	upArrowPressed = 0;
	downArrowPressed = 0;
}


// gameLoop
function gameLoop() {
	// update()-function here
	update();
	// render()-function here
	render();
}

// calls the gameLoop() function 60 times per second
setInterval(gameLoop, 1000 / 60);