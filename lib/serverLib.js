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
  if(req.urlIsOneOf(['/','/guestbook.html','/logout']) && !req.user) res.redirect('/login.html');
}

const servePage = function(fileSystem,filePath,res){
  res.setHeader('Content-Type',`${getContentType(filePath)}`);
  res.write(fileSystem.readFileSync(filePath));
  res.end();
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

const serveStaticPage = function(req,res){
  let filePath = './public'+req.url;
  if (fs.existsSync(filePath))
    servePage(fs,filePath,res);
}

const addCommentHandler = function(req,res){
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

const LoginPageHandler = function(req,res){
  let validUser = getValidUser(registered_users,req.body);
  if(!validUser) {
    handleIfNotUser(res,'login.html');
    return;
  }
  setSessionAndRedirectTo(res,validUser,'guestBook.html');
  res.end();
}

const LogoutPageHandler = function(req,res) {
  res.setHeader('Set-Cookie',[`loginFailed=false,Expires=${new Date(1).toUTCString()}`,`sessionid=0,Expires=${new Date(1).toUTCString()}`]);
  delete req.user.sessionid;
  res.redirect('/login.html');
}

module.exports={
  loadUser,
  serveStaticPage,
  addCommentHandler,
  handleGuestBookPage,
  LoginPageHandler,
  LogoutPageHandler
}
