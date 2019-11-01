/* 
* Author: Tiffany Xiao
* Description: Javascript code for ta-hours-queue
* Date last modified: See Github repo (https://github.com/tiffanyxiao/ta-hours-queue)
* 
* naming convention for API requests: request{TableName}{Type}{Descript}
* naming convention for callback functions: callback{RequestName}
*/

//let url = "https://mysterious-headland-07008.herokuapp.com/";
let url = "http://localhost:8000/";

/* 
* Each instance of the Entry class represents an entry in the queue for a single session. 
* The constructor includes fields representing each column.
*/
class Entry{
    /* 
    * Constructor for an entry.
    *
    * @param    {string}    firstName   The first name of the student (of this entry).
    * @param    {string}    lastName    The last name of the student (of this entry).
    * @param    {time}      int         The time this entry was created.
    * @param    {id}        int         id for this entry. Correlates to the rowid of database.
    * @param    {active}    int         Either 0 or 1. 0 for non-active entry, 1 for active entry.
    */
    constructor(firstName, lastName, time, id, active){
        this.eFirstName = firstName;
        this.eLastName = lastName;
        this.eDescription = "";
        this.eTime = time;
        this.id = id;
        this.active = active;
        this.eFullName = this.eFirstName+" "+this.eLastName;
    }
    
    /* 
    * Function to set the id of this entry
    *
    * @param {int}  id  The new id to set this entry's id to.
    */
    setId(id){
        this.id = id;
    }
}

/* 
* Each instance of the Session class represents an entry in the session queue.
* The constructor includes fields representing some columns of the sessions table (no private key).
*/
class Session{
    /* 
    * Constructor for an entry.
    *
    * @param    {int}       sessionId      id of the session.
    * @param    {string}    publicKey      Public key for the session.
    * @param    {int}       active          Either 0 or 1. 0 for non-active session, 1 for active session.
    * @param    {string}    sessionName    Name of the session.
    */
    constructor(sessionId, publicKey, active, sessionName, room, TAs){
        this.sSessionId = sessionId;
        this.sPublicKey = publicKey;
        this.sActive = active;
        this.sSessionName = sessionName;
        this.sRoom = room;
        this.sTAs = TAs;
    }
}

/* ------------------------- REGULAR JAVASCRIPT FUNCTION CALLS ------------------------- */ 

/*
* Function to clear all HTML code from queue.
*/
function clearQueue(){
    document.getElementById("queueEntries").innerHTML = "";
}

/*
* Function to ask user to confirm delete action. Then, calls delete API call to delete
* entry from queue table.
* 
* @param    {string}    url     url of the hosted server
* @param    {string}    id      id of entry to delete 
* 
*/ 
function confirmAction(url,newEntryId){
    let publicKeyText = localStorage.getItem("publicKey");
    let userEnteredKey = prompt('Enter private key to delete this entry.');
    requestSessionsGetKeyAuth(url, newEntryId, publicKeyText, userEnteredKey);
}

/*
* Turn the entry instance into html to display.
*
* @param    {string}    newEntry    entry to turn into html
* @param    {string}    date        date & time the entry was made by user
*/
function entryToText(newEntry, date){
    // create text elements
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

    // set onclick function for deleting the entry (call confirmAction)
    img.onclick = function(){
        confirmAction(url,newEntry.id);
    }

    // append elements to paragraph element (to add to queue box) 
    para.appendChild(nameText);
    para.appendChild(xText);
    para.appendChild(dateText);
    para.appendChild(img);
    queue.appendChild(para);
}


/*
* Function to ask user to confirm delete action. Then, calls delete API call to delete
* entry from queue table.
* 
* @param    {string}    url     url of the hosted server
* @param    {string}    id      id of entry to delete 
* 
*/ 
function confirmActionSessions(url, publicKey){
    let userEnteredKey = prompt('Enter private key to delete this entry.');
    requestSessionsGetKeyAuthSessions(url, publicKey, userEnteredKey);
}

/*
* Turn the session instance into html to display.
*
* @param    {string}    newSession    session to turn into html
*/
function sessionToText(newSession){
    // create text elements
    let para = document.createElement("p");
    let nameText = document.createTextNode(newSession.sSessionName);
    let lineBreak = document.createElement("br");
    let roomText = document.createTextNode(newSession.sRoom);
    let taText = document.createTextNode(newSession.sTAs);
    let queue = document.getElementById('sessionEntries');
    let xText = document.createTextNode("  ");
    let img = document.createElement("img");

    // set attributes if needed
    para.setAttribute("class","queueEntry");
    img.setAttribute("src", "images/x-icon.png");
    img.setAttribute("height", "10");
    img.setAttribute("width", "10");
    img.setAttribute("alt", "x-out-button");

    // set onclick function for deleting the entry (call confirmAction)
    img.onclick = function(){
        confirmActionSessions(url, newSession.sPublicKey);
    }

    // append elements to paragraph element (to add to queue box) 
    para.appendChild(nameText);
    para.appendChild(lineBreak);
    para.appendChild(roomText);
    para.appendChild(lineBreak);
    para.appendChild(taText);
    para.appendChild(img);
    queue.appendChild(para);
}
 
/* 
* Create a new entry based off of the entries in the form 
*
*/
function createEntry(){
    // get the info from html element by ID
    let firstNameE = document.getElementById("firstName").value;
    let lastNameE = document.getElementById("lastName").value;
    // create an entry object instance
    let newEntry = new Entry(firstNameE, lastNameE);
    return newEntry;
}

/*
* Submit button on form's onclick function. Creates an entry and adds it to the table and queue.
*
*/ 
function formSubmit(){
    let sampleEntry = createEntry();
    let publicKeyText = localStorage.getItem("publicKey");
    requestSessionsGetToPostEntry(url,sampleEntry.eFirstName,sampleEntry.eLastName, publicKeyText);
    requestSessionsGetPublicKey(url, publicKeyText);
}

/* 
* Clear queue button's onclick function. Calls API call to change all active status and update page.
*
*/
function archiveQueue(){
    requestQueueGetId(url);
}

/*
* Onload function for the queue page. Loads queue and the public key (from local storage).
*
*/
function onLoad(){
    // get session id 
    let publicKeyText = localStorage.getItem("publicKey");
    requestSessionsGetPublicKey(url, publicKeyText);
    let publicKeyTextArea = document.getElementById("publicKeyText");
    publicKeyTextArea.append(publicKeyText);
}

/*
* Onload function for the session page. Loads all sessions
*
*/
function onLoadSessions(){
    let room = document.getElementById("room").value;
    let tas = document.getElementById("taNames").value;
    requestSessionsGetActive(url, room, tas);
}

/* 
* Button to submit public key to local storage's onclick function.
*
*/
function keySubmit(){
    let publicKey = document.getElementById("publicKey").value;
    localStorage.setItem("publicKey", publicKey);
    window.location.reload();
}

/* 
* Function to generate a random 6 digit number for the keys. Then, posts the keys to the 
* sessions table.
*
*/
function generateKeys(){
    // generate the public and private keys
    let sessionName = document.getElementById("sessionName").value;
    requestSessionsGetKey(url, sessionName);
}

/* ------------------------- API CALLS FOR QUEUE TABLE -------------------------  */

/*
* Callback function to load all entries in queue. 
*
* @param    {JSON string}   response    response string from API call
* @param    {session_id}    int         id of the session (from session table id column)
*/
function callbackRequestQueueGetEntries(response, session_id){
    // clear queue 
    clearQueue();
    // parse json response, then iterate through the response (to get each entry and display)
    response = JSON.parse(response);
    for (entry in response["data"]){
        currentEntry = response["data"][entry];
        // only show if active is 1 and the session_id matches
        if (currentEntry["active"]===1 & currentEntry["session_id"]===session_id){
            let firstNameE = currentEntry["first_name"];
            let lastNameE = currentEntry["last_name"];
            // create a time for when this entry was made
            let tempTime = new Date(currentEntry["timestamp"]);
            let time = tempTime.getHours().toString()+":"+tempTime.getMinutes().toString()+":"+tempTime.getSeconds().toString();
            let id = currentEntry["person_id"];
            let active = currentEntry["active"];
            // create an entry object instance
            let newEntry = new Entry(firstNameE, lastNameE, time, id, active);
            // display on html page
            entryToText(newEntry, time);
        }
    }
}

/*
* Request to get the entire queue table. 
*
* @param    {string}    theUrl url      of the host server
* @param    {int}       session_id      id of the session 
*/
function requestQueueGetEntries(theUrl, session_id){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callbackRequestQueueGetEntries(xmlHttp.responseText, session_id);
    }
    xmlHttp.open("GET", theUrl+"api/queue", true); // true for asynchronous 
    xmlHttp.send(null);
}

/*
* Callback function to update all entries' ids in the queue. Uses patch call.
*
* @param    {JSON string}    response    response from API call
*/
function callbackRequestQueueGetId(response){
    clearQueue();
    response = JSON.parse(response);
    for (entry in response["data"]){
        currentEntry = response["data"][entry];
        requestQueuePatchId(url,currentEntry["person_id"]);
    }
}

/*
* Request to api queue get call to get entire table (to be used)
*
* @param    {string}    theUrl      url for the host server
*/
function requestQueueGetId(theUrl){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callbackRequestQueueGetId(xmlHttp.responseText);
            window.location.reload();
    }
    xmlHttp.open("GET", theUrl+"api/queue", true); // true for asynchronous 
    xmlHttp.send(null);
}

/* 
* Request to update all entries entered to active=0. 
*
* @param    {string}    theUrl      url for the host server
* @params   {int}       params      id of the entry
*/
function requestQueuePatchId(theUrl, params){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            response = xmlHttp.responseText;
        }
    }
    xmlHttp.open("PATCH", theUrl+"api/queue/"+params, true); // true for asynchronous 
    xmlHttp.send();
}

/*
* Request to post to queue table (post an entry). 
*
* @param    {string}    theUrl      url for the host server
* @param    {string}    firstName   first name for the entry
* @param    {string}    lastName    last name for the entry
* @param    {int}       time        time for the entry (numeric numbers only)
* @param    {int}       session_id  id for the session    
*/
function requestQueuePostEntry(theUrl, firstName, lastName, session_id){
    let response;
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            response = xmlHttp.responseText;
        }
    }
    params = "first_name="+firstName+"&last_name="+lastName+"&session_id="+session_id;
    xmlHttp.open("POST", theUrl+"api/queue?"+params, true); // true for asynchronous 
    xmlHttp.send();
    return response;
}

/*
* Request to delete the entry. 
*
* @param    {string}    theUrl      url for the host server
* @param    {int}       params      id of the entry to be deleted
*/
function requestQueueDeleteEntry(theUrl, params){
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

/* ------------------------- API CALLS FOR SESSIONS TABLE ------------------------- */

/*
* Callback to alert private key and public key and post them to session table if they don't already
* exist. If they do, generate new keys.
*
* @param    {JSON string}   response    response from api
* @param    {int}           publicKey   public key 
* @param    {int}           privateKey  private key 
*/
function callbackRequestSessionsGetKey(response, theUrl, sessionName){
    response = JSON.parse(response);
    publicKey = response["data"]["public_key"];
    privateKey = response["data"]["private_key"];
    alert("Private Key: "+privateKey+"  Public Key: "+publicKey);
    let rowId = response["data"]["session_id"];
    let active = 1;
    requestSessionsPatchSession(theUrl, active, sessionName, rowId);
}

/*
* Request to get session by any key numbers (private and/or public)
*
* @param    {string}    theUrl      url for the host server
* @param    {int}       privateKey  the private key 
* @param    {int}       publicKey   the public key
*/
function requestSessionsGetKey(theUrl, sessionName){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callbackRequestSessionsGetKey(xmlHttp.responseText, theUrl, sessionName);
    }
    xmlHttp.open("GET", theUrl+"api/sessions/generatekeys/", true); // true for asynchronous 
    xmlHttp.send(null);
}

/*
* Callback to alert private key and public key and post them to session table if they don't already
* exist. If they do, generate new keys.
*
* @param    {JSON string}   response    response from api
* @param    {int}           publicKey   public key 
* @param    {int}           privateKey  private key 
*/
function callbackRequestSessionsGetActive(response, room, tas){
    // parse json response, then iterate through the response (to get each entry and display)
    response = JSON.parse(response);
    for (session in response["data"]){
        currentSession = response["data"][session];
        // only show if active is 1 and the session_id matches
        if (currentSession["active"]===1){
            let sessionId = currentSession["session_id"];
            let publicKey = currentSession["public_key"];
            // create a time for when this entry was made
            let active = currentSession["active"];
            let sessionName = currentSession["session_name"];
            // create an entry object instance
            let newSession = new Session(sessionId, publicKey, active, sessionName, room, tas);
            // display on html page
            sessionToText(newSession);
        }
    }
}

/*
* Request to get all active sessions
*
* @param    {string}    theUrl      url for the host server
*/
function requestSessionsGetActive(theUrl, room, tas){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callbackRequestSessionsGetActive(xmlHttp.responseText, room, tas);
    }
    xmlHttp.open("GET", theUrl+"api/sessions/active", true); // true for asynchronous 
    xmlHttp.send(null);
}

/*
* Callback for requestSessionsGetPublicKey. Extracts the session id and then gets entries 
* based off of the session_id.
*
* @param    {JSON string}   response    response from the api
*/
function callbackRequestSessionsGetPublicKey(response){
    response = JSON.parse(response);
    let session_id;
    if ("data" in response){
        session_id = response["data"]["session_id"];
        requestQueueGetEntries(url, session_id);
    } else {
        session_id = null;
    }
}

/*
* Request to get session id using only the public key, to be used for getting all entries with the id.
*
* @param    {string}    theUrl      url for the host server
* @param    {int}       publicKey   the public key
*/
function requestSessionsGetPublicKey(theUrl, publicKey){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callbackRequestSessionsGetPublicKey(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl+"api/sessions/?public_key="+publicKey, true); // true for asynchronous 
    xmlHttp.send(null);
}

/*
* Callback for requestSessionsGetToPostEntry. Post all entires with the specific 
* session id from the response.
*
* @param    {JSON string}   response    response from api
* @param    {string}        theUrl      url for the host server
* @param    {string}        firstName   first name for the entry
* @param    {string}        lastName    last name for the entry
*/
function getPostSessionId(response, theUrl, firstName, lastName){
    response = JSON.parse(response);
    if ("data" in response){
        session_id = response["data"]["session_id"];
        requestQueuePostEntry(theUrl, firstName, lastName, session_id);
    }
}

/*
* Request to get a session id based on public key, to be used for posting an entry with the session_id.
*
* @param    {JSON string}   response    response from api
* @param    {string}        theUrl      url for the host server
* @param    {string}        firstName   first name for the entry
* @param    {string}        lastName    last name for the entry
*/
function requestSessionsGetToPostEntry(theUrl, firstName, lastName, publicKey){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            getPostSessionId(xmlHttp.responseText, theUrl, firstName, lastName);
    }
    xmlHttp.open("GET", theUrl+"api/sessions/?public_key="+publicKey, true); // true for asynchronous 
    xmlHttp.send(null);
}

/*
* Callback function for requestSessionsGetKeyAuth. Deletes the item if the response
* indicates that there is a match for the public and private key.
*
* @param    {string}    theUrl      url for the host server
* @param    {JSON string}   response    response from api
* @param    {int}       newEntryId  id of the entry to be deleted
*/
function callbackRequestSessionsGetKeyAuth(theUrl, response, newEntryId){
    response = JSON.parse(response);
    if ("data" in response){
        // delete the item
        requestQueueDeleteEntry(theUrl,newEntryId);
    } else {
        alert("Wrong private key.");
    }
}

/*
* Request to check if keys match in the sessions table, to delete the entry.
*
* @param    {string}    theUrl      url for the host server
* @param    {int}       newEntryId  id of the entry to be deleted
* @param    {int}       privateKey  the private key 
* @param    {int}       publicKey   the public key
*/
function requestSessionsGetKeyAuth(theUrl, newEntryId, publicKey, privateKey){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callbackRequestSessionsGetKeyAuth(theUrl, xmlHttp.responseText, newEntryId);
    }
    xmlHttp.open("GET", theUrl+"api/sessions/auth/?public_key="+publicKey+"&private_key="+privateKey, true); // true for asynchronous 
    xmlHttp.send(null);
}

/*
* Request to update session to an active session with the session name.
*
* @param    {string}    theUrl      url for the host server
* @param    {int}       active      0 for inactive, 1 for active
* @param    {string}    sessionName name of the session
* @param    {int}       rowId       id of the row
*/
function requestSessionsPatchSession(theUrl, active, sessionName, rowId){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        response = xmlHttp.responseText;
        window.location.reload();
    }
    // if there's no session name, adjust URL
    if (sessionName == ""){
        xmlHttp.open("PATCH", theUrl+"api/sessions/update/?active="+active+"&session_name="+" "+"&rowid="+rowId, true); // true for asynchronous 
    } else {
        xmlHttp.open("PATCH", theUrl+"api/sessions/update/?active="+active+"&session_name="+sessionName+"&rowid="+rowId, true); // true for asynchronous 
    }
    xmlHttp.send(null);
}



/*
* Callback function for requestSessionsGetKeyAuth. Deletes the item if the response
* indicates that there is a match for the public and private key.
*
* @param    {string}    theUrl      url for the host server
* @param    {JSON string}   response    response from api
* @param    {int}       newEntryId  id of the entry to be deleted
*/
function callbackRequestSessionsGetKeyAuthSessions(theUrl, response){
    response = JSON.parse(response);
    if ("data" in response){
        // delete the item
        requestSessionsPatchSession(theUrl,0,"", response["data"]["session_id"]);
        window.location.reload();
    } else {
        alert("Wrong private key.");
    }
}

/*
* Request to check if keys match in the sessions table, to patch a session.
*
* @param    {string}    theUrl      url for the host server
* @param    {int}       privateKey  the private key 
* @param    {int}       publicKey   the public key
*/
function requestSessionsGetKeyAuthSessions(theUrl, publicKey, privateKey){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callbackRequestSessionsGetKeyAuthSessions(theUrl, xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl+"api/sessions/auth/?public_key="+publicKey+"&private_key="+privateKey, true); // true for asynchronous 
    xmlHttp.send(null);
}
// setTimeout(function(){
//     window.location.reload(1);
//  }, 5000);