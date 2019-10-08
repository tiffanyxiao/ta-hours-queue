// Create express app
let express = require("express");
let app = express();
let db = require("./database.js");
let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
    let errors=[];
    // :happiny: :fried egg:
    if (!req.query.first_name){
        errors.push("No first name specified");
    }
    if (!req.query.last_name){
        errors.push("No last name specified");
    }
    if (!req.query.time){
        errors.push("No time specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    let data = {
        first_name: req.query.first_name,
        last_name: req.query.last_name,
        time: req.query.time
    }
    let sql ='INSERT INTO queue(first_name, last_name, time) VALUES (?,?, ?)'
    let params =[data.first_name, data.last_name, data.time];
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

// endpoint to update a person 
app.patch("/api/queue/:first_name", (req, res, next) => {
    var data = {
        first_name: req.query.first_name,
        last_name: req.query.last_name,
        time: req.query.time
    }
    db.run(
        `UPDATE queue set 
           first_name = COALESCE(?,first_name), 
           last_name = COALESCE(?,last_name), 
           time = COALESCE(?,time) 
           WHERE first_name = ?`,
        [data.first_name, data.last_name, data.time, req.params.first_name],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
})

// endpoint to delete a person 
app.delete("/api/queue/:first_name", (req, res, next) => {
    db.run(
        'DELETE FROM queue WHERE first_name = ?',
        req.params.first_name,
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