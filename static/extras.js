var ww = window.innerWidth;
var wh = window.innerHeight;
var gamePieces = [];


window.onload = function() {
	startGame();
}

function startGame() {
	gameArea.start();
	var leftPlayer = new component(982, 1012, 10, 10, 
		"/assets/Robot_PNG/PNG_Animations/Robot1/01_idle/idle_000.png",
		"image");
	gamePieces.push(leftPlayer);
}

var gameArea = {
	canvas: document.createElement("canvas"),
	start: function() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.interval = setInterval(updateGameArea, 1000 / 60);
	},
	clear: function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

function component(width, height, x, y, color, type) {
	this.type = type;
	this.width = width;
	this.height = height;
	this.x = x;
	this.y = y;
	switch(this.type) {
		case "image":
			console.log("image");
			this.image = new Image();
			this.image.src = color;
			break;
		case "text":
			ctx.font = this.width + " " + this.height;
			ctx.fillStyle = color;
			ctx.fillText(this.text, this.x, this.y);
			break;
	}
	this.update = function() {
		ctx = gameArea.context;
		switch (this.type) {
			case "image":
				ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
				break;
			case "text":
				ctx.font = this.width + " " + this.height;
				ctx.fillStyle = color;
				ctx.fillText(this.text, this.x, this.y);
				break;
		}
	}
}

function updateGameArea() {
	gameArea.clear();
	updateGamePieces();
}

function updateGamePieces() {
	for (var i = 0; i < gamePieces.length; i++) {
		gamePieces[i].update();
	}
}