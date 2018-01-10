const getFileExtension = function(fileName){
  return fileName.slice(fileName.lastIndexOf('.'));;
};

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

exports.getContentType = getContentType;
