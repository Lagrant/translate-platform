var camera, scene, renderer;
window.onload = function () {
    var clock = new THREE.Clock();
    var keyboard = new THREEx.KeyboardState();
    var UserInterface = null;
    var Labels = null;
    var parseURL = new URLparser();
    var dollars = 100000000;//0.1billion
    var particles = 1000;
    var destination = [];
    var increment = 5;//点的位置变化增量
    var percentage = 1;
    var loaded = false;//是否加载完毕
    var nodeSize = 30;
    var zoomlock = false;//禁止改变地图比例
    var selectedID = 0;//当前选中的节点（hover即选中）
    var products = {};//存储产品，包括atlasid，color，id,name,sales,x,x3,y,y3,z3
    var countries = {};
    var trades = {};
    var links;//点云中的线
    var globeSize = 150;
    var names = [];//存储的是一个country中对应的一个点
    var countryIndex = 0;
    var categories = {};//下面的颜色目录条的信息
    var previousMode = "2D";//2D or 3D mode
    var darkMode = true;
    var cameraSpeed = 5;
    var currentSetup;//当前模式（也就是当前页面）
    var cameraControls = null;
    var isDragging = false, isClicking = false;
    var mouseCoord = {"x": 0, "y": 0};
    var selectedNode = new THREE.Mesh(new THREE.SphereGeometry(5, 24, 24), new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
    }));
    var storyMode = false;//是否是在story状态，也就是是否在介绍
    var filterCountry = null;//被选中的国家
    var filterProduct = null;//被选中的产品（在下拉菜单中）
    var Particlelinks = null;
    var particlesPlaced = 0;//被安置好的点的数量
    var Pgeometry = null;
    var Sgeometry = null;
    var selectCate = false, siderbar = false;


    //此方法在noWebGL.js里面，检测浏览器的可行性
    init();
    animate();
    existstory();


    /**
     * 初始化，设置camera，renderer，scene等
     * 载入data，包括边界、国家和产品信息
     * 增加一些监听动作
     */
    function init() {
        var WIDTH = window.innerWidth,
            HEIGHT = window.innerHeight;

        // set some camera attributes
        var VIEW_ANGLE = 45,
            ASPECT = WIDTH / HEIGHT,
            NEAR = 0.1,
            FAR = 10000;

        renderer = new THREE.WebGLRenderer();
        if (darkMode)
            renderer.setClearColor(0x000000, 1);
        else
            renderer.setClearColor(0xffffff, 1);

        camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);

        window.addEventListener('resize', function () {
            var WIDTH = window.innerWidth,
                HEIGHT = window.innerHeight;
            renderer.setSize(WIDTH, HEIGHT);
            camera.aspect = WIDTH / HEIGHT;
            camera.updateProjectionMatrix();
        });

        scene = new THREE.Scene();

        // add the camera to the scene
        scene.add(camera);
        //FogExp2对象的构造函数.用来在场景内创建指数雾效,指数雾效是雾效浓度递增根据指数(参数density)设定
        if (darkMode)
            scene.fog = new THREE.FogExp2(0xffffff, 0.001);
        else
            scene.fog = new THREE.FogExp2(0x00ffff, 0.001);

        camera.position.z = 450;

        renderer.setSize(window.innerWidth, window.innerHeight);


        UserInterface = new UI();
        UserInterface.addSpinner();

        document.body.appendChild(renderer.domElement);


        var attributes = {
            size: {type: 'f', value: null},
            customColor: {type: 'c', value: null},
        };

        var textureblock = new THREE.TextureLoader().load("/static/images/graph_data/block.png");
        var uniforms = {
            color: {type: "c", value: new THREE.Color(0xffffff)},
            texture: {type: "t", value: textureblock}
        };
        // console.log('block',textureblock);
        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            // attributes: attributes,
            vertexShader: document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent,
        });

        geometry = new THREE.BufferGeometry();


        var color = new THREE.Color();
        var tetha, phi, ray = 3000;
        var v = 0;
        var totalTrade = 0;
        var count = 0;
        countryIndex = 0;
        var countryHTML = "";


        /*在countries.json文件里面包含了四个主要信息：
        载入country，trade，categories，和products*/
        $.getJSON("/static/data/graphgoo/countries.json", function (corejson) {
            $.each(corejson.countries, function (co, country) {
                countries[co] = country;
            });
            $.each(corejson.products, function (pid, product) {
                products[pid] = product;
            });
            $.each(corejson.categories, function (cid, cat) {
                categories[cid] = cat;
            });
            Labels = new LabelManager(countries);

            UserInterface.buildCategories(categories);

            $.each(corejson.trade, function (i, val) {
                if (countries[i]) {
                    trades[i] = val;
                }
            });

            UserInterface.createSelectionBox(countries);


            //载入产品空间信息
            $.getJSON("/static/data/graphgoo/productspace.json", function (pspace) {
                $.each(pspace, function (p, values) {
                    ID = p;
                    //将ID补全为四位再查询产品信息
                    for (var add = 0; add < 4 - p.length; add++) {
                        ID = "0" + ID;
                    }
                    if (products[ID]) {
                        products[ID].x3 = parseFloat(values[0].x) / 33 + 30;
                        products[ID].y3 = parseFloat(values[0].y) / 33 + 40;
                        products[ID].z3 = parseFloat(values[0].z) / 40;
                    } else {
                    }
                });
                UserInterface.createProductBox(products);//加入产品选择框

                $(".productSelection").on("change", function () {
                    //在产品空间的时候就会触发
                    targetNode(products[$(this).val()]);
                    filterProduct = $(this).val();
                    console.log($(this).val())
                });
            });


            countryIndex = 124;
            particles = 153726;
            var positions = new Float32Array(particles * 3);
            destination = new Float32Array(particles * 3);
            var values_color = new Float32Array(particles * 3);
            var values_size = new Float32Array(particles);
            var total = 0, v = 0, ray = 4, tetha = 0;

            for (var i = 0; i < countryIndex; i++) {
                //对每个index寻找相应的country
                $.each(countries, function (p, v) {
                    if (i == v.id) {
                        val = v;//country的属性们
                        code = p;//country的index
                    }
                });

                //找到countries中对应的国家后开始进行处理
                for (var key in val["products"]) {
                    productValue = val["products"][key];//键为key的product的量
                    productInfo = products[key];//键为key的product的具体信息

                    color = new THREE.Color(productInfo.color);

                    //在点集中加入点并设置它的位置、目标、大小、颜色的初值
                    for (var s = 0; s < Math.round(productValue / dollars); s++) {
                        names.push({"n": key, "c": code});
                        values_size[v] = 3;
                        values_color[v * 3 + 0] = color.r * 1.2;
                        values_color[v * 3 + 1] = color.g * 1.2;
                        values_color[v * 3 + 2] = color.b * 1.2;
                        destination[v * 3 + 0] = 1;
                        destination[v * 3 + 1] = 2;
                        destination[v * 3 + 2] = 5000;
                        positions[v * 3 + 0] = 1;
                        positions[v * 3 + 1] = 2;
                        positions[v * 3 + 2] = 5000;
                        v++;
                    }
                }
            }

            //geometry初始化后第一次变化
            geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.addAttribute('customColor', new THREE.BufferAttribute(values_color, 3));
            geometry.addAttribute('size', new THREE.BufferAttribute(values_size, 1));
            geometry.addAttribute('attributes', new THREE.BufferAttribute(attributes, 1));

            particleSystem = new THREE.Points(geometry, shaderMaterial);
            particleSystem.frustrumCulled = true;
            scene.add(particleSystem);
            loaded = true;
            switcher("productspace3D", false, 5);
            Particlelinks = new ParticleLinks(13000, clock, darkMode);
            links = Particlelinks.getMesh();
            scene.add(links);

            $(".countrySelection").on("change", function () {
                filterCountry = $(this).val();
                switcher(currentSetup, true, 5);


            });


            $("#loaded").fadeOut();
            $("#spinner").fadeOut('slow');
            $('#choice').fadeIn('slow');
            //$("#sideBar").hide();
            //$("#categories").hide();

        });
        selectedNode.position.set(0, 0, 10000);
        scene.add(selectedNode);

        renderer.domElement.addEventListener("mousemove", mouseMove);
        renderer.domElement.addEventListener("mousedown", mouseDown);

        //定义各个监听事件
        window.addEventListener("mouseup", function () {
            //如果不是拖拽，那么鼠标抬起的时候将所有选中的移除并删除link
            if (!isDragging) {
                Labels.resetLabels(countries, darkMode);
            }
            UserInterface.changeCursor("default");
            isClicking = false;
            isDragging = false;
        });
        renderer.domElement.addEventListener("mousewheel", mousewheel, false);
        renderer.domElement.addEventListener("onmousewheel", mousewheel, false);
        //包括IE6在内的浏览器是使用onmousewheel，而FireFox浏览器一个人使用DOMMouseScroll
        renderer.domElement.addEventListener('DOMMouseScroll', mousewheel, false);
        $(renderer.domElement).dblclick(function (e) {
            if (previousMode === "2D") {
                cameraControls.zoom(10);
            }
        });

        if (darkMode)
            scene.add(new THREE.AmbientLight(0xFFFFFF));//环境光
        else
            scene.add(new THREE.AmbientLight(0x000000));//环境光

        zoomlock = false;
        cameraControls = new Controls(renderer.domElement, 450);
    }


    // setTimeout(updatematerial(),500);
    //更新点云，为点设定颜色并存储入dict里面
    function updatePoints() {
        colors = [];
        addedProducts = {};
        availableProducts = null;
        //如果是二维产品空间

        if (countries[filterCountry])
            availableProducts = countries[filterCountry].products;
        $.each(products, function (i, val) {
            //若此品类活跃且（没有选择product或者当前product大于dollar），对没有达到要求的点都设置为灰色
            if (categories[val.color].active && (!availableProducts || availableProducts[i] > dollars)) {
                ncolor = new THREE.Color(val.color);
            } else {
                ncolor = new THREE.Color('#303030');
            }
            //如果在added里面还没有这个product
            // 如果是在二维产品空间，加入它；
            //否则，如果它有xyz，也加入
            if (!addedProducts[i]) {
                if (val.x && val.y) {
                    addedProducts[i] = true;
                    colors.push(ncolor);
                }
            }
        });

        //如果是二维产品空间，那么颜色存储到P里面，否则存储到S里面
        Pgeometry.children[0].geometry.colors = colors;
        Pgeometry.children[0].geometry.colorsNeedUpdate = true;

    }

    /*在产品空间增加连线
     * 对于产品空间且其颜色已经定义好的，直接update点云
     * 否则：
     * 如果是点，那么只需要定义这个点的颜色和位置
     * 如果不只是点，那么需要定义一个circlegeo
     *
     * 然后，打开网络data，获取其中的点和线，每条线都有自己的起止product
     * 在product里面找到他们的xyz然后增设这条线
     *
     * @param circles 定义的点的表达方式
     * @param threeD 是否为3D点
     */
    function addProductLinks(circles, threeD) {
        if (Pgeometry) {
            scene.add(Pgeometry);
            updatePoints();
        }
        else {
            newlinks = new THREE.Object3D();
            var availableProducts = null;
            var addedProducts = {};
            var added = {};
            if (countries[filterCountry])
                availableProducts = countries[filterCountry].products;
            var cloudGeometry = new THREE.Geometry();
            var colors = [];
            var currentColor = new THREE.Color();
            if (circles) {
                $.each(products, function (i, val) {
                    if (categories[val.color].active && (!availableProducts || availableProducts[i] > dollars)) {
                        ncolor = new THREE.Color(val.color);
                    } else {
                        ncolor = new THREE.Color(0x333333);
                    }
                    if (!addedProducts[i]) {
                        addedProducts[i] = true;
                        if (threeD === true) {
                            if (val.x && val.y) {
                                productVector = new THREE.Vector3();
                                productVector.x = val["x"];
                                productVector.y = val["y"];
                                productVector.z = 0;
                                cloudGeometry.vertices.push(productVector);
                                colors.push(ncolor);
                            }
                        } else {
                            if (val.x3 && val.y3 && val.z3) {
                                productVector = new THREE.Vector3();
                                productVector.x = val.x3;
                                productVector.y = val.y3;
                                productVector.z = val.z3;
                                // console.log('dot',ncolor,productVector);
                                cloudGeometry.vertices.push(productVector);
                                colors.push(ncolor);
                            }
                        }
                    }
                });
                cloudGeometry.colors = colors;

                var texturedot7 = new THREE.TextureLoader().load("/static/images/graph_data/dot7.png");
                cloudMaterial = new THREE.PointsMaterial({
                    transparent: true,
                    size: nodeSize,
                    opacity: 0.8,
                    map: texturedot7,
                    vertexColors: THREE.VertexColors,
                    blending: THREE.AdditiveBlending,
                    fog: false,
                    depthTest: false
                });
                cloud = new THREE.Points(cloudGeometry, cloudMaterial);
                newlinks.add(cloud);
            }
            else {
                // console.log('not circle');
                var radius = 2.5;
                var segments = 32;
                var ncolor = new THREE.Color();
                var circleGeometry, circle, material;
                if (!threeD) {
                    mesh = new THREE.SphereGeometry(2, 8, 8);
                } else {
                    mesh = new THREE.CircleGeometry(radius, segments);
                }
                $.each(products, function (i, val) {
                    if (categories[val.color].active && (!availableProducts || availableProducts[i] > dollars)) {
                        ncolor = new THREE.Color(val.color);
                    } else {
                        ncolor = new THREE.Color(0x333333);
                    }
                    if (!addedProducts[i]) {
                        addedProducts[i] = true;
                        if (threeD === true) {
                            if (val.x && val.y) {
                                material = new THREE.MeshBasicMaterial({
                                    blending: THREE.AdditiveBlending,
                                    fog: false,
                                    transparent: true,
                                    opacity: 0.8
                                });
                                material.color.setRGB(ncolor.r, ncolor.g, ncolor.b);
                                circle = new THREE.Mesh(mesh, material);
                                circle.position.x = val["x"];
                                circle.position.y = val["y"];
                                newlinks.add(circle);
                            }
                        } else {
                            if (val.x3 && val.y3 && val.z3) {
                                material = new THREE.MeshBasicMaterial({
                                    blending: THREE.AdditiveBlending,
                                    fog: false,
                                    transparent: true,
                                    opacity: 0.8
                                });
                                material.color.setRGB(ncolor.r, ncolor.g, ncolor.b);
                                circle = new THREE.Mesh(mesh, material);
                                circle.position.x = val.x3;
                                circle.position.y = val.y3;
                                circle.position.z = val.z3;
                                newlinks.add(circle);
                            }
                        }
                    }
                });
            }

            added = {};
            $.getJSON("/static/data/graphgoo/network_hs.json", function (json) {
                nodes = json.nodes;
                line_geom = new THREE.Geometry();
                var line_material = new THREE.LineBasicMaterial({color: 0x808080, opacity: 0.2, linewidth: 1});
                var line_white = new THREE.LineBasicMaterial({color: 0xFFFFFF, opacity: 1, linewidth: 1});
                $.each(json.edges, function (i, val) {
                    IDA = nodes[val["source"]].id.substring(2, 6);
                    IDB = nodes[val["target"]].id.substring(2, 6);
                    productA = products[IDA];
                    productB = products[IDB];

                    if (productA && productB) {
                        if (threeD) {
                            // console.log(productA);
                            line_geom.vertices.push(new THREE.Vector3(productA.x, productA.y, 0));
                            line_geom.vertices.push(new THREE.Vector3(productB.x, productB.y, 0));
                        } else if (productA.x3) {
                            // console.log(productA);
                            line_geom.vertices.push(new THREE.Vector3(productA.x3, productA.y3, productA.z3));
                            line_geom.vertices.push(new THREE.Vector3(productB.x3, productB.y3, productB.z3));
                        }
                        added[IDA + "" + IDB] = true;
                    }
                });

                mergedMesh = new THREE.Line(line_geom, line_material);//, THREE.LinePieces

                // newlinks = new THREE.Object3D();
                newlinks.add(mergedMesh);
                // console.log(mergedMesh);

                scene.remove(links);
                // console.log(newlinks);

                links = newlinks;
                // console.log(links);
                scene.add(links);
                if (!Pgeometry) Pgeometry = links;

            });
        }

    }

    //这是点击一个国家以后触发的动作，给选择的国家连上相应type的线
    function addLinks(type, chosenCountry) {
        scene.remove(links);
        //links=new THREE.Object3D();
        var count = 0;
        var height = 15;
        var color = new THREE.Color();
        //大洲中心的坐标
        var continentCentroid = {
            1: [3.16, 19.33],
            2: [48.92, 85.78],
            3: [-13.58, 121.64],
            4: [53.12, 4.21],
            5: [-16.63, -59.76],
            6: [35.74, -102.3],
            7: [27.99, -173.32]
        };
        var regionCoords = [[-2.88891, 38.91750], [-3.23997, 18.52688], [26.98997, 16.41750], [-28.98956, 22.39406], [9.71916, -1.16062], [19.23786, -71.12156], [17.23455, -92.91844], [-24.91700, -58.46531], [44.28401, -99.24656], [41.97528, 68.44875], [35.96852, 120.12844], [29.77328, 68.44875], [-0.07764, 109.23000], [28.54528, 39.97219], [56.71013, 42.08156], [60.02608, 3.05813], [39.85016, 4.46438], [47.22653, 3.40969], [-33.20254, 144.73781], [-10.56414, 155.98781], [3.78679, 169.69875], [13.16436, 193.95656]];

        //为其他国家设置不透明度0，选中国家不透明度100
        $.each(countries, function (c, co) {
            if (darkMode)
                $("#" + c).css({'font-size': 10, 'color': '#FFFFFF', 'z-index': 2, 'opacity': 0});
            else
                $("#" + c).css({'font-size': 10, 'color': '#000000', 'z-index': 2, 'opacity': 0});

        });
        if (chosenCountry)
            if (darkMode)
                $("#" + chosenCountry).css({
                    'font-size': 24,
                    'color': '#FFFFFF',
                    'z-index': 4,
                    'opacity': 1
                });
            else
                $("#" + chosenCountry).css({
                    'font-size': 24,
                    'color': '#000000',
                    'z-index': 4,
                    'opacity': 1
                });

        var cartx, carty, cartz, cartx2, carty2, cartz2;
        $.each(trades, function (i, exports) {//对每个国家的出口
            country = countries[i];
            states = anchors[i];

            if (country && states) {
                var coord1 = continentCentroid[country.continent], coord2 = null;
                $.each(exports, function (j, val) {//对当前国家的每一个出口
                    country2 = countries[val.c];
                    if (country2 && (chosenCountry === "ALL" || chosenCountry === i)) {

                        if (darkMode)
                            $("#" + val.c).css({
                                'font-size': 12 + Math.sqrt(val.e) / 40,//字体大小和出口量有关
                                'color': '#eee',
                                'z-index': 2,
                                'opacity': 1
                            });
                        else
                            $("#" + val.c).css({
                                'font-size': 12 + Math.sqrt(val.e) / 40,//字体大小和出口量有关
                                'color': '#000',
                                'z-index': 2,
                                'opacity': 1
                            });
                        var coord2 = continentCentroid[country2.continent];
                        var segments = [];

                        var lon1 = Math.min(country.lat, country2.lat) / 180 * Math.PI;  // In radian
                        var lon2 = Math.max(country.lat, country2.lat) / 180 * Math.PI;  // In radian
                        var lat1 = Math.min(country.lon, country2.lon) / 180 * Math.PI; // In radian
                        var lat2 = Math.max(country.lon, country2.lon) / 180 * Math.PI; // In radian

                        var dLon = (lon2 - lon1);

                        var Bx = Math.cos(lat2) * Math.cos(dLon);
                        var By = Math.cos(lat2) * Math.sin(dLon);
                        var avgLat = Math.atan2(
                            Math.sin(lat1) + Math.sin(lat2),
                            Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By));
                        avgLat = avgLat * 180 / Math.PI;
                        var avgLong = lon1 + Math.atan2(By, Math.cos(lat1) + Bx) * 180 / Math.PI;

                        //如果是二维的就提供首尾两点，三维的需要好几个点来确定一条曲线
                        if (type === 'countries2D') {
                            height = 0;
                            color.setHSL(1, 1, 1);
                            segments.push(new THREE.Vector3(country2.lat * 1.55, country2.lon * 1.55, height));
                            segments.push(new THREE.Vector3(country.lat * 1.55, country.lon * 1.55, height));
                        } else if (type === "countries3D") {
                            theta = (90 - country2.lon) * Math.PI / 180;
                            phi = (country2.lat) * Math.PI / 180;
                            sx = globeSize * Math.sin(theta) * Math.cos(phi);
                            sy = globeSize * Math.sin(theta) * Math.sin(phi);
                            sz = globeSize * Math.cos(theta);

                            theta2 = (90 - country.lon) * Math.PI / 180;
                            phi2 = (country.lat) * Math.PI / 180;
                            tx = globeSize * Math.sin(theta2) * Math.cos(phi2);
                            ty = globeSize * Math.sin(theta2) * Math.sin(phi2);
                            tz = globeSize * Math.cos(theta2);

                            avgX = (sx + tx) / 2;
                            avgY = (sy + ty) / 2;
                            avgZ = (sz + tz) / 2;
                            dist = Math.sqrt(Math.pow(sx - tx, 2) + Math.pow(sy - ty, 2) + Math.pow(sz - tz, 2));
                            //extrude=1+dist/globeSize/2;
                            extrude = 1 + Math.pow(dist, 2) / 90000;
                            intrude = 0.995;
                            extrudeCenter = 1 + ((extrude - 1) * 1.5);
                            var A = new THREE.Vector3(sx, sy, sz);
                            segments.push(A.multiplyScalar(intrude));//multiplyScalar将A与常熟intrude相乘
                            var C = new THREE.Vector3(sx + (tx - sx) / 3, sy + (ty - sy) / 3, sz + (tz - sz) / 3);
                            segments.push(C.multiplyScalar(extrude));
                            var E = new THREE.Vector3(sx + (tx - sx) / 2, sy + (ty - sy) / 2, sz + (tz - sz) / 2);
                            segments.push(E.multiplyScalar(extrudeCenter));
                            var D = new THREE.Vector3(sx + (tx - sx) * 2 / 3, sy + (ty - sy) * 2 / 3, sz + (tz - sz) * 2 / 3);
                            segments.push(D.multiplyScalar(extrude));
                            var B = new THREE.Vector3(tx, ty, tz);
                            segments.push(B.multiplyScalar(intrude));

                        } else {
                            color.setHSL(1, 1, 1);
                            segments.push(new THREE.Vector3(country.lat * 1.45, country.lon * 1.45, height));
                            segments.push(new THREE.Vector3(coord1[1] * 1.4, coord1[0] * 1.4, 30 + country.continent * 5));
                            //segments.push(new THREE.Vector3(coord2[1]*1.4,coord2[0]*1.4,30+country2.continent*5));
                            segments.push(new THREE.Vector3(coord2[1] * 1.4, coord2[0] * 1.4, 30 + country2.continent * 5));
                            segments.push(new THREE.Vector3(country2.lat * 1.45, country2.lon * 1.45, height));
                        }
                        line = Spline(segments, color.getHex(), 5 - j / 2);//返回一条线
                        Particlelinks.assignPositions(line.geometry.vertices, j, val.e);
                        //links.add(line);
                        if (chosenCountry === "ALL") return false;
                    }

                });
            }
        });

        links = Particlelinks.getMesh();
        scene.add(links);

    }

    //在三维的空间里画线
    function Spline(controlPoints, colorHex, width) {
        var numPoints = 40;

        var material = new THREE.LineDashedMaterial({
            dashSize: 1,
            gapSize: 100,
            // colorHex: colorHex,
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            linewidth: width + 1
        });
        var colors = [];
        var spline = new THREE.CatmullRomCurve3(controlPoints);//通过一系列的点来创建一条平滑的曲线。
        var geometry = new THREE.Geometry();
        var splinePoints = spline.getPoints(100);
        for (var i = 0; i < splinePoints.length; i++) {
            geometry.vertices.push(splinePoints[i]);
            colors[i] = new THREE.Color();
            colors[i].setHSL(0.5, 0.2, i / 100);//色相、饱和度、透明度
        }
        geometry.colors = colors;

        return (new THREE.Line(geometry, material, THREE.LineSegments));
    }


    /*针对各种鼠标移动做出的反应
    * 关闭鼠标move的默认行为
    * 如果鼠标正在拖拽，那么对3D或者塔状的进行视线center的改变
    * 如果不是拖拽，那么对于非story状态，就需要确定当前鼠标是否触碰到了粒子系统中
    * 的任何粒子，找到触碰的最近的粒子，用label显示这个粒子的信息，查找粒子属于的国家
    * 然后将这个国家边界高亮*/
    function mouseMove(e) {
        /*pageX/pageY:鼠标相对于整个网页HTML页面的X/Y坐标。IE不适用
          clientX/clientY：事件发生时鼠标在浏览器内容区域的X/Y坐标（不包含滚动条）。
          screenX/screenY:鼠标在屏幕上的坐标。
          offsetX/offsetY:得出的结果跟pageX/pageY一样，IE专用*/
        moveY = (e.clientY || e.pageY);
        moveX = (e.clientX || e.pageX);
        e.preventDefault();//阻止元素发生默认的行为（例如，当点击提交按钮时阻止对表单的提交）。
        isDragging = isClicking;

        //如果是鼠标拖拽
        if (isDragging) {
            UserInterface.changeCursor("grabbing", cameraControls.isLocked());
            if (previousMode === "3D" || currentSetup === "towers")
                cameraControls.setTarget(mouseCoord.x - moveX, mouseCoord.y - moveY);
            mouseCoord.x = moveX;
            mouseCoord.y = moveY;

            //如果不是拖拽，且不是在story模式
        } else {
            if (moveX >= window.innerWidth - 50) {
                selectCate = true;
                $("#categories").show();
                // $("#catename").hide();
                $("#categories").animate({'right': '0'}, 0, "swing", function () {
                });
            } else {
                $("#categories").animate({'right': '-20px'}, 0, "swing", function () {
                    $("#categories").hide();
                    // $("#catename").show();
                    selectCate = false;
                });
            }
            if (moveY <= 50) {
                $("#sideBar").show();
                // $("#sideBarname").hide();
                $("#sideBar").animate({'top': '0px'}, 0, 'swing', function () {
                });
                siderbar = true;
            } else {
                $("#sideBar").animate({'top': '-30px'}, 0, 'swing', function () {
                    $("#sideBar").hide();
                    // $("#sideBarname").show();
                    siderbar = false;
                });
            }
            if (loaded) {
                var mouseX = e.clientX / window.innerWidth * 2 - 1;
                var mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
                vector = new THREE.Vector3(mouseX, mouseY, 0);
                var values_color = geometry.attributes.customColor.array;
                var i = 1e3;
                var s = new THREE.Projector;//可以用来进行碰撞检测
                //Raycasting is used for mouse picking (working out what objects in the 3d space the mouse is over) amongst other things.
                var o = new THREE.Raycaster;
                if (currentSetup === "gridSphere")
                    cameraDistance = Math.sqrt(Math.pow(camera.position.x, 2) + Math.pow(camera.position.y, 2) + Math.pow(camera.position.z, 2));
                else cameraDistance = 3000;
                vector.unproject(camera);
                o.ray.set(camera.position, vector.sub(camera.position).normalize());

                intersects = o.intersectObject(particleSystem);//从中心点发射线与别的物品相交点从近到远的一个数组
                if (intersects.length > 0) {//如有相交
                    for (var u = 0; u < intersects.length; u++) {//最近的相交物品
                        if (intersects[u].distanceToRay < i) {
                            i = intersects[u].distanceToRay;
                            //获取该国家的index
                            if (this.INTERSECTED != intersects[u].index && intersects[u].distance < cameraDistance - globeSize / 5) {
                                this.INTERSECTED = intersects[u].index;
                            }
                        }
                    }
                } else if (this.INTERSECTED !== null) {
                    this.INTERSECTED = null;
                }

                if (this.INTERSECTED) {
                    if (selectedID !== this.INTERSECTED) {
                        selectedID = this.INTERSECTED;
                    }
                    UserInterface.changeCursor("pointer");
                    $("#pointer").css({left: e.pageX + 15, top: e.pageY - 7});
                    $("#pointer").html("<span style='color:" + products[names[this.INTERSECTED].n].color + "'>" +
                        countries[names[this.INTERSECTED].c].name + "出口" + products[names[this.INTERSECTED].n].name + ' $' +
                        products[names[this.INTERSECTED].n].sales + "</span>");
                } else {
                    $("#pointer").css({top: -100, left: 0});
                    UserInterface.changeCursor("default");
                    selectedID = null;
                }
            }
        }
    }

    /*鼠标按下的反应
    * 在非story模式的时候，在产品空间中，即转移到该点；
    * 在地图模式中，则相当于选中那个点
    * 如果在没有点的地方点击，那么释放当前选中的点*/
    function mouseDown(e) {
        mouseCoord.x = e.clientX || e.pageX;
        mouseCoord.y = e.clientY || e.pageY;
        isClicking = true;
        if (!storyMode) {
            if (names[selectedID]) {
                var co = names[selectedID].c;
                targetNode(products[names[selectedID].n]);

            } else {
                freeNode();
                chosenCountry = null;
                UserInterface.changeCursor("grab", cameraControls.isLocked());
            }
        }

    }

    //转移到选中的product
    function targetNode(selectedProduct) {
        if (selectedProduct.atlasid)
            parseURL.update_url(currentSetup, selectedProduct.atlasid);
        $("#productlabel").fadeIn();
        $("#pointer").css({top: "-100px"});
        var productURL = "http://atlas.cid.harvard.edu/explore/tree_map/export/show/all/" + selectedProduct.atlasid + "/2012/";
        $("#productlabel").html("<h1>" + selectedProduct.name + '</h1><a target="blank" href="' + productURL + '">[在 Atlas 中打开]</a>');


        selectedNode.position.set(selectedProduct.x, selectedProduct.y, 0);
        cameraControls.center(selectedProduct.x, selectedProduct.y, 0);
        cameraControls.setZoom(100);

    }

    //将selectedNode设置到看不见的位置
    function freeNode() {
        selectedNode.position.set(0, 0, 10000);
        $("#productlabel").fadeOut();//产品的label消失
    }

    //每次滚轮的转动改变zoom 0.005
    function mousewheel(event) {
        var fov;
        if (event.wheelDeltaY)
            fov = event.wheelDeltaY * 0.005;
        else fov = -event.detail / 10;
        cameraControls.zoom(fov);
    }

    //？？？？隐藏没有被选择的category的product点
    function hideCategories() {
        var v = 0;
        var randomCity, country = null;
        var colors = {};
        var count = 0;
        var xaxis = 0;
        yaxis = 0, total = 0;
        loaded = false;
        var indexer = {};
        for (var i = 0; i < countryIndex; i++) {
            $.each(countries, function (p, o) {
                if (i == o.id) {
                    country = o;
                    code = p;
                }
            });
            if (country) {
                for (var product in country["products"]) {
                    cat = categories[products[product].color];
                    if (!indexer[products[product].color]) {
                        indexer[products[product].color] = total;
                        total += cat["total"];
                    }
                    xaxis = cat.id;
                    for (var s = 0; s < Math.round(country["products"][product] / dollars); s++) {
                        index = cat["total"];
                        if (!cat.active) {
                            if (previousMode === "3D") {
                                tetha = (categories[products[product].color].id) / 15 * Math.PI * 2;
                                destination[v * 3 + 0] = 3000 * Math.cos(tetha);
                                destination[v * 3 + 1] = 3000 * Math.sin(tetha);
                                destination[v * 3 + 2] = 0;//globeSize*1.05+Math.random()*3;
                            } else if (previousMode === "2D") {
                                destination[v * 3 + 0] = (indexer[products[product].color] + Math.random() * cat["total"]) / particles * window.innerWidth / 4 - window.innerWidth / 8;
                                if (storyMode) destination[v * 3 + 1] = 3000;
                                else destination[v * 3 + 1] = Math.random() * 5 - window.innerHeight / 4.7;
                                destination[v * 3 + 2] = 0;
                            }
                        }
                        v++;
                    }
                }
            }
        }
        loaded = true;
    }

    //switch 想要到达的状态然后计算并展示
    function switcher(to, reset, incremental) {
        increment = incremental;//增量
        if (currentSetup !== to || reset) {
            if (!reset) {
                //如果当前状态不是to并且没有reset那么：
                cameraControls.reset();
                cameraControls.lockRotation(false);
                particleSystem.rotation.set(0, 0, 0);
                freeNode();//当前点和其label消失
                if (darkMode)
                    scene.fog = new THREE.FogExp2(0x000000, 0.0001);
                else
                    scene.fog = new THREE.FogExp2(0x00ffff, 0.0001);

                cameraControls.center(0, 0, 0);
                cameraSpeed = 5;
            }

            var v = 0;
            scene.remove(Pgeometry);
            scene.remove(Sgeometry);

            Labels.resetLabels(countries, darkMode);
            zoomlock = false;
            scene.remove(links);

            $(".selectionBox").stop().fadeIn();//停止正在运行的动画并渐进出现


            //产品空间Tower
            previousMode = "3D";
            increment = 0;
            if (!reset)
                cameraControls.rotate(-Math.PI / 2, 3 * Math.PI / 4);

            cameraControls.center(-45, 0, 10);
            var state = "", yaxis = 0, xaxis = 0;
            v = 0;
            loaded = false;
            var ray = 3;
            var theta = 0;
            $.each(countries, function (i, val) {
                for (var key in val["products"]) {
                    productValue = val["products"][key];
                    productInfo = products[key];
                    color = new THREE.Color(productInfo.color);
                    for (var s = 0; s < Math.round(productValue / dollars); s++) {
                        tetha = Math.round(Math.random() * Math.PI * 2 * 2) / 2;
                        if (!filterCountry || filterCountry == i) {
                            destination[v * 3 + 2] = Math.round(Math.random() * productInfo.sales / dollars / 40 * 3) / 3;
                            ray = 3 / (destination[v * 3 + 2] + 1);
                            destination[v * 3 + 0] = productInfo.x + ray * Math.cos(tetha);
                            destination[v * 3 + 1] = productInfo.y + ray * Math.sin(tetha);
                        } else {
                            destination[v * 3 + 0] = 0;
                            destination[v * 3 + 1] = 0;
                            destination[v * 3 + 2] = 10000;
                        }
                        v++;
                    }
                }
            });
            addProductLinks(true, true);
            loaded = true;
            increment = 6;
        }
        particlesPlaced = 0;
        currentSetup = to;
        if (!storyMode) $("#atlasBox").stop().fadeIn();
        $("#countrySection").hide();
        $("#productSection").show();

        hideCategories();
    }


    //点击category选择product类别的时候所调用的方法
    $("#categories").on("click", ".chooseCategory", function () {
        var id = $(this).prop("id");
        id = id.substring(3, id.length);
        IDcode = parseInt(id);
        var reset = false;
        $.each(categories, function (a, b) {
            if (IDcode === b.id) {
                if (b.active) reset = true;
                b.active = true;
            } else {
                if (b.active) reset = false;
                b.active = false;
            }
        });
        $.each(categories, function (a, b) {
            if (reset) {
                b.active = true;
                $("#cat" + b.id).removeClass("categorySelected");
            } else {
                if (b.active) {
                    $("#cat" + b.id).addClass("categorySelected");
                }
                else {
                    $("#cat" + b.id).removeClass("categorySelected");
                }
            }
        });
        switcher(currentSetup, true, 5);
    });


    function existstory() {
        cameraControls.loaded();
        $("#UI").fadeIn();
        $("#storyPrompt").stop().stop().fadeOut();
    }

    //动画
    function animate() {
        //如果Labels非空，那么就对不同模式展示不同的Label
        if (Labels)
            Labels.animateLabels(countries, geometry, currentSetup, particleSystem);

        if (loaded) {
            if (links)
                links.position.set(particleSystem.position.x, particleSystem.position.y, particleSystem.position.z);

            var positions = geometry.attributes.position.array;
            var currentColor = new THREE.Color();
            error = 0.2;
            var a = false, b = false, c = false, fin = true;
            //不停地改变点的位置直到它的位置达到目标位置
            if (increment > 0) {
                for (var v = 0; v < particles / percentage; v++) {
                    a = false, b = false, c = false;
                    //easing=Math.sin((0.55+(v%100)/100*0.4)*Math.PI);
                    easing = 0.2 + (v % 1000) / 1000;
                    if (Math.abs(positions[v * 3 + 0] - destination[v * 3 + 0]) > error)
                        positions[v * 3 + 0] += (destination[v * 3 + 0] - positions[v * 3 + 0]) / increment * easing;
                    else {
                        positions[v * 3 + 0] = destination[v * 3 + 0];
                        a = true;
                    }
                    if (Math.abs(positions[v * 3 + 1] - destination[v * 3 + 1]) > error)
                        positions[v * 3 + 1] += (destination[v * 3 + 1] - positions[v * 3 + 1]) / increment * easing;
                    else {
                        positions[v * 3 + 1] = destination[v * 3 + 1];
                        b = true;
                    }
                    if (Math.abs(positions[v * 3 + 2] - destination[v * 3 + 2]) > error)
                        positions[v * 3 + 2] += (destination[v * 3 + 2] - positions[v * 3 + 2]) / increment * easing;
                    else {
                        positions[v * 3 + 2] = destination[v * 3 + 2];
                        c = true;
                    }
                    if (a && b && c) {
                        particlesPlaced++;
                    } else {
                        fin = false;
                    }
                }

                if (fin) {
                    increment = 0;
                    for (var v = 0; v < particles; v++) {
                        positions[v * 3 + 0] = destination[v * 3 + 0];
                        positions[v * 3 + 1] = destination[v * 3 + 1];
                        positions[v * 3 + 2] = destination[v * 3 + 2];
                    }
                }
            }
            geometry.attributes.position.needsUpdate = true;
        }
        cameraControls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
}