<!--比较外围的一些点击事件-->
function UI() {
    this.fullscreen = false;
    this.showabout = false;
    this.darkMode = false;
    this.selectcate = false;
    myThis = this;
    this.loading = 0;

    /*全屏事件处理*/
    //按键处理
    $(document).keyup(function (e) {
        switch (e.which) {
            case 37:
                break;
            case 27://press Esc then fullscreen=false
                THREEx.FullScreen.cancel();
                $("#fullscreen").html('<a href="#">全屏模式</a>');
                myThis.fullscreen = false;
                break;
            default:
                return;
        }
    });
    //在全屏的模式发生改变时触发
    $(window).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function (e) {
        var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
        if (!state) {
            $("#fullscreen").html('<a href="#">全屏模式</a>');
            myThis.fullscreen = false;
            THREEx.FullScreen.cancel();
        }
    });

    //点击全屏时触发
    $("#fullscreen").click(function () {
        if (!myThis.fullscreen) {
            THREEx.FullScreen.request(document.body);
            $("#fullscreen").html('<a href="#">窗口模式</a>');
            myThis.fullscreen = true;
        } else {
            THREEx.FullScreen.cancel();
            $("#fullscreen").html('<a href="#">全屏模式</a>');
            myThis.fullscreen = false;
        }
    });

    //展示/隐藏about
    $("#showAbout").click(function () {
        myThis.showabout = !myThis.showabout;
        if (myThis.showabout) {
            $("#aboutText").show();
            $("#aboutText").animate({'right': '0'}, 400, "swing", function () {

            });
        } else {
            $("#aboutText").animate({'right': -window.innerWidth * 0.4 + 'px'}, 200, "swing", function () {
                $("#aboutText").hide();
            });
        }
    });
    $("#closeAbout").click(function () {
        myThis.showabout = false;
        $("#aboutText").animate({'right': -window.innerWidth * 0.4 + 'px'}, 200, "swing", function () {
            $("#aboutText").hide();
        });
    });


    //展示/隐藏目录筛选
    $("#selectcate").click(function () {
        myThis.selectcate = !myThis.selectcate;
        if (myThis.selectcate) {
            $("#categories").show();
            $("#categories").animate({'left': '20px'}, 400, "swing", function () {
            });
        } else {
            $("#categories").animate({'left': '-100px'}, 200, "swing", function () {
                $("#categories").hide();
            });
        }
    });


    //改变整体色调
    $("#backgroundButton").click(function () {
        myThis.darkMode = !myThis.darkMode;
        // console.log(myThis.darkMode);
        if (!myThis.darkMode) {
            scene.fog = new THREE.FogExp2(0x000000, 0.001);
            renderer.setClearColor(0x080808);
            $('body').css('background-color', 'black');
            $("a:link,a:visited,a:hover").css('color', '#E0E0E0');
            $("#countries").css({
                'background-color': 'rgba(0,0,0,0.6)',
                'color': 'white'
            });
            $(".chosenCountry").css('background-color', 'rgba(0,0,0,0.6)');
            $(".chosenButton").css('color', 'white');
            $(".title,.titleup,.titleTop,.titleTop2").css('color', '#FFFFFF');
            $(".subtitle，.subtitle2").css('color', '#DDD');
            $("#pointer,#upperBar,#bottomBar").css('background-color', 'rgba(0,0,0,0.6)');
            $("#watchsvg").css('fill', 'white');
            $("#annotation").css({
                'color': 'white',
                'background-color': 'rgba(0,0,0,0.8)'
            });
            $("#description,#choice,#beginExplore,#beginStory").css('color', 'white');
            $("#storyline,#fullscreen,#backhome,#showAbout,#showLabels,#contrastbutton,#backgroundButton,#selectcate,#selectcate_1").css({
                'color': 'white',
                'border-top': '1px solid #121314',
                'border-bottom': '1px solid #121314'
            });
            $("#aboutText").css({
                'background': 'rgba(0,0,0,0.8)',
                'color': 'white'
            });

            $("#storyline:hover,#fullscreen:hover,#backhome:hover,#showAbout:hover,#showLabels:hover,#contrastbutton:hover,#backgroundButton:hover,#selectcate:hover,#selectcate_1:hover").css('border-right', '2px solid #FFF')
            $('.selectedMode').css('border', '1px solid white');
            $('#storyPrompt').css('background-color', 'rgba(0,0,0,0.4)');
            $('#productlabel').css({
                'background-color': 'rgba(0,0,0,0.6)',
                'color': 'white'
            });
            $('.modeSelector').css({
                'border': '1px solid #151515',
                'color': 'white'
            });
            $('.modeSelector:hover').css('border', '1px white solid');
            $('#sideBar').css('background', 'linear-gradient(to right, rgba(0, 0, 0, 1),  rgba(0, 0, 0, 0.4))');
            $('#nextlevel,#annotation,#title,#subtitle,#subtitle2').css('text-shadow', '0 0 0.3em #FFF');
            $('#modeDescription').css('background-color', 'rgba(0,0,0,0.8');
            $('.optionSeparator').css('background', 'linear-gradient(right,black,#606060,black)');
            $('.midSeparator').css('background', 'linear-gradient(bottom,black,#606060,black)');
            $('#loadingBar').css('background-color', 'white');
        } else {
            scene.fog = new THREE.FogExp2(0x0000ff, 0.001);
            renderer.setClearColor(0xe4e4e4);//背景色
            $('body').css('background-color', '#FFFFFF');
            $("a:link,a:visited,a:hover").css('color', '#000');
            $("#countries").css({
                'background-color': 'rgba(255,255,255,0.6)',
                'color': 'black'
            });
            $(".chosenCountry").css('background-color', 'rgba(255,255,255,0.6)');
            $(".chosenButton").css('color', 'black');
            $(".title,.titleup,.titleTop,.titleTop2").css('color', '#000000');
            $(".subtitle2,.subtitle").css('color', '#EEE');
            $("#pointer,#upperBar,#bottomBar").css('background-color', 'rgba(255,255,255,0.6)');
            $("#watchsvg").css('fill', 'black');
            $("#annotation").css({
                'color': 'black',
                'background-color': 'rgba(255,255,255,0.8)'
            });
            $("#description,#choice,#beginExplore,#beginStory").css('color', 'black');
            $("#storyline,#fullscreen,#backhome,#showAbout,#showLabels,#contrastbutton,#backgroundButton").css({
                'color': 'black',
                'border-top': '1px solid #000000',
                'border-bottom': '1px solid #000000'
            });
            $("#aboutText").css({
                'background': 'rgba(255,255,255,0.8)',
                'color': 'black'
            });
            $("#storyline:hover,#fullscreen:hover,#backhome:hover,#showAbout:hover,#showLabels:hover,#contrastbutton:hover,#backgroundButton:hover").css('border-right', '2px solid #000');
            $('.selectedMode').css('border', '1px solid black');
            $('#storyPrompt').css('background-color', 'rgba(255,255,255,0.4)');
            $('#productlabel').css({
                'background-color': 'rgba(255,255,255,0.6)',
                'color': 'black'
            });
            $('.modeSelector').css({
                'border': '1px solid #e4e4e4',
                'color': 'black'
            });
            $('modeSelector:hover').css('border', '1px black solid');
            $('#sideBar').css('background', '#e4e4e4');
            $('#nextlevel,#annotation,#title,#subtitle,#subtitle2').css('text-shadow', '0 0 0.3em #000');
            $('#modeDescription').css('background-color', 'rgba(255,255,255,0.8');
            $('.optionSeparator,.midSeparator').css('background', 'white');
            $('#loadingBar').css('background-color', 'black');

        }
    });

    /*下面是左边的选择展示模式的按钮的添加*/
    ring = true;
    buttons = [];
    divX = 45;
    divY = 60;
    step = 30;
    ring = false;
    buttons.push({
        "id": "gridSphereButton",
        "title": "全球视图",
        "img": "images/master/icon/globemap.png",
        "desc": "通过将国家/地区放置在国家/地区内来显"
    });
    buttons.push({
        "id": "gridButton",
        "title": "世界视图",
        "img": "images/master/icon/planemap.png",
        "desc": "通过将国家/地区放置在国家/地区内来显"
    });
    buttons.push({
        "id": "towersButton",
        "title": "地图堆积",
        "img": "images/master/icon/towermap.png",
        "desc": "堆叠一个国家/地区在地图上导出的每个产品，每行代表25亿美元"
    });
    buttons.push({
        "id": "groupButton",
        "title": "分类产品",
        "img": "images/master/icon/listmap.png",
        "desc": "按照产品类别展示产品分布"
    });
    // buttons.push({
    //     "id": "productButton3",
    //     "title": "3D产品",
    //     "img": "images/master/icon/product3D.png",
    //     "desc": "产品空间的3D版本，通过单击节点来跳转"
    // });
    // buttons.push({
    //     "id": "productButton",
    //     "title": "平面产品",
    //     "img": "images/master/icon/product2D.png",
    //     "desc": "显示其类别中的所有产品，排列在称为产品空间的相似性图表中。"
    // });
    // buttons.push({
    //     "id": "productButton2",
    //     "title": "产品堆积",
    //     "img": "images/master/icon/producttower.png",
    //     "desc": "按类别堆叠产品"
    // });


    newDiv = "<table>";
    for (var i = 0; i < buttons.length; i++) {
        option = buttons[i];
        option.rank = i;
        angle = 0;
        if (i % 2 == 0 && i > 0) {
            newDiv += "</tr><tr>"
        }
        newDiv += "<td>" +
            "<div class='modeSelector' style='-webkit-transform: rotateY(" + angle + "deg);transform: rotateY(" + angle + "deg);'id='" + option.id + "'>" +
            "<img style='height: 50px' src='/static/" + option.img + "'/>" +
            "<div class='optionTitle'>" + option.title + "</div></div></td>";
    }
    newDiv += "</tr></table>";

    $("#visualizations").html(newDiv);
    $("#gridSphereButton").addClass("selectedMode");
    $("#visualizations").on("mouseover", ".modeSelector", function () {
        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i].id === $(this).prop('id')) {
                $("#modeDescription").show();
                $("#modeDescription").html(buttons[i].desc);
                offset = $(this).offset();
                $("#modeDescription").css({'top': offset.top, 'left': '130px'});
            }
        }
    });
    $("#visualizations").on("mouseout", ".modeSelector", function () {
        $("#modeDescription").hide();
    });

}

//增加加载时动画
UI.prototype.addSpinner = function () {
    var opts = {
        lines: 17 // The number of lines to draw
        , length: 0 // The length of each line
        , width: 1 // The line thickness
        , radius: 10 // The radius of the inner circle
        , scale: 3.5 // Scales overall size of the spinner
        , corners: 1 // Corner roundness (0..1)
        , color: '#FFF' // #rgb or #rrggbb or array of colors
        , opacity: 0 // Opacity of the lines
        , rotate: 0 // The rotation offset
        , direction: 1 // 1: clockwise, -1: counterclockwise
        , speed: 1 // Rounds per second
        , trail: 99 // Afterglow percentage
        , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
        , zIndex: 2e9 // The z-index (defaults to 2000000000)
        , className: 'spinner' // The CSS class to assign to the spinner
        , top: '50%' // Top position relative to parent
        , left: '50%' // Left position relative to parent
        , shadow: false // Whether to render a shadow
        , hwaccel: false // Whether to use hardware acceleration
        , position: 'absolute' // Element positioning
    };
    var target = document.getElementById('spinner');
    var spinner = new Spinner(opts).spin(target);

};
//建立最下方的目录
UI.prototype.buildCategories = function (categories) {
    cats = [];
    var catHTML = "<table>";
    $.each(categories, function (i, val) {
        cats[val.id] = val.name;
        color = new THREE.Color(i);
        rgba = "rgba(" + Math.round(color.r * 295) + "," + Math.round(color.g * 295) + "," + Math.round(color.b * 295) + ",0.8)";
        catHTML += "<tr><td class='categoryButton' style='border-left:16px solid " + rgba + " ;'>" +
            "<div id=cat" + val.id + " class='chooseCategory'>" + cats[val.id] + " </div></td></tr>";
    });
    $("#categories").html(catHTML + "</table>");
};
//加载中的时候展示加载速度
UI.prototype.updateLoader = function (add) {
    this.loading += add;
    percentage = this.loading;
    $("#loadingBar").animate({'width': percentage / 100 * 500}, 100);
};

//嵌入产品选择框
UI.prototype.createProductBox = function (products) {
    var html = '<select class="productSelection"><option value="null" selected="selected">选择产品</option>';

    $.each(products, function (i, val) {
        html += "<option value ='" + val.atlasid + "'>" + val.name + "</option>";
    });
    html += "</select>";
    $(".productBox").html(html);
    $(".productSelection").select2({placeholder: "product", allowClear: true});

};

//改变鼠标箭头样式
UI.prototype.changeCursor = function (type, blocked) {
    $('body').removeClass("grab");
    $('body').removeClass("grabbing");
    switch (type) {
        case "grab":
            if (blocked) $('body').css({"cursor": "not-allowed"});
            else $('body').addClass("grab");
            break;
        case "grabbing":
            if (blocked) $('body').css({"cursor": "not-allowed"});
            else $('body').addClass("grabbing");
            break;
        case "default":
        case "pointer":
        default:
            $('body').css({"cursor": type});
            break;
    }

};
//创建国家选择框
UI.prototype.createSelectionBox = function (countries) {
    var html = '<select class="countrySelection"><option value="null" selected="selected">选择国家</option>';

    $.each(countries, function (i, val) {
        html += "<option value ='" + i + "'>" + val.name + "</option>";
    });
    html += "</select>";
    $(".selectionBox").html(html);
    $(".countrySelection").select2({placeholder: "country", allowClear: true});

};