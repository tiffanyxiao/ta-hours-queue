// create a entry box object
function entry(firstName, lastName, time) {
    this.eFirstName = firstName;
    this.eLastName = lastName;
    this.eDescription = "";
    // get the time (in milliseconds) of today
    this.eTime = time;
    this.eFullName = this.eFirstName+" "+this.eLastName;
}

// define a function that will turn an entry into text
function entryToText(newEntry){
    var nameNode = document.createTextNode(newEntry.eFullName);
    // add text node 
    document.getElementById('queueEntries').appendChild(document.createTextNode(newEntry.eFullName));
    // add time node 
    document.getElementById('queueEntries').appendChild(document.createTextNode(" "+new Date(newEntry.eTime).toString()));
    // add linebreak 
    document.getElementById('queueEntries').appendChild(document.createElement("br"));
}

// create a new entry based off of form 
function createEntry(){
    // get the info from html element by ID
    let firstNameE = document.getElementById("firstName").value;
    let lastNameE = document.getElementById("lastName").value;
    // create a time 
    let time = new Date().getTime();
    // create an entry object instance
    let newEntry = new entry(firstNameE, lastNameE, time);
    return newEntry;
}

function formSubmit(){
    let sampleEntry = createEntry();
    entryToText(sampleEntry);
}