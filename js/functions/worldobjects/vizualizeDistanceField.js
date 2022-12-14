
function vizualizeDistanceFieldCallbackFunction(index, callback){
    const worldObject = worldObjects[index];
    const distanceFieldLayerOne = worldObject.distanceFieldLayerOne;

    const xRange = worldObject.distanceFieldBoundingBox.max.x-worldObject.distanceFieldBoundingBox.min.x;
    const yRange = worldObject.distanceFieldBoundingBox.max.y-worldObject.distanceFieldBoundingBox.min.y;
    const zRange = worldObject.distanceFieldBoundingBox.max.z-worldObject.distanceFieldBoundingBox.min.z;

    for(let x = 0; x <= xRange; x++){
        for(let y = 0; y <= yRange; y++){
            for(let z = 0; z <= zRange; z++){
                const layerOneIndex = x*yRange*zRange+y*zRange+z;
                if(distanceFieldLayerOne[layerOneIndex] < 20){
                    callback(x,y,z);
                }
            }
        }
    }
}

function vizualizeDistanceField(index){
    let counter = 0;

    vizualizeDistanceFieldCallbackFunction(index, (x,y,z) => {
        counter++;
    });

    let arrayBuffer = new ArrayBuffer(counter*9*12*4);
    let arrayView = new Float32Array(arrayBuffer);
    for(let i = 0; i < counter*9*12; i++){
        arrayView[i] = 0.0;
    }
    counter = 0;

    vizualizeDistanceFieldCallbackFunction(index, (x,y,z) => {
        let box = [
            x, y, z,
            x+1, y, z,
            x, y, z+1,
        
            x+1, y, z+1,
            x, y, z+1,
            x+1, y, z,
        
            x, y, z,
            x, y+1, z,
            x+1, y, z,
            
            x+1, y+1, z,
            x+1, y, z,
            x, y+1, z,
        
            x, y, z,
            x, y, z+1,
            x, y+1, z,
        
            x, y+1, z+1,
            x, y+1, z,
            x, y, z+1,
        
            x+1, y+1, z+1,
            x+1, y, z+1,
            x+1, y+1, z,
            
            x+1, y, z,
            x+1, y+1, z,
            x+1, y, z+1,
        
            x+1, y+1, z+1,
            x+1, y+1, z,
            x, y+1, z+1,
            
            x, y+1, z,
            x, y+1, z+1,
            x+1, y+1, z,
        
            x+1, y+1, z+1,
            x, y+1, z+1,
            x+1, y, z+1,
            
            x, y, z+1,
            x+1, y, z+1,
            x, y+1, z+1,
        ];
        for(let boxIndex = 0; boxIndex < box.length; boxIndex++){
            const index = (counter*9*12)+boxIndex;
            arrayView[index] = box[boxIndex];
        }
        counter++;
    });

    const distanceFieldGeometry = new THREE.BufferGeometry();

    // itemSize = 3 because there are 3 values (components) per vertex
    distanceFieldGeometry.setAttribute( 'position', new THREE.BufferAttribute( arrayView, 3 ) );
    
    const distanceFieldMesh = new THREE.Mesh( distanceFieldGeometry, greyPhongMaterial);

    scene.add( distanceFieldMesh );
    
}