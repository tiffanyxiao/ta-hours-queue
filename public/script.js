/* 
* Author: Tiffany Xiao
* Description: Javascript code for ta-hours-queue
* Date last modified: See Github repo (https://github.com/tiffanyxiao/ta-hours-queue)
* 
* naming convention for API requests: request{TableName}{Type}{Descript}
* naming convention for callback functions: callback{RequestName}
*/

// let url = "https://mysterious-headland-07008.herokuapp.com/";
let url = "http://localhost:8000/";
// paused variable pauses any reloading functions currently loading
let paused = false; 

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
    * @param    {string}    ta          The ta selected for this entry.
    * @param    {string}    descript    The description of the issue for the entry.
    * @param    {string}    password    The password for this entry.
    * @param    {string}    time        The time this entry was created.
    * @param    {int}       id         id for this entry. Correlates to the rowid of database.
    * @param    {int}       active      Either 0 or 1. 0 for non-active entry, 1 for active entry.
    * @param    {int}       session     Session number of this entry.
    */
    constructor(firstName, lastName, ta, descript, password, completed, time, id, active, session){
        this.eFirstName = firstName;
        this.eLastName = lastName;
        this.eTA = ta;
        this.eDescript = descript;
        this.ePassword = password;
        this.eCompleted = completed;
        this.eTime = time;
        this.id = id;
        this.active = active;
        this.session = session;
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
* Function to clear the html from a div by ID
*
*/
function clearHtml(divId){
    document.getElementById(divId).innerHTML = "";
}

/*
* Function to ask user to confirm delete action. Then, calls delete API call to delete
* entry from queue table.
* 
* @param    {string}    url                 url of the hosted server
* @param    {string}    newEntryId          id of entry to delete 
* @param    {string}    newEntryPassword    password of the entry
* 
*/ 
function confirmAction(url, newEntryId, newEntryPassword){
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
        let passwordSet = confirm("Try user entered password? (\"Ok\" to enter password, \"Cancel\" to enter private key");
        if (passwordSet == true){
            console.log("hello");
            // check if entered password matches entry password 
            let enteredPassword = prompt('Enter password to delete this entry.');
            if (newEntryPassword == enteredPassword){
                requestQueueDeleteEntry(url,newEntryId);
            } else {
                alert("Wrong password.")
            }
        } else {
            let userEnteredKey = prompt('Enter private key to delete this entry.');
            requestSessionsGetKeyAuth(url, newEntryId, publicKeyText, userEnteredKey, "manual");    
        }
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
    let br = document.createElement("br");
    // add selected text elements into modal
    addTextToDiv(modalPara, "Requested TA: ", newEntry.eTA);
    addTextToDiv(modalPara, "Full Name: ", newEntry.eFullName);
    addTextToDiv(modalPara, "Time Entered: ", newEntry.eTime);
    addTextToDiv(modalPara, "Description of Issue: ", newEntry.eDescript);
    let img = document.createElement("img");
    
    // set attributes
    divModal.setAttribute("id","myModal"+newEntry.id);
    divModal.setAttribute("class","modal");
    divModalContent.setAttribute("class","modal-content");
    spanModalClose.setAttribute("class","close");
    img.setAttribute("src", "images/trash.jpg");
    img.setAttribute("title", "Click to delete entry (permanently)");
    img.setAttribute("height", "40");
    img.setAttribute("width", "40");
    img.setAttribute("alt", "delete-button");

    img.onclick = function(){
        confirmAction(url, newEntry.id, newEntry.ePassword);
    }

    // set onclick function for check
    input.onclick = function(){
        confirmCheck(url, newEntry.id);
    }

    divText.onclick = function(){
        divModal.style.display = "block";
        paused = true;
    }

    divModal.onclick = function(){
        divModal.style.display = "none";
        paused = false;
    }

    // append elements to divAll
    divModalContent.appendChild(spanModalClose);
    divModalContent.appendChild(modalPara);
    divModalContent.appendChild(img);
    divModal.appendChild(divModalContent);
    divAll.appendChild(divModal);
}

/*
* Function to add text to a div
*
* @param    {html}      div      html div 
* @param    {string}    prompt   prompt text to add to div
* @param    {string}    entered  entered text to add to div
*/
function addTextToDiv(div, prompt, entered){
    // create the text html elements
    let textPara = document.createElement("p");
    let promptContent = document.createTextNode(prompt);
    let enteredPara = document.createElement("p");
    let enteredContent = document.createTextNode(entered);

    // set classes for the entered text (to add color)
    textPara.setAttribute("class","promptText");
    enteredPara.setAttribute("class", "enteredText");

    // add the html elements to the div
    enteredPara.appendChild(enteredContent);
    textPara.appendChild(promptContent);
    textPara.appendChild(enteredPara);
    div.appendChild(document.createElement("br"));
    div.appendChild(textPara);
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
        requestQueuePatchComplete(url, id, 2);
    } else {
        requestQueuePatchId(url, id, 1);
        requestQueuePatchComplete(url, id, 1);
    }
    // api call to update queue entry number
}

/*
* Function to ask user to confirm check action. Then, calls check API call to check off 
* (or uncheck) entry from queue table.
* 
* @param    {string}    url                 url of the hosted server
* @param    {string}    newEntryId          id of entry to delete 
* 
*/ 
function confirmCheck(url, newEntryId){
    // check if the dictionaries are empty, if they are then the user will manually enter key
    let generatedKeysPairingsDict = JSON.parse(localStorage.getItem("generatedKeys"));
    let enteredKeysPairingsDict = JSON.parse(localStorage.getItem("enteredKeys"));
    let publicKeyText = localStorage.getItem("publicKey");
    if (generatedKeysPairingsDict){
        let generatedPrivateKey = generatedKeysPairingsDict[publicKeyText];
        requestSessionsGetKeyAuthCheck(url, newEntryId, publicKeyText, generatedPrivateKey, "generated");
    } else if (enteredKeysPairingsDict){
        let enteredPrivateKey = enteredKeysPairingsDict[publicKeyText];
        requestSessionsGetKeyAuthCheck(url, newEntryId, publicKeyText, enteredPrivateKey, "entered");
    } else {
        let userEnteredKey = prompt('Enter private key to check/uncheck this entry.');
        requestSessionsGetKeyAuthCheck(url, newEntryId, publicKeyText, userEnteredKey, "manual");    
    }
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
    let nameText = document.createTextNode(newSession.sSessionName+ " in");
    let lineBreak = document.createElement("br");
    let roomText = document.createTextNode(" "+newSession.sRoom+" with ");
    let taText = document.createTextNode(newSession.sTAs);
    let queue = document.getElementById('sessionEntries');
    let xText = document.createTextNode("  ");
    let img = document.createElement("img");

    // set attributes if needed
    para.setAttribute("class","queueEntry");
    img.setAttribute("src", "images/trash.jpg");
    img.setAttribute("class","trashImg");
    img.setAttribute("height", "15");
    img.setAttribute("width", "15");
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
    para.appendChild(roomText);
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
    let TAe = document.getElementById("TAdropdown").value;
    let descriptE = document.getElementById("descript").value;
    let passwordE = document.getElementById("password").value;
    if (passwordE.includes("#")){
        alert("Please enter a password with no '#'s.");
        return null;
    } else { 
        if (descriptE == null || descriptE == ""){
            descriptE = "No issue entered.";
        }
        if (passwordE == null || passwordE == ""){
            passwordE = "#####";
        }
        // create an entry object instance
        let newEntry = new Entry(firstNameE, lastNameE, TAe, descriptE, passwordE, 1);
        return newEntry;
    }
}

/*
* Submit button on form's onclick function. Creates an entry and adds it to the table and queue.
*
*/ 
function formSubmit(){
    let sampleEntry = createEntry();
    if (sampleEntry != null){
        let publicKeyText = localStorage.getItem("publicKey");
        requestSessionsGetToPostEntry(url,sampleEntry.eFirstName,sampleEntry.eLastName, publicKeyText, sampleEntry.eTA, sampleEntry.eDescript, sampleEntry.ePassword, sampleEntry.eCompleted);
        requestSessionsGetPublicKey(url, publicKeyText);
    }
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
    // reload queue constantly
    setInterval(function (){
        if(!paused){
            requestSessionsGetPublicKey(url, publicKeyText)
        }
    },2000);

    // populate queue form with the TA options 
    // get TA dropdown 
    let TAdropdown = document.getElementById("TAdropdown");
    // get list of TAs 
    let TAsList = localStorage.getItem("TAs").split(",");
    // add each TA to the dropdown 
    TAsList.forEach(ta => {
        let option = document.createElement("option");
        let optionText = document.createTextNode(ta);
        option.setAttribute("value",ta);
        option.appendChild(optionText);
        TAdropdown.appendChild(option);
    });

    // Get the modal
    let modal = document.getElementById("taModalOptions");

    // Get the button that opens the modal
    let btn = document.getElementById("taOptions");

    // Get the <span> element that closes the modal
    let span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal
    btn.onclick = function() {
        modal.style.display = "block";
        paused = true;
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
        paused = false;
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            paused = false;
        }
    }
}

/*
* Onload function for the session page. Loads all sessions
*
*/
function onLoadSessions(){
    requestSessionsGetActive(url);
    // reload sessions constantly
    setInterval(function (){
        requestSessionsGetActive(url)
    },2000);

    // Get the modal
    var modal = document.getElementById("sessionCreateModal");

    // Get the button that opens the modal
    var btn = document.getElementById("sessionCreateBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks the button, open the modal 
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
* Function to generate a random 6 digit number for the keys. Then, posts the keys to the 
* sessions table.
*
*/
function generateKeys(){
    // generate the public and private keys
    let sessionName = document.getElementById("sessionName").value;
    let room = document.getElementById("room").value;
    let tas = document.getElementById("taNames").value;
    let recTime = document.getElementById("recTime").value;
    let minTime = document.getElementById("minTime").value;
    let maxTime = document.getElementById("maxTime").value;

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
    requestSessionsGetKey(url, sessionName, room, tas, startToday.getTime(), endToday.getTime(), parseInt(recTime), parseInt(minTime), parseInt(maxTime));
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
* @param    {int}           timer       number of seconds of timer
*/
function callbackRequestQueueGetEntries(response, session_id, timer){
    // clear queue 
    clearHtml("queueEntries");
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
                let TAe = currentEntry["ta"];
                let passwordE = currentEntry["password"];
                let completedE = currentEntry["completed"];
                // create a time for when this entry was made
                let tempTime = new Date(currentEntry["timestamp"]);
                tempTime.setTime(tempTime.getTime()-(5*60*60*1000));
                let time = tempTime.getHours().toString()+":"+tempTime.getMinutes().toString()+":"+tempTime.getSeconds().toString();
                let descript = currentEntry["descript"];
                let id = currentEntry["person_id"];
                let session = currentEntry["session_id"] 
                let active = currentEntry["active"];
                // create an entry object instance
                let newEntry = new Entry(firstNameE, lastNameE, TAe, descript, passwordE, completedE, time, id, active, session);
                console.log(newEntry.session);
                if (currentEntry["active"]===1){
                    numPeopleLeft += 1;
                    uncheckedList.push(newEntry);
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
    // get minutes from local storage
    let recMin = localStorage.getItem("recTime");
    let minMin = localStorage.getItem("minTime");
    let maxMin = localStorage.getItem("maxTime");
    let numPeopleCanHelp = numPeopleLeft;
    let numberWarning = "";
    if (timer/numPeopleLeft < recMin*60){
        if (timer/numPeopleLeft > minMin*60){
            recTime = minMin;
            numberWarning = "Warning: Cannot spend more than "+String(minMin)+" minutes with each student, queue is near capacity";
        } else {
            recTime = minMin;
            numPeopleCanHelp = Math.floor(timer/60/minMin);
            numberWarning = "Warning: Queue is at capacity. \n Number of Students that can be helped: "+numPeopleCanHelp.toString()+" (last student to be helped is in red)";
        }
        // issue the warning
        document.getElementById("numberWarning").innerHTML = numberWarning;
    } else if (timer/numPeopleLeft === recMin*60){
        recTime = recMin;
    } else {
        // each student gets at least 5 minutes 
        if (numPeopleLeft < 4){
            recTime = maxMin;
        } else {
            recTime = recMin;
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
* Callback function for requestSessionsGetKeyAuthClearQueue. Clears the queue if response
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
        requestQueueGetId(theUrl, response["data"]["session_id"]);
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
* Request to check if keys match in the sessions table, to clear the queue.
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
* @param    {int}            sessionId   sessionId of session to clear
*/
function callbackRequestQueueGetId(response, sessionId){
    response = JSON.parse(response);
    for (entry in response["data"]){
        if (response["data"][entry]["session_id"] == sessionId){
            currentEntry = response["data"][entry];
            requestQueuePatchId(url,currentEntry["person_id"], 0);
        }
    }
}

/*
* Request to api queue get call to get entire table (to be used to update all active 
* values to 0)
*
* @param    {string}    theUrl      url for the host server
* @param    {int}       sessionId   sessionId of session to clear
*/
function requestQueueGetId(theUrl, sessionId){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callbackRequestQueueGetId(xmlHttp.responseText, sessionId);
            window.location.reload();
    }
    xmlHttp.open("GET", theUrl+"api/queue", true); // true for asynchronous 
    xmlHttp.send(null);
}

/* 
* Request to update all entries entered to active value 
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
* Request to update all entries entered to completed value
*
* @param    {string}    theUrl      url for the host server
* @params   {int}       rowId       id of the entry
* @params   {int}       complete    complete value of the entry to update to
*/
function requestQueuePatchComplete(theUrl, rowId, completed){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            response = xmlHttp.responseText;
        }
    }
    xmlHttp.open("PATCH", theUrl+"api/queue/update/c?rowId="+rowId+"&completed="+completed, true); // true for asynchronous 
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
* @param    {string}    ta          name of TA selected for this entry  
* @param    {string}    descript    description of issue for this entry 
* @param    {string}    password    password for this entry
* @param    {string}    completed   completed value for this entry
*/
function requestQueuePostEntry(theUrl, firstName, lastName, session_id, ta, descript, password, completed){
    let response;
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            response = xmlHttp.responseText;
        }
    }
    params = "first_name="+firstName+"&last_name="+lastName+"&session_id="+session_id+"&ta="+ta+"&descript="+descript+"&password="+password+"&completed="+completed;
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
* @param    {int}           recTime     recommended time per student for this session
* @param    {int}           minTime     minimum time per student for this session
* @param    {int}           maxTime     maximum time per student for this session
*/
function callbackRequestSessionsGetKey(response, theUrl, sessionName, room, tas, start, end, recTime, minTime, maxTime){
    response = JSON.parse(response);
    publicKey = response["data"]["public_key"];
    privateKey = response["data"]["private_key"];
    alert("Private Key: "+privateKey+"  Public Key: "+publicKey);
    // save the private key and public key pairing to localstorage
    localStorage.setItem("generatedKeys", JSON.stringify(addKeys(localStorage.getItem("generatedKeys"), privateKey, publicKey)));
    let rowId = response["data"]["session_id"];
    let active = 1;
    requestSessionsPatchSession(theUrl, active, sessionName, room, tas, rowId, start, end, recTime, minTime, maxTime);
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
* @param    {int}       recTime     recommended time per student for this session
* @param    {int}       minTime     minimum time per student for this session
* @param    {int}       maxTime     maximum time per student for this session
*/
function requestSessionsGetKey(theUrl, sessionName, room, tas, start, end, recTime, minTime, maxTime){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callbackRequestSessionsGetKey(xmlHttp.responseText, theUrl, sessionName, room, tas, start, end, recTime, minTime, maxTime);
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
    clearHtml("sessionEntries");
    // parse json response, then iterate through the response (to get each entry and display)
    response = JSON.parse(response);
    // also save public keys and session names for deleting non-active ones off the localStorage
    let activePublicKeys = [];
    let activeSessionNames = {};
    for (session in response["data"]){
        currentSession = response["data"][session];
        // only show if active is 1 and the session_id matches
        if (currentSession["active"]===1){
            let sessionId = currentSession["session_id"];
            let publicKey = currentSession["public_key"];
            // create a time for when this entry was made
            let active = currentSession["active"];
            let sessionName = currentSession["session_name"];
            let room = currentSession["room"];
            let tas = currentSession["tas"];
            // create an entry object instance
            let newSession = new Session(sessionId, publicKey, active, sessionName, room, tas);
            // display on html page
            sessionToText(newSession);
            // push needed information to activePublicKeys and activeSessionNames
            activePublicKeys.push(publicKey);
            activeSessionNames[publicKey] = sessionName;
        }
    }

    // add html for the active keys (generated and entered)
    clearHtml("generatedKeysPara");
    clearHtml("enteredKeysPara");
    addKeyHtml("generatedKeys","generatedKeysPara", activePublicKeys, activeSessionNames);
    addKeyHtml("enteredKeys","enteredKeysPara", activePublicKeys, activeSessionNames);
}

/*
* Function to add the html for keys (only if the session is active). If the session is no longer active,
* remove the key from localStorage.
*
* @param    {string}    localStorageVariable    string name of the local storage variable
* @param    {string}    divId                   id of the div to add the html to
* @param    {list}      activePublicKeys        all currently active public keys   
* @param    {dict}      activeSessionNames      all currently active session names, mapped to a public key    
*/
function addKeyHtml(localStorageVariable, divId, activePublicKeys, activeSessionNames){
    // repeat for Entered Keys
    keyPairingsDict = JSON.parse(localStorage.getItem(localStorageVariable));
    for (let key in keyPairingsDict){
        if (activePublicKeys.includes(key)){
            let para = document.getElementById(divId);
            let sessionText = document.createTextNode("Session Name: "+activeSessionNames[key]);
            let nameText = document.createTextNode(" | Public Key: "+key+", Private Key: "+keyPairingsDict[key]);
            let lineBreak = document.createElement("br");
            para.appendChild(sessionText);
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
    // get "no session loaded" heading
    let session = document.getElementById('sessionLoadedHeading');
    if ("data" in response){
        session.style.display = "none";
        // store items in localStorage
        localStorage.setItem("publicKey",response["data"][3]);
        localStorage.setItem("recTime",response["data"][4]);
        localStorage.setItem("minTime",response["data"][5]);
        localStorage.setItem("maxTime",response["data"][6]);
        localStorage.setItem("TAs",response["data"][7]);
        localStorage.setItem("sessionName", response["data"][8]);
        
        // add session heading 
        document.getElementById("sessionNumber").innerHTML = "Session Public Key #"+localStorage.getItem("publicKey")+": "+localStorage.getItem("sessionName");

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
        // let user know no session has been loaded
        session.style.display = "block";
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
* @param    {string}        ta          ta selected for this entry
* @param    {string}        descript    description of issue for this entry
* @param    {string}        password    password for this entry
* @param    {string}        completed   completed value for this entry
*/
function getPostSessionId(response, theUrl, firstName, lastName, ta, descript, password, completed){
    response = JSON.parse(response);
    if ("data" in response){
        session_id = response["data"][0];
        requestQueuePostEntry(theUrl, firstName, lastName, session_id, ta, descript, password, completed);
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
* @param    {string}        ta          ta selected for this entry
* @param    {string}        descript    description of issue for this entry
* @param    {string}        password    password for this entry
* @param    {string}        completed   completed value for this entry
*/
function requestSessionsGetToPostEntry(theUrl, firstName, lastName, publicKey, ta, descript, password, completed){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            getPostSessionId(xmlHttp.responseText, theUrl, firstName, lastName, ta, descript, password, completed);
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
    } else {
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
* Callback function for requestSessionsGetKeyAuth. Check/uncheck the item if the response
* indicates that there is a match for the public and private key.
*
* @param    {string}        theUrl      url for the host server
* @param    {JSON string}   response    response from api
* @param    {int}           newEntryId  id of the entry to be delete
* @param    {string}        publicKey   the public key
* @param    {string}        keyType     generated, entered or manual to indicate which key type its checking
*/
function callbackRequestSessionsGetKeyAuthCheck(theUrl, response, newEntryId, publicKey, keyType){
    let enteredKeysPairingsDict = JSON.parse(localStorage.getItem("enteredKeys"));
    response = JSON.parse(response);
    if ("data" in response){
        // check/uncheck the item
        checkedEntry(newEntryId);
    } else if (!("data" in response) && (keyType == "generated") && (enteredKeysPairingsDict)){
        let enteredPrivateKey = enteredKeysPairingsDict[publicKey];
        requestSessionsGetKeyAuthCheck(url, newEntryId, publicKey, enteredPrivateKey, "entered");
    } else if (!("data" in response) && (keyType == "entered")){
        let userEnteredKey = prompt('Enter private key to delete this entry.');
        requestSessionsGetKeyAuthCheck(url, newEntryId, publicKey, userEnteredKey, "manual");
    } else {
        alert("Wrong private key.");
    }
}

/*
* Request to check if keys match in the sessions table, to check/uncheck the entry.
*
* @param    {string}    theUrl      url for the host server
* @param    {int}       newEntryId  id of the entry to be deleted
* @param    {string}    privateKey  the private key 
* @param    {string}    publicKey   the public key
* @param    {string}    keyType     generated, entered or manual to indicate which key type its checking
*/
function requestSessionsGetKeyAuthCheck(theUrl, newEntryId, publicKey, privateKey, keyType){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callbackRequestSessionsGetKeyAuthCheck(theUrl, xmlHttp.responseText, newEntryId, publicKey, keyType);
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
* @param    {int}       recTime     recommended time per student for this session
* @param    {int}       minTime     minimum time per student for this session
* @param    {int}       maxTime     maximum time per student for this session
*/
function requestSessionsPatchSession(theUrl, active, sessionName, room, tas, rowId, start, end, recTime, minTime, maxTime){
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
    if(isNaN(recTime)){
        recTime = 0;
    }
    if(isNaN(minTime)){
        minTime = 0;
    }
    if(isNaN(maxTime)){
        maxTime = 0;
    }
    xmlHttp.open("PATCH", theUrl+"api/sessions/update/?active="+active+"&session_name="+sessionName+"&room="+room+"&tas="+tas+"&start="+start+"&end="+end+"&rec_min="+recTime+"&min_min="+minTime+"&max_min="+maxTime+"&rowid="+rowId, true); // true for asynchronous 
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
        // delete the session and all the localStorage time variables associated with it 
        localStorage.removeItem("starttime"+publicKey);
        localStorage.removeItem("endtime"+publicKey);
        localStorage.removeItem("publicKey");
        localStorage.removeItem("TAs");
        requestSessionsPatchSession(theUrl,0,"None", "None", "None", response["data"]["session_id"], 0, 0, 0, 0, 0);
        requestQueueGetId(theUrl, response["data"]["session_id"]);
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
