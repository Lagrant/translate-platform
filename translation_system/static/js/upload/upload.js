$.fn.csv2arr = function (callback) {
    if (typeof(FileReader) == 'undefined') {    //if not H5
        alert("Please use Chrome or Firefox");
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
                // console.log("被选中的是：", $("input[name=select]:checked").val());
                if ($('input[name=select]:checked').val() == 'Normal') {
                    //console.log("成功进入normal");
                    $.ajax({
                        url: '/data_workshop',
                        type: 'POST',
                        data: {json_data: JSON.stringify(res)},
                        success: function (data) {
                            if(data){
                                alert('Your file was uploaded sucessfully!');
                                window.location.href = '/data_workshop';
                            }
                            else{
                                alert('There is somthing wrong with your data!');
                                window.location.href = '/clean_data';
                            }
                        }
                    });
                }
                else if ($('input[name=select]:checked').val() == 'Geographical') {
                    //console.log("成功进入geo");
                    $.ajax({
                        url: '/geo/admin/upload/',
                        type: 'POST',
                        data: {json_data: JSON.stringify(res)},
                        dataType: 'html',
                        success: function (res) {
                            if (res == "true") {
                                alert('success !');
                                window.location.href = '/geo/admin/';
                            } else {
                                alert('Unknown error.');
                            }
                        },
                        error: function () {
                            alert('Internet error');
                        }
                    });
                }
                else if ($('input[name=select]:checked').val() == 'Text') {
                    //console.log("成功进入text");
                    $.ajax({
                        url: '/textgoo',
                        type: 'POST',
                        data: {json_data: JSON.stringify(res)},
                        success: function (res) {
                            if (res) {
                                alert('success !');
                                window.location.href = '/text_home';
                            }
                            else {
                                alert('Unknown error.');
                            }
                        },
                        error: function () {
                            alert('Internet error');
                        }
                    });
                }
                else if($('input[name=select]:checked').val() == 'Graph'){
                    $.ajax({
                        url: '/graphgoo',
                        type: 'POST',
                        data: {json_data: JSON.stringify(res)},
                        success: function (data) {
                            window.location.href = '/graphgoo'
                        }
                    });
                }
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
            encoding = "ANSI";
        }
        return encoding;
    }
};
function read_file() {
        var file_name=$("input[name=csvfile]").val();
    if (file_name.lastIndexOf(".")!=-1){
var fileType = (file_name.substring(file_name.lastIndexOf(".")+1,file_name.length)).toLowerCase();
if(fileType=='csv')
{
        $("input[name=csvfile]").csv2arr(function (res) {
        });
    }
    if((fileType=='jpg')||(fileType=='jpeg')||(fileType=='png')||(fileType=='pdf'))
    {
        var fd=new FormData();

fd.append("file",document.getElementsByName('csvfile')[0].files[0]);//这是获取上传的文件

    var xhr=new XMLHttpRequest();
    xhr.open("POST","/OCR");//要传到后台方法的路径
    xhr.addEventListener("load",uploadComplete,false);
xhr.send(fd);
    }
    }
    }

    function uploadComplete(evt){//py文件上传成功
alert(evt.target.responseText);
}