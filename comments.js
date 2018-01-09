const Comments = function(){
  this.comments = [];
}

Comments.prototype.addComment = function(commentInfo){
  fs.readFile('./data/comment.json',(err,data)=>{
    this.comments = data;
  });
  console.log(this.comments);
  this.comments.unshift(commentInfo);
  fs.writeFile('./data/comment.json',this.comments, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
}
