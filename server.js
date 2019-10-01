// Create express app
let express = require("express");
let app = express();
let db = require("./database.js");
let md5 = require("md5")

let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Server port
let HTTP_PORT = 8000;

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT));
});

// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"});
});

// endpoint for whole queue
app.get("/api/queue", (req, res, next) => {
    let sql = "select * from queue";
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

// endpoint for getting by first name 
app.get("/api/queue/:first_name", (req, res, next) => {
    let sql = "select * from queue where first_name = ?";
    let params = [req.params.first_name];
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

// endpoint to post a person 
app.post("/api/queue/", (req, res, next) => {
    console.log("hello");
    let errors=[];
    if (!req.body.first_name){
        errors.push("No first name specified");
    }
    if (!req.body.last_name){
        errors.push("No last name specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    let data = {
        first_name: req.body.first_name,
        last_name: req.body.last_name
    }
    let sql ='INSERT INTO queue(first_name, last_name) VALUES (?,?)'
    let params =[data.first_name, data.last_name];
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

// Default response for any other request
app.use(function(req, res){
    res.status(404);
});