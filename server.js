/* 
* Author: Tiffany Xiao
* Description: Code for a RESTful API for the ta-hours-queue project. 
* Date last modified: See Github repo (https://github.com/tiffanyxiao/ta-hours-queue)
*/

// Create express app
let express = require("express");
let app = express();
let db = require("./database.js");
let bodyParser = require("body-parser");
let cors = require('cors');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

// Server port
let HTTP_PORT = 8000;

// Start server
app.listen(process.env.PORT || HTTP_PORT);

// serving static files in express
app.use(express.static('public'));

// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"});
});

// endpoint for getting the whole queue from queue table
app.get("/api/queue", (req, res, next) => {
    let sql = "select * from queue order by time asc";
    let params = [];
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

// endpoint for getting the whole sessions table from sessions table
app.get("/api/sessions/all", (req, res, next) => {
    let sql = "select * from sessions where active=1";
    let params = [];
    let response = [];
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        if (rows){
            // get all session_id 
            for (let i = 0; i < rows.length; i++ ) {
                response.push(rows[i]["session_id"])
            }
            // response = rows["session_id"];
        }
        res.json({
            "message":"success",
            "data":response
        })
      });      
});

// endpoint for getting a row by session_id from sessions table
app.get("/api/sessions/generatekeys/", (req, res, next) => {
    // STEP 1: get all the indexes that are active: 
    let sql = "select * from sessions where active=1";
    let params = [];
    let response = [];
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        if (rows){
            // get all session_id 
            for (let i = 0; i < rows.length; i++ ) {
                response.push(rows[i]["session_id"])
            }
        }
      });    
    // STEP 2: generate a random row index that isn't already in response
    let randomInt;
    while(true){
        randomInt = Math.floor(Math.random() * 5000)+1;
        if (!(randomInt in response)){
            break;
        }
    }
    let errors=[];
    if (errors.length){
        console.log(req);
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    let data = {
        public_key: req.query.public_key,
        private_key: req.query.private_key
    }
    sql ='select * from sessions where session_id =?';
    params =[randomInt];
    db.get(sql, params, function (err, rows) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        if (rows){
            // get all session_id 
            for (let i = 0; i < rows.length; i++ ) {
                response.push(rows[i]["session_id"])
            }
        }
        res.json({
            "message": "success",
            "data": rows
        })
    });
});

// endpoint for getting a row by public key from sessions table
app.get("/api/sessions", (req, res, next) => {
    let errors=[];
    let response;
    if (errors.length){
        console.log(req);
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    let data = {
        public_key: req.query.public_key,
        private_key: req.query.private_key
    }
    let sql ='select * from sessions where public_key=?';
    let params =[data.public_key, data.private_key];
    db.get(sql, params, function (err, rows) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        if (rows){
            response = rows["session_id"];
        }
        res.json({
            "message": "success",
            "data": rows
        })
    });
});

// endpoint for checking public key and private key match from sessions table
app.get("/api/sessions/auth", (req, res, next) => {
    let errors=[];
    if (errors.length){
        console.log(req);
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    let data = {
        public_key: req.query.public_key,
        private_key: req.query.private_key
    }
    let sql ='select public_key from sessions where public_key=? and private_key=?';
    let params =[data.public_key, data.private_key];
    db.get(sql, params, function (err, rows) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        })
    });
});

// endpoint for getting by row_id from queue table
app.get("/api/queue/:rowid", (req, res, next) => {
    let sql = "select * from queue where rowid = ?";
    let params = [req.params.rowid];
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

// endpoint to post an entry into queue table
app.post("/api/queue/", (req, res, next) => {
    let errors=[];
    if (!req.query.first_name){
        errors.push("No first name specified");
    }
    if (!req.query.last_name){
        errors.push("No last name specified");
    }
    if (!req.query.session_id){
        errors.push("No session_id specified");
    }
    if (errors.length){
        console.log(req);
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    let data = {
        first_name: req.query.first_name,
        last_name: req.query.last_name,
        time: req.query.time,
        active: 1,
        session_id: req.query.session_id
    }
    let sql ='INSERT INTO queue(first_name, last_name, active, session_id) VALUES (?, ?, ?, ?)'
    let params =[data.first_name, data.last_name, data.active, data.session_id];
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

// endpoint to update an entry with 0 active status in queue table
app.patch("/api/queue/:rowid", (req, res, next) => {
    db.run(
        `UPDATE queue set 
           active = 0 
           WHERE rowid = ?`,
        [req.params.rowid],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                changes: this.changes
            })
    });
})

// endpoint to delete a person in queue table
app.delete("/api/queue/:rowid", (req, res, next) => {
    db.run(
        'DELETE FROM queue WHERE rowid = ?',
        req.params.rowid,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
})

// Default response for any other request
app.use(function(req, res){
    res.status(404);
});