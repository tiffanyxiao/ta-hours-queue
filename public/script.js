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

//let url = "https://mysterious-headland-07008.herokuapp.com/";
let url = "http://localhost:8000/";

function loadAll(response){
    clearQueue();
    response = JSON.parse(response);
    for (entry in response["data"]){
        currentEntry = response["data"][entry];
        // only show if active is 1 
        if (currentEntry["active"]===1){
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

function httpGetAsync(theUrl){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            loadAll(xmlHttp.responseText);
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

function httpPostAsync(theUrl, firstName, lastName, time){
    let response;
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            response = xmlHttp.responseText;
        }
    }
    params = "first_name="+firstName+"&last_name="+lastName+"&time="+time;
    xmlHttp.open("POST", theUrl+"api/queue?"+params, true); // true for asynchronous 
    xmlHttp.send();
    return response;
}

function httpPatchAsync(theUrl, params){
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            console.log(xmlHttp.responseText);
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
    if (confirm('Are you sure you want to delete this entry?')) {
        httpDeleteAsync(url,newEntryId);
    } else {
        // Do nothing!
    }
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
    let date = new Date(sampleEntry.eTime).toString();
    httpPostAsync(url,sampleEntry.eFirstName,sampleEntry.eLastName,sampleEntry.eTime);
    httpGetAsync(url);
}

function archiveQueue(){
    httpGetPatchAsync(url);
}

function onLoad(){
    httpGetAsync(url);
}

// setTimeout(function(){
//     window.location.reload(1);
//  }, 5000);