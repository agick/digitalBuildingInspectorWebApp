
fileInput.onchange = () => {
    const selectedFile = fileInput.files[0];
    let worldObject = {
        name: selectedFile.name,
        lastModified: selectedFile.lastModified,
        type: selectedFile.type,
        fileExtension: getFileExtension(selectedFile.name),
        size: selectedFile.size,
        mesh: null,
        distanceFieldBoundingBox: null,
        distanceFieldLayerOne: null,
        distanceFieldLayerTwo: null
    } 

    if(worldObject.fileExtension == "stl"){
         loader.load(
            selectedFile.path,
            async function (geometry) {
                const mesh = new THREE.Mesh(geometry, greyPhongMaterial);
                scene.add( mesh );
                worldObject.mesh = mesh;
                const box = new THREE.Box3().setFromObject(mesh);
                const index = worldObjectsAdd(worldObject);
                lookAtWorldObject(index);
                window.api.send("toMain", {   
                    event: "modelUpload", 
                    positions: geometry.getAttribute('position').array, 
                    itemSize: geometry.getAttribute('position').itemSize, 
                    itemCount: geometry.getAttribute('position').count, 
                    boundingBox: box,
                    worldObjectIndex: index 
                });
                /*const Date1 = new Date();
                generateDistanceField(index);
                const Date2 = new Date();
                console.log("time to generate distance field: ", Date2.getTime()-Date1.getTime());*/
            }
        );
    }

    const FileLoader = new THREE.FileLoader( this.manager );

    if(worldObject.fileExtension == "txt"){

        window.api.send("toMain", { event: "pointCloudUpload", path: selectedFile.path });
        /*FileLoader.load(
            selectedFile.path,
            async function (pointCloud) {
                const pointCloudSplitted = pointCloud.split("\n");
                for(i of pointCloudSplitted){
                    console.log(i);
                }
            }
        ); */
    }
    
}