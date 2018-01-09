function hideImage() {
  document.getElementById("flowerImage").style = "visibility:hidden";
  setTimeout(function(){
    document.getElementById("flowerImage").style = "visibility:visible";
  },1000);
};
