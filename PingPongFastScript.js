// einen Verweis auf unsere "canvas" mit Hilfe ihrer ID erfassen
const canvas = document.getElementById("canvas");
/* einen "context" erhalten. Ohne "context" können wir nicht auf canvas zeichnen */
const ctx = canvas.getContext("2d");

canvas.width = 625;
canvas.height = 375;
document.body.appendChild(canvas);

// sounds
const hitSound = new Audio("HitPingPong.mp3");
const winSound = new Audio("WinPingPong.mp3");
const loseSound = new Audio("LosePingPong.mp3");
const wallHitSound = new Audio("WallPingPong.mp3");

/* zusätzliche Variablen */
const netWidth = 4;
const netHeight = canvas.height;

const paddleWidth = 10;
const paddleHeight = 100;

let upArrowPressed = false;
let downArrowPressed = false;


/* objekte */
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

/* die Deklaration der Objekte endet */

/* Zeichenfunktionen */
// Funktion zum Zeichnen des Netzes(net)
function drawNet() {
	// die Farbe von net einstellen
	ctx.fillStyle = net.color;

	// syntax --> fillRect(x, y, width, height)
	ctx.fillRect(net.x, net.y, net.width, net.height);
}

// Funktion zum Zeichnen von Punkten
function drawScore(x, y, score) {
	ctx.fillStyle = "#fff";
	ctx.font = "60px Verdana sans-serif";

	// syntax --> fillText(text, x, y)
	ctx.fillText(score, x, y);
}

// Funktion zum Zeichnen des Paddels
function drawPaddle(x, y, width, height, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, width, height);
}

// Funktion zum Zeichnen des balls
function drawBall(x, y, radius, color) {
	ctx.fillStyle = color;
	ctx.beginPath();
	// syntax --> arc(x, y, radius, startAngle, endAngle, antiClockwise_or_not)
	ctx.arc(x, y, radius, 0, Math.PI * 2, true); // π * 2 Radians = 360 degrees
	ctx.closePath();
	ctx.fill();
}

/* Zeichenfunktionen Ende */

/* Paddles bewegen */
// Hinzufügen eines EventListeners zum Browserfenster
window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);

// wird aktiviert, wenn wir eine Taste drücken
function keyDownHandler(event) {
	// den keyCode erhalten
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

// wird aktiviert, wenn wir die Taste loslassen
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

/* bewegliche Paddles Abschnitt Ende */

// den Ball zurücksetzen
function reset() {
	// den Wert des Balls auf ältere Werte zurücksetzen
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.speed = 9;

	// ändert die Richtung des Balls
	ball.velocityX = -ball.velocityX;
	ball.velocityY = -ball.velocityY;
}

// Kollisionserkennungsfunktion - collision Detect function
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

// Aktualisierungsfunktion, um die Position der Dinge zu aktualisieren
function update() {
	// das Paddel bewegen
	if (upArrowPressed && user.y > 0) {
		user.y -= 8;
	} else if (downArrowPressed && (user.y < canvas.height - user.height)) {
		user.y += 8;
	}

	// Prüfen, ob der Ball die obere oder untere Wand trifft
	if (ball.y + ball.radius >= canvas.height || ball.y - ball.radius <= 0) {
		// play wallHitSound
		wallHitSound.play();
		ball.velocityY = -ball.velocityY;
	}

	// wenn der Ball die rechte Wand trifft
	if (ball.x + ball.radius >= canvas.width) {
		// play winSound
		winSound.play();
		// dann erhält der user 1 Punkt
		user.score += 1;
		reset();
	}

	// wenn der Ball die linke Wand trifft
	if (ball.x - ball.radius <= 0) {
		// play loseSound
		loseSound.play();
		// dann hat KI 1 Punkt erzielt
		com.score += 1;
		reset();
	}

	// den Ball bewegen
	ball.x += ball.velocityX;
	ball.y += ball.velocityY;

	// KI-Paddel-Bewegung
	com.y += ((ball.y - (com.y + com.height / 2))) * 0.2;

	// Kollisionserkennung bei Paddeln
	let player = (ball.x < canvas.width / 2) ? user : com;

	if (collisionDetect(player, ball)) {
		// play hitSound
		hitSound.play();
		// Standardwinkel ist 0deg im Radius
		let angle = 0;

    // wenn der Ball das obere Ende des Paddels trifft
    if (ball.y < (player.y + player.height / 2)) {
		// dann -1 * Math.PI / 4 = -45deg
		angle = -1 * Math.PI / 4;
	} else if (ball.y > (player.y + player.height / 2)) {
		// wenn es den Boden des Paddels trifft
		// dann wird der Winkel Math.PI / 4 = 45deg
		angle = Math.PI / 4;
    }

	/* die Geschwindigkeit des Balls zu ändern, je nachdem, mit welchem Paddel der Ball getroffen wurde */
	ball.velocityX = (player === user ? 1 : -1) * ball.speed * Math.cos(angle);
	ball.velocityY = ball.speed * Math.sin(angle);

	// Ballgeschwindigkeit erhöhen
	ball.speed += 0.2;
	}
}

// Die Render-Funktion zeichnet alles auf canvas
function render() {
	// einen Stil festlegen
	ctx.fillStyle = "#2aac2a"; /* alles, was darunter liegt, erhält die Farbe Schwarz (#000). */
	// zeichnet das Brettes
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Netz ziehen
	drawNet();
	// user-score ermitteln
	drawScore(canvas.width / 4, canvas.height / 6, user.score);
	// KI score ermitteln
	drawScore(3 * canvas.width / 4, canvas.height / 6, com.score);
	// user-paddel zeichnen
	drawPaddle(user.x, user.y, user.width, user.height, user.color);
	// KI-paddle zeichnen
	drawPaddle(com.x, com.y, com.width, com.height, com.color);
	// ball zeichnen
	drawBall(ball.x, ball.y, ball.radius, ball.color);
}


// buttons für Touchscreen
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
	// update()-Funktion hier
	update();
	// render()-Funktion hier
	render();
}

// ruft die Funktion gameLoop() 60 mal pro Sekunde auf
setInterval(gameLoop, 1000 / 60);