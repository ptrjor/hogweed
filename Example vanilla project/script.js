var myGamePiece, myGamePiece2, myGamePiece3;
var myObstacles = [];
var myScore;
var button1Held = false;
var button2Held = false;
var button3Held = false;
var p1key = "KeyQ";
var p2key = "KeyP";
var type;
const gravity = 0.1;

function startGame() {
    myGamePiece = new component(80, 50, "blue", 10, 540, "daxtrot");
    myGamePiece2 = new component(30, 20, "red", 10, 490, "player");  //
    myGamePiece3 = new component(30, 20, "green", 60, 490, "player");
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
        this.y += this.speedY; 
        this.applyGravity();
    }
    this.onGround = function() {

	// return true if this is on the ground
        
        var rockbottom = myGameArea.canvas.height - this.height;
        if(this.type === "player")
        {
            /* Her settes "rockbottom" for playerobjektene cirka til y-verdien til daxtrot, altså mygamepiece.y. 
             når playerobjektene treffer denne blir de reseta til deres standard y-verdi som du ser under testing. 
             Den bør vel heller settes til y-verdien til daxtrot, eller noe liknende. Ærlig talt litt for mye testing fram 
             og tilbake her uten å ha en helt krystallklar plan for hva ting bør gjøre. Derfor sier jeg det er rotete - så du 
             får gjøre hva du vil ut av det. Gjerne re-design dette om du synes dette blir feil. Veldig usikker selv. */

            rockbottom = myGamePiece.y - myGamePiece.height/2;
          
            
        }
        if (this.y >= rockbottom) {
	    return true;
	}
	else {
	    return false;
	}
    }

   // console.log(this.onGround() + " type: " + this.type)

    this.applyGravity = function() {
        if (this.onGround()) {
        //console.log("piece on ground: " + color)
	    this.y = y - this.height;
	    this.speedY = 0;
        }
	else { // piece is in the air, apply gravity
	    if (this.y < 1) { // make sure we don't leave screen at top
		this.y = 1;
	    }
        
        //dette må ryddes opp i. for mye if-else, og å sjekke etter color er ikke helt optimalt. var bare løsninga jeg kom på først under testing
        if(color == "red")
        {
            accelY(myGamePiece2,-gravity);
        }
        else if(color == "green")
        {
            accelY(myGamePiece3,-gravity);
        }
        else
        {
            accelY(myGamePiece,-gravity);
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
    myGamePiece2.newPos();
    myGamePiece2.update();
    myGamePiece3.newPos();
    myGamePiece3.update();
    // check button status after update
    if (button3Held && button2Held && myGamePiece.onGround()) {
	//console.log("button 1 is held!")
	myGamePiece.speedX = 1;
    myGamePiece2.speedX = 1;
    myGamePiece3.speedX = 1;
    }
    else if (myGamePiece.onGround()) {
	if (myGamePiece.x > 10) {
	    myGamePiece.speedX = -1;
        myGamePiece2.speedX = -1;
        myGamePiece3.speedX = -1;
	}
	else {
	    myGamePiece.speedX = 0;
        myGamePiece2.speedX = 0;
        myGamePiece3.speedX = 0;
	}
    }
}

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

function butDown(keycode) {
   //Her lagres verdi for om en knapp holdes nede
    if (keycode == "Space") {
        button1Held = true;
    }
    else if(keycode == p1key) {
        button2Held = true;
    }
    else if(keycode == p2key) {
        button3Held = true;
    } 
}


//Kjøres om en av de designerte spilleknappene er trykt og slippes (keyup) 
function butUp() {

    if (button2Held && button3Held && myGamePiece.onGround()) {
        accelY(myGamePiece, 5);        
        } 
    else if(button2Held)
    {
        if(myGamePiece2.onGround())
        {
            accelY(myGamePiece2, 6);
              
        }
    }
    else if(button3Held)
    {
        if(myGamePiece3.onGround())
        {
            accelY(myGamePiece3, 6);    
        }
        
    }

    //Dette kan sikkert optimaliseres også
    button1Held = false;
    button2Held = false;
    button3Held = false;

}

//Hoppefunksjon
function accelY(piece, n) {
    piece.speedY -= n;
}

function accelX(piece, n) {
    piece.speedX += n;
}

//Keydown-sjekker
document.addEventListener('keydown', (event) => {
    butDown(event.code);
}, false);  

//Keyup-sjekker
document.addEventListener('keyup', (event) => {
    if (event.code == "Space" || p1key || p2key) {
	butUp(event.code);
    }
}, false);





