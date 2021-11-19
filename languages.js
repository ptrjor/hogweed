var navreader = new XMLHttpRequest() || new ActiveXObject('MSXML2.XMLHTTP');
var artreader = new XMLHttpRequest() || new ActiveXObject('MSXML2.XMLHTTP');

// following two functions are black sourcery, snipped from web to allow
// dynamic loading of site fragments

function loadFile(fileName) {
  artreader.open('get', fileName, true);
  artreader.onreadystatechange = displayArticle;
  artreader.send(null);
}
function displayArticle() {
  if(artreader.readyState==4) {
    var el = document.getElementById('article');
    if (artreader.responseText) { // else fallback to local text
      el.innerHTML = artreader.responseText;
    }
  }
}
function displayNavbar() {
  if(navreader.readyState==4) {
    var el = document.getElementById('mySidenav');
    if (navreader.responseText) { // else fallback to local text
      el.innerHTML = navreader.responseText;
    }
  }
}

function fetchContent() { 
  const urlPara = new URLSearchParams(window.location.search);
  let navLang = urlPara.get("lang");
  let navNav = urlPara.get("nav");
  if (!navLang) {
    navLang = "no";
  } 
  if (!navNav) {
    navNav = "info";
  } 
  loadFile(navNav+"_"+navLang+".html")
}

function fetchNavbar(locale) {
  var fileName
  const urlPara = new URLSearchParams(window.location.search);
  let navLang = urlPara.get("lang");
  if (locale) {
    fileName = "navbar_"+locale+".html";
  }
  else if (navLang == "en") {
    fileName = "navbar_en.html";
  }
  else { 
    fileName = "navbar_no.html";
  }
  navreader.open('get', fileName, true);
  navreader.onreadystatechange = displayNavbar;
  navreader.send(null);
}
