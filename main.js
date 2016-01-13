var express = require("express");
var path = require("path");
var fs = require("fs");
var multiparty = require("connect-multiparty");
var app = express();
var router = express.Router();
var bodyParser=require("body-parser");
var id = "admin";
var password = "opd1234";
var mongoose= require("mongoose");
var paht = require("path");

mongoose.connect("mongodb://admin:opd1234@ds035683.mongolab.com:35683/woodb");

var db = mongoose.connection;
db.once("open", function(err){
   if(err) console.log(err);
});

  var dataSchema = mongoose.Schema({ // Data 구조 설정​
     title: String, filename: String, file : Buffer
  });
  var multer = require("multer"); // 파일 업로드를 위해 multer 모듈을 사용합니다.​
   app.use(multer({dest:"upload/"}).single("cfile"));

   var MData = mongoose.model("data2",dataSchema);
  // dataSchema를 기반으로하는 DBData 모델을 모듈화함.  ​​
  //module.exports = mongoose.model("DBData", dataSchema);
 /* 업로드 요청 처리 */
 app.get("/upload",function(req,res){
   fs.readFile("public/index.html",function(error,data){
     res.writeHead(200,{"Content-Type": "text/html"});
     res.end(data);
   });
 });

//var upload = multer({dest: "upload/"});

 app.post("/upload", function(req, res){
   console.log(req.file);
   console.log("adfadfadfdfadfadfadf");
   if(req.file.size>16000000){
     fs.readFile("public/fail.html",function(error,data){
       res.writeHead(200,{"Content-Type": "text/html"});
       res.end(data);
     });
     return console.log("Data size limit!!");
   }
     var title = req.body.title; // inputText의 name Value의 값을 가져옵니다.
     var fileObj = req.file.filename; // multer 모듈 덕분에​ req.files가 사용 가능합니다.  ​
//     console.log(fileObj);
     var orgFileName = req.file.originalname; // 원본 파일명을 저장한다.(originalname은 fileObj의 속성)​​
     // 추출한 데이터를 Object에 담는다.
     var savePath = path.join(__dirname,"upload/"+orgFileName);
     console.log(savePath);

     fs.open(savePath,"r",function(err,fd){
       if(err) return console.log("file open Error");
       var buffer = new Buffer(req.file.size);
       fs.read(fd,buffer,0,buffer.length,null,function(err,bytes,buffer){
              var obj = { "title": title, "filename": orgFileName, "file": buffer };
       });

     console.log("tile: " + title +"filename: "+orgFileName+"file"+buffer);


     // DBData 객체에 담는다. (DBData는 moongoose의 를 모델화한 객체입니다.)​
    //  var newData = new DBData(obj);
    //  newData.save(function(err){ // DB에 저장한다.​
    //      if(err) res.send(err); // 에러 확인
    //      res.end("ok"); // 응답
    //   });
    MData.create({ "title": title, "filename": orgFileName, "file": buffer },function(err,data){
      if(err) return console.log("save err");
      console.log("save complete");
      fs.readFile("public/success.html",function(error,data){
        res.writeHead(200,{"Content-Type": "text/html"});
        res.end(data);
       });
      });
    });
 });

 /* 다운로드 요청 처리 */
 app.get("/download", function(req, res){
  // 요청시 해당 파일의 id값을 쿼리로 붙여서 전달합니다.(선택된 파일을 DB에서 찾기 위해)
  fs.readFile("public/download.html",function(error,data){
    res.writeHead(200,{"Content-Type": "text/html"});
    res.end(data);
   });
 });
  app.post("/download",function(req,res){

 var title2 = req.body.title;
 console.log("title:" + title2);
  // id를 사용해 데이터를 찾음
  MData.findOne({"title":title2})
    .select("filename file") // 파일이름과 파일을 찾는다.
    .exec(function(err, data){ // 완료되면 찾은 데이터는 data에 담깁니다.
     // 응답 헤더에 파일의 이름과 mime Type을 명시한다.(한글&특수문자,공백 처리)
     console.log("name: "+data.filename);
     res.setHeader("Content-Disposition", "attachment;filename=" + encodeURI(data.filename));
     res.setHeader("Content-Type","binary/octet-stream");
     // buffer에 있는 데이터로 응답합니다.
     res.end(data.file);
     console.log(data.file+"Download Success!!");
    //  fs.readFile("data.file.html",function(error,data){
    //    res.writeHead(200,{"Content-Type": "text/html"});
    //    res.end(data);
    // });
  });
});

 app.listen(3000, function(){
  console.log("Server On!");
});
