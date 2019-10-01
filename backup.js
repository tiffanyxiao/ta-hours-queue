// create the table 
//db.run('CREATE TABLE queue(first_name varchar(255), last_name varchar(255), time int)');

function insert(firstName, lastName, time){
    // import sqlite3 module 
    const sqlite3 = require('sqlite3').verbose();
    
    // open or create the database
    let db = new sqlite3.Database('ta_hours_queue.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });

    // insert row into database object 
    db.run('INSERT INTO queue(first_name, last_name) VALUES(?,?)', [firstName, lastName, time], function(err){
        if (err) {
            return console.log(err.message);
        }
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
    });

    let sql = `SELECT first_name, last_name FROM queue`;

    // print everything to make sure it's all ok
    db.each(sql, (err, row) => {
    if (err) {
        throw err;
    }
    console.log(`${row.first_name} ${row.last_name} ${row.time}`);
    });

    // close the database
    db.close((err) => {
        if (err) {
        console.error(err.message);
        }
        console.log('Close the database connection.');
    });
}