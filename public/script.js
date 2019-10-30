//let url = "https://mysterious-headland-07008.herokuapp.com/";
let url = "http://localhost:8000/";

// create a entry box object
class Entry{
    constructor(firstName, lastName, time, id, status){
        this.eFirstName = firstName;
        this.eLastName = lastName;
        this.eDescription = "";
        // get the time (in milliseconds) of today
        this.eTime = time;
        this.id = id;
        this.status = status;
        this.eFullName = this.eFirstName+" "+this.eLastName;
    }
    
    setId(id){
        this.id = id;
    }
}

function loadAll(response, session_id){
    clearQueue();
    response = JSON.parse(response);
    for (entry in response["data"]){
        currentEntry = response["data"][entry];
        // only show if active is 1 
        if (currentEntry["active"]===1 & currentEntry["session_id"]===session_id){
            let firstNameE = currentEntry["first_name"];
            let lastNameE = currentEntry["last_name"];
            // create a time 
            let tempTime = new Date(currentEntry["time"]);
            let time = tempTime.getHours().toString()+":"+tempTime.getMinutes().toString()+":"+tempTime.getSeconds().toString();
            let id = currentEntry["person_id"];
            let status = currentEntry["active"];
            // create an entry object instance
            let newEntry = new Entry(firstNameE, lastNameE, time, id, status);
            entryToText(newEntry, time);
        }
    }
}

function getPatch(response){
    clearQueue();
    response = JSON.parse(response);
    for (entry in response["data"]){
        currentEntry = response["data"][entry];
        // only show if active is 1 
        httpPatchAsync(url,currentEntry["person_id"]);
    }
}

function clearQueue(){
    document.getElementById("queueEntries").innerHTML = "";
}

function httpGetAsync(theUrl, session_id){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            loadAll(xmlHttp.responseText, session_id);
    }
    xmlHttp.open("GET", theUrl+"api/queue", true); // true for asynchronous 
    xmlHttp.send(null);
}

function httpGetPatchAsync(theUrl){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            getPatch(xmlHttp.responseText);
            window.location.reload();
    }
    xmlHttp.open("GET", theUrl+"api/queue", true); // true for asynchronous 
    xmlHttp.send(null);
}

function httpPostAsync(theUrl, firstName, lastName, time, session_id){
    let response;
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            response = xmlHttp.responseText;
        }
    }
    params = "first_name="+firstName+"&last_name="+lastName+"&time="+time+"&session_id="+session_id;
    xmlHttp.open("POST", theUrl+"api/queue?"+params, true); // true for asynchronous 
    xmlHttp.send();
    return response;
}

function httpPatchAsync(theUrl, params){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            response = xmlHttp.responseText;
        }
    }
    xmlHttp.open("PATCH", theUrl+"api/queue/"+params, true); // true for asynchronous 
    xmlHttp.send();
}

function httpDeleteAsync(theUrl, params){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            response = xmlHttp.responseText;
            window.location.reload();
    }
    xmlHttp.open("DELETE", theUrl+"api/queue/"+params, true); // true for asynchronous 
    xmlHttp.send(null);
    console.log("done");
}

function confirmAction(url,newEntryId){
    let publicKeyText = localStorage.getItem("publicKey");
    let userEnteredKey = prompt('Enter private key to delete this entry.');
    sessionDeleteCheck(url, newEntryId, publicKeyText, userEnteredKey);
}

// define a function that will turn an entry into text
function entryToText(newEntry, date){
    // create text element
    let para = document.createElement("p");
    let nameText = document.createTextNode(newEntry.eFullName);
    let dateText = document.createTextNode(" "+date+" ");
    let lineBreak = document.createElement("br");
    let queue = document.getElementById('queueEntries');
    let xText = document.createTextNode("  ");
    let img = document.createElement("img");

    // set attributes if needed
    para.setAttribute("class","queueEntry");
    img.setAttribute("src", "images/x-icon.png");
    img.setAttribute("height", "10");
    img.setAttribute("width", "10");
    img.setAttribute("alt", "x-out-button");

    // set onclick function
    img.onclick = function(){
        confirmAction(url,newEntry.id);
    }

    // append to para
    para.appendChild(nameText);
    para.appendChild(xText);
    para.appendChild(dateText);
    para.appendChild(img);
    queue.appendChild(para);
}

// create a new entry based off of form 
function createEntry(){
    // get the info from html element by ID
    let firstNameE = document.getElementById("firstName").value;
    let lastNameE = document.getElementById("lastName").value;
    // create a time 
    let time = new Date().getTime();
    // create an entry object instance
    let newEntry = new Entry(firstNameE, lastNameE, time);
    return newEntry;
}

// "try it" button onclick function
function formSubmit(){
    let sampleEntry = createEntry();
    let publicKeyText = localStorage.getItem("publicKey");
    sessionPostSessionId(url,sampleEntry.eFirstName,sampleEntry.eLastName,sampleEntry.eTime, publicKeyText);
    sessionsGetSessionId(url, publicKeyText);
}

function archiveQueue(){
    httpGetPatchAsync(url);
}

function onLoad(){
    // get session id 
    let publicKeyText = localStorage.getItem("publicKey");
    sessionsGetSessionId(url, publicKeyText);
    let publicKeyTextArea = document.getElementById("publicKeyText");
    publicKeyTextArea.append(publicKeyText);
}

function keySubmit(){
    let publicKey = document.getElementById("publicKey").value;
    localStorage.setItem("publicKey", publicKey);
    window.location.reload();
}

// function to generate a random 6 digit number 
function generateKeys(){
    // generate the public and private keys
    let privateKey = Math.floor(100000 + Math.random() * 900000);
    let publicKey = Math.floor(100000 + Math.random() * 900000);
    sessionsGetAllKeys(url, publicKey, privateKey);
}

/* API CALLS FOR SESSIONS API */

// helper function for sessionsGetAllKeys api call 
function checkKeys(response, publicKey, privateKey){
    response = JSON.parse(response);
    if ("data" in response){
        generateKeys();    
    } else {
        alert("Private Key: "+privateKey+"\r \nPublic Key: "+publicKey);
        sessionPostKeys(url,publicKey, privateKey);
    }
}

// request to get by ALL key numbers (private and public)
function sessionsGetAllKeys(theUrl, privateKey, publicKey){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            checkKeys(xmlHttp.responseText, publicKey, privateKey);
    }
    xmlHttp.open("GET", theUrl+"api/sessions/?public_key="+publicKey+"&private_key="+privateKey, true); // true for asynchronous 
    xmlHttp.send(null);
}

// helper function for sessionsGetSessionId
function getLoadSessionId(response){
    response = JSON.parse(response);
    let session_id;
    if ("data" in response){
        session_id = response["data"]["session_id"];
        httpGetAsync(url, session_id);
    } else {
        session_id = null;
    }
}

// request to get session id by public key
function sessionsGetSessionId(theUrl, publicKey){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            getLoadSessionId(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl+"api/sessions/?public_key="+publicKey, true); // true for asynchronous 
    xmlHttp.send(null);
}

// helper function for sessionsGetSessionId
function getPostSessionId(response, theUrl, firstName, lastName, time){
    response = JSON.parse(response);
    if ("data" in response){
        session_id = response["data"]["session_id"];
        httpPostAsync(theUrl, firstName, lastName, time, session_id);
    }
}

// request to get + post a queue using session id 
function sessionPostSessionId(theUrl, firstName, lastName, time, publicKey){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            getPostSessionId(xmlHttp.responseText, theUrl, firstName, lastName, time);
    }
    xmlHttp.open("GET", theUrl+"api/sessions/?public_key="+publicKey, true); // true for asynchronous 
    xmlHttp.send(null);
}

// request to post keys 
function sessionPostKeys(theUrl, publicKey, privateKey){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            response = xmlHttp.responseText;
        }
    }
    params = "public_key="+publicKey+"&private_key="+privateKey;
    xmlHttp.open("POST", theUrl+"api/sessions/?"+params, true); // true for asynchronous 
    xmlHttp.send();
}

// helper for sessionDeleteCheck (deletes the item if the key matches)
function deleteRow(theUrl, response, newEntryId){
    response = JSON.parse(response);
    if ("data" in response){
        // delete the item
        httpDeleteAsync(theUrl,newEntryId);
    } else {
        alert("Wrong private key.");
    }
}

// request to check delete permissions 
function sessionDeleteCheck(theUrl, newEntryId, publicKey, privateKey){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            deleteRow(theUrl, xmlHttp.responseText, newEntryId);
    }
    xmlHttp.open("GET", theUrl+"api/sessions/auth/?public_key="+publicKey+"&private_key="+privateKey, true); // true for asynchronous 
    xmlHttp.send(null);
}

// setTimeout(function(){
//     window.location.reload(1);
//  }, 5000);