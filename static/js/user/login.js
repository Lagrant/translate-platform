//选项卡的选择：
//登录
$('#switch_qlogin').click(function () {
    $('#switch_login').removeClass("switch_btn_focus").addClass('switch_btn');
    $('#switch_qlogin').removeClass("switch_btn").addClass('switch_btn_focus');
    $('.switch_bottom').css('left', '0');
    $('#qlogin').css('display', 'none');
    $('#web_qr_login').css('display', 'block');
});

// 注册
$('#switch_login').click(function () {
    $('#switch_login').removeClass("switch_btn").addClass('switch_btn_focus');
    $('#switch_qlogin').removeClass("switch_btn_focus").addClass('switch_btn');
    $('.switch_bottom').css('left', '154px');
    $('#qlogin').css('display', 'block');
    $('#web_qr_login').css('display', 'none');
});

//忘记密码，请求验证码
$('#get_code').click(function () {
    if ($('#code_email').val() == "") {
        $('#userCue_code').html("Please enter the email");
        return false;
    }
    $('#get_code').attr('disabled', true);
    count = 60;
    time2 = setInterval(function () {
        if (count == 0) {
            clearInterval(time2);
            $('#get_code').removeAttr('disabled');
            $('#get_code').attr('value', "get code");
            count = 60;
        } else {
            $('#get_code').attr('value', count + "s later");
            count--;
            $('#get_code').attr('disabled', true);
        }
    }, 1000);
    parameters = {'email': $('#code_email').val()};
    $.ajax({
        type: "POST",
        url: '/login/verify/',
        data: JSON.stringify(parameters),
        contentType: 'application/json; charset=UTF-8',
        dataType: "text",
        success: function (res) {//返回数据根据结果进行相应的处理
            if (res === "fail to send the mail") {
                $('#userCue_code').html("fail to send the mail");
                clearInterval(time2);
                $('#get_code').removeAttr('disabled');
                $('#get_code').attr('value', "get code");
                count = 60;
            }
        },
        error: function () {
            alert("获取数据失败！");
        }
    });
});


//验证验证码
$('#passwd_code').click(function () {
    if ($('#code_email').val() == "") {
        $('#code_email').focus();
        $('#userCue_code').html("Email should not be empty!");
        return false;
    } else if ($('#write_code').val() == "") {
        $('#write_code').focus();
        $('#userCue_code').html("Verification code should not be empty!");
        return false;
    }

    var semail = /^(\w|.)+@(\d|.|[a-z]|[A-Z])+$/g;
    if (!semail.test($('#code_email').val()) || $('#code_email').val().length < 5 || $('#code_email').val().length > 30) {
        $('#code_email').focus();
        $('#userCue_code').html("Please enter a valid email.");
        return false;
    }

    if ($('#write_code').val().length != 4) {
        $('#write_code').focus();
        $('#userCue_code').html("Verification code error");
        return false;
    }
    var data = {
        "email": $('#code_email').val(),
        "verify": $('#write_code').val()
    };
    $.ajax({
        type: "POST",
        url: '/forget/verify/',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=UTF-8',
        dataType: "text",
        success: function (res) {//返回数据根据结果进行相应的处理
            if (res == "success") {
                $('#switch_code').removeClass("switch_btn_focus").addClass('switch_btn');
                $('#switch_pass').removeClass("switch_btn").addClass('switch_btn_focus');
                $('.switch_bottom').css('left', '154px');
                $('#web_code').css('display', 'none');
                $('#web_pass').css('display', 'block');
            }
            else {
                $('#userCue_code').html("Please enter the right username and verification code!");
            }
        },
        error: function () {
            alert("获取数据失败！");
        }
    });
});

// 修改密码
$('#passwd_submit').click(function () {
    if ($('#passwdnew').val().length < 6 || $('#passwdnew').val().length > 16) {
        $('#passwdnew').focus();
        $('#userCue_pass').html("The password must between 6-16");
        return false;
    }
    if ($('#passwdnew').val() != $('#passwdnew2').val()) {
        $('#userCue_pass').html('The two entries are inconsistent.')
    } else {
        var data = {
            "email": $('#code_email').val(),
            "password": $('#passwdnew').val()
        };
        $.ajax({
            type: "POST",
            url: '/forget/change/',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=UTF-8',
            dataType: "text",
            success: function (res) {//返回数据根据结果进行相应的处理
                if (res == "success") {
                    $('#logsign').css('display', 'block');
                    $('#forgoten').css('display', 'none');
                    $('#userCue1').html("Success changed!")
                }
                else {
                    $('#userCue_pass').html("Fail to edit");
                }
            },
            error: function () {
                alert("获取数据失败！");
            }
        });
    }
});


//这个模块的功能就是把登录和注册的前端检查都做好，并且防止坏数据传到后台，引起数据库注入，危害系统
/* 如果注册按钮被点击，检查注册信息是否填写正确,如果正确那么将前台的数据
* 传递给后台进行处理*/
function click_reg(){
     //空值检测
    if ($('#email').val() == "") {
        $('#email').focus();
        $('#userCue').html("Email should not be empty!");
        return false;
    } else if ($('#user').val() == "") {
        $('#user').focus();
        $('#userCue').html("Username should not be empty!");
        return false;
    } else if ($('#passwd').val() == "") {
        $('#passwd').focus();
        $('#userCue').html("Password should not be empty!");
        return false;
    }
    /*检查email是否符合要求
    * 总长度不少于5或超过30
    * 必须包含@，且前后都只能前面只能由\w组成，后面则是\w或.
    * */
    var semail = /^(\w|.)+@(\d|.|[a-z]|[A-Z])+$/g;
    if (!semail.test($('#email').val()) || $('#email').val().length < 5 || $('#email').val().length > 30) {
        $('#email').focus();
        $('#userCue').html("Please enter a valid email.");
        return false;
    }
    /*检查username是否符合要求
    * 长度要求是4-12
    * 字符要求是由区分大小写的英文字符、数字和下划线组成
    * */
    var suser = /^\w{4,12}$/g;
    if (!suser.test($('#user').val())) {
        $('#user').focus();
        $('#userCue').html("Please enter a user name with valid format.");
        return false;
    }
    /*检查password是否符合要求
    * password由于在传输过程中会加密
    * 因此不需要考虑太多注入的问题
    * */
    if ($('#passwd').val().length < 6 || $('#passwd').val().length > 16) {
        $('#passwd').focus();
        $('#userCue').html("The password must between 6-16");
        return false;
    }

    var data = {
        "email": $('#email').val(),
        "verify": $('#verify').val(),
        "username": $('#user').val(),
        "password": $('#passwd').val(),
        "tp": $('#t').val()
    };
    $('#reg').attr('value', 'creating account...');
    $('#reg').attr('disabled', true);
    $.ajax({
        type: "POST",
        url: '/login/signup/',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=UTF-8',
        dataType: "html",
        success: function (res) {//返回数据根据结果进行相应的处理
            $('#reg').attr('value', 'create an account');
            $('#reg').removeAttr('disabled');
            $('#confirm').removeAttr('disabled');
            $('#confirm').attr('value', "get code");
            count = 60;
            if (res == "email already exist") {
                $('#userCue').html("The account exists already, please log in directly");
                $('#reg').attr('value', 'create an account');
                $('#reg').removeAttr('disabled');
            }
            else if (res == 'success') {
                $('#switch_login').removeClass("switch_btn_focus").addClass('switch_btn');
                $('#switch_qlogin').removeClass("switch_btn").addClass('switch_btn_focus');
                $('.switch_bottom').animate({left: '0px', width: '70px'});
                $('#qlogin').css('display', 'none');
                $('#web_qr_login').css('display', 'block');
                $('#userCue1').html("Successfully registered");
                $('#e').value = $('email').val();
                $('#p').value = $('passwd').val();
                $('#userCue').html("");
                console.log("获取数据成功")
            }
            else if (res == 'Verification code error') {
                $('#reg').attr('value', 'create an account');
                $('#reg').removeAttr('disabled');
                $('#userCue').html(res);
            }
            else if(res=="error"){
                $('#reg').attr('value', 'create an account');
                $('#reg').removeAttr('disabled');
                $('#userCue').html("Something was wrong with the path");
            }
        },
        error: function () {
            alert("获取数据失败！");
        }
    });
}
$('#reg').click(click_reg);
$('#verify').keypress(function(e) {
    if(e.which == 13) {
        click_reg();
    }
});
function click_log() {
    if ($('#u').val() == "") {
        $('#u').focus();
        $('#userCue1').html("Email should not be empty!");
        return false;
    } else if ($('#p').val() == "") {
        $('#p').focus();
        $('#userCue1').html("Password should not be empty!");
        return false;
    }

    var semail = /^(\w|.)+@(\d|.|[a-z]|[A-Z])+$/g;
    if (!semail.test($('#e').val()) || $('#e').val().length < 5 || $('#e').val().length > 30) {
        $('#e').focus();
        $('#userCue1').html("Please enter a valid email.");
        return false;
    }

    var data = {
        "email": $('#e').val(),
        "password": $('#p').val()
    };
    $.ajax({
        type: "POST",
        url: '/login/pass/',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=UTF-8',
        dataType: "html",
        success: function (res) {//返回数据根据结果进行相应的处理
            if (res == "account not exist")
                $('#userCue1').html("Please enter the right username and password");
            else if(res=="password not right")
                $('#userCue1').html("Please enter the right password");
            else {
                window.location.href = res;
            }
        },
        error: function () {
            alert("获取数据失败！");
        }
    });
}

$('#log').click(click_log);
$('#p').keypress(function(e) {
    if(e.which == 13) {
        click_log();
    }
});

//注册获取验证码
$('#confirm').click(function () {
    if ($('#email').val() == '') {
        $('#userCue').html("Please enter the email");
        return false;
    }
    $('#confirm').attr('disabled', true);
    count = 60;
    time2 = setInterval(function () {
        if (count == 0) {
            clearInterval(time2);
            $('#confirm').removeAttr('disabled');
            $('#confirm').attr('value', "get code");
            count = 60;
        } else {
            $('#confirm').attr('value', count + "s later");
            count--;
            $('#confirm').attr('disabled', true);
        }
    }, 1000);
    parameters = {'email': $('#email').val()};
    $.ajax({
        type: "POST",
        url: '/login/verify/',
        data: JSON.stringify(parameters),
        contentType: 'application/json; charset=UTF-8',
        dataType: "text",
        success: function (res) {//返回数据根据结果进行相应的处理
            if (res === "fail to send the mail") {
                $('#userCue').html("fail to send the mail");
                clearInterval(time2);
                $('#confirm').removeAttr('disabled');
                $('#confirm').attr('value', "get code");
                count = 60;
            }
        },
        error: function () {
            alert("获取数据失败！");
        }
    });
});

$('#user').change(function () {
    parameters = {'name': $('#user').val()};
    $.ajax({
        type: "POST",
        url: '/login/pass/name/',
        data: JSON.stringify(parameters),//一个draw_id用于表示要画在哪个div上面。
        contentType: 'application/json; charset=UTF-8',
        dataType: "text",
        success: function (res) {//返回数据根据结果进行相应的处理
            if (res === "true") {
                $('#user').focus();
                $('#userCue').html("Please replace a username");
                $('#reg').attr('disabled', true);
            }
            else {
                $('#userCue').html("");
                $('#reg').removeAttr('disabled')
            }
        },
        error: function () {
            alert("获取数据失败！");
        }
    });
});

$('#forgot').click(function () {
    $('#logsign').css('display', 'none');
    $('#forgoten').css('display', 'block');
});
