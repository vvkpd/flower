let fs = require('fs');
const http = require('http');
const WebApp = require('./webapp');
const qs = require('querystring');
const addComment = require('./storeComments.js').addComment;

let registered_users = [{userName:'bhanutv',name:'Bhanu Teja Verma'},{userName:'harshab',name:'Harsha Vardhana'}];

let loadUser = (req,res)=>{
  let sessionid = req.cookies.sessionid;
  let user = registered_users.find(u=>u.sessionid==sessionid);
  if(sessionid && user){
    req.user = user;
  }
};
let redirectLoggedInUserToHome = (req,res)=>{
  if(req.urlIsOneOf(['/','/login']) && req.user) res.redirect('/home');
}
let redirectLoggedOutUserToLogin = (req,res)=>{
  if(req.urlIsOneOf(['/','/home','/logout']) && !req.user) res.redirect('/login');
}

let servePages = function(req,res){
  if (get(req,'/')) {
    res.redirect('/index.html');
    return;
  }
  let url = req.url;
  servePage(res,url,fs);
}

const addCommentHandler = function(req,res){
  if (post(req,'/Submit')) {
    let content = "";
    req.on('data',(data)=>content+=data.toString());
    req.on('end',function(){
      storeResponseAndRedirectTo(res,content,'/guestBook.html');
    })
    return;
  }
}

const getContentType = function(fileName){
  let fileExtension = getFileExtension(fileName);
  let contentType = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.json': 'application/json',
    '.ico': 'image/x-icon'
  }
  return contentType[fileExtension];
};

const handleFileNotFound = function(){
  this.writeHead(404, 'Not Found', {'Content-Type':'text/plain'});
  this.end();
}

const getFileExtension = function(fileName){
  return fileName.slice(fileName.lastIndexOf('.'));;
};

const servePage = function(res,url,fileSystem){
  let filePath = './public'+url;
  res.setHeader('Content-Type',`${getContentType(filePath)}`);
  res.write(fileSystem.readFileSync(filePath))
  res.end();
  return ;
};

const get = function(req,url) {
  return req.method == "GET" && req.url == url;
}

const post = function(req,url) {
  return req.method == "POST" && req.url == url;
}

const getCommentInfo = function(commentInfo){
  let nameAndComment = qs.parse(commentInfo.toString());
  nameAndComment['date'] = new Date().toLocaleString();
  return nameAndComment;
}


const storeResponseAndRedirectTo = function(res,content,redirectPath) {
  let commentInfo = getCommentInfo(content);
  addComment(commentInfo,fs);
  res.redirect(redirectPath);
}


let app = WebApp.create();
app.use(loadUser);
// app.post('/Submit',addCommentHandler)
app.use(servePages);

const PORT = 5000;
let server = http.createServer(app);
server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
