const Comment = function(nameAndComment){
  this.name = nameAndComment.Name;
  this.comment = nameAndComment.Comment;
  this.date = new Date().toLocaleString();
}

Comment.prototype.getName = function(){
  return this.name;
}

Comment.prototype.getComment = function(){
  return this.comment;
}

Comment.prototype.getDate = function(){
  return this.date;
}

Comment.prototype.stringify = function(){
  return JSON.stringify(this);
}

module.exports = Comment;
