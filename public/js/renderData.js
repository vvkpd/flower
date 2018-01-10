const getTDFormat = function(str){
  return `<td>${str}</td>`;
}

const getTRFormat = function(str){
  return `<tr>${str}</tr>`;
}

const getCommentToHTML = function(comment){
  let comments = getTDFormat(comment.date)+getTDFormat(comment.Name)+getTDFormat(comment.Comment);
  return getTRFormat(comments);
}

const getAllComments = function(comments){
  return comments.map(function(comment){
    return getCommentToHTML(comment);
  }).join('');
}


const getComments = function(){
  document.getElementById("commentTable").innerHTML = getAllComments(commentsData);
}
window.onload = getComments;
