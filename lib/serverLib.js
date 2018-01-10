const fs = require('fs');
const qs = require('querystring');
const addComment = require('./storeComments.js').addComment;
const getContentType = require('./contentType.js').getContentType;
const registered_users = require('./registerUser.js').registered_users;


const loadUser = (req,res)=>{
  let sessionid = req.cookies.sessionid;
  let user = registered_users.find(u=>u.sessionid==sessionid);
  if(sessionid && user){
    req.user = user;
  }
};

const redirectLoggedInUserToHome = (req,res)=>{
  if(req.urlIsOneOf(['/','/login']) && req.user) res.redirect('/home');
}

const redirectLoggedOutUserToLogin = (req,res)=>{
  if(req.urlIsOneOf(['/','/home','/logout']) && !req.user) res.redirect('/login');
}

const servePage = function(fileSystem,filePath,res){
  res.setHeader('Content-Type',`${getContentType(filePath)}`);
  res.write(fileSystem.readFileSync(filePath));
  res.end();
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

const servePages = function(req,res){
  if (get(req,'/')) {
    res.redirect('/index.html');
    return;
  }
  let filePath = './public'+req.url;
  if (fs.existsSync(filePath))
  servePage(fs,filePath,res);
  else
    handleFileNotFound(res);
  return ;
}

const addCommentHandler = function(req,res){
  if (post(req,'/Submit'))
  storeResponseAndRedirectTo(res,req.body,'/guestBook.html');
}

const handleGuestBookPage = function(req,res){
  if (!req.user){
    res.redirect('guest.html');
    return ;
  }
}

const handleIfNotUser = function(res,redirectPath){
  res.setHeader('Set-Cookie',`logInFailed=true`);
  res.redirect(redirectPath);
}

const setSessionAndRedirectTo = function(res,user,redirectPath){
  let sessionid = new Date().getTime();
  res.setHeader('Set-Cookie',`sessionid=${sessionid}`);
  user.sessionid = sessionid;
  res.redirect(redirectPath);
}

const getValidUser = function(registeredUser,user){
  return registeredUser.find((registerUser)=>
    registerUser.Name==user.Name && registerUser.Password==user.Password
  )
}

const handleLoginPage = function(req,res){
  let validUser = getValidUser(registered_users,req.body);
  if(!validUser) {
    handleIfNotUser(res,'login.html');
    return;
  }
  setSessionAndRedirectTo(res,validUser,'guestBook.html');
  res.end();
}

const handleLogout = function(req,res) {
  res.setHeader('Set-Cookie',[`loginFailed=false,Expires=${new Date(1).toUTCString()}`,`sessionid=0,Expires=${new Date(1).toUTCString()}`]);
  delete req.user.sessionid;
  res.redirect('/login.html');
}

exports.lib={
  loadUser:loadUser,
  servePages:servePages,
  addCommentHandler:addCommentHandler,
  handleGuestBookPage:handleGuestBookPage,
  handleLoginPage:handleLoginPage,
  handleLogout:handleLogout
}
