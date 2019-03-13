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
    var globe = null;//存储sphere的边界信息
    var contrast = false;
    var percentage = 1;
    var loaded = false;//是否加载完毕
    var nodeSize = 30;
    var zoomlock = false;//禁止改变地图比例
    var selectedID = 0;//当前选中的节点（hover即选中）
    var shape = null;//存储plane的边界信息
    var products = {};//存储产品，包括atlasid，color，id,name,sales,x,x3,y,y3,z3
    var countries = {};
    var sales = {};
    var trades = {};
    var countryOverlay = null;//鼠标覆盖的地图的边界
    var links;//点云中的线
    var showLinks = true;
    var data = null;
    var blending = true;
    var globeSize = 150;
    var names = [];//存储的是一个country中对应的一个点
    var countryIndex = 0;
    var categories = {};//下面的颜色目录条的信息
    var incrementLink = 0;
    var incrementLinkMax = 2000;
    var previousMode = "2D";//2D or 3D mode
    var darkMode = true;
    var oldColors = [];
    var cameraSpeed = 5;
    var selectedCountry = null;
    var currentSetup;//当前模式（也就是当前页面）
    var cameraControls = null;
    var isDragging = false;
    var mouseCoord = {"x": 0, "y": 0};
    var currentZoom = 0;
    var step = 0;
    var selectedNode = new THREE.Mesh(new THREE.SphereGeometry(5, 24, 24), new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
    }));
    var storyMode = false;//是否是在story状态，也就是是否在介绍
    var filterCountry = null;//被选中的国家
    var filterProduct = null;//被选中的产品（在下拉菜单中）
    var constantSize = false;
    var Particlelinks = null;
    var particlesPlaced = 0;//被安置好的点的数量
    var centers = {};
    var Pgeometry = null;
    var Sgeometry = null;
    var overlayMaterial = null;
    // var texturedot7, textureblock, texturecolormap;

    //此方法在noWebGL.js里面，检测浏览器的可行性
    if (WebGLtest()) {
        init();
        animate();
    } else {
        $("#storyPrompt").html($("#noWebGL").html());
    }

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
        // texturedot7 = new THREE.TextureLoader().load("/static/images/master/dot7.png");
        // textureblock = new THREE.TextureLoader().load("/static/images/master/block.png");
        // texturecolormap = new THREE.TextureLoader().load("/static/images/master/colormap5.png");

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

        var textureblock = new THREE.TextureLoader().load("/static/images/master/block.png");
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
        var planeShapeIDs;
        var sphereShapeIDs;

        //载入边界信息
        $.getJSON("/static/data/master/world.json", function (json) {
            var texturecolormap = new THREE.TextureLoader().load("/static/images/master/colormap5.png");
            overlayMaterial = new THREE.MeshPhongMaterial({//一种光亮表面的材质效果
                map: texturecolormap,
                transparent: true,
                opacity: 0.5,
                blending: THREE.AdditiveBlending//决定物体如何与背景进行融合,提供一种半透明的眩光。
            });

            // geoMeshline = new GeoMeshLine(json, {
            //     resolution: [window.innerWidth, window.innerHeight],
            //     color: 0x00ffff,
            //     lineWidth: 2
            // });
            // scene.add(geoMeshline);
            //function drawThreeGeo(json, radius, shape,scene, options)
            temp = drawThreeGeo(json, 400, 'plane', scene, {
                color: 0x7e7e7e,
                linewidth: 2,
                transparent: true,
                opacity: 0.7
            });
            shape = new THREE.Object3D();
            shape.add(temp[0]);//边界线
            overlay = new THREE.Mesh(new THREE.PlaneGeometry(560, 280, 1, 1), overlayMaterial);
            shape.add(overlay);
            planeShapeIDs = temp[1];//边界线ID

            globe = new THREE.Object3D();
            globe.add(new THREE.Mesh(new THREE.SphereGeometry(globeSize - 2, 32, 32),
                new THREE.MeshBasicMaterial({
                    color: 0x000000,
                    opacity: 0.2
                })));
            //globe.add(new THREE.Mesh(new THREE.IcosahedronGeometry( globeSize-1, 6 ),new THREE.MeshBasicMaterial({color:0x080808,wireframe:true})));

            overlaySphere = new THREE.Mesh(new THREE.SphereGeometry(globeSize + 2, 32, 32), overlayMaterial);
            overlaySphere.rotation.y = -Math.PI / 2;
            globe.add(overlaySphere);
            //画地图边界信息
            temp = drawThreeGeo(json, globeSize * 1.45, 'sphere', scene, {
                color: 0x7e7e7e,
                linewidth: 2,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.7
            });
            sphereShapeIDs = temp[1];
            globe.add(temp[0]);
            globe.updateMatrix();
            renderer.render(scene, camera);
        });


        /*在countries.json文件里面包含了四个主要信息：
        载入country，trade，categories，和products*/
        $.getJSON("/static/data/master/countries.json", function (corejson) {
            $.each(corejson.countries, function (co, country) {
                countries[co] = country;
            });
            $.each(planeShapeIDs, function (shapeid, shapes) {
                if (countries[shapeid])
                    countries[shapeid]["polygons"] = planeShapeIDs[shapeid];
            });
            $.each(sphereShapeIDs, function (shapeid, shapes) {
                if (countries[shapeid])
                    countries[shapeid]["polygons3D"] = sphereShapeIDs[shapeid];
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
            $.getJSON("/static/data/master/productspace.json", function (pspace) {
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
                    if (currentSetup === "productspace" || currentSetup === "productspace3D" || currentSetup === "productsphere")
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
            switcher("gridSphere", false, 25);
            Particlelinks = new ParticleLinks(13000, clock, darkMode);
            links = Particlelinks.getMesh();
            scene.add(links);

            $(".countrySelection").on("change", function () {
                targetCountry($(this).val(), true, true);
                filterCountry = $(this).val();
                if (currentSetup === "productspace" || currentSetup === "productsphere" || currentSetup === "productspace3D") {
                    switcher(currentSetup, true, 5);
                }

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
                hideLinks();
                Labels.resetLabels(countries, darkMode);
                $("#atlasBox").stop().fadeOut();
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


    // function updatematerial(){
    //     var texture=new THREE.TextureLoader().load("/static/images/master/dot7.png");
    //     cloudMaterial.map=texture;
    //     console.log("call update");
    //
    // }
    // setTimeout(updatematerial(),500);
    //更新点云，为点设定颜色并存储入dict里面
    function updatePoints() {
        colors = [];
        addedProducts = {};
        availableProducts = null;
        //如果是二维产品空间
        if (currentSetup === "productspace" || currentSetup === "productspace3D")
            P = true;
        else P = false;

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
                if (P) {
                    if (val.x && val.y) {
                        addedProducts[i] = true;
                        colors.push(ncolor);
                    }
                } else if (val.x3 && val.y3 && val.z3) {
                    addedProducts[i] = true;
                    colors.push(ncolor);
                }
            }
        });

        //如果是二维产品空间，那么颜色存储到P里面，否则存储到S里面
        if (P) {
            Pgeometry.children[0].geometry.colors = colors;
            Pgeometry.children[0].geometry.colorsNeedUpdate = true;
        } else {
            Sgeometry.children[0].geometry.colors = colors;
            Sgeometry.children[0].geometry.colorsNeedUpdate = true;
        }
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
        if ((currentSetup === "productspace" || currentSetup === "productspace3D") && Pgeometry) {
            scene.add(Pgeometry);
            updatePoints();
        } else if (currentSetup === "productsphere" && Sgeometry) {
            scene.add(Sgeometry);
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

                var texturedot7 = new THREE.TextureLoader().load("/static/images/master/dot7.png");
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
            $.getJSON("/static/data/master/network_hs.json", function (json) {
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
                if (currentSetup === "productspace" || currentSetup === "productspace3D") {
                    if (!Pgeometry) Pgeometry = links;
                } else if (currentSetup === "productsphere") {
                    if (!Sgeometry) Sgeometry = links;
                }
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

    //？？？？对于粒子系统
    function animateLinks() {
        switch (currentSetup) {
            case "globe":
            case "cities":
            case "probability":
            case "probability3D":
            case "centroids3D":
            case "gridmap":
            case "gridSphere":
                Particlelinks.animate();
                break;
        }
    }

    //在非产品空间移除连线
    function hideLinks() {
        if (currentSetup !== "productspace" && currentSetup !== "productsphere" && currentSetup !== "productspace3D")
            scene.remove(links);
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
        } else if (!storyMode) {
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
                    highLightCountry(null, false);
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
                    highLightCountry(countries[names[this.INTERSECTED].c], true);
                } else {
                    $("#pointer").css({top: -100, left: 0});
                    UserInterface.changeCursor("default");
                    selectedID = null;
                    highLightCountry(null, false);
                }
            }
        }
    }

    //鼠标指到这个国家里面的时候调用的方法，将当前高亮的国家转回普通，然后将当前国家的边界高亮
    function highLightCountry(country, on) {
        if (currentSetup != "productspace" && currentSetup != "productspace3D" && currentSetup != "productsphere") {
            //如果当前已经有别的国家被高亮了，那么将这个国家先给变为普通状态
            if (countryOverlay) {
                for (var i = 0; i < countryOverlay.length; i++) {
                    currentMesh = scene.getObjectById(countryOverlay[i], true);
                    if (currentMesh) {
                        currentMesh.material.linewidth = 1;
                        currentMesh.material.opacity = 0.6;
                    }
                }
            }
            if (on) {
                if (currentSetup === "gridSphere") {
                    meshes = country.polygons3D;
                    if (!countryOverlay) countryOverlay = [];
                    if (meshes != null)
                        for (var i = 0; i < meshes.length; i++) {
                            currentMesh = globe.children[2].getObjectById(meshes[i], true);
                            currentMesh.material.linewidth = 5;
                            currentMesh.material.opacity = 1;
                            countryOverlay.push(meshes[i]);
                        }
                } else if (currentSetup === "gridmap" || currentSetup === "towers") {
                    meshes = country.polygons;
                    if (!countryOverlay) countryOverlay = [];
                    if (meshes != null)
                        for (var i = 0; i < meshes.length; i++) {
                            currentMesh = shape.children[0].getObjectById(meshes[i], true);
                            currentMesh.material.linewidth = 5;
                            currentMesh.material.opacity = 1;
                            countryOverlay.push(meshes[i]);
                        }
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
                if (currentSetup === "productsphere" || currentSetup === "productspace" || currentSetup === "productspace3D") {
                    targetNode(products[names[selectedID].n]);
                } else {
                    $(".countrySelection").select2("val", co);
                }
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

        if (currentSetup === "productsphere") {
            if (selectedProduct.x3) {
                selectedNode.position.set(selectedProduct.x3, selectedProduct.y3, selectedProduct.z3);
                cameraControls.center(selectedProduct.x3, selectedProduct.y3, selectedProduct.z3);
                cameraControls.focusCenter();
                cameraControls.setZoom(100);
            }
        } else {
            selectedNode.position.set(selectedProduct.x, selectedProduct.y, 0);
            cameraControls.center(selectedProduct.x, selectedProduct.y, 0);
            cameraControls.setZoom(100);
        }
    }

    //将selectedNode设置到看不见的位置
    function freeNode() {
        selectedNode.position.set(0, 0, 10000);
        $("#productlabel").fadeOut();//产品的label消失
    }

    //设置目标国家
    function targetCountry(co, linksOn, center) {
        parseURL.update_url(currentSetup, selectedCountry);//更新url
        filterCountry = co;
        var target = countries[co];
        if (target) {
            switch (currentSetup) {
                case "globe":
                case "cities":
                case "probability":
                case "probability3D":
                case "centroids3D":
                case "gridmap":
                case "gridSphere":
                case "towers":
                    if (previousMode === "3D") {
                        if (linksOn)
                            addLinks("countries3D", co);
                        if (center)
                            cameraControls.rotate(-(target.lat * Math.PI / 180 + Math.PI), -(target.lon * Math.PI / 180 - Math.PI) + 0.01);
                        //console.log(countries[co].lat * Math.PI / 180+Math.PI+" "+(countries[co].lon * Math.PI / 180+Math.PI);
                    } else {
                        if (linksOn)
                            addLinks("countries2D", co);
                        cameraControls.center(target.lat * 1.55, target.lon * 1.55, 0);
                    }
                    break;
                default:
                    break;
            }
        }
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
                shape.position.set(0, 0, 0);
            }

            var v = 0;
            scene.remove(globe);
            scene.remove(shape);
            scene.remove(Pgeometry);
            scene.remove(Sgeometry);

            Labels.resetLabels(countries, darkMode);
            zoomlock = false;
            scene.remove(links);

            $(".selectionBox").stop().fadeIn();//停止正在运行的动画并渐进出现

            switch (to) {
                //普通的2D均匀展示
                case "gridmap":
                    cameraControls.lockRotation(true);
                    previousMode = "2D";
                    scene.add(shape);
                    var v = 0;
                    loaded = false;
                    zoomlock = true;
                    cameraControls.center(-40, 0, 10);
                    var randomCity, country = null;
                    var colors = {};
                    var count = 0;
                    var xaxis = 0;
                    yaxis = 0;

                function shapeCentroid(poly) {
                    var totalx = 0, totaly = 0, totalz = 0, perimeter = 0;
                    for (var l = 0; l < poly.length; l++) {
                        totalx += poly[l].x;
                        totaly += poly[l].y;
                        totalz += poly[l].z;
                        if (l < poly.length - 1) {
                            perimeter += Math.sqrt(Math.pow(poly[l].x - poly[l + 1].x, 2) + Math.pow(poly[l].y - poly[l + 1].y, 2) + Math.pow(poly[l].z - poly[l + 1].z, 2));
                        }
                    }
                    return [totalx / poly.length * 0.7, totaly / poly.length * 0.7, totalz / poly.length * 0.7, perimeter];
                }

                    for (var i = 0; i < countryIndex; i++) {
                        $.each(countries, function (p, o) {
                            if (i == o.id) {
                                country = o;
                                code = p;
                            }
                        });
                        IDs = country.polygons;
                        var dotspacing = Math.pow(country.particles / country.area, 0.5) * 40;
                        if (IDs) {
                            var p = 0;
                            while (p < country.particles) {
                                for (var k = 0; k < IDs.length; k++) {
                                    countryline = shape.children[0].getObjectById(IDs[k]);

                                    test = shapeCentroid(countryline.geometry.vertices);

                                    for (var j = 0; j < countryline.geometry.vertices.length - 1; j++) {

                                        r = Math.floor(Math.random() * (countryline.geometry.vertices.length - 1));
                                        vector = countryline.geometry.vertices[r];
                                        vector2 = countryline.geometry.vertices[r + 1];
                                        for (var u = 0; u < Math.sqrt(Math.pow(vector.x - vector2.x, 2) + Math.pow(vector.y - vector2.y, 2) + Math.pow(vector.z - vector2.z, 2)) / test[3] * countryline.geometry.vertices.length; u++) {
                                            rand = Math.random();

                                            newx = -(vector.x + rand * (vector2.x - vector.x)) * 0.7;
                                            newy = (vector.z + rand * (vector2.z - vector.z)) * 0.7;
                                            newz = (vector.y + rand * (vector2.y - vector.y)) * 0.7;
                                            theta = (90 - country.lon) * Math.PI / 180;
                                            phi = (country.lat) * Math.PI / 180 + Math.PI / 2;
                                            //rand=0.5+(Math.random()-0.5)*Math.random();
                                            //rand=0.25+(Math.random()-0.25)*Math.random();
                                            rand = Math.random();
                                            //rand= Math.round(rand*dotspacing*30)/dotspacing/30;
                                            //rand = 1-Math.random() * Math.random(); //powder
                                            /*ray = globeSize + (1 - rand) * Math.PI * 2;
                                            newx2 = (ray * Math.sin(theta) * Math.cos(phi));
                                            newy2 = (ray * Math.sin(theta) * Math.sin(phi));
                                            newz2 = (ray * Math.cos(theta));*/
                                            offsetX = 0, offsetY = 0, offsetZ = 0;
                                            if (k == 1 && code == "CN") offsetZ = 10;
                                            if (k === 9 && code == "RU") offsetZ = 50;
                                            if (k === 0 && code == "IN") offsetY = -15;
                                            if (k === 0 && code == "AE") offsetZ = 3;
                                            if (k === 0 && code == "BR") offsetX = 20;
                                            if (k === 1 && code == "GB") offsetX = 2;
                                            if (k === 5 && code == "US") offsetY = 14;
                                            if (k === 1 && code == "JP") offsetX = -3;
                                            if (k === 10 && code == "CA") offsetZ = 20;
                                            if (k === 2 && code == "IT") {
                                                if (r < 10 || r > 38) offsetZ = -5;
                                                offsetX = offsetZ;
                                            }
                                            newx2 = -test[0] + (2 * Math.random() - 1) * rand - offsetX;
                                            newy2 = test[2] + (2 * Math.random() - 1) * rand - offsetY;
                                            newz2 = test[1] + (2 * Math.random() - 1) * rand - offsetZ;
                                            //len=Math.sqrt(Math.pow(vector.x-newx2,2)+Math.pow(vector.y-newy2,2)+Math.pow(vector.z-newz2,2));

                                            //mod=1+country.area/150000000;
                                            mod = 1;
                                            newx2 = newx2 * (mod);
                                            newy2 = newy2 * (mod);
                                            newz2 = newz2 * (mod);

                                            if (p < country.particles) {
                                                newpoint = {
                                                    "x": newx + rand * (newx2 - newx),
                                                    "y": newy + rand * (newy2 - newy),
                                                    "z": newz + rand * (newz2 - newz)
                                                };
                                                newpoint2 = {"x": test[0], "y": test[2], "z": test[1]};
                                                //if(code=="IT" ||code=="MX"||code=="JP"||code=="VN"||code=="TH"||code=="GB")polytest=!outofPoly(vector,vector2,newpoint);
                                                polytest = false;
                                                if (polytest) {
                                                    destination[v * 3 + 0] = 0;
                                                    destination[v * 3 + 1] = 0;
                                                    destination[v * 3 + 2] = 0;
                                                } else {
                                                    destination[v * 3 + 0] = -Math.round(newpoint.x * dotspacing) / dotspacing;
                                                    destination[v * 3 + 2] = -Math.round(newpoint.y * dotspacing) / dotspacing;
                                                    destination[v * 3 + 1] = Math.round(newpoint.z * dotspacing) / dotspacing;
                                                }
                                                v++;
                                                p++;
                                            } else {
                                                break;
                                            }

                                        }
                                    }
                                }
                            }
                        } else {
                            for (var r = 0; r < country.particles; r++) {
                                destination[v * 3 + 0] = 0;
                                destination[v * 3 + 1] = 0;
                                destination[v * 3 + 2] = 0;
                                v++;
                            }
                        }
                    }
                    loaded = true;
                    break;

                //普通的3D网格球
                case "gridSphere":
                    previousMode = "3D";
                    cameraControls.globe();
                    if (!reset)
                        cameraControls.rotate(-Math.PI / 2, Math.PI);
                    particleSystem.position.set(0, 0, 0);
                    globe.rotation.set(Math.PI / 2, Math.PI / 2, 0);
                    particleSystem.rotation.z = -Math.PI / 2;
                    scene.add(globe);
                    var v = 0;
                    loaded = false;
                    zoomlock = false;
                    var randomCity, country = null;
                    var ray = globeSize;
                    var theta, phi;

                    var randomCity, code, country = null;
                    var shapecount = 0;
                    var inc = 0;
                    var particleCount = 0;

                    //判断这个点是否在这个国家。
                    // 注意到如果从P作水平向左的射线的话，如果P在多边形内部，那么这条射线与多边形的交点必为奇数，
                    //如果P在多边形外部，则交点个数必为偶数(0也在内)
                function isPointInPoly(poly, pt) {
                    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
                        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
                        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
                        && (c = !c);
                    return c;
                }

                    //求这个国家的正中心点和周长
                function shapeCentroid(poly) {
                    var totalx = 0, totaly = 0, totalz = 0, perimeter = 0;
                    for (var l = 0; l < poly.length; l++) {
                        totalx += poly[l].x;
                        totaly += poly[l].y;
                        totalz += poly[l].z;
                        if (l < poly.length - 1) {
                            perimeter += Math.sqrt(Math.pow(poly[l].x - poly[l + 1].x, 2) +
                                Math.pow(poly[l].y - poly[l + 1].y, 2) +
                                Math.pow(poly[l].z - poly[l + 1].z, 2));
                        }
                    }
                    return [totalx / poly.length * 0.7, totaly / poly.length * 0.7, totalz / poly.length * 0.7, perimeter];
                }

                    for (var i = 0; i < countryIndex; i++) {//对每个国家
                        //找到对应的country
                        $.each(countries, function (p, o) {
                            if (i == o.id) {
                                country = o;
                                code = p;
                            }
                        });
                        IDs = country.polygons3D;
                        var dotspacing = Math.pow(country.particles / country.area, 0.5) * 40;
                        /* 确定随机粒子分布的方法
                         *
                         * */
                        if (IDs) {
                            var p = 0;
                            while (p < country.particles) {//对每个粒子
                                for (var k = 0; k < IDs.length; k++) {//对每个边界线
                                    countryline = globe.children[2].getObjectById(IDs[k], true);//在globe中寻找到该边界线
                                    test = shapeCentroid(countryline.geometry.vertices);//找到该边界线（国界线）的中心点
                                    for (var j = 0; j < countryline.geometry.vertices.length - 1; j++) {//对边界线上的每个点
                                        r = Math.floor(Math.random() * (countryline.geometry.vertices.length - 1));
                                        vector = countryline.geometry.vertices[r];
                                        vector2 = countryline.geometry.vertices[r + 1];//任取线上两点
                                        AveLen = Math.sqrt(Math.pow(vector.x - vector2.x, 2) + Math.pow(vector.y - vector2.y, 2) + Math.pow(vector.z - vector2.z, 2)) / test[3] * countryline.geometry.vertices.length;
                                        for (var u = 0; u < AveLen; u++) {
                                            rand = Math.random();

                                            newx = -(vector.x + rand * (vector2.x - vector.x)) * 0.7;
                                            newy = (vector.z + rand * (vector2.z - vector.z)) * 0.7;
                                            newz = (vector.y + rand * (vector2.y - vector.y)) * 0.7;
                                            theta = (90 - country.lon) * Math.PI / 180;
                                            phi = (country.lat) * Math.PI / 180 + Math.PI / 2;
                                            //rand=0.5+(Math.random()-0.5)*Math.random();
                                            rand = 0.25 + (Math.random() - 0.25) * Math.random();
                                            offsetX = 0, offsetY = 0, offsetZ = 0;
                                            //对有多个边界线的国家进行分类讨论，确定它们的偏移量
                                            if (k == 1 && code == "CN") offsetZ = 27;
                                            if (k === 9 && code == "RU") offsetZ = 50;
                                            if (k === 0 && code == "MX") {
                                                if (r > 10 && r < 44) {
                                                    offsetX = -60;
                                                    offsetY = -15;
                                                }
                                            }
                                            if (k === 0 && code == "TH") {
                                                if (r > 6 && r < 24) {
                                                    offsetZ = 12;
                                                    offsetY = -3;
                                                }
                                            }
                                            if (k === 0 && code == "IN") offsetY = -15;
                                            if (k === 0 && code == "AE") offsetZ = 3;
                                            if (k === 0 && code == "BR") offsetX = 50;
                                            if (k === 1 && code == "GB") offsetX = 2;
                                            if (k === 5 && code == "US") offsetY = 14;
                                            if (k === 1 && code == "JP") offsetX = -10;
                                            if (k === 10 && code == "CA") offsetZ = 20;
                                            if (k === 2 && code == "IT") {

                                                if (r < 5) offsetZ = -5;
                                                if (r > 25 && r < 35) offsetZ = 5;
                                                if (r > 40 && r < 47) offsetZ = -5;
                                                offsetX = offsetZ;
                                            }
                                            newx2 = -test[0] + (2 * Math.random() - 1) * rand - offsetX;
                                            newy2 = test[2] + (2 * Math.random() - 1) * rand - offsetY;
                                            newz2 = test[1] + (2 * Math.random() - 1) * rand - offsetZ;
                                            //len=Math.sqrt(Math.pow(vector.x-newx2,2)+Math.pow(vector.y-newy2,2)+Math.pow(vector.z-newz2,2));

                                            //mod=1+country.area/150000000;
                                            mod = 1;
                                            newx2 = newx2 * (mod);
                                            newy2 = newy2 * (mod);
                                            newz2 = newz2 * (mod);

                                            if (p < country.particles) {
                                                newpoint = {
                                                    "x": newx + rand * (newx2 - newx),
                                                    "y": newy + rand * (newy2 - newy),
                                                    "z": newz + rand * (newz2 - newz)
                                                };
                                                len = Math.sqrt(newpoint.x * newpoint.x + newpoint.y * newpoint.y + newpoint.z * newpoint.z);

                                                newpoint.x *= globeSize / len;
                                                newpoint.y *= globeSize / len;
                                                newpoint.z *= globeSize / len;
                                                newpoint2 = {"x": test[0], "y": test[2], "z": test[1]}
                                                polytest = false;
                                                if (polytest) {
                                                    destination[v * 3 + 0] = 0;
                                                    destination[v * 3 + 1] = 0;
                                                    destination[v * 3 + 2] = 0;
                                                } else {
                                                    destination[v * 3 + 0] = Math.round(newpoint.x * dotspacing) / dotspacing;
                                                    destination[v * 3 + 1] = Math.round(newpoint.y * dotspacing) / dotspacing;
                                                    destination[v * 3 + 2] = Math.round(newpoint.z * dotspacing) / dotspacing;
                                                }
                                                v++;
                                                p++;
                                            } else {
                                                break;
                                            }

                                        }
                                    }
                                }
                            }
                        } else {
                            for (var r = 0; r < country.particles; r++) {
                                destination[v * 3 + 0] = 0;
                                destination[v * 3 + 1] = 0;
                                destination[v * 3 + 2] = 0;
                                v++;
                            }
                        }
                    }

                    //////////////////////////////////////////////////////////////////////////
                    //////////////////////////////////////////////////////////////////////////
                    //////////////////////////////////////////////////////////////////////////
                    loaded = true;
                    break;

                //普通的塔状视图，可旋转
                case "towers":
                    previousMode = "2D";
                    if (!reset)
                        cameraControls.rotate(-Math.PI / 2, 3 * Math.PI / 4);
                    scene.add(shape);
                    var v = 0;
                    loaded = false;
                    zoomlock = false;
                    var xaxis = 0, yaxis = 0, zaxis = 0;
                    var randomCity, country = null;
                    for (var i = 0; i < countryIndex; i++) {
                        zaxis = 0;
                        $.each(countries, function (p, o) {
                            if (i == o.id) {
                                country = o;
                                code = p;
                            }
                        });
                        xaxis = 0;
                        yaxis = 0;
                        // boxSize = Object.keys(country["products"]).length / 10000;
                        //堆积成长宽各为5的Tower
                        for (var j = 0; j < country.particles; j++) {
                            if (xaxis > 5) {
                                yaxis++;
                                xaxis = 0;
                            }
                            if (yaxis > 5) {
                                zaxis++;
                                yaxis = 0;
                            }
                            destination[v * 3 + 0] = (country.lat) * 1.55 + (xaxis - 2.5) / 3;
                            destination[v * 3 + 1] = (country.lon) * 1.55 + (yaxis - 2.5) / 3;
                            destination[v * 3 + 2] = zaxis / 3;
                            v++;
                            xaxis++;
                        }
                    }
                    loaded = true;
                    break;

                //intro瑞士手表界面，所有的点都以随机的方向远离了
                case "hide":
                    $(".selectionBox").hide();
                    previousMode = "2D";
                    for (var v = particles - 1; v >= 0; v--) {
                        tetha = Math.random() * Math.PI * 2;
                        destination[v * 3 + 0] = 3000 * Math.cos(tetha);
                        destination[v * 3 + 1] = 3000 * Math.sin(tetha);
                        destination[v * 3 + 2] = 0;
                    }
                    loaded = true;
                    break;

                //intro 的初始界面，球模式，点以特定的球随机方式四散开来
                case "wind":
                    previousMode = "3D";
                    cameraControls.globe();
                    var v = 0;
                    increment = 200 + Math.random() * 50;
                    for (var v = particles - 1; v >= 0; v--) {
                        tetha = Math.random() * Math.PI;
                        phi = Math.PI * Math.random() * 2;
                        r = 100 + Math.random() * 600;
                        destination[v * 3 + 0] = r * Math.sin(tetha) * Math.cos(phi);
                        destination[v * 3 + 1] = r * Math.sin(tetha) * Math.sin(phi);
                        destination[v * 3 + 2] = r * Math.cos(tetha);
                    }
                    loaded = true;
                    increment = 500;
                    break;

                //intro中世界是一个经济总体那个正方体的样子
                case "step3":
                    cameraControls.lockRotation(true);
                    $(".selectionBox").hide();
                    previousMode = "2D";
                    var v = 0;
                    loaded = false;
                    zoomlock = true;
                    var xaxis = 0;
                    yaxis = 0;
                    var boxlimit = Math.round(Math.sqrt(particles));
                    for (var i = 0; i < particles; i++) {
                        xaxis += 1;
                        if (xaxis % boxlimit == 0) {
                            yaxis += 1;
                        }
                        destination[i * 3 + 0] = (xaxis - boxlimit * yaxis - boxlimit / 2) / 5.5;
                        destination[i * 3 + 1] = (yaxis - boxlimit / 2) / 5.5 - 35;
                        destination[i * 3 + 2] = 320;
                        v++;
                    }
                    increment = 5;
                    loaded = true;
                    break;

                //intro中瑞士表以后的那一页，一个国家的所有点都被集中到了国家的中心点上
                case "centroids3D":
                    previousMode = "3D";
                    cameraControls.globe();
                    if (!reset)
                        cameraControls.rotate(-Math.PI / 2, Math.PI);
                    var v = 0;
                    loaded = false;
                    zoomlock = false;
                    scene.add(globe);
                    var country = null;
                    var ray = globeSize;
                    globe.rotation.set(Math.PI / 2, Math.PI / 2, 0);

                    particleSystem.position.set(0, 0, 0);
                    var theta, phi;
                    var randomCity, code, country = null;
                    var offsetx = 0, offsety = 0;
                    for (var i = 0; i < countryIndex; i++) {
                        $.each(countries, function (p, o) {
                            if (i == o.id) {
                                country = o;
                                code = p;
                            }
                        });
                        for (var product in country["products"]) {
                            theta = (90 - country.lon) * Math.PI / 180;
                            phi = (country.lat) * Math.PI / 180;
                            ray = globeSize;
                            destination[v * 3 + 0] = ray * Math.sin(theta) * Math.cos(phi);
                            destination[v * 3 + 1] = ray * Math.sin(theta) * Math.sin(phi);
                            destination[v * 3 + 2] = ray * Math.cos(theta);
                            v++;
                        }
                    }
                    loaded = true;
                    break;

                //平面地图点展示（无国家坐标）
                case "blend":
                    previousMode = "2D";
                    scene.add(shape);
                    var v = 0;
                    loaded = false;
                    zoomlock = true;
                    loaded = true;
                    var randomCity, code, country = null, actuator = 1;
                    for (var i = 0; i < countryIndex; i++) {
                        $.each(countries, function (p, o) {
                            if (i == o.id) {
                                country = o;
                                code = p;
                            }
                        });
                        state = anchors[code];
                        for (var j = 0; j < country.particles; j++) {
                            if (state) {
                                actuator = 2 + Math.random() * 100;
                                randomCity = state[Math.round(Math.random() * (state.length - 1))];
                                destination[v * 3 + 0] = (randomCity["lon"] + (country.lat - randomCity["lon"]) / actuator) * 1.55 + Math.random() - 0.5;
                                destination[v * 3 + 1] = (randomCity["lat"] + (country.lon - randomCity["lat"]) / actuator) * 1.55 + Math.random() - 0.5;
                                destination[v * 3 + 2] = 0;
                            }
                            v++;
                        }
                    }
                    break;

                //2D平面Tower展示，不可旋转
                case "centroid":
                    previousMode = "2D";
                    scene.add(shape);
                    var v = 0;
                    loaded = false;
                    zoomlock = true;
                    var xaxis = 0, yaxis = 0;
                    var randomCity, country = null;

                    for (var i = 0; i < countryIndex; i++) {
                        $.each(countries, function (p, o) {
                            if (i == o.id) {
                                country = o;
                                code = p;
                            }
                        });
                        xaxis = 0;
                        yaxis = 0;
                        boxSize = Object.keys(country["products"]).length / 10000;
                        for (var j = 0; j < country.particles; j++) {
                            xaxis++;
                            if (xaxis > 20) {
                                yaxis++;
                                xaxis = 0;
                            }
                            destination[v * 3 + 0] = (country.lat) * 1.55 + xaxis * boxSize + Math.random() * boxSize * 0.9;
                            destination[v * 3 + 1] = (country.lon) * 1.55 + yaxis * boxSize + Math.random() * boxSize * 0.9;
                            destination[v * 3 + 2] = 0;
                            v++;
                        }
                    }
                    loaded = true;
                    break;

                //哈哈有点搞笑，每个国家用饼环展示，很丑
                case "pies":
                    previousMode = "2D";
                    scene.add(shape);
                    var v = 0;
                    loaded = false;
                    zoomlock = true;
                    var ray, tetha, total;
                    var randomCity, country = null, actuator = 1;
                    var code;
                    for (var i = 0; i < countryIndex; i++) {
                        $.each(countries, function (p, o) {
                            if (i == o.id) {
                                country = o;
                                code = p;
                            }
                        });
                        if (country) {
                            total = 0;
                            for (var key in country["products"]) {
                                ray = country["exports"] / dollars / 1000;
                                for (var s = 0; s < Math.round(country["products"][key] / dollars); s++) {
                                    tetha = (total + country["products"][key] * Math.random()) / country["exports"] * Math.PI * 2;
                                    destination[v * 3 + 0] = country.lat * 1.55 + ray * Math.cos(tetha);
                                    destination[v * 3 + 1] = country.lon * 1.55 + ray * Math.sin(tetha);
                                    destination[v * 3 + 2] = 0;
                                    v++;
                                }
                                total += country["products"][key];
                            }
                        }

                    }

                    loaded = true;
                    break;

                //将点按照城市进行分布而不是按照平均分布
                case "cities":
                    previousMode = "2D";
                    scene.add(shape);
                    var v = 0;

                    loaded = false;
                    zoomlock = true;
                    var randomCity, code, country = null;
                    for (var i = 0; i < countryIndex; i++) {
                        $.each(countries, function (p, o) {
                            if (i == o.id) {
                                country = o;
                                code = p;
                            }
                        });
                        state = anchors[code];
                        for (var j = 0; j < country.particles; j++) {
                            if (state) {
                                randomCity = state[Math.round(Math.random() * (state.length - 1))];//随意选择一个城市编号
                                destination[v * 3 + 0] = (randomCity["lon"]) * 1.55;
                                destination[v * 3 + 1] = (randomCity["lat"]) * 1.55;
                                destination[v * 3 + 2] = Math.random();
                            }
                            v++;
                        }
                    }
                    loaded = true;
                    break;

                //球状,按城市分布
                case "probability3D":
                    previousMode = "3D";
                    cameraControls.globe();
                    if (!reset)
                        cameraControls.rotate(-Math.PI / 2, Math.PI);
                    var v = 0;
                    loaded = false;
                    zoomlock = false;
                    scene.add(globe);
                    var randomCity, country = null;
                    var ray = globeSize;
                    //particleSystem.rotation.set(-Math.PI/2,0,-Math.PI/2);
                    globe.rotation.set(Math.PI / 2, Math.PI / 2, 0);

                    particleSystem.position.set(0, 0, 0);
                    var theta, phi;
                    var randomCity, code, country = null;

                    for (var i = 0; i < countryIndex; i++) {
                        $.each(countries, function (p, o) {
                            if (i == o.id) {
                                country = o;
                                code = p;
                            }
                        });
                        state = anchors[code];
                        if (country && state) {
                            for (var product in country["products"]) {
                                prob = categories[products[product].color].probabilities;
                                cityLimit = state.length;
                                selection = 0;

                                for (var s = 0; s < Math.round(country["products"][product] / dollars); s++) {
                                    selection = 0;
                                    rand = Math.random();
                                    //随机选择一个城市布置点，只是每个城市被选择的概率和它的prob有关
                                    for (var r = 0; r < prob.length; r++) {
                                        selection += prob[r];
                                        if (selection > rand) break;
                                    }
                                    randomCity = state[Math.floor((r + rand) / 20 * state.length)];
                                    theta = (90 - randomCity["lat"] + Math.random() / 20 * (country.lon - randomCity["lat"])) * Math.PI / 180;
                                    phi = (randomCity["lon"] + Math.random() / 20 * (country.lat - randomCity["lon"])) * Math.PI / 180;
                                    ray = globeSize;


                                    actuator = 2 + Math.random() * 500;
                                    // phi = ((randomCity["lon"] + (country.lat - randomCity["lon"]) / actuator)) * Math.PI / 180;
                                    // theta = ((randomCity["lat"] + (country.lon - randomCity["lat"]) / actuator)) * Math.PI / 180;

                                    destination[v * 3 + 0] = ray * Math.sin(theta) * Math.cos(phi) + (Math.random() - 0.5) / 2;
                                    destination[v * 3 + 1] = ray * Math.sin(theta) * Math.sin(phi) + (Math.random() - 0.5) / 2;
                                    destination[v * 3 + 2] = ray * Math.cos(theta) + (Math.random() - 0.5) / 2;
                                    v++;
                                }
                            }
                        }
                    }
                    loaded = true;
                    break;

                //平面地图按照城市分布进行分布，比较集中，不好看
                case "probability":
                    previousMode = "2D";
                    scene.add(shape);
                    var v = 0;
                    loaded = false;
                    zoomlock = true;
                    var randomCity, country = null;
                    var colors = {};
                    var count = 0;
                    var xaxis = 0;
                    yaxis = 0;
                    for (var i = 0; i < countryIndex; i++) {
                        $.each(countries, function (p, o) {
                            if (i == o.id) {
                                country = o;
                                code = p;
                            }
                        });
                        state = anchors[code];
                        if (country && state) {
                            for (var product in country["products"]) {
                                prob = categories[products[product].color].probabilities;
                                cityLimit = state.length;
                                selection = 0;

                                for (var s = 0; s < Math.round(country["products"][product] / dollars); s++) {
                                    selection = 0;
                                    rand = Math.random();
                                    for (var r = 0; r < prob.length; r++) {
                                        selection += prob[r];
                                        if (selection > rand) break;
                                    }
                                    randomCity = state[Math.floor((r + rand) / 20 * state.length)];
                                    tetha = Math.PI * 2 * Math.random();
                                    destination[v * 3 + 0] = randomCity["lon"] * 1.55 - tetha * (randomCity["lon"] - country.lat) / 100 + rand * 2 - 1;
                                    destination[v * 3 + 1] = randomCity["lat"] * 1.55 - tetha * (randomCity["lat"] - country.lon) / 100 + Math.random() - 0.5;
                                    destination[v * 3 + 2] = Math.random() * 3;
                                    v++;
                                    //console.log(colors[products[product].color]+" "+colors[products[product].color]%5+" "+colors[products[product].color]%5)
                                }
                            }
                        }

                    }
                    loaded = true;
                    break;

                //按照城市分布简单的确定位置，3D
                case "globe":
                    previousMode = "3D";
                    cameraControls.globe();
                    if (!reset) {
                        cameraControls.rotate(-Math.PI / 2, Math.PI);
                        globe.rotation.set(Math.PI / 2, Math.PI / 2, 0);
                    }
                    var v = 0;
                    loaded = false;
                    zoomlock = false;
                    scene.add(globe);
                    var randomCity, country = null;
                    var ray = globeSize;
                    //particleSystem.rotation.set(-Math.PI/2,0,-Math.PI/2);


                    particleSystem.position.set(0, 0, 0);
                    var theta, phi;
                    var randomCity, code, country = null;
                    for (var i = 0; i < countryIndex; i++) {
                        $.each(countries, function (p, o) {
                            if (i == o.id) {
                                country = o;
                                code = p;
                            }
                        });
                        state = anchors[code];
                        for (var j = 0; j < country.particles; j++) {
                            ray = globeSize + Math.random() / 100;
                            if (state) {
                                randomCity = state[Math.round(Math.random() * (state.length - 1))];
                                theta = (90 - randomCity["lat"]) * Math.PI / 180 + (1 - Math.random() * 2) / 200;
                                phi = (randomCity["lon"]) * Math.PI / 180 + (1 - Math.random() * 2) / 200;
                                destination[v * 3 + 0] = ray * Math.sin(theta) * Math.cos(phi);
                                destination[v * 3 + 1] = ray * Math.sin(theta) * Math.sin(phi);
                                destination[v * 3 + 2] = ray * Math.cos(theta);
                            }
                            v++;
                        }


                    }
                    loaded = true;
                    break;

                //二维产品空间
                case "productspace":
                    cameraControls.lockRotation(true);
                    cameraControls.center(-45, 0, 10);
                    increment = 0;
                    previousMode = "2D";
                    var state = "", yaxis = 0, xaxis = 0;
                    v = 0;
                    loaded = false;
                    var ray = 2;
                    var theta = 0;
                    $.each(countries, function (i, val) {//对每个国家
                        for (var key in val["products"]) {//该国家里的product分量（即product编号和产量）
                            productValue = val["products"][key];
                            productInfo = products[key];
                            color = new THREE.Color(productInfo.color);
                            //对每个国家的每个产品的出口量，以一个点代替1 'dollars'那么多的量进行描点，下面是点的位置确认
                            for (var s = 0; s < Math.round(productValue / dollars); s++) {
                                tetha = Math.random() * Math.PI * 2;
                                if (!filterCountry || filterCountry == i) {
                                    destination[v * 3 + 0] = productInfo.x + ray * (1 - Math.random() * Math.random()) * Math.cos(tetha);
                                    destination[v * 3 + 1] = productInfo.y + ray * (1 - Math.random() * Math.random()) * Math.sin(tetha);
                                    destination[v * 3 + 2] = 0;

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
                    break;

                //三维产品空间
                case "productsphere":
                    scene.fog = new THREE.FogExp2(0x000000, 0.002);
                    increment = 0;
                    previousMode = "3D";
                    cameraControls.globe();
                    if (!reset) {
                        cameraControls.rotate(-Math.PI / 2, Math.PI);
                        cameraControls.setZoom(600);
                    }
                    var v = 0;

                    var country, code, productInfo;
                    var tetha = 0, phi = 0;
                    loaded = false;
                    for (var i = 0; i < countryIndex; i++) {
                        $.each(countries, function (p, o) {
                            if (i == o.id) {
                                country = o;
                                code = p;
                            }
                        });
                        for (var product in country["products"]) {
                            productInfo = products[product];
                            lim = Math.round(country["products"][product] / dollars);
                            for (var s = 0; s < lim; s++) {
                                tetha = s / lim * Math.PI;
                                phi = s / lim * Math.PI * 24;
                                if (productInfo.x3 && (!filterCountry || filterCountry == code)) {
                                    destination[v * 3 + 0] = productInfo.x3 + nodeSize / 30 * Math.sin(tetha) * Math.cos(phi);
                                    destination[v * 3 + 1] = productInfo.y3 + nodeSize / 30 * Math.sin(tetha) * Math.sin(phi);
                                    destination[v * 3 + 2] = productInfo.z3 + nodeSize / 30 * Math.cos(tetha);
                                } else {
                                    destination[v * 3 + 0] = 0;
                                    destination[v * 3 + 1] = 0;
                                    destination[v * 3 + 2] = 10000;
                                }
                                v++;

                            }
                        }
                    }
                    addProductLinks(true, false);
                    loaded = true;
                    increment = 6;

                    break;

                //产品空间Tower
                case "productspace3D":
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
                    break;

                //按照产品种类进行分组展示
                case "groupby":
                    previousMode = "2D";
                    $(".selectionBox").hide();
                    var v = 0;
                    loaded = false;
                    zoomlock = true;
                    var randomCity, country = null;
                    var colors = {};
                    var count = 0;
                    var xaxis = 0;
                    yaxis = 0;
                    for (var i = 0; i < countryIndex; i++) {
                        $.each(countries, function (p, o) {
                            if (i == o.id) {
                                country = o;
                                code = p;
                            }
                        });
                        state = anchors[code];
                        if (country && state) {
                            for (var product in country["products"]) {
                                xaxis = categories[products[product].color].id;
                                yaxis = Math.floor(xaxis / 5);
                                xaxis -= yaxis * 5;

                                for (var s = 0; s < Math.round(country["products"][product] / dollars); s++) {
                                    randomCity = state[Math.round(Math.random() * (state.length - 1))];

                                    destination[v * 3 + 0] = (randomCity["lon"]) / 3.5 + (xaxis) * 100 - window.innerWidth / 8;
                                    destination[v * 3 + 1] = (randomCity["lat"]) / 3.5 + (2 - yaxis) * 100 - window.innerHeight / 8;
                                    destination[v * 3 + 2] = 0;
                                    v++;
                                }
                            }
                        }
                    }
                    loaded = true;
                    break;

                case "groupbyC":
                    $(".selectionBox").hide();
                    previousMode = "2D";
                    var count = 0;
                    var v = 0;
                    loaded = false;
                    var total = 0;
                    boxSize = (window.innerWidth - 200) / Object.keys(products).length;

                    $.each(countries, function (i, val) {
                        for (var key in val["products"]) {
                            count++;
                            productInfo = products[key];
                            for (var s = 0; s < Math.round(val["products"][key] / dollars); s++) {
                                destination[v * 3 + 0] = 100 + i * boxSize + Math.random() * boxSize * 0.9;
                                destination[v * 3 + 1] = productInfo.sales / dollars / 100 * Math.random();
                                destination[v * 3 + 2] = 0;
                                v++;
                            }
                        }
                    });
                    loaded = true;
                    break;

                case "treemap":

                    break;

                //对不同的国家进行柱状统计图展示
                case "histogram":
                    previousMode = "2D";
                    var v = 0;
                    loaded = false;
                    zoomlock = true;
                    var xaxis = 0, yaxis = 0;
                    var randomCity, country = null;
                    var maxX = window.innerWidth, maxY = window.innerHeight;
                    for (var i = 0; i < countryIndex; i++) {
                        $.each(countries, function (p, o) {
                            if (i == o.id) {
                                country = o;
                                code = p;
                            }
                        });
                        xaxis = 0;
                        yaxis = 0;
                        boxSize = Object.keys(country["products"]).length / 5200;
                        increment = (maxX) / countryIndex / 2;
                        for (var j = 0; j < country.particles; j++) {
                            xaxis++;
                            if (xaxis > 20) {
                                yaxis++;
                                xaxis = 0;
                            }
                            destination[v * 3 + 0] = (i * increment + xaxis * boxSize + Math.random() * boxSize - maxX / 4) * 0.8;
                            destination[v * 3 + 1] = yaxis * boxSize + Math.random() * boxSize - maxY / 8;
                            destination[v * 3 + 2] = 0;
                            v++;
                        }
                    }
                    loaded = true;
                    break;

            }
        }
        particlesPlaced = 0;
        currentSetup = to;
        if (!storyMode) $("#atlasBox").stop().fadeIn();
        if (currentSetup === "productspace" || currentSetup === "productspace3D" || currentSetup === "productsphere") {
            // $("#atlasBox").stop().fadeOut();
            $("#countrySection").hide();
            $("#productSection").show();

        } else {
            $("#atlasBox").stop().fadeIn();
            $("#countrySection").show();
            $("#productSection").hide();
        }
        hideCategories();
    }

    //点击选择框的时候switch到的内容所调用的方法
    $("#UI").on("click", ".modeSelector", function () {
        $(".modeSelector").removeClass("selectedMode");
        $(this).addClass("selectedMode");
        switch ($(this).prop('id')) {
            case "mapButton":
                switcher("map", false, 5);
                break;
            case "globeButton":
                switcher("globe", false, 5);
                break;
            case "globeProbaButton":
                switcher("probability3D", false, 5);
                break;
            case "hideButton":
                switcher("hide", false, 5);
                break;
            case "anchorButton":
                switcher("cities", false, 5);
                break;
            case "probaButton":
                switcher("probability", false, 5);
                break;
            case "blendButton":
                switcher("blend", false, 5);
                break;
            case "centerButton":
                switcher("centroid", false, 5);
                break;
            case "towersButton":
                switcher("towers", false, 5);
                break;
            case "histButton":
                switcher("histogram", false, 5);
                break;
            case "groupButton":
                switcher("groupby", false, 5);
                break;
            case "groupCButton":
                switcher("groupbyC", false, 5);
                break;
            case "groupCButton":
                switcher("groupbyc", false, 5);
                break;
            case "rankButton":
                switcher("rank", false, 5);
                break;
            case "locationButton":
                switcher("locationRank", false, 5);
                break;
            case "circleButton":
                switcher("circles", false, 5);
                break;
            case "pieButton":
                switcher("pie", false, 5);
                break;
            case "piesButton":
                switcher("pies", false, 5);
                break;
            case "gridSphereButton":
                switcher("gridSphere", false, 5);
                break;
            case "gridButton":
                switcher("gridmap", false, 5);
                break;
            case "productButton":
                switcher("productspace", false, 5);
                $(".countrySelection").select2("val", null);
                break;
            case "productButton2":
                switcher("productspace3D", false, 5);
                $(".countrySelection").select2("val", null);
                break;
            case "productButton3":
                switcher("productsphere", false, 5);
                $(".countrySelection").select2("val", null);
                break;
        }
    });

    /*下面的是story模式的时候的一些方法*/
    $("#skipStoryLine").click(function () {
        storyMode = false;
        exitStoryline();
    });

    //点击story模式按钮的时候
    $("#storyline").click(function () {
        if (storyMode) {
            exitStoryline();
        } else {
            StoryLine();
        }
    });

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

    //选择国家
    $("#countries").on('click', '.chosenCountry', function () {
        if (!storyMode) {
            $(".countrySelection").select2("val", $(this).prop('id'));
        }
    });

    $("#countries").on('mouseout', '.chosenCountry', function () {
        hoverHTML = $(this).html();
        $(this).html(hoverHTML.substring(0, hoverHTML.length - 8));
    });

    $("#countries").on('mouseover', '.chosenCountry', function () {
        hoverHTML = $(this).html();
        hoverHTML += "(点击查看连线)";
        $(this).html(hoverHTML);

        selectedCountry = $(this).prop("id");
        highLightCountry(countries[selectedCountry], true);

        $("#pointer").css({top: -100, left: 0});

    });

    //改变整体色调
    $("#backgroundButton").click(function () {
        darkMode = !darkMode;
        if (darkMode) {
            // Particlelinks.changeColor(0xffffff);

            scene.fog = new THREE.FogExp2(0x000000, 0.001);
            renderer.setClearColor(0x080808);
            globe.children[0].material.color.setHex(0x000000);
            $('body').css('background-color', 'black');
            $("a:link,a:visited,a:hover").css('color', '#E0E0E0');
            $("#countries").css({
                'background-color': 'rgba(0,0,0,0.6)',
                'color': 'white'
            });
            // $("#categories").css('background-color', 'rgba(0,0,0,0.6)');
            $(".chosenCountry").css('background-color', 'rgba(0,0,0,0.6)');
            // $(".chooseCategory").css({
            //     'background-color': '#FFFFFF',
            //     'color': '#080808'
            // });
            // $('.categoryButton').css('color', 'white');
            $(".chosenButton").css('color', 'white');
            // $(".categorySelected").css({
            //     'background-color': 'white',
            //     'color': '#080808'
            // });
            $(".title,.titleup,.titleTop,.titleTop2").css('color', '#FFFFFF');
            $(".subtitle，.subtitle2").css('color', '#DDD');
            $("#pointer,#upperBar,#bottomBar").css('background-color', 'rgba(0,0,0,0.6)');
            $("#watchsvg").css('fill', 'white');
            $("#annotation").css({
                'color': 'white',
                'background-color': 'rgba(0,0,0,0.8)'
            });
            $("#description,#choice,#beginExplore,#beginStory").css('color', 'white');
            $("#storyline,#fullscreen,#showAbout,#showLabels,#contrastbutton,#backgroundButton").css({
                'color': 'white',
                'border-top': '1px solid #121314',
                'border-bottom': '1px solid #121314'
            });
            $("#aboutText").css({
                'background': 'rgba(0,0,0,0.8)',
                'color': 'white'
            });
            $("#storyline:hover,#fullscreen:hover,#showAbout:hover,#showLabels:hover,#contrastbutton:hover,#backgroundButton:hover").css('border-right', '2px solid #FFF')
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


            //select2
            $(".select2-dropdown .select2-close-mask .select2-container--default .select2-selection--single").css('background-color', 'black');
            $('.select2-container--default .select2-selection--single').css('border', '1px solid #303030');
            $('.select2-container--default .select2-selection--single .select2-selection__rendered').css('color', '#EEE');
            $('.select2-container--default .select2-selection--single .select2-selection__placeholder').css('color', '#EEE');
            $('.select2-container--default.select2-container--disabled .select2-selection--single').css('background-color', '#EEE');
            $('.select2-container--default .select2-selection--multiple').css({
                'background-color': 'black',
                'border': '1px solid #aaa'
            });
            $('.select2-container--default .select2-selection--multiple .select2-selection__placeholder').css('color', '#EEE');
            $('.select2-container--default .select2-selection--multiple .select2-selection__choice').css({
                'background-color': '#e4e4e4',
                'border': '1px solid #aaa'
            });
            $('.select2-container--default .select2-selection--multiple .select2-selection__choice__remove').css('color', '#eee');
            $('.select2-container--default.select2-container--focus .select2-selection--multiple').css('border', 'solid black 1px');
            $('.select2-container--default.select2-container--disabled .select2-selection--multiple').css('background-color', '#eee');
            $('.select2-container--default .select2-search--dropdown .select2-search__field').css('border', '1px solid #aaa');
            $('.select2-container--default .select2-results__option[aria-disabled=true]').css('background-color', '#080808');
            $('.select2-container--default .select2-results__option--highlighted[aria-selected]').css('border-right', '2px solid #FFF');
            $('.select2-container--classic .select2-selection--single').css({
                'background-color': '#f6f6f6',
                'border': '1px solid #aaa',
                'background-image': 'linear-gradient(to bottom, #ffffff 50%, #eeeeee 100%)',
                'filter': "progid: DXImageTransform.Microsoft.gradient(startColorstr='#ffffff', endColorstr='#eeeeee', GradientType=0)"
            });
            $('.select2-container--classic .select2-selection--single:focus').css('border', '1px solid #ffffff');
            $('.select2-container--classic .select2-selection--single .select2-selection__rendered').css('color', '#eee');
            $('.select2-container--classic .select2-selection--single .select2-selection__placeholder').css('color', '#eee');
            $('.select2-container--classic .select2-selection--single .select2-selection__arrow').css({
                'background-color': '#ddd',
                'border-left': '1px solid #aaa',
                'background-image': 'linear-gradient(to bottom, #eeeeee 50%, #cccccc 100%)',
                'filter': "progid: DXImageTransform.Microsoft.gradient(startColorstr='#eeeeee', endColorstr='#cccccc', GradientType=0)"
            });
            $('.select2-container--classic .select2-selection--single .select2-selection__arrow b').css('border-color', '#303030 transparent transparent transparent');
            $('.select2-container--classic[dir="rtl"] .select2-selection--single .select2-selection__arrow').css('border-right', '1px solid #aaa');
            $('.select2-container--classic.select2-container--open .select2-selection--single').css('border', '1px solid #ffffff');
            $('.select2-container--classic.select2-container--open .select2-selection--single .select2-selection__arrow b').css('border-color', 'transparent transparent #303030 transparent');
            $('.select2-container--classic.select2-container--open.select2-container--above .select2-selection--single').css({
                'background-image': 'linear-gradient(to bottom, #ffffff 0%, #eeeeee 50%)',
                "filter": "progid: DXImageTransform.Microsoft.gradient(startColorstr='#ffffff', endColorstr='#eeeeee', GradientType=0)"
            });
            $('.select2-container--classic.select2-container--open.select2-container--below .select2-selection--single').css({
                'background-image': 'linear-gradient(to bottom, #eeeeee 50%, #ffffff 100%)',
                'filter': "progid: DXImageTransform.Microsoft.gradient(startColorstr='#eeeeee', endColorstr='#ffffff', GradientType=0)"
            });
            $('.select2-container--classic .select2-selection--multiple').css('background-color', 'black');
            $('.select2-container--classic .select2-selection--multiple:focus').css('border', '1px solid #303030');
            $('.select2-container--classic .select2-selection--multiple .select2-selection__choice').css('background-color', '#e4e4e4');
            $('.select2-container--classic .select2-selection--multiple .select2-selection__choice__remove').css('color', '#eee');
            $('.select2-container--classic .select2-selection--multiple .select2-selection__choice__remove:hover').css('color', '#eee');
            $('.select2-container--classic .select2-dropdown').css('background-color', 'black');
            $('.select2-container--classic .select2-results__option[aria-disabled=true]').css('color', 'white');
            $('.select2-container--classic .select2-results__option--highlighted[aria-selected]').css('color', 'black');
            $('.select2-container--classic.select2-container--open .select2-dropdown').css('border-color', '#ffffff');


        } else {
            // Particlelinks.changeColor(0x00ff00);
            scene.fog = new THREE.FogExp2(0x0000ff, 0.001);
            // scene.fog.color.setHex(0x00ffff);
            renderer.setClearColor(0xe4e4e4);//背景色
            globe.children[0].material.color.setHex(0x0086a7);//球
            $('body').css('background-color', '#FFFFFF');
            $("a:link,a:visited,a:hover").css('color', '#000');
            $("#countries").css({
                'background-color': 'rgba(255,255,255,0.6)',
                'color': 'black'
            });
            // $("#categories").css('background-color', 'rgba(255,255,255,0.6)');
            $(".chosenCountry").css('background-color', 'rgba(255,255,255,0.6)');
            // $(".chooseCategory").css({
            //     'background-color': '#000000',
            //     'color': '#FFFFFF'
            // });
            // $('.categoryButton').css('color', 'white');
            $(".chosenButton").css('color', 'black');
            // $(".categorySelected").css({
            //     'background-color': 'black',
            //     'color': 'white'
            // });
            $(".title,.titleup,.titleTop,.titleTop2").css('color', '#000000');
            $(".subtitle2,.subtitle").css('color', '#EEE');
            $("#pointer,#upperBar,#bottomBar").css('background-color', 'rgba(255,255,255,0.6)');
            $("#watchsvg").css('fill', 'black');
            $("#annotation").css({
                'color': 'black',
                'background-color': 'rgba(255,255,255,0.8)'
            });
            $("#description,#choice,#beginExplore,#beginStory").css('color', 'black');
            $("#storyline,#fullscreen,#showAbout,#showLabels,#contrastbutton,#backgroundButton").css({
                'color': 'black',
                'border-top': '1px solid #000000',
                'border-bottom': '1px solid #000000'
            });
            $("#aboutText").css({
                'background': 'rgba(255,255,255,0.8)',
                'color': 'black'
            });
            $("#storyline:hover,#fullscreen:hover,#showAbout:hover,#showLabels:hover,#contrastbutton:hover,#backgroundButton:hover").css('border-right', '2px solid #000');
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


            //select2
            $('.t').css('color', '#aaa');
            $(".select2-dropdown .select2-close-mask .select2-container--default .select2-selection--single").css('background-color', 'white');
            // $('.select2-container--default .select2-selection--single').css('border', '1px solid #303030');
            $('.select2-container--default .select2-selection--single .select2-selection__rendered').css('color', '#222');
            $('.select2-container--default .select2-selection--single .select2-selection__placeholder').css('color', '#222');
            $('.select2-container--default.select2-container--disabled .select2-selection--single').css('background-color', '#222');
            $('.select2-container--default .select2-selection--multiple').css({
                'background-color': 'white',
                'border': '1px solid #aaa'
            });
            $('.select2-container--default .select2-selection--multiple .select2-selection__placeholder').css('color', '#222');
            $('.select2-container--default .select2-selection--multiple .select2-selection__choice').css({
                'background-color': '#2a2a2a',
                'border': '1px solid #444'
            });
            $('.select2-container--default .select2-selection--multiple .select2-selection__choice__remove').css('color', '#222');
            $('.select2-container--default.select2-container--focus .select2-selection--multiple').css('border', 'solid white 1px');
            $('.select2-container--default.select2-container--disabled .select2-selection--multiple').css('background-color', '#222');
            $('.select2-container--default .select2-search--dropdown .select2-search__field').css('border', '1px solid #444');
            $('.select2-container--default .select2-results__option[aria-disabled=true]').css('background-color', '#fafafa');
            $('.select2-container--default .select2-results__option--highlighted[aria-selected]').css('border-right', '2px solid #000');
            $('.select2-container--classic .select2-selection--single').css({
                'background-color': '#090909',
                'border': '1px solid #444',
                'background-image': 'linear-gradient(to bottom, #000000 50%, #444444 100%)',
                'filter': "progid: DXImageTransform.Microsoft.gradient(startColorstr='#111111', endColorstr='#444444', GradientType=0)"
            });
            $('.select2-container--classic .select2-selection--single:focus').css('border', '1px solid #000');
            $('.select2-container--classic .select2-selection--single .select2-selection__rendered').css('color', '#222');
            $('.select2-container--classic .select2-selection--single .select2-selection__placeholder').css('color', '#222');
            $('.select2-container--classic .select2-selection--single .select2-selection__arrow').css({
                'background-color': '#333',
                'border-left': '1px solid #444',
                'background-image': 'linear-gradient(to bottom, #222 50%, #444 100%)',
                'filter': "progid: DXImageTransform.Microsoft.gradient(startColorstr='#222', endColorstr='#444', GradientType=0)"
            });
            $('.select2-container--classic .select2-selection--single .select2-selection__arrow b').css('border-color', '#c0c0c0 transparent transparent transparent');
            $('.select2-container--classic[dir="rtl"] .select2-selection--single .select2-selection__arrow').css('border-right', '1px solid #555');
            $('.select2-container--classic.select2-container--open .select2-selection--single').css('border', '1px solid #000');
            $('.select2-container--classic.select2-container--open .select2-selection--single .select2-selection__arrow b').css('border-color', 'transparent transparent #cfcfcf transparent');
            $('.select2-container--classic.select2-container--open.select2-container--above .select2-selection--single').css({
                'background-image': 'linear-gradient(to bottom, #000 0%, #222 50%)',
                "filter": "progid: DXImageTransform.Microsoft.gradient(startColorstr='#000', endColorstr='#222', GradientType=0)"
            });
            $('.select2-container--classic.select2-container--open.select2-container--below .select2-selection--single').css({
                'background-image': 'linear-gradient(to bottom, #222 50%, #000 100%)',
                'filter': "progid: DXImageTransform.Microsoft.gradient(startColorstr='#222', endColorstr='#000', GradientType=0)"
            });
            $('.select2-container--classic .select2-selection--multiple').css('background-color', 'white');
            $('.select2-container--classic .select2-selection--multiple:focus').css('border', '1px solid #dfdfdf');
            $('.select2-container--classic .select2-selection--multiple .select2-selection__choice').css('background-color', '#2a2a2a');
            $('.select2-container--classic .select2-selection--multiple .select2-selection__choice__remove').css('color', '#222');
            $('.select2-container--classic .select2-selection--multiple .select2-selection__choice__remove:hover').css('color', '#222');
            $('.select2-container--classic .select2-dropdown').css('background-color', 'white');
            $('.select2-container--classic .select2-results__option[aria-disabled=true]').css('color', 'black');
            $('.select2-container--classic .select2-results__option--highlighted[aria-selected]').css('color', 'white');
            $('.select2-container--classic.select2-container--open .select2-dropdown').css('border-color', '#000');
        }
    });


    $('#nextButton').on("click", function () {
        StoryLine()
    });

    $('.titleTop2').click(function () {
        positions = geometry.attributes.position.array;
        for (var v = 0; v < particles; v++) {
            positions[v * 3 + 2] = 3000;
        }
        increment = 3;
    });

    $("#storyPrompt").on("click", "#beginExplore", function () {
        $("#storyPrompt").stop().fadeOut();
        cameraControls.loaded();
        $("#UI").fadeIn();
        values = parseURL.decode_url();
        if (values.length != 0) {
            switch (values[0][1]) {
                case "gridSphere":
                case "gridmap":
                case "towers":
                    switcher(values[0][1], false, 25);
                    filterCountry = values[1][1];
                    targetCountry(values[1][1], true, true);
                    break;
                case "productsphere":
                case "productspace":
                case "productspace3D":
                    switcher(values[0][1], false, 25);
                    filterProduct = values[1][1];
                    targetNode(products[values[1][1]]);
                    break;
            }
        }
    });

    $("#storyPrompt").on("click", "#beginStory", function () {
        cameraControls.loaded();
        $("#UI").fadeIn();
        $("#storyPrompt").stop().stop().fadeOut();
        switcher("gridSphere");
        StoryLine();
    });

    //高亮与正常模式之间的切换
    $("#contrastbutton").click(function () {
        if (!contrast) {
            $(this).html("正常");
            contrast = true;
            constantSize = true;
            changePointSize(3);
            lines = shape.children[0];
            for (var i = 0; i < lines.children.length; i++) {
                lines.children[i].material.linewidth = 6
            }
            lines = globe.children[2];
            for (var i = 0; i < lines.children.length; i++) {
                lines.children[i].material.linewidth = 6
            }

        } else {
            $(this).html("高亮");
            contrast = false;
            constantSize = false;

            lines = shape.children[0];
            for (var i = 0; i < lines.children.length; i++) {
                lines.children[i].material.linewidth = 2
            }
            lines = globe.children[2];
            for (var i = 0; i < lines.children.length; i++) {
                lines.children[i].material.linewidth = 2
            }
            animatePointSize(true);
        }
    });

    //根据当前的比例尺设定point的大小
    function animatePointSize(reset) {
        if (currentSetup !== "productspace" && currentSetup !== "productsphere" && currentSetup !== "productspace3D" && !constantSize) {
            if (previousMode === "2D")
                testZoom = Math.round(Math.log(431 - particleSystem.position.z));
            else {
                zoom = Math.sqrt(Math.pow(camera.position.x, 2) + Math.pow(camera.position.y, 2) + Math.pow(camera.position.z, 2));
                testZoom = Math.round(Math.log(zoom - globeSize - 20));
            }
            levels = [0.23, 0.23, 0.4, 0.8, 1, 1.3, 1.35, 1.38, 1.4, 1.41, 1.413, 1.4];
            if (testZoom !== currentZoom || reset) {
                currentZoom = testZoom;
                var sizes = geometry.attributes.size.array;
                for (var v = 0; v < particles / percentage; v++) {
                    sizes[v] = levels[currentZoom];
                }
                geometry.attributes.size.needsUpdate = true;
            }
        }
    }

    //改变点的大小，在产品空间的时候不起作用
    function changePointSize(size) {
        if (currentSetup !== "productspace" && currentSetup !== "productsphere" && currentSetup !== "productspace3D") {
            var sizes = geometry.attributes.size.array;
            for (var v = 0; v < particles / percentage; v++) {
                sizes[v] = size;
            }
            geometry.attributes.size.needsUpdate = true;
        }
    }

    //进入story状态
    function StoryLine() {
        $("#sideBar").stop().fadeOut();
        $("#categories").stop().fadeOut();
        $("#annotation").stop().fadeIn();
        $("#nextlevel").stop().fadeIn();
        $("#pointer").css({top: -100, left: 0});
        $("#storyline").html("◙ 停止动画");

        Labels.setLabels(false);
        storyMode = true;
        filterCountry = null;

        var story = [
            {
                "div": 1,
                "setup": "wind",
                "delay": 3,
                "title": "经济复杂性的全球化",
                "subtitle": "本网站通过对每个国家的出口商品的可视化来说明各国的经济发展程度"
            },
            {
                "div": 2,
                "setup": "step3",
                "delay": 4,
                "title": "这是世界的总体经济",
                "subtitle": "每个像素都代表不同的产品"
            },
            {
                "div": 3,
                "setup": "hide",
                "delay": 3,
                "title": "以瑞士手表做对照",
                "subtitle": "瑞士手表的均价是 $685"
            },
            {
                "div": 4,
                "setup": "centroids3D",
                "delay": 5,
                "title": "每个点代表 1 亿的贸易额",
                "subtitle": "相当于 150000 个瑞士手表"
            },
            {
                "div": 5,
                "setup": "gridSphere",
                "delay": 5,
                "title": "每种颜色代表一个行业",
                "subtitle": "手表占瑞士出口额的 5%"
            },
            {
                "div": 6,
                "setup": "gridSphere",
                "delay": 4,
                "title": "这是瑞士的十大贸易伙伴",
                "subtitle": "总计2630亿美元的商品"
            },
            {
                "div": 7,
                "setup": "gridmap",
                "delay": 4,
                "title": "并非所有国家在每个行业都有出口",
                "subtitle": "你可以对比 <span style='color:#17becf'>机械（发动机，集成电路，电话）</span> 和 <span style='color:#FFC41C'>蔬菜（咖啡，大豆，小麦）</span>得出此结论"
            },
            {
                "div": 8,
                "setup": "productsphere",
                "delay": 4,
                "title": "产品依赖于不同的生产能力",
                "subtitle": "有些行业的产品之间有很多的联系，比如 <span style='color:#17becf'>机械y</span>, 而不是 <span style='color:#FFC41C'>蔬菜</span>.<br/>我们称之为产品空间"
            },
            {
                "div": 9,
                "setup": "gridSphere",
                "delay": 4,
                "title": "准备好去探索了吗?",
                "subtitle": "通过本网站您可以发掘产品和国家之间的生产相似性."
            }];

        if (story[step]) {
            switcher(story[step]["setup"], false, 25);
            $("#annotation").stop().fadeOut("fast", function () {
                $("#annotation").html("<span class='title'>" + story[step - 1]["title"] + "</span><br/><div class='subtitle'>" + story[step - 1]["subtitle"] + "</div>");
                $("#annotation").stop().fadeIn("fast");
            });
            $(".selectionBox").hide();

            switch (story[step]["div"]) {
                case 1:
                    $.each(categories, function (col, val) {
                        val.active = true
                    });
                    break;
                case 2:
                    Labels.setLabels(true);
                    break;
                case 3:
                    $("#watch").stop().fadeIn("slow");
                    $.each(categories, function (col, val) {
                        if (col == "#17becf")
                            val.active = true;
                        else val.active = false;
                    });

                    Labels.setLabels(true);
                    break;
                case 4:
                    $("#watch").stop().fadeOut("slow");
                    Labels.setLabels(true);
                    $.each(categories, function (col, val) {
                        val.active = true;
                    });

                    targetCountry("CH", false, true);

                    Labels.setLabels(true);
                    cameraControls.setZoom(200);

                    break;
                case 5:
                    //$("#categories").stop().fadeIn();
                    targetCountry("CH", false, true);
                    cameraControls.setZoom(220);

                    Labels.setLabels(true);
                    break;
                case 6:

                    targetCountry("CH", true, true);
                    Labels.setLabels(true);
                    cameraControls.setZoom(350);
                    $.each(categories, function (col, val) {
                        if (col == "#FFC41C" || col == "#17becf") val.active = true;
                        else val.active = false;
                    });

                    break;
                case 7:
                    constantSize = true;
                    changePointSize(5);
                    break;
                case 8:
                    constantSize = false;
                    animatePointSize(false);
                    $.each(categories, function (col, val) {
                        val.active = true;
                    });
                    break;
                case 9:
                    break;
            }
            //window.setTimeout(StoryLine,story[step]["delay"]*1000);

            step++;

        } else {
            exitStoryline();
        }
    }

    //退出story模式的时候展示的方法
    function exitStoryline() {
        $("#storyline").html("► 介绍");
        $("#categories").stop().fadeIn();
        $("#nextlevel").stop().fadeOut();
        $("#annotation").empty();
        $("#annotation").stop().fadeOut();
        $("#watch").stop().fadeOut("slow");
        $("#sideBar").stop().fadeIn();
        $.each(categories, function (col, val) {
            val.active = true;
        });
        switcher("gridSphere", false, 5);//我认为这个地方应该修改成先从url获取
        storyMode = false;
        Labels.setLabels(true);
        step = 0;
        constantSize = false;
        animatePointSize(false);
    }

    //
    function animateOverlay(percentage) {
        //对于第一二种模式
        if (currentSetup === "gridmap" || currentSetup === "gridSphere") {
            var test = true;
            //测试目录中每个类型的活跃度
            $.each(categories, function (col, val) {
                if (!val.active) test = false;
            });
            if (test) {
                overlay = globe.children[1];
                //如果所有点都安放好的话，边界就改变透明度
                if (percentage === 0) {//如果还有没安放好的点的话
                    overlayMaterial.opacity = Math.min(((cameraControls.getZoom() - 175) / 300), 0.6);
                } else {
                    overlayMaterial.opacity = Math.min(percentage / 100, 0.6);
                }
            } else {
                overlayMaterial.opacity = 0;
            }
        } else {
            overlayMaterial.opacity = 0;
        }
    }

    //动画
    function animate() {
        //如果Labels非空，那么就对不同模式展示不同的Label
        if (Labels)
            Labels.animateLabels(countries, geometry, currentSetup, particleSystem);

        if (loaded) {
            if (links)
                links.position.set(particleSystem.position.x, particleSystem.position.y, particleSystem.position.z);
            animateLinks();

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
                animateOverlay(particlesPlaced / particles);
            } else {
                animateOverlay(0);
            }
            geometry.attributes.position.needsUpdate = true;
            animatePointSize(false);
        }
        cameraControls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);

    }

};


//没有被用过的方法
function changeColor(co, white) {
    var v = 0;
    var colors = geometry.attributes.customColor.array;
    var color = new THREE.Color();
    oldColors = [];
    $.each(countries, function (p, o) {
        if (co == p) {
            if (white) {
                for (var j = 0; j < o.particles; j++) {
                    colors[v * 3 + 0] = 255;
                    colors[v * 3 + 1] = 255;
                    colors[v * 3 + 2] = 255;
                    v++;
                }
            } else {
                for (var key in o["products"]) {
                    productValue = o["products"][key];
                    productInfo = products[key];
                    color = new THREE.Color(productInfo.color);
                    for (var s = 0; s < Math.round(productValue / dollars); s++) {
                        colors[v * 3 + 0] = color.r;
                        colors[v * 3 + 1] = color.g;
                        colors[v * 3 + 2] = color.b;
                        v++;
                    }
                }
            }
        } else {
            v += o.particles;
        }
    });
    geometry.attributes.customColor.needsUpdate = true;
}