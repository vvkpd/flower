const http = require('http');
const WebApp = require('./lib/webapp.js');
const lib = require('./lib/serverLib.js');
const PORT = 8000;

let app = WebApp.create();

app.use(lib.loadUser);
app.get('/guestbook.html',lib.handleGuestBookPage);
app.get('/',(req,res)=>{
  req.url = '/index.html';
  lib.serveStaticPage(req,res);
});

app.post('/addcomment',lib.addCommentHandler);
app.post('/login',lib.LoginPageHandler);
app.get('/logout',lib.LogoutPageHandler);

app.postProcess(lib.serveStaticPage);

let server = http.createServer(app);
server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
