var ww = window.innerWidth;
var wh = window.innerHeight;
const ANIM_FRAME_RATE = 10;
var gamePieces = [];
var leftSprites = [];
var rightSprites = [];
var leftActive = false;
var rightActive = false;
var leftIdlePath = "/assets/Robot_PNG/PNG_Animations/Robot1/01_Idle/idle_0";
var leftActivePath = "/assets/Robot_PNG/PNG_Animations/Robot1/06_Attack/Attack_0";
var rightIdlePath = "/assets/Robot_PNG/PNG_Animations/Robot3/01_Idle/idle_0";
var rightActivePath = "/assets/Robot_PNG/PNG_Animations/Robot3/06_Attack/Attack_0";

window.onload = function() {
	startGame();
}

window.onresize = function() {

}

function startGame() {
	gameArea.start();
	var leftPlayer = new component(982, 1012, window.innerWidth * .1, 200, 
		"/assets/Robot_PNG/PNG_Animations/Robot1/01_idle/idle_000.png",
		"image", 300);
	gamePieces.push(leftPlayer);
	var rightPlayer = new component(984, 993, window.innerWidth * .6, 200,
		"/assets/Robot_PNG/PNG_Animations/Robot3/01_idle/idle_000.png",
		"image", 300);
	gamePieces.push(rightPlayer);
}

var gameArea = {
	canvas: document.createElement("canvas"),
	frameNo: 0,
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

function loadImages(path, frames, arr) {
	for (var i = 0; i < frames; i++) {
		var img = new Image();
		if (i < 10) {
			this.image.src = path + "0" + i + ".png";
		}
		else {
			this.image.src = path + i + ".png";
		}
		arr.push(img);
	}
}

function component(width, height, x, y, color, type, scale) {
	this.type = type;
	this.original = {width: width, height: height};
	this.scale = scale / width;
	this.width = this.scale * width;
	this.height = this.scale * height;
	this.x = x;
	this.y = y;
	this.currFrame = 0;
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
	this.resize = function(type, w, h) {
		if (type == "animation") {
			this.width = this.scale * w;
			this.height = this.scale * h;
		}
	}
	this.animate = function(path, frames, rate, w, h, flipped) {
		this.resize("animation", w, h);
		if (gameArea.frameNo % rate == 0) {
			tmpFrame = this.currFrame;
			if (flipped) {
				tmpFrame = frames - this.currFrame - 1;
				console.log(tmpFrame);
			}
			if (tmpFrame < 10) {
				this.image.src = path + "0" + tmpFrame + ".png";
			}
			else {
				this.image.src = path + tmpFrame + ".png";
			}
			this.currFrame = (this.currFrame + 1) % frames;
		}
	}
}

function updateGameArea() {
	gameArea.clear();
	gameArea.frameNo++;
	updateGamePieces();
}

function updateGamePieces() {
	for (var i = 0; i < gamePieces.length; i++) {
		if (leftActive) {
			gamePieces[0].animate(leftActivePath, 18, ANIM_FRAME_RATE, 
				1532, 1315, false);
		}
		else {
			gamePieces[0].animate(leftIdlePath, 9, ANIM_FRAME_RATE, 982, 
				1012, false);
		}
		if (rightActive) {
			gamePieces[1].animate(rightActivePath, 18, ANIM_FRAME_RATE, 
				1533, 1319, false);
		}
		else {
			gamePieces[1].animate(rightIdlePath, 9, ANIM_FRAME_RATE, 984, 
				993, false);
		}
		gamePieces[i].update();
	}
}