var daxtrot, player1, player2;
var myObstacles = [];
var myScore;
var currscore = 0;
var button1Held = false;
var button2Held = false;
var button3Held = false;
var p1key = "KeyQ";
var p2key = "KeyP";
var type;
const gravity = 0.2;
var onhound = false;
var p1onhound = false;
var p2onhound = false;
var game = true;
var hscore = localStorage.getItem('hscore'); // Lagrer en highscore i nettleserens lokallagring. Lagres mellom økter på samme maskin, men ikke mellom enheter eller forskjellige nettlesere.

function startGame() {
    daxtrot = new component(160, 50, "blue", 10, 700, "daxtrot");
    player1 = new component(60, 40, "red", 10, 650, "player");  //
    player2 = new component(60, 40, "green", 110, 650, "player");
    myScore = new component("30px", "Consolas", "black", 40, 40, "text");
    myGameArea.start();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 1440;
        this.canvas.height = 810;
        this.canvas.style = "padding: 0; margin: auto; display: block; width: 1000px; height: 500px;";
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
        this.y += this.speedY; 
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

  this.onHound = function() {
        // return true if player is on hound (daxtrot)
            if(this.type == "player") {
                if(this.y > daxtrot.y - this.height) //sjekker om playerbrikkens y-verdi er større (altså lengre ned i canvas) enn daxtrots yverdi
                    return true;
            }
            else {
                    return false;
                }
        }

    this.applyGravity = function() {
        if (this.onGround()) { // piece is on bottom ground, stop there.
        this.y = myGameArea.canvas.height - this.height;
	    this.speedY = 0;
        }
        else if(this.onHound() && onhound == false)
        {
            
            this.y = daxtrot.y - this.height;
            this.speedY = 0;
            if(color == "red")
            {
                p1onhound = true;
            }
            else if(color == "green")
            {
                p2onhound = true;
            }
            
            //console.log("hound hit: " + color);
        }
	    else { // piece is in the air, apply gravity
	    if (this.y < 1) { // make sure we don't leave screen at top
		this.y = 1;
	    }
        
        //dette må ryddes opp i. for mye if-else, og å sjekke etter color er ikke helt optimalt. var bare løsninga jeg kom på først under testing
       if(color == "red" && p1onhound == false)
        {
            accelY(player1,-gravity);
        }
        else if(color == "green" && p2onhound == false)
        {
            accelY(player2,-gravity);
        } 
        else
        {
            accelY(daxtrot,-gravity);
        }
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

function checkHiScore(thisscore) {
    if(thisscore>hscore)
    {
        localStorage.setItem('hscore', thisscore)
        return "Congratulations, new highscore!";
    }
    else
    {
        return "No highscore this time. "
    }
        

}

function updateGameArea() {
    
    var x, height, minHeight, maxHeight;
    for (i = 0; i < myObstacles.length; i += 1) {
        if (daxtrot.crashWith(myObstacles[i]) || player1.crashWith(myObstacles[i]) || player2.crashWith(myObstacles[i])) {
            if(game) // kjøres ved game over, 1 gang
            {
                currscore = myGameArea.frameNo;
                alert("Game over. Your score: " + currscore + ". " + checkHiScore(currscore) + " Refresh the page to try again.")
            }
            game = false;
            return;

        } 
    }
    myGameArea.clear();
    myGameArea.frameNo += 1;
    if (myGameArea.frameNo == 1 || everyinterval(250)) {
        minHeight = 25;
        maxHeight = 100;
        minWidth = 20;
        maxWidth = 80;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        width = Math.floor(Math.random()*(maxWidth-minWidth+1)+minWidth);
        x = myGameArea.canvas.width;
	y = myGameArea.canvas.height - height;
        var randomColor = "#" + Math.floor(Math.random()*16777215).toString(16);
        myObstacles.push(new component(width, height, randomColor, x, y));
    }
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -2;
        myObstacles[i].update();
    }
    myScore.text="SCORE: " + myGameArea.frameNo;
    myScore.update();
    daxtrot.newPos();
    daxtrot.update();
    player1.newPos();
    player1.update();
    player2.newPos();
    player2.update();
    // check button status after update
    if (button2Held && button3Held && daxtrot.onGround()) {
	accelX(daxtrot, 3);
    accelX(player1, 3);
    accelX(player2, 3);
    }
    else if (daxtrot.onGround()) {
	if (daxtrot.x > 10 && daxtrot.x < 600) {
	    accelX(daxtrot, -1);
        accelX(player1, -1);
        accelX(player2, -1);
	}
    else if(daxtrot.x >= 600)
    {
        accelX(daxtrot, -2);
        accelX(player1, -2);
        accelX(player2, -2);
    }
	else {
	    accelX(daxtrot, 0);
        accelX(player1, 0);
        accelX(player2, 0);
	}
    }

}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function butDown(keycode) {
   // Her lagres verdi for om en knapp holdes nede
    if(keycode == p1key) {
        button2Held = true;
    }
    else if(keycode == p2key) {
        button3Held = true;
    } 
}


// Kjøres om en av de designerte spilleknappene er trykt og slippes (keyup) 
// Det er her vi må fikse på ting for å sørge for at ikke bare én spiller kan slippe knappen, så hopper daxtrot fortsatt.
function butUp() {

    if (button2Held && button3Held && daxtrot.onGround() && p1onhound && p2onhound) {
        accelY(daxtrot, 9); 
        accelY(player1, 9); 
        accelY(player2, 9); 
        p1onhound = false;
        p2onhound = false;       
        } 
    else if(button2Held)
    {
        if(p1onhound)
        {
            accelY(player1, 6);
            p1onhound = false;
        }
    }
    else if(button3Held)
    {
        if(p2onhound)
        {   
            accelY(player2, 6);
            p2onhound = false;
        }
    }

    button2Held = false;
    button3Held = false;

}

// Hoppefunksjon, y-verdi, oppover
function accelY(piece, n) {
    piece.speedY -= n;
}

// Hoppefunksjon, x-verdi, forover
function accelX(piece, n) {
    piece.speedX = n;
}

//Keydown-sjekker
document.addEventListener('keydown', (event) => {
    butDown(event.code);
}, false);  

//Keyup-sjekker
document.addEventListener('keyup', (event) => {
	butUp(event.code);
}, false);





