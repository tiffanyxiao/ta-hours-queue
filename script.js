let request = new XMLHttpRequest();

// Open a new connection, using the GET request on the URL endpoint
request.open('GET', 'https://mysterious-headland-07008.herokuapp.com/api/queue', true);

request.onload = function() {
  // Begin accessing JSON data here
}

// Send request
request.send();

// Begin accessing JSON data here
let data = JSON.parse(request.response);

data.forEach(person => {
  // Log each movie's title
  console.log(person.first_name)
})

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
    let nameNode = document.createTextNode(newEntry.eFullName);
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