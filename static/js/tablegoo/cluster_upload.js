    $.fn.cluster_csv2arr = function (callback) {
        if (typeof(FileReader) == 'undefined') {    //if not H5
            alert("Your browser is too old,please use Chrome or Firefox");
            return false;
        }
        if (!$(this)[0].files[0]) {
            alert("Please select a file");
            return false;
        }
        var fReader = new FileReader();
        fReader.readAsDataURL($(this)[0].files[0]);
        $fileDOM = $(this);
        fReader.onload = function (evt) {
            var data = evt.target.result;
            var encoding = checkEncoding(data);
            Papa.parse($($fileDOM)[0].files[0], {
                encoding: encoding,
                complete: function (results) {
                    var res = results.data;
                    $.ajax({
                        url: '/data_workshop',
                        type: 'POST',
                        data: {json_data: JSON.stringify(res)},
                        dataType: 'html',
                        success:function(){
                            alert('upload the data file successfully !');
                            window.location.href = '/cluster'
                            //a = document.createElement('a');
                            //a.href = '/cluster';
                            //a.click();
                        }

                    });
                    if (res[res.length - 1] == "") {
                        res.pop();
                    }
                    callback && callback(res);
                }
            });
        };
        fReader.onerror = function (evt) {
            alert("The file has changed,please select again.(Firefox)");
        };

        function checkEncoding(base64Str) {
            var str = atob(base64Str.split(";base64,")[1]);
            var encoding = jschardet.detect(str);
            encoding = encoding.encoding;
            console.log(encoding);
            if (encoding == "windows-1252") {
                encoding.detecting = "ANSI";
            }
            return encoding;
        }
    };
$.fn.cluster_csv = function (callback) {
    alert("hello!")
}
function read_cluster_file(){
    var file_name=$("input[name=cluster_csvfile]").val();
    if (file_name.lastIndexOf(".")!=-1){
var fileType = (file_name.substring(file_name.lastIndexOf(".")+1,file_name.length)).toLowerCase();
if(fileType=='csv')
                {
                var fd=new FormData();

                fd.append("file",document.getElementById('cluster_csvfile').files[0]);//这是获取上传的文件
                    fd.append('label','csv');

                    var xhr=new XMLHttpRequest();
                    xhr.open("POST","/save_cluster_file");//要传到后台方法的路径
                    xhr.addEventListener("load",uploadComplete,false);
                xhr.send(fd)
                    }
if(fileType=='py')
{
var fd=new FormData();

fd.append("file",document.getElementById('cluster_csvfile').files[0]);//这是获取上传的文件
    fd.append('label','py');

    var xhr=new XMLHttpRequest();
    xhr.open("POST","/save_cluster_file");//要传到后台方法的路径
    xhr.addEventListener("load",uploadComplete,false);
xhr.send(fd)
    };

if(fileType=='zip')
{
var fd=new FormData();

fd.append("file",document.getElementById('cluster_csvfile').files[0]);//这是获取上传的文件
    fd.append('label','zip');

    var xhr=new XMLHttpRequest();
    xhr.open("POST","/save_cluster_file");//要传到后台方法的路径
    xhr.addEventListener("load",uploadComplete,false);
xhr.send(fd);
}
if(fileType=='jar')//执行java程序
{
var fd=new FormData();

fd.append("file",document.getElementById('cluster_csvfile').files[0]);//这是获取上传的文件
    fd.append('label','jar');

    var xhr=new XMLHttpRequest();
    xhr.open("POST","/save_cluster_file");//要传到后台方法的路径
    xhr.addEventListener("load",uploadComplete,false);
xhr.send(fd);
}
if(fileType=='so')//执行c或者C++程序
{
var fd=new FormData();

fd.append("file",document.getElementById('cluster_csvfile').files[0]);//这是获取上传的文件
    fd.append('label','so');

    var xhr=new XMLHttpRequest();
    xhr.open("POST","/save_cluster_file");//要传到后台方法的路径
    xhr.addEventListener("load",uploadComplete,false);
xhr.send(fd);
}
}
    }



function uploadComplete(evt){//py文件上传成功
alert(evt.target.responseText);
}


function save_user_way(){
    var name=document.getElementsByName('user_cluster_name');
    var role=document.getElementsByName('role');
    var fd=new FormData();
    fd.append("name",name);
    fd.append('role',role);

    var xhr=new XMLHttpRequest();
    xhr.open("POST","/cluster/save_user_way");//要传到后台方法的路径
    xhr.addEventListener("load",uploadComplete,false);
xhr.send(fd);
}