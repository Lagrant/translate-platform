function newProject() {
    var btn = document.getElementById("newTask");
    btn.style.display = 'block';
}

function closeWindow() {
//    var btn = $(ob).parent().parent().parent();
    var btns = document.getElementsByClassName("task");
    for (var i = 0; i < btns.length; i++) {
        btns[i].style.display = 'none';
    }
    
}

window.onclick = function (event) {
    var btns = document.getElementsByClassName("task");
    for (var i = 0; i < btns.length; i++) {
        if (event.target == btns[i]) {
            btns[i].style.display = "none";
        }
    }
    
}

function beginSeg() {
    var btn = document.getElementById("segment-file");
    btn.style.display = 'block';
}

function get_foreign_book(){
    
}

function uploadComplete(evt){//pdf文件上传成功
    alert(evt.target.responseText);
}

function newTaskSettings(ob) {
    var settingList = {};
    
    var btn = document.getElementById(ob.id);
    var divbtn = $(btn).parent();
    var settingListElements = $(divbtn).siblings();
    
    var projName = settingListElements[0].children[0];
    /*if ($(projName).val() === "") {
        alert("Project name must not be empty");
        return;
    }*/
    settingList["name"] = $(projName).val();
    
    var foreignBook = settingListElements[1].children[1].children[0];
    /*if ($(foreignBook).val() === "") {
        alert("File must not be empty");
        return;
    }*/
//    settingList["foreignBook"] = $(foreignBook).val();
    
    var group = settingListElements[2].children[0];
    /*if (group.options[group.selectedIndex].value) === "--none--") {
        alert("Group must not be empty");
        return;
    }*/
    settingList["group"] = group.options[group.selectedIndex].value;
    
    var ddl = settingListElements[3].children[0];
    /*if ($(ddl).val() === "") {
        alert("Deadline must not be empty");
        return;
    }*/
    settingList["ddl"] = $(ddl).val();
    
    console.log(settingList);
    $.ajax({
        type: "POST",
        url: "/set_setting_list",
        data: JSON.stringify(settingList),
        error: function () {
            alert("fail to create new task");
            return;
        }
    });
    
    var file_name=$("input[name=foreign-book]").val();
    var fileType, nameOnly;
    console.log(file_name);
    if (file_name.lastIndexOf(".")!=-1){
        fileType = (file_name.substring(file_name.lastIndexOf(".")+1,file_name.length)).toLowerCase();
        nameOnly = file_name.substring(0,file_name.lastIndexOf("."));
        nameOnly = nameOnly.split("\\").slice(-1);
        nameOnly = nameOnly[0].replace(/(\s*$)/g,"");
        if(fileType=='pdf')
        {
            var fd=new FormData();

            fd.append("file",document.getElementById('foreign-book').files[0]);//这是获取上传的文件
            fd.append('label','pdf');

            var xhr=new XMLHttpRequest();
            xhr.open("POST","/upload_file/" + nameOnly);//要传到后台方法的路径
            xhr.addEventListener("load",uploadComplete,false);
            xhr.send(fd)
        }
        
    }
    
    var viewTranslation = document.getElementById("view-translation");
    viewTranslation.setAttribute("href", "/translation/" + nameOnly + "+translation_" + nameOnly + "." + fileType);
    
    drawAssign();
    
    closeWindow();
}

//            $.ajax({
//                type: "POST",
//                url: url,
//                data: JSON.stringify(parameters),//还需要加一个draw_id用于表示要画在哪个div上面。
//                contentType: 'application/json; charset=UTF-8',
//                //dataType:"html",
//                success: function (res) {//返回数据根据结果进行相应的处理
//                    if (res.hasOwnProperty('prompt')) {
//                        alert(res.prompt);
//                        draw_counts.push(draw_count);
//                    } else {
//                        create_draw_element('draw_bar', draw_count, cluster_way_inf);//首先创建一个div用来画图
//                        var count = "#draw_" + draw_count.toString();
//                        $(count).html(res);
//                        ddd(draw_count);
//                    }
//                },
//                error: function () {
//                    alert("获取数据失败！");
//                    draw_counts.push(draw_count);
//                }
//            });

var lastRange = undefined;
function selectRangeMode(ob) {
    if (lastRange === undefined) {
        ob.style.boxShadow = "inset 0 1px 5px #c4c5c7";
        lastRange = ob;
        return;
    } else if (lastRange === ob) {
        return;
    } else {
        lastRange.style.boxShadow = "";
        ob.style.boxShadow = "inset 0 1px 5px #c4c5c7";
        lastRange = ob;
        return;
    }
    
}

function deleteRange(ob) {
    var bd = ob.parentNode.parentNode;
    bd.parentNode.removeChild(bd);
}