color_name = ['Blues', 'Greens', 'Greys', 'Oranges', 'Purples', 'Reds', 'autumn', 'spring', 'summer', 'winter',
    'hot', 'seismic', 'RdYlGn', 'bwr', 'RdGy', 'ocean', 'rainbow', 'jet'];
//设定可选的colorbar
var inner = "";
for (i in color_name) {
    inner += "<option value='" + color_name[i] + "'>" + color_name[i] + "</option>";
}
document.getElementById('color_select').innerHTML = inner;
var max_value = 5000;
var min_value = 0;
window.onload = function () {
    $("input[name=attribute]:eq(0)").click();
    drawColormap("color_canvas", window["Blues"]);
};
/*colorbar所调用的方法*/

//在旧的HTML后面append上一串HTML
function appendHTMLbyID(id, text) {
    old_html = document.getElementById(id).innerHTML;
    document.getElementById(id).innerHTML = old_html + text;
}

//防止边界溢出
function enforceBounds(x) {
    if (x < 0) {
        return 0;
    } else if (x > 1) {
        return 1;
    } else {
        return x;
    }
}

//插值获得位于x位置的颜色值
function interpolateLinearly(x, values) {
    // Split values into four lists
    var x_values = [];
    var r_values = [];
    var g_values = [];
    var b_values = [];
    for (i in values) {
        x_values.push(values[i][0]);
        r_values.push(values[i][1][0]);
        g_values.push(values[i][1][1]);
        b_values.push(values[i][1][2]);
    }

    var i = 1;
    while (x_values[i] < x) {
        i = i + 1;
    }
    i = i - 1;

    var width = Math.abs(x_values[i] - x_values[i + 1]);
    var scaling_factor = (x - x_values[i]) / width;

    // Get the new color values though interpolation
    var r = r_values[i] + scaling_factor * (r_values[i + 1] - r_values[i]);
    var g = g_values[i] + scaling_factor * (g_values[i + 1] - g_values[i]);
    var b = b_values[i] + scaling_factor * (b_values[i + 1] - b_values[i]);

    return [enforceBounds(r), enforceBounds(g), enforceBounds(b)];
}

//用于在canvasID这个画布上根据colormap画一个colorbar
function drawColormap(CanvasID, colormap) {
    var c = document.getElementById(CanvasID);
    var ctx = c.getContext("2d");
    for (i = 0; i <= 200; i++) {
        if (!reverse) {
            var color = interpolateLinearly(i / 200, colormap);
        } else {
            var color = interpolateLinearly((200 - i) / 200, colormap);
        }
        r = Math.round(255 * color[0]);//四舍五入的整数
        g = Math.round(255 * color[1]);
        b = Math.round(255 * color[2]);
        ctx.fillStyle = 'rgb(' + r + ', ' + g + ', ' + b + ')';
        ctx.fillRect(i, 0, 1, 40);
    }
}

//在tableID上画一个colorbar组合
function drawColormapTable(TableID) {
    for (i in color_name) {
        var cmap = color_name[i];
        appendHTMLbyID(TableID, '<tr><td>' + cmap + '</td><td><canvas id="' + cmap + '" width="200" height="50"></canvas></td></tr>');
    }
    for (i in color_name) {
        var cmap = color_name[i];
        drawColormap(cmap, window[cmap]);
    }
}

window.onload = function () {
    province = ["北京市", "天津市", "河北省", "山西省", "内蒙古自治区", "辽宁省", "吉林省", "黑龙江省", "上海市", "江苏省",
        "浙江省", "安徽省", "福建省", "江西省", "山东省", "河南省", "湖北省", "湖南省", "广东省", "广西壮族自治区", "海南省", "重庆市",
        "四川省", "贵州省", "云南省", "西藏自治区", "陕西省", "甘肃省", "青海省", "宁夏回族自治区", "新疆维吾尔自治区", "台湾省",
        "香港特别行政区", "澳门特别行政区"];
    province_area = [1.6807, 1.13, 19, 15.6, 118.3, 14.57, 18.74, 47.3, 0.634, 10.26, 10.18, 13.96, 12.14, 16.69, 15.7, 16.7,
        18.59, 21.18, 17.98, 23.63, 3.392, 8.3, 48.5, 17.62, 39.4, 122.84, 20.58, 45.5, 72, 6.64, 166.49, 3.62, 0.1098, 0.0254,];
    //just some colors

    //设定可选的colorbar
    var inner = "";
    for (i in color_name) {
        inner += "<option value='" + color_name[i] + "'>" + color_name[i] + "</option>";
    }
    document.getElementById('color_select').innerHTML = inner;

    //选定colorbar之后需要进行的一系列的动作
    $('#color_select').change(function () {
        var color = $('#color_select').val();
        drawColormap("color_canvas", window[color]);
        $('input[name=attribute]:checked').click();
    });

    $.ajax({
        type: "POST",
        url: "/geo/get/",
        data: {},
        async: false,
        dataType: "json",
        success: function (res) {//返回数据根据结果进行相应的处理
            data_index = res.data;
            province_index = res.province;
            attr_index = res.attr;
        },
        error: function () {
            alert("获取数据失败！");
        }
    });

    $("input[name=attribute]:eq(0)").click();
    drawColormap("color_canvas", window["Blues"]);
};

reverse = false;
//点击reverse之后出现的反应
$('#color_reverse').click(function () {
    reverse = !reverse;
    $('input[name=attribute]:checked').click();
    var color = $('#color_select').val();
    drawColormap("color_canvas", window[color]);
});


//创建地图
var map = new AMap.Map('container', {
    mapStyle: 'amap://styles/26fc904bd43d8b834219809619ba4aea',
    zoom: 4
});
AMap.plugin(['AMap.ToolBar', 'AMap.Scale'], function () {
    var toolbar = new AMap.ToolBar();
    map.addControl(toolbar);
    map.addControl(new AMap.Scale())
});


function initPage(DistrictCluster, $, utils) {
    //自定义绘制引擎begin
    function MyRender(distClusterIns, opts) {
        //直接调用父类的构造函数
        MyRender.__super__.constructor.apply(this, arguments);
    }

    //继承默认引擎
    utils.inherit(MyRender, DistrictCluster.Render.Default);

    //增加或者覆盖接口
    utils.extend(MyRender.prototype, {
        drawFeaturePolygons: function (ctx, polygons, styleOptions, feature, dataItems) {
            //调用父类方法
            MyRender.__super__.drawFeaturePolygons.apply(this, arguments);
        },
        _initContainter: function () {
            //调用父类方法
            MyRender.__super__._initContainter.apply(this, arguments);
        },
    });
    //自定义绘制引擎end


    var distCluster = new DistrictCluster({
        map: map, //所属的地图实例
        zIndex: 11,

        getPosition: function (item) {
            if (!item) {
                return null;
            }
            var parts = item.split(',');
            //返回经纬度
            return [parseFloat(parts[0]), parseFloat(parts[1])];
        },
        renderConstructor: MyRender,
        renderOptions: {
            //点击后显示聚合标注begin
            clusterMarkerKeepConsistent: false, //marker的位置随交互变化
            getClusterMarkerPosition: function (feature) {
                //返回之前存储的点击位置
                return currentLngLat;
                //return feature.properties.center;
            },
            //点击后显示聚合标注end
            //定制聚合信息标注begin
            getClusterMarker: function (feature, dataItems, recycledMarker) {
                if (feature.properties.adcode !== currentAdcode) {
                    return null;
                }

                var index = 0, given_index = -1;
                for (index = 0; index < province_index.length; index++) {
                    if (feature.properties.name.indexOf(province_index[index]) >= 0) {
                        given_index = index;
                        break;
                    }
                }
                //label内容
                var content = feature.properties.name + ' (' + data_index[index][j] + ')';
                var label = {
                    offset: new AMap.Pixel(10, 25), //修改label相对于marker的位置
                    content: content
                };
                //存在可回收利用的marker
                if (recycledMarker) {
                    //直接更新内容返回
                    recycledMarker.setLabel(label);
                    return recycledMarker;
                }
                //返回一个新的Marker
                return new AMap.Marker({
                    label: label
                });
            },
            //定制聚合信息标注end

            //自定义绘制引擎（下面一句）
            //点击区划面后切换到子级区划
            featureClickToShowSub: true,
            featureStyle: {
                fillStyle: 'rgba(102,170,0,1)', //填充色
                lineWidth: 1, //描边线宽
                strokeStyle: '#353535', //描边色
                //鼠标Hover后的样式
                hoverOptions: {
                    opacity: 0.8,
                    lineWidth: 1,
                    strokeStyle: 'white',
                }
            },
            getFeatureStyle: function (feature, dataItems) {
                var index = 0, given_index = -1;
                for (index = 0; index < province_index.length; index++) {
                    if (feature.properties.name.indexOf(province_index[index]) >= 0) {
                        given_index = index;
                        break;
                    }
                }
                var colorbar_choose = $('#color_select').val();
                if (given_index === -1)
                    fillColor = 'white';
                else {
                    var colorbar_choose = $('#color_select').val();
                    if (!reverse) {
                        var color = interpolateLinearly((province_value[index] - min) / (max - min), window[colorbar_choose]);
                    } else {
                        var color = interpolateLinearly((max - province_value[index]) / (max - min), window[colorbar_choose]);
                    }
                    r = Math.round(255 * color[0]);//四舍五入的整数
                    g = Math.round(255 * color[1]);
                    b = Math.round(255 * color[2]);
                    fillColor = 'rgb(' + r + ', ' + g + ', ' + b + ')';
                }
                return {
                    fillStyle: 'rgb(' + r + ', ' + g + ', ' + b + ')',
                };
            },
            featureEventSupport: true,
            clusterMarkerEventSupport: true,
            //标注信息Marker上需要监听的事件
            clusterMarkerEventNames: ['click', 'rightclick', 'mouseover', 'mouseout']
        }
    });

    var currentAdcode = null,
        currentLngLat = null;

    //点击后显示聚合标注
    //监听区划面的点击
    distCluster.on('featureMouseover', function (e, feature) {
        currentAdcode = feature.properties.adcode;
        //记住点击位置
        currentLngLat = e.originalEvent.lnglat;
        //重绘
        distCluster.renderLater();
    });

    window.distCluster = distCluster;
    distCluster.on('outsideClick', function (e) {

        currentAdcode = currentLngLat = null;

        //重绘
        distCluster.renderLater();
    });

    $.get('https://a.amap.com/amap-ui/static/data/10w.txt', function (csv) {
        $('#loadingTip').remove();
        var data = csv.split('\n');
        distCluster.setData(data);
    });
}

$('input[name=attribute]').click(function () {
    province_value = [];
    j = 0;

    //寻找这个被选中的attribute对应的是第几列
    for (j = 0; j < attr_index.length; j++) {
        if (attr_index[j] === $(this).val()) {
            break;
        }
    }

    for (var i = 0; i < province_index.length; i++) {
        var thisdata = parseFloat(data_index[i][j]);
        province_value.push(thisdata);
    }

    max = province_value[0];
    min = province_value[0];
    for (var i in province_value) {
        if (province_value[i] > max) {
            max = province_value[i];
        }
        else if (province_value[i] < min) {
            min = province_value[i];
        }
    }
    //加载相关组件
    AMapUI.load(['ui/geo/DistrictCluster', 'lib/$', 'lib/utils'], function (DistrictCluster, $, utils) {
        //启动页面
        initPage(DistrictCluster, $, utils);
    });
});

//文件上传部分
$.fn.csv2arr = function (callback) {
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
                console.log("成功进入geo");
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
    var file_name = $("input[name=csvfile]").val();
    if (file_name.lastIndexOf(".") != -1) {
        var fileType = (file_name.substring(file_name.lastIndexOf(".") + 1, file_name.length)).toLowerCase();
        if (fileType == 'csv') {
            $("input[name=csvfile]").csv2arr(function (res) {
            });
        }
        else
            alert("Please use csv file")
    }
}

function uploadComplete(evt) {//py文件上传成功
    alert(evt.target.responseText);
}