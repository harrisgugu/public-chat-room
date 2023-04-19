const express = require('express');
const app = express();
var server  = require("http").createServer(app);
io = require("socket.io")(server);

// var http = require('http').Server(app);
// var server = http.createServer(app);
// var io = require('socket.io')(http);


const path = require('path');
const hostname = 'localhost';
const port = 4000;
app.use(
  express.urlencoded({
    extended: true,
  })
);

var pug = require('pug');
var session = require("express-session")({
  secret: "my-secret",
  resave: true,
  saveUninitialized: true,
});
var sharedsession = require("express-socket.io-session");
app.use(session);
io.use(sharedsession(session));


app.use(express.json());
app.set("view engine","pug");
app.use(express.static(path.resolve(__dirname,'public')));
//app.use(sharedsession(session));
//using pug with express

app.get('/',(req,res)=>{
    res.statusCode = 200;
    res.render('login',{match:true});
});


//connecting to the database
var mysql = require("mysql");
const { isObject } = require("util");
const e = require("express");
const { time } = require("console");
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "051Tiantian!",
  database:"fsechatroom",
  port:3000
});

con.connect(function(err) {
  if (err){
    throw err;
  }
  console.log("Successfully connected to mysql database!");
});

app.get('/register',(req,res)=>{
  res.render('register',{register:true,empty:false, valid:true});
});

app.post('/register', (req,res)=>{
  const validpattern = /[^a-zA-Z0-9]/;
  console.log(req);
  var username = req.body.username;
  var password=  req.body.password;
  console.log("username: "+username);
  console.log("password: "+ password);
  if(username===''||password===''){
    //res.redirect('register');
    res.render('register',{register:true,empty:true,valid:true});
    //res.end("Username does not exits");
    return;
  }else if(validpattern.test(username)){
    //res.redirect("register");
    res.render('register',{register:true,empty:false,valid:false});
    //res.end("Please only use letters and numbers for your username");
    return;
  }else{
    var checkQuery = "select * from users where username = '"+ username+"' ;";
    con.query(checkQuery, function (err, result) {
      if (err) throw err;
      console.log("Check Query Result: " + result);
      if(result.length>=1){
        console.log("this is already in use");
        //res.redirect('register');
        res.render('register',{register:false});
        //res.end("Username already in use. Please use a different name");
        return;
      }else{
        var insertSql = "insert into users value ('"+ username +"' , '"+ password+ "' );";
        con.query(insertSql, function (err, result) {
          if (err) {
            throw err;
          }
          console.log("Result: " + result);
        });
        res.redirect('login');
      }
      console.log("after everything");
    });
    //res.redirect('login');
    //res.end("successfully registed");
  } 
});

app.get('/login',(req,res)=>{
  res.render('login',{match:true,empty:false});
});

app.get('/backToMain',(req,res)=>{
  res.render( 'login', { match: true, empty: false } );
});

app.post('/login', (req,res)=>{
  var username = req.body.username;
  var password=  req.body.password;
  console.log("username: "+username);
  console.log("password: "+ password);
  if(username===''||password===''){
    res.render('login',{match:true,empty:true});
    //res.end("Username does not exits");
    return;
  }
  var checkQuery = "select * from users where username = '"+ username + "' and password = '" + password +"' ;";
  console.log(checkQuery);
  con.query(checkQuery, function (err, result) {
    if (err) {
      //res.end("Error executing the query.\n");
      throw err;
    }
    console.log("Result: " + result);
    console.log(result.length);
    if(result.length<1||result===''){
      res.render('login',{match:false});
      //res.end("Username/password does not exits");
      return;
    }else{
      req.session.username = username;
      req.session.loggedIn = true;
      res.redirect('/chatroom');
    }
  });

  //res.end();
});

app.get('/chatroom',(req,res)=>{
  if(!req.session.loggedIn){
    res.end("Please log in first");
  }else{
    var sql = "select * from messages;";
    con.query(sql, function (err, r,result) {
      if (err) throw err;
      var messages = [];
      console.log("Messages Result: " + result);
      for(var i = 0;i<r.length;i++){
        console.log("sendtime:"+r[i].sendtime);
        var t = new Date(String(r[i].sendtime));
        t = t.toISOString();
        var timestamp = t.substring(0,19);
        timestamp =timestamp.replace("0Z",' ');
        timestamp= timestamp.replace("T",' ');
        console.log("t:"+t);
        var msg = {
          'user':r[i].author,
          'msg':r[i].msg,
          'timestamp':timestamp
        }
        messages.push(msg);
      }
      res.render('chatroom',{data:messages,currentUser:req.session.username});
    });
  }
});

app.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect("/login");
})

server.listen(port, () => {
  console.log(`Chatroom running at http://localhost:${port}`);
});

io.on('connection',(socket)=>{
  socket.on('postMessage',function(message){
    var msg = message.msg;
    var currentDate = new Date();
    var timestamp = currentDate.toISOString();
    timestamp =timestamp.replace("Z",' ');
    timestamp= timestamp.replace("T",' ');
    var user = socket.handshake.session.username;
    var sql = "insert into messages value('"+timestamp
    +"' , '"+ user+"' , '"+ msg + "' );";
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Result: " + result);
    });
    console.log("connection timestamp: "+timestamp);
    io.emit('msgPosted',{msg:msg,user:user,timestamp:timestamp});
  });


})

