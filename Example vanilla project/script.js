var myGamePiece;
var myObstacles = [];
var myScore;
var button1Held = false;
const gravity = 0.1;

function startGame() {
    myGamePiece = new component(60, 30, "blue", 10, 540);
    // myGamePiece.gravity = 0.05; // let g be global constant
    myScore = new component("30px", "Consolas", "black", 40, 40, "text");
    myGameArea.start();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 960;
        this.canvas.height = 540;
        this.canvas.style = "position:absolute; left: 50%; top: 40%; width: 400px; margin-left: -200px;";
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
        },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(width, height, color, x, y, type) {
    this.type = type;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;
    this.update = function() {
        ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY // + this.gravitySpeed;
        this.applyGravity();
    }
    this.onGround = function() {
	// return true if this is on the ground
        var rockbottom = myGameArea.canvas.height - this.height;
        if (this.y >= rockbottom) {
	    return true;
	}
	else {
	    return false;
	}
    }

    this.applyGravity = function() {
        if (this.onGround()) {
	    this.y = myGameArea.canvas.height - this.height;
	    this.speedY = 0;
        }
	else { // piece is in the air, apply gravity
	    if (this.y < 1) { // make sure we don't leave screen at top
		this.y = 1;
	    }
	    accelY(-gravity);
	}
    }

    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            return;
        } 
    }
    myGameArea.clear();
    myGameArea.frameNo += 1;
    if (myGameArea.frameNo == 1 || everyinterval(250)) {
        minHeight = 10;
        maxHeight = 75;
        minWidth = 10;
        maxWidth = 75;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        width = Math.floor(Math.random()*(maxWidth-minWidth+1)+minWidth);
        x = myGameArea.canvas.width;
	y = myGameArea.canvas.height - height;
        // minGap = 50;
        // maxGap = 200;
        // gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
        // myObstacles.push(new component(10, height, "green", x, 0));
        myObstacles.push(new component(width, height, "green", x, y));
    }
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -2;
        myObstacles[i].update();
    }
    myScore.text="SCORE: " + myGameArea.frameNo;
    myScore.update();
    myGamePiece.newPos();
    myGamePiece.update();
    // check button status after update
    if (button1Held & myGamePiece.onGround()) {
	console.log("button 1 is held!")
	myGamePiece.speedX = 1;
    }
    else if (myGamePiece.onGround()) {
	if (myGamePiece.x > 10) {
	    myGamePiece.speedX = -1;
	}
	else {
	    myGamePiece.speedX = 0;
	}
    }
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function butDown() {
    console.log("Pressed button 1");
    button1Held = true;
}

function butUp() {
    console.log("Released button 1");
    button1Held = false;
    if (myGamePiece.onGround()) {
	console.log("Jump!");
	accelY(5);
    }
}

function accelY(n) {
    myGamePiece.speedY -= n;
}

document.addEventListener('keydown', (event) => {
    if (event.code == "Space") {
	butDown();
    }
}, false);

document.addEventListener('keyup', (event) => {
    if (event.code == "Space") {
	butUp();
    }
}, false);

