function newProject() {
    
    $.ajax({
        type: "POST",
        url: "/whether_login",
        success: function (res) {
            if (res === "true") {
                var btn = document.getElementById("newTask");
                btn.style.display = "block";
            } else {
                window.open('/login/','_self');
            }
        },
        error: function () {
            
        }
        
    });
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

function uploadComplete(evt){//pdf文件上传成功
    alert(evt.target.responseText);
}

function newTaskSettings(ob) {
    var settingList = {};
    
    var btn = document.getElementById(ob.id);
    var divbtn = $(btn).parent();
    var settingListElements = $(divbtn).siblings();
    
    var foreignBook = settingListElements[1].children[1].children[0];
    if ($(foreignBook).val() === "") {
        alert("File must not be empty");
        return;
    }
//    settingList["foreignBook"] = $(foreignBook).val();
    
    var ddl = settingListElements[3].children[0];
    if ($(ddl).val() === "") {
        alert("Deadline must not be empty");
        return;
    }
    settingList["ddl"] = $(ddl).val();
    
    var language = settingListElements[2].children[0];
    if (language.options[language.selectedIndex].value === "--none--") {
        alert("Group must not be empty");
        return;
    }
    settingList["language"] = language.options[language.selectedIndex].value;
    
    var projName = settingListElements[0].children[0];
    if ($(projName).val() === "") {
        alert("Project name must not be empty");
        return;
    }
    settingList["name"] = $(projName).val().toString();
    
    console.log(settingList);
    
    var file_name=$("input[name=foreign-book]").val();
    var fileType, nameOnly;
    console.log(file_name);
    
    if (file_name.lastIndexOf(".")!=-1){
        fileType = (file_name.substring(file_name.lastIndexOf(".")+1,file_name.length)).toLowerCase();
        nameOnly = file_name.substring(0,file_name.lastIndexOf("."));
        nameOnly = nameOnly.split("\\").slice(-1);
    //        nameOnly = nameOnly[0].replace(/(\s*$)/g,"");
        nameOnly = nameOnly[0];
        settingList["filename"] = nameOnly + "." + fileType;
        settingList["href"] = "/translation/" + settingList["name"] + "+" + nameOnly + "_translation" + "." + fileType;
    } else {
        alert("invalid file name!");
        return;
    }
    $.ajax({
        type: "POST",
        url: "/set_setting_list",
        data: JSON.stringify(settingList),
        success: function (res) {
            if (res["status"] == 200) {
                if(fileType=='pdf'){
                    var fd=new FormData();

                    fd.append("file",document.getElementById('foreign-book').files[0]);//这是获取上传的文件
                    fd.append("label","pdf");
                    fd.append("projectId", res["projectId"]);

                    var xhr=new XMLHttpRequest();
                    xhr.open("POST","/upload_file/" + nameOnly);//要传到后台方法的路径
                    xhr.addEventListener("load",uploadComplete,false);
                    xhr.send(fd)
                }
            }
        },
        error: function () {
            alert("fail to create new task");
            return;
        }
    });
    
    drawAssign();
    location.reload();
    
    closeWindow();
}




function drawAssignDetails(setting) {
    var item = $('<td rowspan="1" colspan="2">\n\
                <div class="cell">' + setting + '</div>\n\
            </td>');
    return item;
}

function drawAssignItems(result) {
    console.log(result);
    var iconSettings = $('<td rowspan="1" colspan="1">\n\
                <div class="cell">\n\
                    <div name="icon-settings" class="el-table__expand-icon tri-left" onclick="expand(this)"></div>\n\
                </div>\n\
            </td>');

    var items = new Array();
    /*for (item in result) {
        items.push(drawAssignDetails(result[item]));
    }*/
    items.push(drawAssignDetails(result['name']));

    if (result['type'] !== undefined) {
        items.push(drawAssignDetails(result['type']));
    }
    items.push(drawAssignDetails(result['deadline']));
    items.push(drawAssignDetails(result['progress']));
    var titles = $('<tr></tr>');
    titles.append(iconSettings);
    for (var i = 0; i < items.length; i++) {
        titles.append(items[i]);
    }
    var taskBody = $('<tbody></tbody>');
    taskBody.attr('id', result['name']);
    if (result['taskId'] !== undefined) {
        taskBody.attr('name', result['taskId']);
    }
    
    taskBody.append(titles);
    $("#task-content").append(taskBody);
}

function drawAssign() {
    $.ajax({
        type: "POST",
        url: "/get_setting_list",
        success: function (res) {
            if (res == "false") {
                window.open('/login/','_self');
                return;
            }
            if (res == "404 NOT FOUND") {
                alert("fail to find the user");
                return;
            }
            var results = res;
            for (i in results) {
                if (typeof results[i] === "string") {
                    results[i] = JSON.parse(results[i]);
                }
                drawAssignItems(results[i]);
            }
        },
    });
}

function beginSeg(ob) {
    var btn = document.getElementById("segment-file");
    btn.style.display = "block";

    var taskBody = ob.parentNode.parentNode.parentNode.parentNode.parentNode;
    taskBody.appendChild(btn);

    $.ajax({
        type: "POST",
        url: "/get_setting_item/" + taskBody.id,
        success: function (result) {
            result = JSON.parse(result)
            $.ajax({
                type: "POST",
                url: "/page_number/" + result["id"],
                success: function (res) {
                    var formGroups = document.getElementsByClassName("form-group");
                    for (var i = 0; i < formGroups.length; i++) {
                        formGroups[i].setAttribute("min", 1);
                        formGroups[i].setAttribute("max", res);
                    }
                },
                error: function () {
                    alert("fail to get page number");
                }
            });
        },
        error: function () {
            alert("fail to set segmentation range");
        }
    });


}

var lastRange = undefined;
function selectRangeMode(ob) {
    if (lastRange === undefined) {
        ob.style.boxShadow = "inset 0 1px 5px #c4c5c7";
        lastRange = ob;
//                                        return;
    } else if (lastRange === ob) {
        return;
    } else {
        lastRange.style.boxShadow = "";
        ob.style.boxShadow = "inset 0 1px 5px #c4c5c7";
        lastRange = ob;
//                                        return;
    }
    var idString = ob.id;
    idString = idString.split("-")[0];
    if (idString == "customized") {
        document.getElementById("customized").style = "display:block";
        document.getElementById("fixed").style = "display:none";
    } else if (idString == "fixed") {
        document.getElementById("fixed").style = "display:block";
        document.getElementById("customized").style = "display:none";
    }
}

function deleteRange(ob) {
    var rname = ob.parentNode.getAttribute("name");
    var ranges = document.getElementsByName(rname);
    if (ranges.length === 1) {
        return;
    }
    var bd = ob.parentNode.parentNode;
    bd.parentNode.removeChild(bd);
}

function newRange(ob) {
    var cr = ob.parentNode.parentNode;
    var cust = cr.parentNode;
    cust.appendChild(cr.cloneNode(true));
}
