function UI() {
    this.fullscreen = false;
    this.showabout = false;
    myThis = this;
    this.loading = 0;
    $(document).keyup(function (e) {
        switch (e.which) {
            case 37:

                break;
            case 27:
                THREEx.FullScreen.cancel();
                $("#fullscreen").html('<a href="#">全屏</a>');
                myThis.fullscreen = false;
                break;
            default:
                return;
        }
    });
    $(window).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', function (e) {
        var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
        if (!state) {
            $("#fullscreen").html('<a href="#">全屏</a>');
            myThis.fullscreen = false;
            THREEx.FullScreen.cancel();
        }
    });


    $("#fullscreen").click(function () {
        if (!myThis.fullscreen) {
            THREEx.FullScreen.request(document.body);
            $("#fullscreen").html('<a href="#">窗口模式</a>');
            myThis.fullscreen = true;
        } else {
            THREEx.FullScreen.cancel();
            $("#fullscreen").html('<a href="#">全屏</a>');
            myThis.fullscreen = false;
        }
    });


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


    ring = true;
    buttons = [];
    divX = 45;
    divY = 60;
    step = 30;
    ring = false;
    //buttons.push({"id":"groupButton","title":"Group by Product","img":"images/icon/productstack.png"});
    buttons.push({
        "id": "gridSphereButton",
        "title": "全球视图",
        "img": "/static/images/master/icon/globemap.png",
        "desc": "通过将国家/地区放置在国家/地区内来显"
    });
    buttons.push({
        "id": "gridButton",
        "title": "世界视图",
        "img": "/static/images/master/icon/planemap.png",
        "desc": "通过将国家/地区放置在国家/地区内来显"
    });
    buttons.push({
        "id": "towersButton",
        "title": "地图堆积",
        "img": "/static/images/master/icon/towermap.png",
        "desc": "堆叠一个国家/地区在地图上导出的每个产品，每行代表25亿美元"
    });
    buttons.push({
        "id": "productButton3",
        "title": "3D产品",
        "img": "/static/images/master/icon/product3D.png",
        "desc": "产品空间的3D版本，通过单击节点来跳转"
    });
    buttons.push({
        "id": "productButton",
        "title": "平面产品",
        "img": "/static/images/master/icon/product2D.png",
        "desc": "显示其类别中的所有产品，排列在称为产品空间的相似性图表中。"
    });
    buttons.push({
        "id": "productButton2",
        "title": "产品堆积",
        "img": "/static/images/master/icon/producttower.png",
        "desc": "按类别堆叠产品"
    });

    newDiv = "<table>";
    for (var i = 0; i < buttons.length; i++) {
        option = buttons[i];
        option.rank = i;
        angle = 0;
        if (i % 2 == 0 && i > 0) {
            newDiv += "</tr><tr>"
        }
        newDiv += "<td><div class='modeSelector' style='-webkit-transform: rotateY(" + angle + "deg);transform: rotateY(" + angle + "deg);'id='" + option.id + "'><img src='" + option.img + "'/><div class='optionTitle'>" + option.title + "</div></div></td>";
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

};
UI.prototype.addSpinner = function () {
    var opts = {
        lines: 17 // The number of lines to draw
        , length: 0 // The length of each line
        , width: 1 // The line thickness
        , radius: 84 // The radius of the inner circle
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
    }
    var target = document.getElementById('spinner')
    var spinner = new Spinner(opts).spin(target);

}
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
UI.prototype.updateLoader = function (add) {
    this.loading += add;
    percentage = this.loading;
    $("#loadingBar").animate({'width': percentage / 100 * 500}, 100);
}
UI.prototype.createProductBox = function (products) {
    var html = '<select class="productSelection"><option value="null" selected="selected">Select a product</option>';

    $.each(products, function (i, val) {
        html += "<option value ='" + val.atlasid + "'>" + val.name + "</option>";
    });
    html += "</select>";
    $(".productBox").html(html);
    $(".productSelection").select2({placeholder: "Select a product", allowClear: true});

};

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

UI.prototype.createSelectionBox = function (countries) {
    var html = '<select class="countrySelection"><option value="null" selected="selected">Select a country</option>';

    $.each(countries, function (i, val) {
        html += "<option value ='" + i + "'>" + val.name + "</option>";
    });
    html += "</select>";
    $(".selectionBox").html(html);
    $(".countrySelection").select2({placeholder: "选择国家", allowClear: true});

};