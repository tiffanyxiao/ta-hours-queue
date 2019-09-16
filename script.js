// create a entry box object
function entry(firstName, lastName) {
    this.eFirstName = firstName;
    this.eLastName = lastName;
    this.eDescription = "";
    this.eFullName = this.eFirstName+" "+this.eLastName;
}

// define a function that will turn an entry into text
function entryToText(newEntry){
    var nameNode = document.createTextNode(newEntry.eFullName);
    document.body.appendChild(nameNode);
}

// create a new entry based off of form 
function createEntry(){
    // get the info from html element by ID
    let firstNameE = document.getElementById("firstName").value;
    let lastNameE = document.getElementById("lastName").value;

    // create an entry object instance
    let newEntry = new entry(firstNameE, lastNameE);
    console.log(newEntry.eFirstName);
    return newEntry;
}

function formSubmit(){
    let sampleEntry = createEntry();
    entryToText(sampleEntry);
}