var daxtrot, p1, p2, ground, bg;
var myScore, hiscorecomponent, hscorecolor;
var rockbottom;
var obstacles, ground_tiles, backdrops, collectibles;
var runDist, curScore, curCollected, jackpot ;
const groundWt = 962 ;
var b1Held = false;
var b2Held = false;
const gravity = 0.2;
var gameOver = false;
var mobile = false;
var lastscore, hitext;
var k = 0;
var c;
var pkeychange = 1;
var startscrn = true;
var startbtn, changeInputCmp;
var hiScore = localStorage.getItem('hiScore'); // Lagrer en highscore i nettleserens lokallagring. Lagres mellom økter på samme maskin, men ikke mellom enheter eller forskjellige nettlesere.
var p1Key = localStorage.getItem('config_p1')
var p2Key = localStorage.getItem('config_p2')
if (!p1Key) { p1Key = "KeyQ"; }
if (!p2Key) { p2Key = "KeyP"; }

// Get language from URL parameters
const urlPara = new URLSearchParams(window.location.search);
var lang = urlPara.get("lang");
if (!lang) { lang = "no"; }

function startScreen(scr, newHscore) {  
  
  if(screen.width<450){
    if (lang == "en") {
      document.getElementById("spilldiv").innerHTML = "Rotate screen and refresh to play.";
    }
    else if (lang == "no") {
      document.getElementById("spilldiv").innerHTML = "Roter skjermen og oppdater nettsiden for å spille.";
    }
    return
  } else if(screen.width>450 && screen.width<922){
    mobile = true;
    document.getElementById("navigasjon").style = "position: absolute; font-size: 120%; top: 40%; margin-left: 103%; text-align: center;";
  } // Dette betyr at det sannsynligvis er en rotert mobilskjerm

  startscrn = true;
  obstacles = [];
  collectibles = [];
  ground_tiles = [];
  backdrops = [];
  gameArea.frameNo = 0;
  curScore = 0;
  runDist = 0;
  curCollected = [];
  jackpot = 0 // give bonus points here (eg. for collecting treasure)

  gameArea.start(startscrn);
  bg = new sprComponent(2412, 810, "bg_spr", 0, 1, 1, 1);
  bg.update();
  startbtn = new txtComponent("40px", "Consolas", "brown", gameArea.canvas.width/2-180, gameArea.canvas.height/2);
  if(!mobile){
  p1keytext = new txtComponent("20px", "Consolas", "green", gameArea.canvas.width-400, gameArea.canvas.height-50);
  p2keytext = new txtComponent("20px", "Consolas", "red", gameArea.canvas.width-200, gameArea.canvas.height-50);
  changeInputCmp = new txtComponent("20px", "Consolas", "black", 50, gameArea.canvas.height-50);
  }
  if (lang=="en") {
    startbtn.text = "Click to play"; 
    if(!mobile){
    changeInputCmp.text = "Click to change game buttons";
    p1keytext.text = "Player 1: " + p1Key[3];
    p2keytext.text = "Player 2: " + p2Key[3];
    }
}
  else if (lang=="no") {
  startbtn.text = "Klikk for å spille"; 
  if(!mobile){
  changeInputCmp.text = "Klikk for å endre spillknapper";
  p1keytext.text = "Spiller 1: " + p1Key[3];
  p2keytext.text = "Spiller 2: " + p2Key[3];
  }
}
  if(scr>0) // Viser score du fikk på forrige forsøk, dersom du nettopp tapte. Vises ikke om du nettopp startet siden
  {
    if(mobile){
      lastscore = new txtComponent("40px", "Consolas", "brown", gameArea.canvas.width/2-250, 50);
    } else{
      lastscore = new txtComponent("40px", "Consolas", "brown", 420, 150);
    }
    hitext = new txtComponent("40px", "Consolas", "brown",
                              gameArea.canvas.width/2-220,
                              gameArea.canvas.height/2-100);
    if (lang=="en") {
      lastscore.text = "Game over. Score: " + scr;
      startbtn.text = "Click to play";
      if (newHscore) {
        hitext.x = gameArea.canvas.width/2-330;
        hitext.text = "Congratulations, new high score!"
        hitext.color = "orange";}
      else {
        hitext.text = "Try again, fail better!";
      }
    }
    else if (lang=="no") {
      lastscore.text = "Dære kræsja. Poeng: " + scr;
      startbtn.text = "Klikk for å spille";
      if (newHscore) {
        hitext.text = "Gratulerer med ny rekord!"
        hitext.color = "orange";}
      else {
        hitext.text = "Bedre lykke neste gang!";
      }
    }
    lastscore.update();
    hitext.update();
  }
  startbtn.update();
  if(!mobile){
  p1keytext.update();
  p2keytext.update();
  changeInputCmp.update();
  }
  c = gameArea.canvas;
  c.addEventListener("click",handleclick,false);
}

function handleclick(e){
  e.preventDefault();
  var rect = c.getBoundingClientRect();
  var cx = e.clientX;
  var cy = e.clientY;

  var rectleft = rect.left.toFixed(0);
  var recttop = rect.top.toFixed(0);

  var x = cx-rectleft;
  var y = cy-recttop
  console.log("clicked: " + x + " y: " + y)
  if(x<410 && y>600 && mobile == false)
  {
    changeInput();
    c.removeEventListener("click",handleclick)
  }
  else{
  startGame();
  c.removeEventListener("click",handleclick)
}
}

function changeInput()
{
  pkeychange = 1;
  bg.update();
  if (lang=="en") {
  startbtn.text = "Tap button for player 1, green. Default: Q"
  }
  else{
  startbtn.text = "Trykk på knapp for spiller 1, grønn. Standard: Q"
  }
  startbtn.x = 100;
  startbtn.update();
  document.addEventListener('keydown',handleKeydown,false);  
}

function handleKeydown(event){
  bg.update();
  if(pkeychange == 1){
      if (String.fromCharCode(event.keyCode).match(/(\w|\s)/g)) {
          // Trykt knapp må være en bokstavknapp
          p1Key = event.code;
          localStorage.setItem('config_p1', p1Key)        
          console.log("P1 key now: "+p1Key)
        if(lang=="en"){
        startbtn.text = "Player 1 key: " + p1Key[3] + ". Choose player 2 key."
        } else{
        startbtn.text = "Knapp for spiller 1: " + p1Key[3] + ". Velg knapp for spiller 2."
        }
        startbtn.x = 100;
        startbtn.update();
        pkeychange = 2;
      } else {
        // Andre knapper som esc, ctrl osv. funker ikke
        if(lang=="en"){
          startbtn.text = "Key " + event.code + " is not a valid character."
          } else{
          startbtn.text = "Knapp " + event.code + " er ikke en gyldig knapp."
          }
          startbtn.x = 200;
          startbtn.update();
      }
    } 
  else if(pkeychange == 2){
    if(event.code == p1Key){
      if(lang=="en"){
        startbtn.text = "Player 2 key cannot be the same as Player 1";
        } else{
        startbtn.text = "Knapp for spiller 2 kan ikke være samme som spiller 1";
        }
        startbtn.x = 50;
        startbtn.update();
    } 
    else{
      if (String.fromCharCode(event.keyCode).match(/(\w|\s)/g)) {
        p2Key = event.code;
        localStorage.setItem('config_p2', p2Key)
        if(lang=="en"){
        startbtn.text = "Player 2 key: " + p2Key[3] + ". Click to play";
        } else{
        startbtn.text = "Knapp for spiller 2: " + p2Key[3] + ". Klikk for å spille";
        }
        c.addEventListener("click",handleclick,false);
        startbtn.x = 100;
        startbtn.update();
        document.removeEventListener('keydown', handleKeydown);
      } else{
        if(lang=="en"){
          startbtn.text = "Key " + event.code + " is not a valid character."
          } else{
          startbtn.text = "Knapp " + event.code + " er ikke en gyldig knapp."
          }
          startbtn.x = 200;
          startbtn.update();
    }}}}

function startGame() {
  startscrn = false;
  keydownListeners();
  gameArea.start(startscrn);
  player1 = new sprComponent(62, 48, "player1_spr", 10, 7, 40, 400); 
  player2 = new sprComponent(62, 48, "player2_spr", 0, 7, 130, 400);
  daxtrot = new sprComponent(256, 96, "daxtrot_spr", 20, 4, 10, 850);
  hiscorecomponent = new txtComponent("30px", "Consolas", "black", 1100, 70);
  if(mobile){
    touchHandle();
    hiscorecomponent.width = "40px";
    hiscorecomponent.x = 2 * gameArea.canvas.width/3 + 30;
    hiscorecomponent.y = 40;
    myScore = new txtComponent("40px", "Consolas", "black",
                               gameArea.canvas.width/2 - 30, 40);
    but1 = new hudComponent(168, 168, 'but1big_spr', 10, 10);
    but2 = new hudComponent(168, 168,'but2big_spr', gameArea.canvas.width-180,10);
  } else{
    hiscorecomponent.x = 1100;
    hiscorecomponent.y = 80;
    myScore = new txtComponent("30px", "Consolas", "black", 1135, 40);
    but1 = new hudComponent(56, 56, 'but1_spr', 10, gameArea.canvas.height-60);
    but1key = new txtComponent("25px", "Consolas", "black", 32, gameArea.canvas.height-25);
    but2 = new hudComponent(56, 56,'but2_spr', gameArea.canvas.width-66,gameArea.canvas.height-60);
    but2key = new txtComponent("25px", "Consolas", "black", gameArea.canvas.width-45, gameArea.canvas.height-25);
  }
}

var gameArea = {
  canvas : document.createElement("canvas"),
  start : function(startscrn) {
    this.canvas.width = 1280;
    this.canvas.height = 720;
    this.canvas.style = "padding: 5px; margin: auto; display: block; width: 1000px; height: 560px;";
    this.canvas.style = "padding: 5px; margin: auto; display: block; max-width: 100%;";
    if(mobile){ 
      this.canvas.width = 1280;
      this.canvas.height = 500;
      this.canvas.style = "width: 100%";
    }
    else {
      document.getElementById("navigasjon").style = "position: absolute; font-size: top: 30; left: 10; text-align: center;" //    hiscorecomponent = new txtComponent("30px", "Consolas", "black", 1100, 50, 40);
    }
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.getElementById("spilldiv"));  
    // Her settes spillcanvas inn før en div kalt spilldiv, slik at vi kan endre plasseringen av spillet på nettsiden
    this.frameNo = 0;
    
    if(startscrn){
      this.pause = true;
    } else{
      this.interval = setInterval(updateGameArea, 20);
      this.pause = false;
    }
    rockbottom = gameArea.canvas.height - 90;
    ground_tiles.push(new sprComponent(962, 96, "ground_spr", 5, 1, 0, rockbottom));
    ground_tiles.push(new sprComponent(962, 96, "ground_spr", 5, 1, groundWt, rockbottom));
  },
  stop : function() {
    clearInterval(this.interval, gameArea.start.interval);
    this.pause = true;
    this.frameNo = 0;
  }, 
  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
}

function txtComponent(width, height, color, x, y) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.color = color
  this.update = function(hscorecolor) {
    if (!hscorecolor) { hscorecolor = this.color; }
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
  // sprites (daxtrot, players, obstacles, collectibles)
  this.sprSheet = sprite // points to id sprite in style.css
  this.sprFrame = 0 // index in sprSheet of current frame (column in png)
  this.sprReel = 0 // current reel in sprSheet (row in png)
  this.frameLen = framelen // length of reels (before looping)
  this.throttleAnim = false // prevent from animating
  // sprite size
  this.width = width; 
  this.height = height;
  this.sprBorder = collidebuffer 
  // position and velocity
  this.speedX = 0;
  this.speedY = 0;    
  this.x = startX;
  this.y = startY;
  // status switches
  this.isVulturefodder = false; // if true, can be carried off screen
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
        // daxtrot speed for held buttons
        if (b1Held && b2Held && player1.onHound() && player2.onHound()) {
          this.speedX = 2;
          this.sprReel = 1;
        }
        // else if (((b2Held && player2.onHound()) || (b1Held && player1.onHound())) && this.x > 20) {
        //   this.speedX = -2;
        //   this.sprReel = 0;
        else if(this.x > 20) // && (player1.onHound()==false) && (player2.onHound()==false))
        { // fall back to left of screen
          this.speedX = -2;
          this.sprReel = 0;
        }
        else { // cruising speed
          this.speedX = 0;
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
        else { // player jump on daxtrot from right side
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
    { // this is sitting on daxtrot
      this.y = daxtrot.y - (this.height / 1.5) + daxtrot.sprBorder
      this.speedY = daxtrot.speedY;
      this.speedX = daxtrot.speedX;
      if (this.sprReel != 0) {
        this.sprReel = 0;
      }
    }
    else { // piece is in the air, apply gravity
      if (this.y < 1 && this.isVulturefodder == false) { // don't leave screen
	this.y = 1;
        if (this.speedY < 0) {
          this.speedY = 1;
        }
      }
      if (this.x < 1 && this.isVulturefodder == false) { // don't leave screen
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
    if (this.frameLen) { // animated sprite
      if (everyinterval(7)) {
        if (!this.throttleAnim) {
          this.sprFrame+=1 // to next animation frame
          if (this.sprFrame >= this.frameLen) { // cycle animation
            this.sprFrame = 0;
          }
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
    hiScore = thisscore
    return true;
  } else {
    return false; 
  }
}

function updateGameArea() { // one game turn
  if (gameArea.pause) {return;}
  if (gameOver) { // kjøres ved game over, 1 gang
    gameArea.stop();
    if (jackpot) {
      curScore += jackpot;
      jackpot = 0;
    }
    startScreen(curScore, checkHiScore(curScore));
    gameOver = false;
    return;
  }
  gameArea.clear();
  var scoreInterval = 6 // increment score every N frames
  var buttonInterval = 20 // reset button status every N frames
  var paralaxInterval = 12 // scroll background
  bg.update();
  gameArea.frameNo += 1;
  runDist += 1
  // spawn backdrops and obstacles
  rockMap.testCoord(runDist) 
  // scroll ground tiles and backdrops
  for (i = 0; i < ground_tiles.length; i+= 1) {
    ground_tiles[i].x -= 3 ;
    ground_tiles[i].update();
    }
  for (i = 0; i < backdrops.length; i += 1) {
    backdrops[i].x += -3;
    if (backdrops[i].sprSheet == "tutorial_spr") { // animation sequence
      if (backdrops[i].sprFrame > 3) {
        if (backdrops[i].sprReel == 0) {
          if (gameArea.frameNo > 200) {
            backdrops[i].throttleAnim = false
            backdrops[i].sprReel = 1 ; backdrops[i].sprFrame = 0;}
          else {
            backdrops[i].throttleAnim = true;
          }
        }
        else {
          backdrops[i].throttleAnim = true;}
      }
      else if (75 < gameArea.frameNo) {backdrops[i].throttleAnim = false; }
      else {backdrops[i].throttleAnim = true};
    }
    backdrops[i].update();
  }
  // scroll collectibles
  for (i = 0; i < collectibles.length; i += 1) {
    let pup = collectibles[i]
    let collided = false
    pup.x += -3;
    if (pup.crashWith(player1)) {
      collided = player1;
    }
    else if (pup.crashWith(player2)) {
      collided = player2;
    }
    else if (pup.crashWith(daxtrot)) {
      collided = daxtrot;
    }
    if (collided) {
      if (pup.sprSheet == "crown_spr" && (collided != daxtrot)) {
        jackpot += 200
        collectibles.pop(i);
        curCollected.push(pup);
      };
    }
    pup.update()
  };
  // scroll obstacles
  for (i = 0; i < obstacles.length; i += 1) {
    let obs = obstacles[i]
    obs.x += -3;
    if (obs.sprSheet == "bird_spr") {
      obs.x += -1;
      obs.y += obs.speedY;
      if (obs.y < obs.minY || obs.y > obs.maxY)
      {
        obs.speedY = - obs.speedY;
      }
      if (obs.crashWith(player1)) {
        player1.speedY = -3;
        player1.speedX = -5;
      }
      if (obs.crashWith(player2)) {
        player2.speedY = -3;
        player2.speedX = -5;
      }
    }
    else if (obs.sprSheet == "vulture_spr") {
      obs.centerX -= 3 // stay focused on spawned x-coord, scrolling
      if (obs.crashWith(player1) || obs.crashWith(player2)) { // caught frog
        obs.diving = true;
        obs.speedX = -1;
        obs.speedY = -4;
        if (obs.crashWith(player1)) { // hold player1 in claws
          player1.x = obs.x + 30; 
          player1.y = obs.y + 40;
          player1.isVulturefodder = true; // allow player to leave screen
        }
        else if (obs.crashWith(player2)) { // hold player1 in claws
          player2.x = obs.x + 30; 
          player2.y = obs.y + 40;
          player2.isVulturefodder = true;
        }
      }
      else if(!obs.diving) { // check if above vulnerable player avatar
        if(obs.x-15<player1.x && obs.x+15>player1.x && !player1.onHound() && player1.y > obs.y) {
          obs.diving = true; // try to snatch player 1
          obs.speedY = 12;
          obs.speedX = 0;
        }
        else if(obs.x-15<player2.x && obs.x+15>player2.x && !player2.onHound() && player2.y > obs.y) {
          obs.diving = true; // try to snatch player 1
          obs.speedY = 12;
        obs.speedX = 0;
        }
      }
      if (obs.diving) { // vulture diving to catch a frog
        if (obs.y + obs.height > rockbottom) { // missed player, now fly away
          obs.speedX = -1;
          obs.speedY = -4;
        }
      }
      else { // normal movement pattern
        let maxY = obs.centerY + obs.sverve
        let minY = obs.centerY - obs.sverve
        let maxX = obs.centerX + obs.sverve * 2
        let minX = obs.centerX - obs.sverve * 2
        console.log("min/max",minX,minY,"/",maxX,maxY,"sverve:",obs.sverve,"pos:",obs.x,obs.y)
        if (obs.y > maxY) {
          obs.speedY = - 2;
        }
        else if (obs.y < minY) {
          obs.speedY = 2;
        }
        if (obs.x > maxX) {
          obs.speedX = -6;
        }
        else if (obs.x < minX) {
          obs.speedX = 3;
        }
      };
      // apply flying speed
      obs.y += obs.speedY;
      obs.x += obs.speedX;
      if (obs.speedX <= 0) {
        obs.sprReel = 0;}
      else {
        obs.sprReel = 1;}
    }
    obs.update()
    if (obs.crashWith(daxtrot)) {
      console.log("Crash with "+obs.sprSheet)
      gameOver = true // handle i neste frame
    }
  }
  // move daxtrot and players
  daxtrot.newPos(); daxtrot.update();
  player1.newPos(); player1.update();
  player2.newPos(); player2.update();
    
  // reset button status
  if (everyinterval(buttonInterval)) {
    player1.button = false;
    player2.button = false;
  }
  but1.update(b1Held);
  but2.update(b2Held);
  if(!mobile){
    but1key.text = p1Key[3];
    but1key.update();
    but2key.text = p2Key[3];
    but2key.update();
  }
  // increment score
  if (jackpot) { // just got bonus points
    curScore ++;
    jackpot --;
  }
  if (everyinterval(scoreInterval)) {
    curScore = curScore + 1;
  }
  if (everyinterval(paralaxInterval)) {
    bg.x -= 1;
  }
  myScore.text=curScore;
  if(curScore>hiScore){
    hiscorecomponent.text="🜲 " + curScore;
    myScore.update("orange");
    hiscorecomponent.update("orange");
  }
  else{
    hiscorecomponent.text="🜲 " + hiScore;
    myScore.update("black");
    hiscorecomponent.update("black");
  }
}
function everyinterval(n) {
  if ((gameArea.frameNo / n) % 1 == 0) {return true;}
  return false;
}

function butUp(keycode) {
  if(keycode==p1Key){b1Held=false;but1.update(b1Held);if(!mobile){but1key.update()}}
  if(keycode==p2Key){b2Held=false;but2.update(b2Held);if(!mobile){but2key.update()}}
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

  if(mobile){butUp(keycode)}
}

// Hoppefunksjon, y-verdi, oppover
function accelY(piece, n) {
  piece.speedY -= n;
}

// Hoppefunksjon, x-verdi, forover
function accelX(piece, n) {
  piece.speedX = n;
}

function keydownListeners(){
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
  }


// Nav-bar funksjoner
function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
  gameArea.pause = true;
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  gameArea.pause = false;
}

// Under er eventlistenere som gir mobil-touch funksjonalitet

function touchHandle(){
  window.addEventListener('touchstart', handleStarttouch, false);

  function handleStarttouch(evt){
    evt.preventDefault();
    posx = evt.touches[0].clientX.toFixed(2);
    posy = evt.touches[0].clientY.toFixed(2);

    if(evt.targetTouches.length > 1) // Fyrer av hopp for begge knappene dersom det trykkes samtidig (uansett hvor)
    {
      butDown(p1Key)
      but1.update(true)
      butDown(p2Key)
      but2.update(true)
    }

    if(posx<175 && posy<190) // P1 Hopp dersom Q klikkes
      {
        butDown(p1Key)
        but1.update(true);
      }
    if(posx>screen.width-180 && posy < 190) // P2 Hopp dersom P klikkes
      {
        butDown(p2Key)
        but2.update(true)
      }
  }

  // Touchend event - dersom vi skulle trenge å holde inne knappene f.eks. siden de nå bare funker med 'tap'
  /*
  window.addEventListener('touchend', handleEndtouch, false);
  function handleEndtouch(evt){
    evt.preventDefault();
    show.innerHTML = "tend";
  }
  // Klikkevent for samme greia. Brukes ikke nå, men i fall vi ønsker å bruke senere lagrer jeg den her   
  window.addEventListener('click', canvclick, false);
  function canvclick(e) {    
    var pos = getMousePos(gamecanvas, e);
    posx = pos.x;
    posy = pos.y;    
    if(mobile){
      if(posx>5 && posx<175 && posy<190 && posy>10)
      {
        butDown(p1Key)
      }

      if(posx>1100 && posx<1265 && posy<190 && posy>10)
      {
        butDown(p2Key)
      }
    }
  } 
  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
  } */ 
}

var rockMap = {
  hinderInterval: 200,
  groundInterval: (groundWt / 4).toFixed(0), // spawn unending ground tiles
  randomInterval: 200,
  testCoord : function(dist) {
    var nuObs
    // spawn ground sprites
    if (gameArea.frameNo == 1 || everyinterval(this.groundInterval)) {
      ground_tiles.push(new sprComponent(962, 96, "ground_spr", 5,
				       1, gameArea.canvas.width, rockbottom));
    }
    // if (everyinterval(this.randomInterval)) {
    //   spawnRandom();
    // }
    switch (dist) { // dist counted in pixels
    case 1: // tutorial tree at position 1
      console.log("We have contact.");
      backdrops.push(new sprComponent(216, 205, "tutorial_spr", 5, 5, gameArea.canvas.width+50, rockbottom - 190));
      break;
    case 200:
      spawnBird(200)
      break;
    case 350:
      spawnHinder()
      break;
    case 700:
      spawnHinder()
      break;
    case 850:
      spawnBird(250)
      break;
    case 1100:
      spawnCrownBones();
      spawnVulture(250);
      break;
    case 1400:
      spawnHinder()
      break;
    case 1590:
      spawnThorns();
      break;
    case 1600:
      spawnThorns();
      break;
    default: // fallback random generation
      if (gameArea.frameNo > 1600 && everyinterval(200)) {
        spawnRandom();
      }
    }
  },
}

function spawnHinder(y,x) { // undeclared x,y to spawn on right side
  if (!x) { x = gameArea.canvas.width; }
  if (!y) { y = rockbottom - 55; }
  obstacles.push(new sprComponent(64, 64, "hinder_spr", 5, 1, x, y));
}
function spawnThorns(y,x) { // undeclared x,y to spawn on right side
  if (!x) { x = gameArea.canvas.width; }
  if (!y) { y = rockbottom - 55; }
  obstacles.push(new sprComponent(175, 75, "thorns_spr", 5, 1, x, y));
}

function spawnBird(y,x) {
  //  var sverve
  if (!x) { x = gameArea.canvas.width; }
  if (!y) { y = rockbottom - (60 + Math.floor(Math.random() * 250)); }
  nuObs = new sprComponent(54, 36, "bird_spr", 5, 4, x, y);
  // attributes to fly up and down
  var sverve = ((rockbottom - 60) - y) / 2
  nuObs.maxY = y + sverve
  nuObs.minY = y - sverve
  if (nuObs.minY < 10) {
    nuObs.minY = 10;
  }
  if (Math.floor(Math.random() * 1)) {
    nuObs.speedY = -2;
  }
  else {
    nuObs.speedY = 2;
  };
  obstacles.push(nuObs);
}

function spawnVulture(y,x) {
  if (!x) { x = gameArea.canvas.width; }
  if (!y) { y = rockbottom - (100 + Math.floor(Math.random() * 400)); }
  let startY = y - ((rockbottom - 60 - y) / 3)
  nuObs = new sprComponent(120, 100, "vulture_spr", 20, 4, x, startY);
  nuObs.centerY = y // circle this point
  nuObs.centerX = x // circle above this point
  nuObs.sverve = (rockbottom - 60 - y) / 4
  // if (startY - nuObs.sverve < 10) {
  //   nuObs.sverve = startY - 10;}
  console.log(nuObs.centerX,"/",nuObs.centerY,nuObs.sverve);
  nuObs.speedX = -3
  nuObs.speedY = 1
  nuObs.diving = false; // if true, dive to catch a frog
  obstacles.push(nuObs);
}

function spawnTalltrunk(y,x) {
  if (!x) { x = gameArea.canvas.width; }
  if (!y) { y = rockbottom - 300; }
  nuObs = new sprComponent(143, 310, "talltrunk_spr", 1, 1, x, y);
  backdrops.push(nuObs);
}
function spawnTallesttrunk(y,x) {
  if (!x) { x = gameArea.canvas.width; }
  if (!y) { y = rockbottom - 420; }
  nuObs = new sprComponent(200, 434, "tallertrunk_spr", 1, 1, x, y);
  backdrops.push(nuObs);
}
function spawnCrownBones(y,x) {
  if (!x) { x = gameArea.canvas.width; }
  if (!y) { y = rockbottom - 30 }
  nuObs = new sprComponent(80, 40, "bones_spr", 1, 1, x, y);
  backdrops.push(nuObs);
  nuPup = new sprComponent(80, 40, "crown_spr", 1, 8, x, y);
  collectibles.push(nuPup);
}  

function spawnRandom(y,x) {
  /// test: random enemies
  spawnType = Math.floor(Math.random() * 5) // which type of hinder
  if (spawnType == 0) {
    spawnHinder();
  }
  else if (spawnType == 1) {
    spawnBird();
  }
  else if (spawnType == 2) {
    spawnVulture();
  }
  else if (spawnType == 3) {
    spawnThorns();
  }
  else if (spawnType == 4) {
    spawnTallesttrunk();
  }
}  
