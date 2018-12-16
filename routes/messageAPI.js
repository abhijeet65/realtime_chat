var express = require('express');
var mysql = require('mysql');
var router = express.Router()

var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'groupchat'
})

connection.connect(function(err){
    if(err){
        console.log("something wrong. Could not connect with database");
    }
    else console.log("messageAPI mysql successfully connected");
})


router.post('/getMessages', function(req,res){
    /*
        @param from : the userId of the user who needs to read messages
        @param to : the userId of recipient
        return : list of messages
    */
    var from = req.body.from;
    var to = req.body.to;
    connection.query("SELECT fromId, toId, body, timestamp FROM messages WHERE (fromId = " + from + " AND toId = " + to + ") OR (fromId = " + to + "AND toId = " + from + ") ORDER BY timestamp", function(err, results, fields){
        if(err){
            console.log("getMessage error");
        }
        else{
            return results;
        }
    });
    /* connection.query("SELECT body, timestamp FROM messages WHERE fromId = " + to + " AND toId = " + from, function(err, results, fields){
        if(err){
            console.log("getMessage error");
        }
        else{
            result['recieved'] = results;
        }
    }); */
    console.log(JSON.stringify(result));
    return result;
});

router.post('/sendMessage', function(req, res){
    /*
        @param from : the userId of the sender
        @param to : the userId of the recipient
        @param msg : the message body
        return : status of the operation
    */
    var from = req.body.from;
    var to = req.body.to;
    var msg = req.body.msg;
    var timestamp = Date.now();
    connection.query("INSERT INTO messages(fromId, toId, body, timestamp) VALUES(" + from + ", " + to + ", '" + msg + "', " + timestamp + ")", function(err, results, fields){
        if(err){
            console.log(err);
            return -1;
        }
        return 0;
    });
});

module.exports = router;