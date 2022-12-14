let worldObjects = [];

function worldObjectsDeleteByIndex(index){
    worldObjects.splice(index,1);
    worldObjectsUpdate();
}

function worldObjectsUpdateWithIndex(index, info){
    worldObjects[index] = {...worldObjects[index], ...info}
    console.log(worldObjects[index]);
}

function vizualizeDistanceFieldCallbackFunctionv2(index, callback){
    const worldObject = worldObjects[index];

    const xRange = worldObject.distanceFieldBoundingBox.max.x-worldObject.distanceFieldBoundingBox.min.x;
    const yRange = worldObject.distanceFieldBoundingBox.max.y-worldObject.distanceFieldBoundingBox.min.y;
    const zRange = worldObject.distanceFieldBoundingBox.max.z-worldObject.distanceFieldBoundingBox.min.z;

    for(let x = 0; x <= xRange; x++){
        for(let y = 0; y <= yRange; y++){
            for(let z = 0; z <= zRange; z++){
                const layerOneIndex = x*yRange*zRange+y*zRange+z;
                const layerTwoLeftIndex = worldObject.distanceFieldLayerOne[layerOneIndex]*8;
                if(layerTwoLeftIndex > 0){
                    for(let x2 = 0; x2 <= 1; x2++){
                        for(let y2 = 0; y2 <= 1; y2++){
                            for(let z2 = 0; z2 <= 1; z2++){
                                const layerTwoIndex = layerTwoLeftIndex+x2*4+y2*2+z;
                                if(worldObject.distanceFieldLayerTwo[layerTwoIndex] < 5){
                                    callback(x,y,z,x2,y2,z2);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function vizualizeDistanceFieldv2(index){

    let counter = 0;
    vizualizeDistanceFieldCallbackFunctionv2(index, (x,y,z,x2,y2,z2) => {
        counter++;
    });

    let arrayBuffer = new ArrayBuffer(counter*9*12*4);
    let arrayView = new Float32Array(arrayBuffer);
    for(let i = 0; i < counter*9*12; i++){
        j= i;
        arrayView[i] = 0;
    }
    counter = 0;

    vizualizeDistanceFieldCallbackFunctionv2(index, (x,y,z,x2,y2,z2) => {
        let box = [
            x+(x2*0.5), y+(y2*0.5), z+(z2*0.5),
            x+(x2*0.5)+0.5, y+(y2*0.5), z+(z2*0.5),
            x+(x2*0.5), y+(y2*0.5), z+(z2*0.5)+0.5,
        
            x+(x2*0.5)+0.5, y+(y2*0.5), z+(z2*0.5)+0.5,
            x+(x2*0.5), y+(y2*0.5), z+(z2*0.5)+0.5,
            x+(x2*0.5)+0.5, y+(y2*0.5), z+(z2*0.5),
        
            x+(x2*0.5), y+(y2*0.5), z+(z2*0.5),
            x+(x2*0.5), y+(y2*0.5)+0.5, z+(z2*0.5),
            x+(x2*0.5)+0.5, y+(y2*0.5), z+(z2*0.5),
            
            x+(x2*0.5)+0.5, y+(y2*0.5)+0.5, z+(z2*0.5),
            x+(x2*0.5)+0.5, y+(y2*0.5), z+(z2*0.5),
            x+(x2*0.5), y+(y2*0.5)+0.5, z+(z2*0.5),
        
            x+(x2*0.5), y+(y2*0.5), z+(z2*0.5),
            x+(x2*0.5), y+(y2*0.5), z+(z2*0.5)+0.5,
            x+(x2*0.5), y+(y2*0.5)+0.5, z+(z2*0.5),
        
            x+(x2*0.5), y+(y2*0.5)+0.5, z+(z2*0.5)+0.5,
            x+(x2*0.5), y+(y2*0.5)+0.5, z+(z2*0.5),
            x+(x2*0.5), y+(y2*0.5), z+(z2*0.5)+0.5,
        
            x+(x2*0.5)+0.5, y+(y2*0.5)+0.5, z+(z2*0.5)+0.5,
            x+(x2*0.5)+0.5, y+(y2*0.5), z+(z2*0.5)+0.5,
            x+(x2*0.5)+0.5, y+(y2*0.5)+0.5, z+(z2*0.5),
            
            x+(x2*0.5)+0.5, y+(y2*0.5), z+(z2*0.5),
            x+(x2*0.5)+0.5, y+(y2*0.5)+0.5, z+(z2*0.5),
            x+(x2*0.5)+0.5, y+(y2*0.5), z+(z2*0.5)+0.5,
        
            x+(x2*0.5)+0.5, y+(y2*0.5)+0.5, z+(z2*0.5)+0.5,
            x+(x2*0.5)+0.5, y+(y2*0.5)+0.5, z+(z2*0.5),
            x+(x2*0.5), y+(y2*0.5)+0.5, z+(z2*0.5)+0.5,
            
            x+(x2*0.5), y+(y2*0.5)+0.5, z+(z2*0.5),
            x+(x2*0.5), y+(y2*0.5)+0.5, z+(z2*0.5)+0.5,
            x+(x2*0.5)+0.5, y+(y2*0.5)+0.5, z+(z2*0.5),
        
            x+(x2*0.5)+0.5, y+(y2*0.5)+0.5, z+(z2*0.5)+0.5,
            x+(x2*0.5), y+(y2*0.5)+0.5, z+(z2*0.5)+0.5,
            x+(x2*0.5)+0.5, y+(y2*0.5), z+(z2*0.5)+0.5,
            
            x+(x2*0.5), y+(y2*0.5), z+(z2*0.5)+0.5,
            x+(x2*0.5)+0.5, y+(y2*0.5), z+(z2*0.5)+0.5,
            x+(x2*0.5), y+(y2*0.5)+0.5, z+(z2*0.5)+0.5,
        ];
        for(let boxIndex = 0; boxIndex < box.length; boxIndex++){
            const index = (counter*9*12)+boxIndex;
            j = index;
            arrayView[index] = box[boxIndex];
        }                          
        counter++;
    });

    
    console.log(arrayBuffer,arrayView,counter);

    const distanceFieldGeometry = new THREE.BufferGeometry();

    // itemSize = 3 because there are 3 values (components) per vertex
    distanceFieldGeometry.setAttribute( 'position', new THREE.BufferAttribute( arrayView, 3 ) );
    
    const distanceFieldMesh = new THREE.Mesh( distanceFieldGeometry, greyPhongMaterial);

    scene.add( distanceFieldMesh );
    
}

function worldObjectsAdd(worldObject){
    const index = worldObjects.length;
    worldObjects.push({...worldObject, index: index});
    worldObjectsUpdate();
    return index;
}

function createWorldObjectListItem(worldObject){
    const listElement = document.createElement("p");
    listElement.className = "panel-block";
    const nameShortened = 
        worldObject.name.length > worldObjectInListMaxNameLength ? 
        worldObject.name.substring(0,worldObjectInListMaxNameLength-3) + "..." : worldObject.name;
    listElement.innerHTML = nameShortened;
    filesList.appendChild(listElement);
}

function worldObjectsUpdate(){
    filesList.innerHTML = "";
    for(var worldObject of worldObjects){
        createWorldObjectListItem(worldObject);
    }
}