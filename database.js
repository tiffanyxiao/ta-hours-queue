/* 
* Author: Tiffany Xiao
* Description: Code to connect to database, or create the database if it doesn't already exist. 
* Date last modified: See Github repo (https://github.com/tiffanyxiao/ta-hours-queue)
*/

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
        db.run('CREATE TABLE queue(person_id INTEGER PRIMARY KEY, first_name varchar(255), last_name varchar(255), active int, session_id int, ta varchar(255), timestamp datetime default current_timestamp)', 
        (err) => {
            if (err) {
                // Table already created
            }else{  
                // add some rows
                // let insert = 'INSERT INTO queue(first_name, last_name, time) VALUES (?,?,?)';
                // db.run(insert, ["Tiffany","Xiao","11:03"]);
            }
        });  
        db.run('CREATE TABLE sessions(session_id INTEGER PRIMARY KEY, public_key varchar(255), private_key varchar(255), active int, session_name varchar(255), room varchar(255), tas varchar(255), starttime int, endtime int, rec_min int, min_min int, max_min int)', 
        (err) => {
            if (err) {
                // Table already created
            }else{  
                // generate 5000 rows (5000 active sessions)
                let publicKeys = [];
                let privateKeys = [];
                for (let t = 0; t < 5000; t++){
                    let created = false;
                    while(created === false){
                        publicKey = generateKey(6);
                        privateKey = generateKey(6);
                        if (!((publicKey in publicKeys) & (privateKey in privateKeys))){
                            let insert = 'INSERT INTO sessions(public_key, private_key, active, session_name, room, tas, starttime, endtime, rec_min, min_min, max_min) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
                            db.run(insert, [publicKey, privateKey, 0, "None", "None", "None", 0, 0, 0, 0, 0]);
                            publicKeys.push(publicKey);
                            privateKeys.push(privateKey);
                           created = true;
                        }
                    }
                }
            }
        });  
    }
});

// function to generate a key of the given length
function generateKey(length){
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result
}

module.exports = db; 