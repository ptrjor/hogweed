var daxtrot, p1, p2, ground, bg;
var myScore, hiscorecomponent, hscorecolor;
var rockbottom
var obstacles = [];
var ground_tiles = [] ;
const groundWt = 962 ;
var curScore = 0
var p1Key = "KeyQ";
var p2Key = "KeyP";
var b1Held = false;
var b2Held = false;
const gravity = 0.2;
var game = true;
var hiScore = localStorage.getItem('hiScore'); // Lagrer en highscore i nettleserens lokallagring. Lagres mellom økter på samme maskin, men ikke mellom enheter eller forskjellige nettlesere.

function startGame() {
  gameArea.start();
  bg = new sprComponent(2412, 810, "bg_spr", 0, 1, 1, 1);
  player1 = new sprComponent(62, 48, "player1_spr", 10, 7, 40, 400); 
  player2 = new sprComponent(62, 48, "player2_spr", 0, 7, 130, 400);
  daxtrot = new sprComponent(256, 96, "daxtrot_spr", 20, 4, 10, 850);
  // obs = new sprComponent(64, 64, "hinder_spr", 1, 1, 700, 700);
  myScore = new txtComponent("30px", "Consolas", "black", 40, 40);
  hiscorecomponent = new txtComponent("30px", "Consolas", "black", 980, 40);
  but1 = new hudComponent(56, 56, 'but1_spr', 10, gameArea.canvas.height-60);
  but2 = new hudComponent(56, 56,'but2_spr',
                          gameArea.canvas.width-66,gameArea.canvas.height-60);
}

var gameArea = {
  canvas : document.createElement("canvas"),
  start : function() {
    this.canvas.width = 1280;
    this.canvas.height = 720;
    this.canvas.style = "padding: 0; margin: auto; display: block; width: 1000px; height: 560px;";
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.getElementById("spilldiv"));  
    // Her settes spillcanvas inn før en div kalt spilldiv, slik at vi kan endre plasseringen av spillet på nettsiden
    this.frameNo = 0;
    this.interval = setInterval(updateGameArea, 20);
    rockbottom = gameArea.canvas.height - 90;
    ground_tiles.push(new sprComponent(962, 96, "ground_spr", 5,
                                       1, 0, rockbottom));
    ground_tiles.push(new sprComponent(962, 96, "ground_spr", 5,
                                       1, groundWt, rockbottom));
  },
  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

function txtComponent(width, height, color, x, y) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.update = function(hscorecolor) {
    ctx = gameArea.context;
    ctx.font = this.width + " " + this.height;
    ctx.fillStyle = hscorecolor;
    ctx.fillText(this.text, this.x, this.y);
  };
}

function hudComponent(width, height, sprite, startX, startY) {
  this.width = width
  this.height = height
  this.x = startX
  this.y = startY
  this.sprSheet = sprite;
  this.update = function(isHeld) { // function(isHeld) {
    var imgId = this.sprSheet
    if(isHeld)
    {
      sx = this.width;
    }
    else{
      sx = 0
    }
     // set to this.width to get hilit button sprite
    sy = 0 
    ctx.drawImage(document.getElementById(imgId), sx, sy,
		  this.width, this.height, this.x, this.y,
		  this.width, this.height);
  }
}

function sprComponent(width, height, sprite, collidebuffer, framelen, 
                      startX, startY) {
  // sprites (daxtrot, players, obstacles)
  this.sprSheet = sprite // points to id sprite in style.css
  this.sprFrame = 0 // index in sprSheet of current frame (column in png)
  this.sprReel = 0 // current reel in sprSheet (row in png)
  this.frameLen = framelen // length of reels (before looping)
  // sprite size
  this.width = width; 
  this.height = height;
  this.sprBorder = collidebuffer 
  // position and velocity
  this.speedX = 0;
  this.speedY = 0;    
  this.x = startX;
  this.y = startY;
  // button status (for players)
  this.button = false // set true when button pushed
  this.crashWith = function(otherobj) {
    var myleft = this.x + this.sprBorder;
    var mytop = this.y + this.sprBorder ;
    var myright = this.x + this.width - this.sprBorder;
    var mybottom = this.y + this.height - this.sprBorder;
    var otherleft = otherobj.x + otherobj.sprBorder;
    var otherright = otherobj.x + otherobj.width - otherobj.sprBorder;
    var othertop = otherobj.y + otherobj.sprBorder;
    var otherbottom = otherobj.y + otherobj.height - otherobj.sprBorder;
    var crash = otherobj;
    if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
      crash = false;
    }
    return crash;
  }

  this.onHound = function() { // return true if this is on hound (daxtrot)
    if (this == daxtrot || this.speedY < daxtrot.speedY) {
      return false;
    }
    else {
      return this.crashWith(daxtrot);
    }
  }

  this.onGround = function() { // return true if this is on the ground
    if (this.y >= rockbottom - this.height) {
      return true;
    }
    else {
      return false;
    }
  }

  this.applyGravity = function() {
    if (this.onGround() && this.speedY > -1) {
    // this is running along the ground
      this.y = rockbottom - this.height + this.sprBorder;
      this.speedY = 0; // don't fall through ground
      if (this == daxtrot) { // regulate speed if this is daxtrot
        if(this.x > 20) { // fall back to left of screen
          this.speedX = -2;
          if (this.sprReel != 0) {
            this.frame = 0;
          }
          this.sprReel = 0;
        }
        else { // cruising speed
          this.speedX = 0;
          if (this.sprReel != 1) {
            this.frame = 0;
          }
          this.sprReel = 1;
        }
      }
      else if (this.onHound() == false) { // player running off hound
        if(this.x < daxtrot.x) {
          this.speedX = 4;
          if (this.sprReel != 1) { // switch to running animation
            this.sprFrame = 0; }
          this.sprReel = 1;
        }
        else if (this.x > daxtrot.x) {
          this.speedX = -4;
          if (this.sprReel != 2) { // run left animation
            this.sprFrame = 0; }
          this.sprReel = 2;
        }
      }
      else { // onGround && onHound
        this.y = daxtrot.y - (this.height / 1.5) + daxtrot.sprBorder
        if (this.x < daxtrot.x) { // coming from left
          this.x += this.width * 1.25
          // push other player forward if overlapping position
          if (this == player1 && this.crashWith(player2)) {
            for (let i = 20; this.crashWith(player2); true)
              player2.x += i; }
          else if (this == player2 && this.crashWith(player1)) {
            for (let i = 20; this.crashWith(player1); true)
              player1.x += i; }
        }
        else { // player jump on on daxtrot from right side
          this.x -= this.width * 1.25
          if (this == player1 && this.crashWith(player2)) {
            for (let i = 20; this.crashWith(player2); true)
              player2.x -= i; }
          else if (this == player2 && this.crashWith(player1)) {
            for (let i = 20; this.crashWith(player1); true)
              player1.x -= i; }
        }
        this.sprReel = 0;
        this.sprFrame = 0;
      }
    }
    else if (this.onHound() && this.sprSheet != 'daxtrot' && this.speedY > -1)
    {
      this.y = daxtrot.y - (this.height / 1.5) + daxtrot.sprBorder
      this.speedY = daxtrot.speedY;
      this.speedX = daxtrot.speedX;      
    }
    else { // piece is in the air, apply gravity
      if (this.y < 1) { // make sure we don't leave screen at top
	this.y = 1;
        if (this.speedY < 0) {
          this.speedY = 1;
        }
      }
      if (this.x < 1) { // make sure we don't leave screen to the left
	this.x = 1;
        if (this.speedX < 0) {
          this.speedX = 0;
        }
      }
      accelY(this,-gravity)
    }
  }

  this.newPos = function() {
    this.x += this.speedX;
    this.y += this.speedY; 
    this.applyGravity();
  }

  this.update = function() { // draw current sprite frame
    ctx = gameArea.context;
    if (this.frameLen) { // this is a sprite with animation frames
      if (everyinterval(7)) {
        this.sprFrame+=1 // to next animation frame
        if (this.sprFrame >= this.frameLen) { // cycle animation
          this.sprFrame = 0;
        }
      }
      var imgId = this.sprSheet
      var sx = this.width * this.sprFrame
      var sy = this.height * this.sprReel
      ctx.drawImage(document.getElementById(this.sprSheet),sx,sy,
		    this.width,this.height,this.x,this.y,
		    this.width,this.height);
      
    }
  }
}

function checkHiScore(thisscore) {
  if(thisscore>hiScore)
  {
    localStorage.setItem('hiScore', thisscore)
    return "Congratulations, new highscore!";
  }
  else
  {
    return "No highscore this time. ";
  }
}

function updateGameArea() {
  var x;
  for (i = 0; i < obstacles.length; i += 1) {
    if (daxtrot.crashWith(obstacles[i])) {
      if(game) // kjøres ved game over, 1 gang
      {
        alert("Game over. Your score: " + curScore + ". " + checkHiScore(curScore) + " Refresh the page to try again.")
        game = false
      }
      return;
    }
    else if(obstacles[i].sprSheet == "bird_spr") {
      if (obstacles[i].crashWith(player1)) {
        player1.speedY = -3;
        player1.speedX = -5;
      }
      if (obstacles[i].crashWith(player2)) {
        player2.speedY = -3;
        player2.speedX = -5;
      }
    }
  }
  gameArea.clear();
  var scoreInterval = 6 // increment score every N frames
  var buttonInterval = 20 // reset button status every N frames
  let groundInterval = (groundWt / 4).toFixed(0) // spawn unending ground tiles
  var paralaxInterval = 12 // scroll background
  bg.update();
  gameArea.frameNo += 1;
  // scroll background, increment score
  if (gameArea.frameNo == 1 || everyinterval(groundInterval)) {
    ground_tiles.push(new sprComponent(962, 96, "ground_spr", 5,
				       1, gameArea.canvas.width, rockbottom));
  }
  if (gameArea.frameNo == 1 || everyinterval(scoreInterval)) {
    curScore = curScore + 1;
  }
  if (gameArea.frameNo == 1 || everyinterval(paralaxInterval)) {
    bg.x -= 1;
  }
  myScore.text="SCORE: " + curScore;
  myScore.update();
  if(curScore>hiScore){
    hscorecolor = "red";
    hiscorecomponent.text="High Score: " + curScore;
    hiscorecomponent.update(hscorecolor);
  }
  else{
    hscorecolor = "black";
    hiscorecomponent.text="High Score: " + hiScore;
    hiscorecomponent.update();
  }
  
  // scroll ground and obstacles
  for (i = 0; i < ground_tiles.length; i+= 1) {
    ground_tiles[i].x -= 3 ;
    ground_tiles[i].update();
  }
  for (i = 0; i < obstacles.length; i += 1) {
    obstacles[i].x += -3;
    obstacles[i].update();
    if (obstacles[i].sprSheet == "bird_spr") {
      obstacles[i].x += -1;
      obstacles[i].y += obstacles[i].speedY;
      if (obstacles[i].y < obstacles[i].minY || obstacles[i].y > obstacles[i].maxY)
      {
        obstacles[i].speedY = - obstacles[i].speedY;
      }
    }
  }
  // move daxtrot and players
  daxtrot.newPos(); daxtrot.update();
  player1.newPos(); player1.update();
  player2.newPos(); player2.update();
  // spawn new obstacles
  // Hadde vært fint å hardkode et level med varierende obstacles,
  // men dette er allerede spillbart som "endless runner"
  if (gameArea.frameNo == 1 || everyinterval(hinderInterval)) {
    x = gameArea.canvas.width;
    y = rockbottom - 55;
    obstacles.push(new sprComponent(64, 64, "hinder_spr", 5, 1, x, y));
  }
  // reset button status
  if (everyinterval(buttonInterval)) {
    player1.button = false;
    player2.button = false;
  }
  but1.update(b1Held);
  but2.update(b2Held);
}

function everyinterval(n) {
  if ((gameArea.frameNo / n) % 1 == 0) {return true;}
  return false;
}

function butUp(keycode) {
  var pThis // which player just pressed their button
  var pOther // reference other player here
  if(keycode == p1Key && player1.onHound()) {
    pThis = player1; 
    pOther = player2; 
  }
  else if(keycode == p1Key && player1.onGround()) {
    player1.speedY = -9;
    return;
  }
  else if(keycode == p2Key && player2.onHound()) {
    pThis = player2;
    pOther = player1;
  }
  else if(keycode == p2Key && player2.onGround()) {
    player2.speedY = -9;
    return;
  }
  else {
    return
  }
  pThis.button = true
  if (pOther.button == true && daxtrot.onGround()) {
    // both players pushed button, make daxtrot jump
    pThis.button = false;
    pOther.button = false;
    // pOther just jumped, make sure both stay on dax
    pOther.y = daxtrot.y - (pOther.height / 1.5)
    pOther.speedY = 0
    daxtrot.speedY = -9;
    daxtrot.speedX = 3;
    return;
  }
  // check player jumps
  if (pThis.onHound()) { 
    pThis.speedY = -9;
    pThis.speedX = 3;
  }
}

function butDown(keycode) {
  // Her lagres verdi for om en knapp holdes nede - gjeninnførte for å bruke spriteupdate på knappene 10.11 -Petter
  if(keycode == p1Key) {
    b1Held = true;
  }
  else if(keycode == p2Key) {
    b2Held = true;
  }
}

// Hoppefunksjon, y-verdi, oppover
function accelY(piece, n) {
  piece.speedY -= n;
}

// Hoppefunksjon, x-verdi, forover
function accelX(piece, n) {
  piece.speedX = n;
}

// Keydown-sjekker
document.addEventListener('keydown', (event) => {
  butDown(event.code);
}, false);  

// Keyup-sjekker
document.addEventListener('keyup', (event) => {
  butUp(event.code);
  if(event.code == p1Key) {
    b1Held = false;
  }
  else if(event.code == p2Key) {
    b2Held = false;
  }
}, false);


// Nav-bar funksjoner
function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}
