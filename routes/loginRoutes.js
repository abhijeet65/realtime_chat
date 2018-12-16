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

var login = function(req, res){
    console.log("login callback");
    var email= req.body.email;
    var password = req.body.password;
    connection.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields) {
    if (error) {
        // console.log("error ocurred",error);
        res.send({
        "code":400,
        "failed":"error ocurred"
        })
    }else{
        // console.log('The solution is: ', results);
        if(results.length >0){
            console.log(results[0].Password + " " + password);
            if(results[0].Password === password){
            req.session.user = results[0].id;
            res.redirect('/profile');
            /* res.send({
            "code":200,
            "success":"login sucessfull"
                }); */
            }
            else{
                res.send({
                "code":204,
                "success":"Email and password does not match"
                    });
            }
        }
        else{
        res.send({
            "code":204,
            "success":"Email does not exits"
            });
        }
    }
    });
}

var register = function(req, res){
    console.log("register callback");
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    var user = {
        name:name,
        email:email,
        password:password
    }
    connection.query("INSERT INTO users SET ?", user, function (error, results, fields) {
        if (error) {
          console.log("error ocurred",error);
          res.send({
            "code":400,
            "failed":"error ocurred"
          })
        }else{
          console.log('The solution is: ', results);
          res.send({
            "code":200,
            "success":"user registered sucessfully"
              });
        }
        });
}
module.exports = {
    login:login,
    register:register
}