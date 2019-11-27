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
    // check if the dictionaries are empty, if they are then the user will manually enter key
    let generatedKeysPairingsDict = JSON.parse(localStorage.getItem("generatedKeys"));
    let enteredKeysPairingsDict = JSON.parse(localStorage.getItem("enteredKeys"));
    let publicKeyText = localStorage.getItem("publicKey");
    if (generatedKeysPairingsDict){
        let generatedPrivateKey = generatedKeysPairingsDict[publicKeyText];
        requestSessionsGetKeyAuth(url, newEntryId, publicKeyText, generatedPrivateKey, "generated");
    } else if (enteredKeysPairingsDict){
        let enteredPrivateKey = enteredKeysPairingsDict[publicKeyText];
        requestSessionsGetKeyAuth(url, newEntryId, publicKeyText, enteredPrivateKey, "entered");
    } else {
        let userEnteredKey = prompt('Enter private key to delete this entry.');
        requestSessionsGetKeyAuth(url, newEntryId, publicKeyText, userEnteredKey, "manual");
    }
}

/*
* Turn the entry instance into html to display.
*
* @param    {string}    newEntry    entry to turn into html
* @param    {bool}      unchecked   bool representing if the box is checked
* @param    {bool}      redBorder   bool representing if the box should have a red border
*/
function entryToText(newEntry, unchecked, redBorder){
    // if unchecked, show normally
    // create text elements for entry on queue
    let namePara = document.createElement("p");
    let nameText = document.createTextNode(newEntry.eFullName);
    let datePara = document.createElement("p");
    let dateText = document.createTextNode(newEntry.eTime);
    let divText = document.createElement("div");
    let divCheckbox = document.createElement("div");
    let input = document.createElement("input");
    let span = document.createElement("span");
    let divAll = document.createElement("div");
    let divQueue = document.getElementById('queueEntries')
    let label = document.createElement("label");

    // set attributes
    label.setAttribute("class","container");
    datePara.setAttribute("class","date");
    input.setAttribute("type","checkbox");
    input.setAttribute("id","checkbox"+newEntry.id);
    span.setAttribute("class","checkmark");
    divAll.setAttribute("class","divContainer");
    divText.setAttribute("class", "entryText");

    // append elements to queue element 
    namePara.appendChild(nameText);
    datePara.appendChild(dateText);
    divText.appendChild(namePara);
    divText.appendChild(datePara);
    divCheckbox.appendChild(input);
    divCheckbox.appendChild(span);
    label.appendChild(divCheckbox);
    divAll.appendChild(label);
    divAll.appendChild(divText);
    divQueue.appendChild(divAll);

    // if the entry is unchecked, change the appearance 
    if (!unchecked){
        input.checked = true;
        divAll.style.background = "gray";
        divAll.style.borderColor = "gray";
    }

    if (redBorder){
        divAll.style.borderColor = "red";
    }

    /* MODAL FOR QUEUE ENTRY HTML CODE */
    // create html elements for modal
    let divModal = document.createElement("div");
    let divModalContent = document.createElement("div");
    let spanModalClose = document.createElement("span");
    let modalPara = document.createElement("p");
    let modalParaText = document.createTextNode("hello");
    let closeButton = document.createTextNode("close");
    let img = document.createElement("img");
    
    // set attributes
    divModal.setAttribute("id","myModal"+newEntry.id);
    divModal.setAttribute("class","modal");
    divModalContent.setAttribute("class","modal-content");
    spanModalClose.setAttribute("class","close");
    img.setAttribute("src", "images/x-icon.png");
    img.setAttribute("height", "10");
    img.setAttribute("width", "10");
    img.setAttribute("alt", "x-out-button");

    img.onclick = function(){
        confirmAction(url,newEntry.id);
    }

    // set onclick function for check
    input.onclick = function(){
        checkedEntry(newEntry.id);
    }

    divText.onclick = function(){
        divModal.style.display = "block";
    }

    divModal.onclick = function(){
        divModal.style.display = "none";
    }

    // append elements to divAll
    divModalContent.appendChild(spanModalClose);
    modalPara.appendChild(modalParaText);
    modalPara.appendChild(closeButton);
    modalPara.appendChild(img);
    divModalContent.appendChild(modalPara);
    divModal.appendChild(divModalContent);
    divAll.appendChild(divModal);
}

/*
* Function to do stuff when entry is checked off
*
*/
function checkedEntry(id){
    // If checkbox is checked, active = 2, otherwise active = 1
    let checkBox = document.getElementById("checkbox"+id);
    if (checkBox.checked){
        requestQueuePatchId(url, id, 2);
    } else {
        requestQueuePatchId(url, id, 1);
    }
    // api call to update queue entry number
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
    // check if the dictionaries are empty, if they are then the user will manually enter key
    let generatedKeysPairingsDict = JSON.parse(localStorage.getItem("generatedKeys"));
    let enteredKeysPairingsDict = JSON.parse(localStorage.getItem("enteredKeys"));
    if (generatedKeysPairingsDict){
        let generatedPrivateKey = generatedKeysPairingsDict[publicKey];
        requestSessionsGetKeyAuthSessions(url, publicKey, generatedPrivateKey, "generated");
    } else if (enteredKeysPairingsDict){
        let enteredPrivateKey = enteredKeysPairingsDict[publicKey];
        requestSessionsGetKeyAuthSessions(url, publicKey, enteredPrivateKey, "entered");
    } else {
        let userEnteredKey = prompt('Enter private key to delete this entry.');
        requestSessionsGetKeyAuthSessions(url, publicKey, userEnteredKey, "manual");
    }
}

/*
* Function to ask user for public key in order to assess the queue page.
* 
* @param    {string}    url     url of the hosted server
* @param    {string}    id      id of entry to delete 
* 
*/ 
function sessionsToQueue(url, publicKey){
    // automatic check: if the publicKey is in localStorage 
    let worked = false;
    let generatedKeysPairingsDict = JSON.parse(localStorage.getItem("generatedKeys"));
    let enteredKeysPairingsDict = JSON.parse(localStorage.getItem("enteredKeys"));
    if (enteredKeysPairingsDict){
        if (publicKey in enteredKeysPairingsDict){
            document.location.href = url+"session.html";
            localStorage.setItem("publicKey", publicKey);
            worked = true;
        } 
    }
    if (generatedKeysPairingsDict){
        if (publicKey in generatedKeysPairingsDict){
            document.location.href = url+"session.html";
            localStorage.setItem("publicKey", publicKey);
            worked = true;
        } 
    }
    if (!worked){
        // else: user enters the key by themselves
        let userEnteredKey = prompt('Enter public key to enter this session.');
        if (userEnteredKey == publicKey){
            document.location.href = url+"session.html";
            localStorage.setItem("publicKey", publicKey);
        } else {
            alert("Wrong public key.");
        }
    }
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
    let roomText = document.createTextNode(" "+newSession.sRoom);
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
    img.onclick = function(event){
        event.cancelBubble = true;
        confirmActionSessions(url, newSession.sPublicKey);
    }

    // set onclick function for going to the public key page
    para.onclick = function(){
        sessionsToQueue(url, newSession.sPublicKey);
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
    // check if the dictionaries are empty, if they are then the user will manually enter key
    let generatedKeysPairingsDict = JSON.parse(localStorage.getItem("generatedKeys"));
    let enteredKeysPairingsDict = JSON.parse(localStorage.getItem("enteredKeys"));
    let publicKey = localStorage.getItem("publicKey");
    if (generatedKeysPairingsDict){
        let generatedPrivateKey = generatedKeysPairingsDict[publicKey];
        requestSessionsGetKeyAuthClearQueue(url, publicKey, generatedPrivateKey, "generated");
    } else if (enteredKeysPairingsDict){
        let enteredPrivateKey = enteredKeysPairingsDict[publicKey];
        requestSessionsGetKeyAuthClearQueue(url, publicKey, enteredPrivateKey, "entered");
    } else {
        let userEnteredKey = prompt('Enter private key to delete this entry.');
        requestSessionsGetKeyAuthClearQueue(url, publicKey, userEnteredKey, "manual");
    }
}

/*
* Onload function for the queue page. Loads queue and the public key (from local storage).
*
*/
function onLoad(){
    // get session id 
    let publicKeyText = localStorage.getItem("publicKey");
    requestSessionsGetPublicKey(url, publicKeyText);

    // Get the modal
    var modal = document.getElementById("taModalOptions");

    // Get the button that opens the modal
    var btn = document.getElementById("taOptions");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

/*
* Onload function for the session page. Loads all sessions
*
*/
function onLoadSessions(){
    requestSessionsGetActive(url);
}

/* 
* Function to generate a random 6 digit number for the keys. Then, posts the keys to the 
* sessions table.
*
*/
function generateKeys(){
    // generate the public and private keys
    let sessionName = document.getElementById("sessionName").value;
    let room = document.getElementById("room").value;
    let tas = document.getElementById("taNames").value;

    // get start time
    let startToday = new Date();
    let start = document.getElementById("startTime").value;
    let startTimeSplit = start.split(':');
    startToday.setHours(0,0,0,0);
    startToday.setTime(startToday.getTime()+(startTimeSplit[0]*60*60*1000)+(startTimeSplit[1]*60*1000));

    // get end time
    let endToday = new Date();
    let end = document.getElementById("endTime").value;
    let endTimeSplit = end.split(':');
    endToday.setHours(0,0,0,0)
    endToday.setTime(endToday.getTime()+(endTimeSplit[0]*60*60*1000)+(endTimeSplit[1]*60*1000));
    
    // call api
    requestSessionsGetKey(url, sessionName, room, tas, startToday.getTime(), endToday.getTime());
}

function createKeys(){
    let publicKey = document.getElementById("publicKeyEntered").value;
    let privateKey = document.getElementById("privateKeyEntered").value;
    // catch edge case: if user enters nothing for private key 
    if (!privateKey){
        privateKey = "None";
    }
    // save the private key and public key pairing to localstorage (as enteredKeys)
    localStorage.setItem("enteredKeys", JSON.stringify(addKeys(localStorage.getItem("enteredKeys"), privateKey, publicKey)));
    window.location.reload();
}

/*
* Function to add key pairings to a dictionary (used in generating keys and entering keys funcs)
*
* @param    {dict}      currentDict     current dictionary (saved in localStorage)
* @param    {string}    privateKey      private key to store
* @param    {string}    publicKey       public key to store
*/ 
function addKeys(currentDict, privateKey, publicKey){
    if (!currentDict){
        currentDict = {};
    } else {
        currentDict = JSON.parse(currentDict);
    }
    currentDict[publicKey] = privateKey;
    return currentDict;
}

/* ------------------------- API CALLS FOR QUEUE TABLE -------------------------  */

/*
* Callback function to load all entries in queue. 
*
* @param    {JSON string}   response    response string from API call
* @param    {session_id}    int         id of the session (from session table id column)
* @param    {int}           timer           number of seconds of timer
*/
function callbackRequestQueueGetEntries(response, session_id, timer){
    // clear queue 
    clearQueue();
    // parse json response, then iterate through the response (to get each entry [saved in list] and display [after saving in list, to have checked at bottom])
    let uncheckedList = [];
    let checkedList = [];
    // also track number of people helped and number of people left
    let numPeopleLeft = 0;
    let numPeopleHelped = 0;
    response = JSON.parse(response);
    if (response["data"]){
        for (let entry in response["data"]){
            currentEntry = response["data"][entry];
            // only show if active is 1 and the session_id matches
            if ((currentEntry["active"]===1 || currentEntry["active"]===2) && currentEntry["session_id"]===session_id){
                let firstNameE = currentEntry["first_name"];
                let lastNameE = currentEntry["last_name"];
                // create a time for when this entry was made
                let tempTime = new Date(currentEntry["timestamp"]);
                let time = tempTime.getHours().toString()+":"+tempTime.getMinutes().toString()+":"+tempTime.getSeconds().toString();
                let id = currentEntry["person_id"];
                let active = currentEntry["active"];
                // create an entry object instance
                let newEntry = new Entry(firstNameE, lastNameE, time, id, active);
                if (currentEntry["active"]===1){
                    numPeopleLeft += 1;
                    uncheckedList.push(newEntry);
                    console.log(newEntry.eFullName);
                } else{
                    numPeopleHelped += 1;
                    checkedList.push(newEntry);
                }
            }
        }
    }
    // add number stats to page 
    document.getElementById("numPeopleLeft").innerHTML = numPeopleLeft;
    document.getElementById("numPeopleHelped").innerHTML = numPeopleHelped;
    // recommended time per student stats
    let recTime = 0;
    let numPeopleCanHelp = numPeopleLeft;
    let numberWarning = "";
    if (timer/numPeopleLeft < 300){
        if (timer/numPeopleLeft > 180){
            recTime = 3;
            numberWarning = "Warning: Cannot spend more than 3 minutes with each student, queue is near capacity";
        } else {
            recTime = 3;
            numPeopleCanHelp = Math.floor(timer/60/3);
            numberWarning = "Warning: Queue is at capacity. \n Number of Students that can be helped: "+numPeopleCanHelp.toString()+" (last student to be helped is in red)";
        }
        // issue the warning
        document.getElementById("numberWarning").innerHTML = numberWarning;
    } else if (timer/numPeopleLeft === 300){
        recTime = 5;
    } else {
        // each student gets at least 5 minutes 
        if (numPeopleLeft < 3){
            recTime = 10;
        } else {
            recTime = 5;
        }
    }
    document.getElementById("numTimeRec").innerHTML = recTime.toString() + " Minutes Per Student"
    let numPeopleAdded = 0;
    uncheckedList.forEach(function(entry1){
        numPeopleAdded += 1;
        if (numPeopleCanHelp === numPeopleLeft){
            entryToText(entry1, true, false);
        } else {
            if (numPeopleAdded === numPeopleCanHelp){
                entryToText(entry1, true, true);
            } else {
                entryToText(entry1, true, false);
            }
            
        }
    });
    checkedList.forEach(function(entry2){
        entryToText(entry2, false, false);
    });
}

/*
* Request to get the entire queue table. 
*
* @param    {string}    theUrl url      of the host server
* @param    {int}       session_id      id of the session 
* @param    {int}       timer           number of seconds of timer
*/
function requestQueueGetEntries(theUrl, session_id, timer){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callbackRequestQueueGetEntries(xmlHttp.responseText, session_id, timer);
    }
    xmlHttp.open("GET", theUrl+"api/queue", true); // true for asynchronous 
    xmlHttp.send(null);
}



/*
* Callback function for requestSessionsGetKeyAuth. Deletes the item if the response
* indicates that there is a match for the public and private key.
*
* @param    {string}        theUrl      url for the host server
* @param    {JSON string}   response    response from api
* @param    {int}           newEntryId  id of the entry to be delete
* @param    {string}        publicKey   the public key
* @param    {string}        keyType     generated, entered or manual to indicate which key type its checking
*/
function callbackRequestSessionsGetKeyAuthClearQueue(theUrl, response, publicKey, keyType){
    let enteredKeysPairingsDict = JSON.parse(localStorage.getItem("enteredKeys"));
    response = JSON.parse(response);
    if ("data" in response){
        requestQueueGetId(theUrl);
    } else if (!("data" in response) && (keyType == "generated") && (enteredKeysPairingsDict)){
        let enteredPrivateKey = enteredKeysPairingsDict[publicKey];
        requestSessionsGetKeyAuthClearQueue(url, publicKey, enteredPrivateKey, "entered");
    } else if (!("data" in response) && (keyType == "entered")){
        let userEnteredKey = prompt('Enter private key to delete this entry.');
        requestSessionsGetKeyAuthClearQueue(url, publicKey, userEnteredKey, "manual");
    } else{
        alert("Wrong private key.");
    }
}

/*
* Request to check if keys match in the sessions table, to delete the entry.
*
* @param    {string}    theUrl      url for the host server
* @param    {int}       newEntryId  id of the entry to be deleted
* @param    {string}    privateKey  the private key 
* @param    {string}    publicKey   the public key
* @param    {string}    keyType     generated, entered or manual to indicate which key type its checking
*/
function requestSessionsGetKeyAuthClearQueue(theUrl, publicKey, privateKey, keyType){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callbackRequestSessionsGetKeyAuthClearQueue(theUrl, xmlHttp.responseText, publicKey, keyType);
    }
    xmlHttp.open("GET", theUrl+"api/sessions/auth/?public_key="+publicKey+"&private_key="+privateKey, true); // true for asynchronous 
    xmlHttp.send(null);
}

/*
* Callback function to update all entries' active value in the queue. Uses patch call.
*
* @param    {JSON string}    response    response from API call
*/
function callbackRequestQueueGetId(response){
    response = JSON.parse(response);
    for (entry in response["data"]){
        currentEntry = response["data"][entry];
        requestQueuePatchId(url,currentEntry["person_id"], 0);
    }
}

/*
* Request to api queue get call to get entire table (to be used to update all active 
* values to 0)
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
* @params   {int}       rowId       id of the entry
* @params   {int}       active      active value of the entry to update to
*/
function requestQueuePatchId(theUrl, rowId, active){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            response = xmlHttp.responseText;
            window.location.reload();
        }
    }
    xmlHttp.open("PATCH", theUrl+"api/queue/update?rowId="+rowId+"&active="+active, true); // true for asynchronous 
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
}

/* ------------------------- API CALLS FOR SESSIONS TABLE ------------------------- */

/*
* Callback to alert private key and public key and post them to session table if they don't already
* exist. If they do, generate new keys.
*
* @param    {JSON string}   response    response from api
* @param    {string}        theUrl      url for the host server
* @param    {string}        sessionName name for the session
* @param    {string}        room        room for the session
* @param    {string}        tas         tas for the session
* @param    {int}           start       starttime of the session
* @param    {int}           end         endtime of the session
*/
function callbackRequestSessionsGetKey(response, theUrl, sessionName, room, tas, start, end){
    response = JSON.parse(response);
    publicKey = response["data"]["public_key"];
    privateKey = response["data"]["private_key"];
    alert("Private Key: "+privateKey+"  Public Key: "+publicKey);
    // save the private key and public key pairing to localstorage
    localStorage.setItem("generatedKeys", JSON.stringify(addKeys(localStorage.getItem("generatedKeys"), privateKey, publicKey)));
    let rowId = response["data"]["session_id"];
    let active = 1;
    requestSessionsPatchSession(theUrl, active, sessionName, room, tas, rowId, start, end);
}

/*
* Request to get keys for a session
*
* @param    {string}    theUrl      url for the host server
* @param    {string}    sessionName name for the session
* @param    {string}    room        room for the session
* @param    {string}    tas         tas for the session
* @param    {int}       start       starttime of the session
* @param    {int}       end         endtime of the session
*/
function requestSessionsGetKey(theUrl, sessionName, room, tas, start, end){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callbackRequestSessionsGetKey(xmlHttp.responseText, theUrl, sessionName, room, tas, start, end);
    }
    xmlHttp.open("GET", theUrl+"api/sessions/generatekeys/", true); // true for asynchronous 
    xmlHttp.send(null);
}

/*
* Callback for requqest to get all the active sessions and populate the queue table
*
* @param    {JSON string}   response    response from api
*/
function callbackRequestSessionsGetActive(response){
    // parse json response, then iterate through the response (to get each entry and display)
    response = JSON.parse(response);
    // also save public keys for deleting non-active ones off the localStorage
    activePublicKeys = []
    for (session in response["data"]){
        currentSession = response["data"][session];
        // only show if active is 1 and the session_id matches
        if (currentSession["active"]===1){
            let sessionId = currentSession["session_id"];
            let publicKey = currentSession["public_key"];
            activePublicKeys.push(publicKey);
            // create a time for when this entry was made
            let active = currentSession["active"];
            let sessionName = currentSession["session_name"];
            let room = currentSession["room"];
            let tas = currentSession["tas"];
            // create an entry object instance
            let newSession = new Session(sessionId, publicKey, active, sessionName, room, tas);
            // display on html page
            sessionToText(newSession);
        }
    }

    // add html for the active keys (generated and entered)
    addKeyHtml("generatedKeys","generatedKeysPara", activePublicKeys);
    addKeyHtml("enteredKeys","enteredKeysPara", activePublicKeys);
}

/*
* Function to add the html for keys (only if the session is active). If the session is no longer active,
* remove the key from localStorage.
*
* @param    {string}    localStorageVariable    string name of the local storage variable
* @param    {string}    divId                   id of the div to add the html to
* @param    {list}      activePublicKeys        all currently active public keys      
*/
function addKeyHtml(localStorageVariable, divId, activePublicKeys){
    // repeat for Entered Keys
    keyPairingsDict = JSON.parse(localStorage.getItem(localStorageVariable));
    for (let key in keyPairingsDict){
        if (activePublicKeys.includes(key)){
            let para = document.getElementById(divId);
            let nameText = document.createTextNode("Public Key: "+key+", Private Key: "+keyPairingsDict[key]);
            let lineBreak = document.createElement("br");
            para.appendChild(nameText);
            para.appendChild(lineBreak);
        }
        else {
            delete keyPairingsDict[key];
            localStorage.setItem(localStorageVariable,JSON.stringify(keyPairingsDict));
        }
    }
}

/*
* Request to get all active sessions
*
* @param    {string}    theUrl      url for the host server
*/
function requestSessionsGetActive(theUrl){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callbackRequestSessionsGetActive(xmlHttp.responseText);
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
        // store times in localStorage
        localStorage.setItem("publicKey",response["data"][3])

        let nameOfKey = "endtime" + response["data"][3];
        if(!localStorage.getItem(nameOfKey)){
            // do setting the current time
            localStorage.setItem(nameOfKey, response["data"][2]);
        } 
        let nameOfStartKey = "starttime" + response["data"][3];
        if(!localStorage.getItem(nameOfStartKey)){
            // do setting the current time
            localStorage.setItem(nameOfStartKey, response["data"][1]);
        } 
        let startTime = parseInt(localStorage.getItem(nameOfStartKey), 10);
        let endTime = parseInt(localStorage.getItem(nameOfKey), 10);
        let currentTime = new Date().getTime();

        // if session hasn't begun, do nothing
        let timer = Math.floor((endTime - currentTime) / 1000);
        if (currentTime < startTime){
            document.getElementById('timeLeft').textContent = "Session Not Started Yet";
        } else {
            document.getElementById('timeLeftSeconds').textContent = timer;
    
            // add time to html and increment 
            setInterval(function(){
                document.getElementById('timeLeftSeconds').textContent = --timer;
                let seconds;
                // indicate if session is over (then display that text)
                if (timer > 0){
                    seconds = new Date(timer * 1000).toISOString().substr(11, 8);
                } else if (timer < 0){
                    seconds = "Session Over"
                }
                document.getElementById('timeLeft').textContent = seconds;
                
            }, 1000);
        }

        // populate queue with entries
        session_id = response["data"][0];
        requestQueueGetEntries(url, session_id, timer);
    } else {
        session_id = null;
    }
}

/*
* Request to get session id using only the public key, to be used for getting all entries with the id.
*
* @param    {string}    theUrl      url for the host server
* @param    {string}    publicKey   the public key
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
        session_id = response["data"][0];
        console.log("hello",session_id);
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
* @param    {string}        publicKey   public key for the entry
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
* @param    {string}        theUrl      url for the host server
* @param    {JSON string}   response    response from api
* @param    {int}           newEntryId  id of the entry to be delete
* @param    {string}        publicKey   the public key
* @param    {string}        keyType     generated, entered or manual to indicate which key type its checking
*/
function callbackRequestSessionsGetKeyAuth(theUrl, response, newEntryId, publicKey, keyType){
    let enteredKeysPairingsDict = JSON.parse(localStorage.getItem("enteredKeys"));
    response = JSON.parse(response);
    if ("data" in response){
        // delete the item
        requestQueueDeleteEntry(theUrl,newEntryId);
    } else if (!("data" in response) && (keyType == "generated") && (enteredKeysPairingsDict)){
        let enteredPrivateKey = enteredKeysPairingsDict[publicKey];
        requestSessionsGetKeyAuth(url, newEntryId, publicKey, enteredPrivateKey, "entered");
    } else if (!("data" in response) && (keyType == "entered")){
        let userEnteredKey = prompt('Enter private key to delete this entry.');
        requestSessionsGetKeyAuth(url, newEntryId, publicKey, userEnteredKey, "manual");
    } else{
        alert("Wrong private key.");
    }
}

/*
* Request to check if keys match in the sessions table, to delete the entry.
*
* @param    {string}    theUrl      url for the host server
* @param    {int}       newEntryId  id of the entry to be deleted
* @param    {string}    privateKey  the private key 
* @param    {string}    publicKey   the public key
* @param    {string}    keyType     generated, entered or manual to indicate which key type its checking
*/
function requestSessionsGetKeyAuth(theUrl, newEntryId, publicKey, privateKey, keyType){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callbackRequestSessionsGetKeyAuth(theUrl, xmlHttp.responseText, newEntryId, publicKey, keyType);
    }
    xmlHttp.open("GET", theUrl+"api/sessions/auth/?public_key="+publicKey+"&private_key="+privateKey, true); // true for asynchronous 
    xmlHttp.send(null);
}

/*
* Request to update session to active or inactive
*
* @param    {string}    theUrl      url for the host server
* @param    {int}       active      0 for inactive, 1 for active
* @param    {string}    sessionName name of the session
* @param    {string}    room        room of the session
* @param    {string}    tas         tas of the session
* @param    {int}       rowId       id of the row
* @param    {int}       start       starttime of the session
* @param    {int}       end         endtime of the session
*/
function requestSessionsPatchSession(theUrl, active, sessionName, room, tas, rowId, start, end){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        response = xmlHttp.responseText;
        window.location.reload();
    }
    // if there's no entry for fields, set it to None
    if(sessionName == ""){
        sessionName = "None";
    }
    if(room == ""){
        room = "None";
    }
    if(tas == ""){
        tas = "None";
    }
    if(isNaN(start)){
        start = 0;
    }
    if(isNaN(end)){
        end = 0;
    }
    xmlHttp.open("PATCH", theUrl+"api/sessions/update/?active="+active+"&session_name="+sessionName+"&room="+room+"&tas="+tas+"&start="+start+"&end="+end+"&rowid="+rowId, true); // true for asynchronous 
    xmlHttp.send(null);
}



/*
* Callback function for requestSessionsGetKeyAuth. Deletes the item if the response
* indicates that there is a match for the public and private key.
*
* @param    {string}        theUrl      url for the host server
* @param    {JSON string}   response    response from api
* @param    {string}        keyType     generated, entered or manual to indicate which key type its checking
*/
function callbackRequestSessionsGetKeyAuthSessions(theUrl, response, publicKey, keyType){
    let enteredKeysPairingsDict = JSON.parse(localStorage.getItem("enteredKeys"));
    response = JSON.parse(response);
    if ("data" in response){
        // delete the item
        requestSessionsPatchSession(theUrl,0,"None", "None", "None", response["data"]["session_id"], 0, 0);
    } else if (!("data" in response) && (keyType == "generated") && (enteredKeysPairingsDict)){
        let enteredPrivateKey = enteredKeysPairingsDict[publicKey];
        requestSessionsGetKeyAuthSessions(url, publicKey, enteredPrivateKey, "entered");
    } else if (!("data" in response) && (keyType == "entered")){
        let userEnteredKey = prompt('Enter private key to delete this entry.');
        requestSessionsGetKeyAuthSessions(url, publicKey, userEnteredKey, "manual");
    } else{
        alert("Wrong private key.");
    }
}

/*
* Request to check if keys match in the sessions table, to patch a session.
*
* @param    {string}    theUrl      url for the host server
* @param    {string}    privateKey  the private key 
* @param    {string}    publicKey   the public key
* @param    {string}    keyType     generated, entered or manual to indicate which key type its checking
*/
function requestSessionsGetKeyAuthSessions(theUrl, publicKey, privateKey, keyType){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callbackRequestSessionsGetKeyAuthSessions(theUrl, xmlHttp.responseText, publicKey, keyType);
    }
    xmlHttp.open("GET", theUrl+"api/sessions/auth/?public_key="+publicKey+"&private_key="+privateKey, true); // true for asynchronous 
    xmlHttp.send(null);
}
// setTimeout(function(){
//     window.location.reload(1);
//  }, 5000);