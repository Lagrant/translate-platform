$('.intro_table').mouseenter(function () {
    if ($(this).find(".title")) {
        $(this).find('.title').css('height', '60px');
        $(this).css('margin-top', '-15px');
        $(this).find('table').css('transition', '0.5s');
        $(this).find('.title').css('transition', '0.5s');
    }
});
$('.intro_table').mouseleave(function () {
    if ($(this).find(".title")) {
        $(this).find('.title').css('height', '45px');
        $(this).css('margin-top', '0');
        $(this).find('table').css('transition', '0.5s');
        $(this).find('.title').css('transition', '0.5s');
    }
});
//当输入出现变化的时候进行检查，只要有不合格的就不允许提交
$('.mdui-textfield-input').change(function () {
    $div = $('#homepage').children('div');
    var hasclass = false;
    $div.each(function () {
        if ($(this).hasClass('mdui-textfield-invalid-html5')) {
            $('#change').attr('disabled', true);
            hasclass = true;
        }
    });
    if (!hasclass) {
        $('#change').removeAttr('disabled');
    }
});
// 点击save change，
$('#change').click(function () {
    var formData = new FormData();
    formData.append('email', $('#change_email').val());
    formData.append('username', $('#change_username').val());
    formData.append('gender', $("input[name='group1']:checked").val());
    formData.append('password', $('#change_password').val());
    formData.append('signature', $('#change_signature').val());
    $.ajax({
        type: "POST",
        url: "/user/change/",
        data: formData,
        processData: false,
        contentType: false,
        success(res) {
            if (res == "success") {
                alert('Successfully changed!');
                window.location.href = '/user/';
            }
            else if (res == "False") {
                alert(res);
            }
        }, error() {
            alert("Internet error");
        }
    });

});

$('#change_username').change(function () {
    if ($('#username_default').val() != $("#change_username").val()) {
        parameters = {'name': $('#change_username').val()};
        $.ajax({
            type: "POST",
            url: '/login/pass/name/',
            data: JSON.stringify(parameters),//一个draw_id用于表示要画在哪个div上面。
            contentType: 'application/json; charset=UTF-8',
            dataType: "text",
            success: function (res) {//返回数据根据结果进行相应的处理
                if (res === "true") {
                    $('#change_username').focus();
                    $('#change_username_helper').html("Please replace a username");
                    $('#change_username_title').addClass('mdui-textfield-invalid-html5');
                    $('#change').attr('disabled', true);
                }
                else {
                    $('#change_username_helper').html("Consists of 4-12 letters, numbers, or \"_\"");
                    $('#change').removeAttr('disabled')
                }
            },
            error: function () {
                alert("获取数据失败！");
            }
        });
    }
});


function changePic(file) {
    var formData = new FormData();
    formData.append('file', $('#pic_file')[0].files[0]);
    $.ajax({
        type: "POST",
        url: "/user/change/img/",
        data: formData,
        processData: false,
        contentType: false,
        success(res) {
            if (res == "success") {
                alert('Picture successfully changed!');
            }
            else if (res == "filename invalid or network error") {
                alert(res);
            }
        }, error() {
            alert("Internet error");
        }
    });
    var prevDiv = document.getElementById('pic_img');
    if (file.files && file.files[0]) {
        var reader = new FileReader();
        reader.onload = function (evt) {
            $('#pic_img').attr('src', evt.target.result);
        };
        reader.readAsDataURL(file.files[0]);
    } else {
        prevDiv.innerHTML = '<div class="img" style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src=\'' + file.value + '\'"></div>';
    }
}
