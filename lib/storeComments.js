const writeDataInto = function(fileSystem,filePath,contents){
  fileSystem.writeFile(filePath,contents,(err)=>{});
  return ;
}

const getContents = function(commentInfo,data){
  let comments = data && JSON.parse(data) || [];
  comments.unshift(commentInfo);
  return JSON.stringify(comments,null,2);
}

const addComment = function(commentInfo,fs){
  fs.readFile('./data/comment.json','utf8',(err,data)=>{
    let contents = getContents(commentInfo,data);
    writeDataInto(fs,'./data/comment.json',contents);
    let commentsData = `var commentsData = ${contents}`;
    writeDataInto(fs,'./public/js/data.js',commentsData);
  })
}

exports.addComment = addComment;
