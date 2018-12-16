var path = require('path');
var login = require('./routes/loginRoutes');
var session = require('client-sessions');
var express = require('express');
var SQLCalls = require('./routes/mySqlCalls');
var app = express();
var http = require('http').Server(app);
var bodyParser= require('body-parser');
var io = require('socket.io')(http);
var CronJob = require('cron').CronJob;
var messageAPI = require('./routes/messageAPI');
//global variables
var allUsers = []

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//sessions
app.use(session({
    cookieName : 'session',
    secret : 'groupchat_secret',
    duration : 0
}));

//cronJobs
new CronJob('* * * * * *', function() {
    console.log('You will see this message every second');
    console.log('allUsers is')
    for(var key in allUsers){
        console.log(JSON.stringify(key));
        console.log();
    }
    // console.log(JSON.stringify(allUsers));
    console.log("end");
}, null, true, 'America/Los_Angeles');


//mysql
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

var findUser = function(socket){
    //find userid given the socket to which he/she is connected
    for(var key in allUsers){
        if(allUsers[key] === socket){
            return key;
        }
    }
    return -1;
}
var deleteUser = function(socket){
    //delete userid of the socket to which he/she is connected
    for(var key in allUsers){
        if(allUsers[key] === socket){
            delete allUsers[key];
            break;
        }
    }
}
io.on('connection', function(socket){
    messages = [];
    console.log("a user connected");
    // io.emit('connection',)
    socket.on('disconnect', function(){
        console.log("user disconnected" + JSON.stringify(allUsers[socket]));
        var key = findUser(socket)
        io.emit('disconnection', findUser(socket));
        deleteUser(socket);
        // delete allUsers[socket];
        // console.log("now allUsers are :" + allUsers);
    })
    socket.on('chat message', function(msg){
        console.log('msg : ' + msg);
        messages.push(msg);
        io.emit('chat message', msg);
    })
    socket.on("connected", function(userObj){
        console.log(JSON.stringify(userObj));
        allUsers[userObj.id] = socket;
        // console.log("allUsers now " + allUsers.length);
        socket.broadcast.emit("connected",userObj)
    })
   /*  socket.on("disconnection", function(userObj){
        console.log(userObj);
    }) */
});



app.get("/", function(req, res){
    console.log("Hello realtime world");
    res.send("Hello world");
    //res.sendFile(__dirname + "/index.html");
});

//loginlogout entry points
var router = express.Router();
router.get('/', function(req, res){
    res.json("Welcome to this groupchat web app.");
    console.log("hello");
});

router.post('/register', login.register);
router.post('/login', login.login);

app.use('/api/loginlogout', router);

app.get('/login', function(req, res){
    res.render('login.ejs', {title : "hello please login", type : "good"})
})

app.get('/register', function(req, res){
    res.render('register.ejs', {type : "good"});
});

app.get('/profile', function(req, res){
    if(!req.session.user)res.redirect('/login');
    else
        res.render('dashboard.ejs', {title:'Dashboard', user : req.session.user});
});
app.get('/logout', function(req, res){
    req.session.user = undefined;
    res.redirect('/profile');
});
//end loginlogout entry points

//message processing API
app.use('/api/', messageAPI);

app.get("/chat_window", function(req, res){
    if(!req.session.user){
        res.redirect('/login');
    }
    function callback(users){
        console.log("user id is " + req.session.user);
        console.log(users);
        var onlineUsers = {}
        for(var key in allUsers){
            onlineUsers[key] = "online";
        }
        console.log("online users : " + JSON.stringify(onlineUsers));
        res.render("chat_window.ejs", {users : users, id : req.session.user, onlineUsers : onlineUsers});
    }
    SQLCalls.getUsers(callback);
});



var port = 3000 | process.env.port;
http.listen(port, function(req, res){
    console.log("Connected on port " + port);
});