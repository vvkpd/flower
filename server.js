let fs = require('fs');
const http = require('http');
const WebApp = require('./lib/webapp.js');
const qs = require('querystring');
const addComment = require('./lib/storeComments.js').addComment;
const getContentType = require('./lib/contentType.js').getContentType;
const registered_users = require('./lib/registerUser.js').registered_users;

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

const servePage = function(fileSystem,filePath,res){
  res.setHeader('Content-Type',`${getContentType(filePath)}`);
  res.write(fileSystem.readFileSync(filePath));
  res.end();
}

let servePages = function(req,res){
  if (get(req,'/')) {
    res.redirect('/index.html');
    return;
  }
  let filePath = './public'+req.url;
  if (fs.existsSync(filePath)) {
    servePage(fs,filePath,res);
  } else {
    handleFileNotFound(res);
  }
  return ;
}

const addCommentHandler = function(req,res){
  if (post(req,'/Submit')) storeResponseAndRedirectTo(res,req.body,'/guestBook.html');
}

const handleFileNotFound = function(res){
  res.writeHead(404, 'Not Found', {'Content-Type':'text/plain'});
  res.write('File Not Found');
  res.end();
}

const get = function(req,url) {
  return req.method == "GET" && req.url == url;
}

const post = function(req,url) {
  return req.method == "POST" && req.url == url;
}

const getCommentInfo = function(commentInfo){
  commentInfo['date'] = new Date().toLocaleString();
  return commentInfo;
}


const storeResponseAndRedirectTo = function(res,content,redirectPath) {
  let commentInfo = getCommentInfo(content);
  addComment(commentInfo,fs);
  res.redirect(redirectPath);
}

const handleGuestBookPage = function(req,res){
  if (!req.user){
    res.redirect('guest.html');
    return ;
  }
}

const handleLoginPage = function(req,res){
  let user = registered_users.find(u=>u.Name==req.body.Name);
  if(!user) {
    res.setHeader('Set-Cookie',`logInFailed=true`);
    res.redirect('/login.html');
    return;
  }
  let sessionid = new Date().getTime();
  res.setHeader('Set-Cookie',`sessionid=${sessionid}`);
  user.sessionid = sessionid;
  res.redirect('/guestBook.html');
  res.end();
}

const handleLogout = function(req,res) {
  res.setHeader('Set-Cookie',[`loginFailed=false,Expires=${new Date(1).toUTCString()}`,`sessionid=0,Expires=${new Date(1).toUTCString()}`]);
  delete req.user.sessionid;
  res.redirect('/login.html');
}

let app = WebApp.create();
app.use(loadUser);
app.post('/Submit',addCommentHandler);
app.get('default',servePages);
app.get('/guestBook.html',handleGuestBookPage);
app.post('/login',handleLoginPage);
app.get('/logout',handleLogout);
app.postProcess(servePages);

const PORT = 8000;
let server = http.createServer(app);
server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
