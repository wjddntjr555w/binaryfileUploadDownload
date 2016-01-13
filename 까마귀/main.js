var express = require('express');
var path = require('path');
var fs = require('fs');
var multiparty = require('connect-multiparty');
var app = express();
var router = express.Router();
var bodyParser=require('body-parser');
var id = 'admin';
var password = 'opd1234';
var mongoose= require('mongoose');

mongoose.connect("mongodb://admin:opd1234@ds035683.mongolab.com:35683/woodb");

var db = mongoose.connection;
db.once('open',function(){
  console.log('DB connected');
});

db.on("error",function(err){
  console.log('DB error: ',err);
});

var dataSchema = mongoose.Schema({
  ID : String,
  PassW : String
});

var Mdata = mongoose.model('data2',dataSchema);
Mdata.findOne({ID:'jungos'},function(err,data){
  if(err) return console.log("Data error:",err);
  if(!data){
    Mdata.create({ID:"jungos",PassW:'1234'},function(err,data){
      if(err) return console.log('data error',err);
      console.log('Counter initialized :',data);
    });
  }
});

app.use( bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/',function(req,res){
  fs.readFile('public/index.html',function(error,data){
    res.writeHead(200,{'Content-Type': 'text/html'});
    res.end(data);
  });
});

app.post('/', function(req,res){
Mdata.findOne({ID:'jungos'},function(err,data){

  console.log(data.ID);
  if(req.body.id == data.ID)
  {
    console.log('ID Ok!');
    if(req.body.password == data.PassW)
    {
      console.log('login success');
      fs.readFile('public/success.html',function(error,data){
        res.writeHead(200,{'Content-Type': 'text/html'});
        res.end(data);
      });
    }
    else {
      fs.readFile('public/fail.html',function(error,data){
        res.writeHead(200,{'Content-Type': 'text/html'});
        res.end(data);
      });
    }
  }
  else {
    console.log('login fail ID');
  }
});
});



app.listen(3007, function(){
  console.log('Server On!');
});
