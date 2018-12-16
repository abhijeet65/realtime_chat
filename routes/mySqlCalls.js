var mysql  = require('mysql');
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
    else console.log("mysql successfully connected");
})

var getUsers = function(callback){
    query = "SELECT id, name from users";
    connection.query(query, function(err, result, fields){
        if(err){
            return err;
        }
        callback(result);
    })
}

module.exports = {
    "getUsers" : getUsers
}