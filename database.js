// import sqlite3 module 
const sqlite3 = require('sqlite3').verbose();

// open or create the database
let db = new sqlite3.Database('ta_hours_queue.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        // throw error when Cannot open database
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the database.');
        db.run('CREATE TABLE queue(person_id INTEGER PRIMARY KEY, first_name varchar(255), last_name varchar(255), time int, active int, session_id int)', 
        (err) => {
            if (err) {
                // Table already created
            }else{  
                // add some rows
                // let insert = 'INSERT INTO queue(first_name, last_name, time) VALUES (?,?,?)';
                // db.run(insert, ["Tiffany","Xiao","2:04"]);
                // db.run(insert, ["Mickey","Mouse","3:55"]);              
            }
        });  
        db.run('CREATE TABLE sessions(session_id INTEGER PRIMARY KEY, public_key varchar(255), private_key varchar(255))', 
        (err) => {
            if (err) {
                // Table already created
            }else{  
                // add some rows
                // let insert = 'INSERT INTO queue(first_name, last_name, time) VALUES (?,?,?)';
                // db.run(insert, ["Tiffany","Xiao","2:04"]);
                // db.run(insert, ["Mickey","Mouse","3:55"]);              
            }
        });  
    }
});

module.exports = db; 