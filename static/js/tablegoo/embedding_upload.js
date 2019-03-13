function read_embedding_file(){
    var file_name=$("input[name=embedding_csvfile]").val();
    if (file_name.lastIndexOf(".")!=-1){
var fileType = (file_name.substring(file_name.lastIndexOf(".")+1,file_name.length)).toLowerCase();
if(fileType=='csv')
{
    var fd=new FormData();

                fd.append("file",document.getElementById('embedding_csvfile').files[0]);//这是获取上传的文件
                    fd.append('label','csv');

                    var xhr=new XMLHttpRequest();
                    xhr.open("POST","/User_code");//要传到后台方法的路径
                    xhr.addEventListener("load",uploadComplete,false);
                xhr.send(fd)
}
if(fileType=='py')
{
var fd=new FormData();

fd.append("file",document.getElementById('embedding_csvfile').files[0]);//这是获取上传的文件
fd.append('label','py');
    var xhr=new XMLHttpRequest();
    xhr.open("POST","/User_code");//要传到后台方法的路径
    xhr.addEventListener("load",uploadComplete,false);
xhr.send(fd)
    };
if(fileType=='so')
{
var fd=new FormData();

fd.append("file",document.getElementById('embedding_csvfile').files[0]);//这是获取上传的文件
fd.append('label','so');
    var xhr=new XMLHttpRequest();
    xhr.open("POST","/User_code");//要传到后台方法的路径
    xhr.addEventListener("load",uploadComplete,false);
xhr.send(fd)
    };
if(fileType=='jar')
{
var fd=new FormData();

fd.append("file",document.getElementById('embedding_csvfile').files[0]);//这是获取上传的文件
fd.append('label','jar');
    var xhr=new XMLHttpRequest();
    xhr.open("POST","/User_code");//要传到后台方法的路径
    xhr.addEventListener("load",uploadComplete,false);
xhr.send(fd)
    };
if(fileType=='zip')
{
var fd=new FormData();

fd.append("file",document.getElementById('embedding_csvfile').files[0]);//这是获取上传的文件
    fd.append('label','zip');

    var xhr=new XMLHttpRequest();
    xhr.open("POST","/User_code");//要传到后台方法的路径
    xhr.addEventListener("load",uploadComplete,false);
xhr.send(fd);
};
}
    }



function uploadComplete(evt){//py文件上传成功
alert(evt.target.responseText);
}