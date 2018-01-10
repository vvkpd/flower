const http = require('http');
const WebApp = require('./lib/webapp.js');
const lib = require('./lib/serverLib.js').lib;
const PORT = 8000;

let app = WebApp.create();

app.use(lib.loadUser);
app.get('/guestBook.html',lib.handleGuestBookPage);
app.get('default',lib.servePages);
app.post('/Submit',lib.addCommentHandler);
app.post('/login',lib.handleLoginPage);
app.get('/logout',lib.handleLogout);
app.postProcess(lib.servePages);

let server = http.createServer(app);
server.on('error',e=>console.error('**error**',e.message));
server.listen(PORT,(e)=>console.log(`server listening at ${PORT}`));
