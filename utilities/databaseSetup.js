var r = require('rethinkdb');
//for now we work on test database.Later we will create a separate database.

var connection = null;
r.connect({host : 'localhost', port : 28015}, function(err, conn){
    if(err){
        throw err;
    }
    connection = conn;
    r.db('test').tableCreate('users').run(connection, function(err, result){
    if(err){
        throw err;
    }
    console.log("creating table users");
    console.log(result);
});

r.db('test').tableCreate('messages').run(connection, function(err, result){
    if(err){
        throw err;
    }
    console.log("creating table messages");
    console.log(result);
});
});



//the setup work is done.