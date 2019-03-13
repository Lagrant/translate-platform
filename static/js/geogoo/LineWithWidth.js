class MeshLine {
    constructor(options) {
        let baseDef = {
            lineWidth: 1,
            resolution: [1, 1],
            map: null,
            color: 0x000000,
            useMap: false,
            depthTest: true,
            transparent: false,
            opacity: 0.5,
            wireframe: false
        };
        this.initions = Object.assign(baseDef, options);
        return this
    }

    setGeometry(geometry, thick) {
        let meshGeom = this.createGeometry(geometry,thick);
        let material = this.createMaterial();

        this.mesh = new THREE.Mesh(meshGeom, material);
        return this.mesh
    }

    createMaterial() {
        let materialConf = this.initions;
        let uniforms = {
            resolution: {value: new THREE.Vector2(...materialConf.resolution)},
            uColor: {value: new THREE.Color(materialConf.color)},
            map: {value: null},
            useMap: {value: materialConf.useMap},
            width: {value: materialConf.lineWidth},
            opacity: {value: materialConf.opacity}
        };
        if (materialConf.map) {
            uniforms.map.value = new THREE.TextureLoader().load(materialConf.map)
        }
        return new THREE.ShaderMaterial({
            uniforms,
            vertexShader: document.getElementById('vertexShader1').textContent,
            fragmentShader: document.getElementById('fragmentShader1').textContent,
            side: THREE.DoubleSide,
            depthTest: materialConf.depthTest,
            transparent: materialConf.transparent
        })
    }

    createGeometry(geometry, offset) {
        // console.log(geometry);
        let verticesCount = geometry.vertices.length;
        let bufferGeometry = new THREE.PlaneBufferGeometry(0, 0, 1, verticesCount - 1);
        let prevPositions = new Float32Array(verticesCount * 3 * 2);
        let nextPositions = new Float32Array(verticesCount * 3 * 2);
        let side = new Float32Array(verticesCount * 2);
        let uv = bufferGeometry.attributes.uv.array;
        let position = bufferGeometry.attributes.position.array;
        for (let j = 0; j < verticesCount * 2; j += 2) {
            let ratio = j / (verticesCount - 1) / 2;

            // side
            side[j] = 1;
            side[j + 1] = -1;

            // index
            let current = geometry.vertices[j / 2];
            let prev = geometry.vertices[(j === 0 ? j : j - 2) / 2];
            let next = geometry.vertices[(j === (verticesCount - 1) * 2 ? j : j + 2) / 2];
            // position
            //修改x和y的比例试一试
            position[j * 3] = current.x * 0.7 + offset;
            position[j * 3 + 1] = current.y * 0.7 + offset;
            position[j * 3 + 2] = current.z * 0.7;
            position[j * 3 + 3] = current.x * 0.7 + offset;
            position[j * 3 + 4] = current.y * 0.7 + offset;
            position[j * 3 + 5] = current.z * 0.7;

            // prev
            prevPositions[j * 3] = prev.x * 0.7 + offset;
            prevPositions[j * 3 + 1] = prev.y * 0.7 + offset;
            prevPositions[j * 3 + 2] = prev.z * 0.7;
            prevPositions[j * 3 + 3] = prev.x * 0.7 + offset;
            prevPositions[j * 3 + 4] = prev.y * 0.7 + offset;
            prevPositions[j * 3 + 5] = prev.z * 0.7;

            // next
            nextPositions[j * 3] = next.x * 0.7 + offset;
            nextPositions[j * 3 + 1] = next.y * 0.7 + offset;
            nextPositions[j * 3 + 2] = next.z * 0.7;
            nextPositions[j * 3 + 3] = next.x * 0.7 + offset;
            nextPositions[j * 3 + 4] = next.y * 0.7 + offset;
            nextPositions[j * 3 + 5] = next.z * 0.7;

            uv[j * 2] = ratio;
            uv[j * 2 + 2] = ratio;
            uv[j * 2 + 1] = 0;
            uv[j * 2 + 3] = 1
        }

        bufferGeometry.addAttribute('prevPositions', new THREE.BufferAttribute(prevPositions, 3));
        bufferGeometry.addAttribute('nextPositions', new THREE.BufferAttribute(nextPositions, 3));
        bufferGeometry.addAttribute('side', new THREE.BufferAttribute(side, 1));
        return bufferGeometry
    }
}


class GeoMeshLine extends THREE.Object3D {
    constructor(geojson, matConf) {
        super();
        this.matcConf = matConf;
        this.draw(geojson);
    }

    draw(points) {
        let geometry = new THREE.Geometry();
        // console.log(points);
        // var rectShape = new THREE.Shape();
        // rectShape.moveTo(points[0].x*0.7,points[0].y*0.7);
        // for (var i = 1; i < points.length - 1; i++) {
        //             rectShape.lineTo(points[i].x*0.7,points[i].y*0.7);
        //         }
        //         rectShape.lineTo(points[0].x*0.7,points[0].y*0.7);
        //         var rectGeom = new THREE.ShapeGeometry(rectShape);
        //         var rectMesh = new THREE.Mesh(rectGeom, new THREE.MeshBasicMaterial({
        //             color: 0x080808,
        //             opacity:1,
        //             depthTest:false,
        //         }));
        // this.add(rectMesh);

        for (var i = 0; i < points.length; i++) {
            geometry.vertices.push(points[i]);
        }
        let meshline = new MeshLine(this.matcConf).setGeometry(geometry, 2);
        this.add(meshline);
    }
}


class MeshLine3D {
    constructor(options) {
        let baseDef = {
            lineWidth: 1,
            resolution: [1, 1],
            map: null,
            color: 0x000000,
            useMap: false,
            depthTest: true,
            transparent: false,
            opacity: 1,
            wireframe: false
        };
        this.initions = Object.assign(baseDef, options);
        return this
    }

    setGeometry(geometry, thick) {
        let meshGeom = this.createGeometry(geometry,thick);
        let material = this.createMaterial();

        this.mesh = new THREE.Mesh(meshGeom, material);
        return this.mesh
    }

    createMaterial() {
        let materialConf = this.initions;
        let uniforms = {
            resolution: {value: new THREE.Vector2(...materialConf.resolution)},
            uColor: {value: new THREE.Color(materialConf.color)},
            map: {value: null},
            useMap: {value: materialConf.useMap},
            width: {value: materialConf.lineWidth},
            opacity: {value: materialConf.opacity}
        };
        if (materialConf.map) {
            uniforms.map.value = new THREE.TextureLoader().load(materialConf.map)
        }
        return new THREE.ShaderMaterial({
            uniforms,
            vertexShader: document.getElementById('vertexShader1').textContent,
            fragmentShader: document.getElementById('fragmentShader1').textContent,
            side: THREE.DoubleSide,
            depthTest: materialConf.depthTest,
            transparent: materialConf.transparent
        })
    }

    createGeometry(geometry,offset) {
        // console.log(geometry);
        let verticesCount = geometry.vertices.length;
        let bufferGeometry = new THREE.PlaneBufferGeometry(0, 0, 1, verticesCount - 1);
        let prevPositions = new Float32Array(verticesCount * 3 * 2);
        let nextPositions = new Float32Array(verticesCount * 3 * 2);
        let side = new Float32Array(verticesCount * 2);
        let uv = bufferGeometry.attributes.uv.array;
        let position = bufferGeometry.attributes.position.array;
        for (let j = 0; j < verticesCount * 2; j += 2) {
            let ratio = j / (verticesCount - 1) / 2;

            // side
            side[j] = 1;
            side[j + 1] = -1;

            // index
            let current = geometry.vertices[j / 2];
            let prev = geometry.vertices[(j === 0 ? j : j - 2) / 2];
            let next = geometry.vertices[(j === (verticesCount - 1) * 2 ? j : j + 2) / 2];
            // position

            // current.x = Math.cos(current.x * Math.PI / 180) * Math.cos(current.y * Math.PI / 180) * 200;
            // current.y = Math.cos(current.x * Math.PI / 180) * Math.sin(current.y * Math.PI / 180) * 200;
            // current.z = Math.sin(current.x * Math.PI / 180) * 200;
            //
            // prev.x = Math.cos(prev.x * Math.PI / 180) * Math.cos(prev.y * Math.PI / 180) * 200;
            // prev.y = Math.cos(prev.x * Math.PI / 180) * Math.sin(prev.y * Math.PI / 180) * 200;
            // prev.z = Math.sin(prev.x * Math.PI / 180) * 200;
            //
            // next.x = Math.cos(next.x * Math.PI / 180) * Math.cos(next.y * Math.PI / 180) * 200;
            // next.y = Math.cos(next.x * Math.PI / 180) * Math.sin(next.y * Math.PI / 180) * 200;
            // next.z = Math.sin(next.x * Math.PI / 180) * 200;

            //修改x和y的比例试一试
            position[j * 3] = current.z * 0.7+offset;
            position[j * 3 + 1] = current.x * 0.7+offset;
            position[j * 3 + 2] = current.y * 0.7;
            position[j * 3 + 3] = current.z * 0.7+offset;
            position[j * 3 + 4] = current.x * 0.7+offset;
            position[j * 3 + 5] = current.y * 0.7;

            // prev
            prevPositions[j * 3] = prev.z * 0.7+offset;
            prevPositions[j * 3 + 1] = prev.x * 0.7+offset;
            prevPositions[j * 3 + 2] = prev.y * 0.7;
            prevPositions[j * 3 + 3] = prev.z * 0.7+offset;
            prevPositions[j * 3 + 4] = prev.x * 0.7+offset;
            prevPositions[j * 3 + 5] = prev.y * 0.7;

            // next
            nextPositions[j * 3] = next.z * 0.7+offset;
            nextPositions[j * 3 + 1] = next.x * 0.7+offset;
            nextPositions[j * 3 + 2] = next.y * 0.7;
            nextPositions[j * 3 + 3] = next.z * 0.7+offset;
            nextPositions[j * 3 + 4] = next.x * 0.7+offset;
            nextPositions[j * 3 + 5] = next.y * 0.7;

            uv[j * 2] = ratio;
            uv[j * 2 + 2] = ratio;
            uv[j * 2 + 1] = 0;
            uv[j * 2 + 3] = 1
        }

        bufferGeometry.addAttribute('prevPositions', new THREE.BufferAttribute(prevPositions, 3));
        bufferGeometry.addAttribute('nextPositions', new THREE.BufferAttribute(nextPositions, 3));
        bufferGeometry.addAttribute('side', new THREE.BufferAttribute(side, 1));
        return bufferGeometry
    }
}

class GeoMeshLine3D extends THREE.Object3D {
    constructor(geojson, matConf) {
        super();
        this.matcConf = matConf;
        this.draw(geojson);
    }

    draw(points) {
        let geometry = new THREE.Geometry();
        // console.log(points);
        for (var i = 0; i < points.length; i++) {
            geometry.vertices.push(points[i]);
        }
        let meshline = new MeshLine3D(this.matcConf).setGeometry(geometry,2);
        this.add(meshline)
    }
}


class MeshLineThunder {
    constructor(options) {
        let baseDef = {
            lineWidth: 1,
            resolution: [1, 1],
            map: null,
            color: 0x000000,
            useMap: false,
            depthTest: true,
            transparent: false,
            opacity: 1,
            wireframe: false
        };
        this.initions = Object.assign(baseDef, options);
        return this
    }

    setGeometry(geometry, thick) {
        let meshGeom = this.createGeometry(geometry);
        let material = this.createMaterial();

        this.mesh = new THREE.Mesh(meshGeom, material);
        return this.mesh
    }

    createMaterial() {
        let materialConf = this.initions;
        let uniforms = {
            resolution: {value: new THREE.Vector2(...materialConf.resolution)},
            uColor: {value: new THREE.Color(materialConf.color)},
            map: {value: null},
            useMap: {value: materialConf.useMap},
            width: {value: materialConf.lineWidth},
            opacity: {value: materialConf.opacity}
        };
        if (materialConf.map) {
            uniforms.map.value = new THREE.TextureLoader().load(materialConf.map)
        }
        return new THREE.ShaderMaterial({
            uniforms,
            vertexShader: document.getElementById('vertexShader1').textContent,
            fragmentShader: document.getElementById('fragmentShader1').textContent,
            side: THREE.DoubleSide,
            depthTest: materialConf.depthTest,
            transparent: materialConf.transparent
        })
    }

    createGeometry(geometry) {
        // console.log(geometry);
        let verticesCount = geometry.vertices.length;
        let bufferGeometry = new THREE.PlaneBufferGeometry(0, 0, 1, verticesCount - 1);
        let prevPositions = new Float32Array(verticesCount * 3 * 2);
        let nextPositions = new Float32Array(verticesCount * 3 * 2);
        let side = new Float32Array(verticesCount * 2);
        let uv = bufferGeometry.attributes.uv.array;
        let position = bufferGeometry.attributes.position.array;
        for (let j = 0; j < verticesCount * 2; j += 2) {
            let ratio = j / (verticesCount - 1) / 2;

            // side
            side[j] = 1;
            side[j + 1] = -1;

            // index
            let current = geometry.vertices[j / 2];
            let prev = geometry.vertices[(j === 0 ? j : j - 2) / 2];
            let next = geometry.vertices[(j === (verticesCount - 1) * 2 ? j : j + 2) / 2];
            // position

            current.z = Math.cos(current.y * Math.PI / 180) * Math.cos(current.x * Math.PI / 180) * 200;
            current.y = Math.cos(current.y * Math.PI / 180) * Math.sin(current.x * Math.PI / 180) * 200;
            current.x = Math.sin(current.y * Math.PI / 180) * 200;

            prev.z = Math.cos(prev.y * Math.PI / 180) * Math.cos(prev.x * Math.PI / 180) * 200;
            prev.y = Math.cos(prev.y * Math.PI / 180) * Math.sin(prev.x * Math.PI / 180) * 200;
            prev.x = Math.sin(prev.y * Math.PI / 180) * 200;

            next.z = Math.cos(next.y * Math.PI / 180) * Math.cos(next.x * Math.PI / 180) * 200;
            next.y = Math.cos(next.y * Math.PI / 180) * Math.sin(next.x * Math.PI / 180) * 200;
            next.x = Math.sin(next.y * Math.PI / 180) * 200;

            //修改x和y的比例试一试
            position[j * 3] = current.x;
            position[j * 3 + 1] = current.y;
            position[j * 3 + 2] = current.z;
            position[j * 3 + 3] = current.x;
            position[j * 3 + 4] = current.y;
            position[j * 3 + 5] = current.z;

            // prev
            prevPositions[j * 3] = prev.x;
            prevPositions[j * 3 + 1] = prev.y;
            prevPositions[j * 3 + 2] = prev.z;
            prevPositions[j * 3 + 3] = prev.x;
            prevPositions[j * 3 + 4] = prev.y;
            prevPositions[j * 3 + 5] = prev.z;

            // next
            nextPositions[j * 3] = next.x;
            nextPositions[j * 3 + 1] = next.y;
            nextPositions[j * 3 + 2] = next.z;
            nextPositions[j * 3 + 3] = next.x;
            nextPositions[j * 3 + 4] = next.y;
            nextPositions[j * 3 + 5] = next.z;

            uv[j * 2] = ratio;
            uv[j * 2 + 2] = ratio;
            uv[j * 2 + 1] = 0;
            uv[j * 2 + 3] = 1
        }

        bufferGeometry.addAttribute('prevPositions', new THREE.BufferAttribute(prevPositions, 3));
        bufferGeometry.addAttribute('nextPositions', new THREE.BufferAttribute(nextPositions, 3));
        bufferGeometry.addAttribute('side', new THREE.BufferAttribute(side, 1));
        return bufferGeometry
    }
}

class GeoMeshLineThunder extends THREE.Object3D {
    constructor(geojson, matConf) {
        super();
        this.matcConf = matConf;
        this.draw(geojson);
    }

    draw(points) {
        let geometry = new THREE.Geometry();
        // console.log(points);
        for (var i = 0; i < points.length; i++) {
            geometry.vertices.push(points[i]);
        }
        let meshline = new MeshLineThunder(this.matcConf).setGeometry(geometry);
        this.add(meshline)
    }
}