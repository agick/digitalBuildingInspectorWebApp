function lookAtWorldObject(index) {
    const worldObject = worldObjects[index];
    const box = new THREE.Box3().setFromObject(worldObject.mesh);
    const midX = ((box.min.x+box.max.x)/2)-worldObject.mesh.position.x;
    const midY = ((box.min.y+box.max.y)/2)-worldObject.mesh.position.y;
    const midZ = ((box.min.z+box.max.z)/2)-worldObject.mesh.position.z;
    const halfSizeY = midY-box.min.y;
    const halfSizeZ = midZ-box.min.z;
    //worldObject.mesh.position.set( -box.min.x, -box.min.y, -box.min.z );
    
    camera.position.set(midX,box.min.y-halfSizeY,box.max.z+halfSizeZ);
    camera.lookAt(midX,midY,midZ);
}

/*
function createSquareRootLookupTable(range, increment){
    let lookUpTable = new Map([]);
    for(let x = 0.0; x <= range; x += increment){
        const exactX = x.toFixed(1);
        for(let y = 0.0; y <= range; y += increment){
            const exactY = y.toFixed(1);
            for(let z = 0.0; z <= range; z += increment){
                const exactZ = z.toFixed(1);
                lookUpTable.set(exactX.toString() + exactY.toString() + exactZ.toString(),Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2)));
            }
        }
    }
    return lookUpTable;
}


const squareRootMaxRange = distanceFieldBoundingBoxBufferSpace+1;
const squareRootLookupTable = createSquareRootLookupTable(distanceFieldBoundingBoxBufferSpace+1, 0.1);


const Date1 = new Date();
let testx = 0.351234;
let testy = 1.123123;
let testz = 0.123232;
const newX = Math.abs(testx).toFixed(1).toString();
const newY = Math.abs(testy).toFixed(1).toString();
const newZ = Math.abs(testz).toFixed(1).toString();
squareRootLookupTable.get(newX+newY+newZ)
const Date2 = new Date();

console.log(squareRootLookupTable);
function calculateSquareRoot(x,y,z,precise){
    if(precise){
        return Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2));
    } else {
        if(x > -squareRootMaxRange && x < squareRootMaxRange && 
            y > -squareRootMaxRange && y < squareRootMaxRange && 
            z > -squareRootMaxRange && z < squareRootMaxRange){
                const newX = Math.abs(x).toFixed(1).toString();
                const newY = Math.abs(y).toFixed(1).toString();
                const newZ = Math.abs(z).toFixed(1).toString();
                return squareRootLookupTable.get(newX+newY+newZ);
            } else {
                return Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2));
            }
    }
}

function getPolygonBoundingBox(px0,py0,pz0,px1,py1,pz1,px2,py2,pz2, callback){
        const x0 = parseInt(px0);
        const y0 = parseInt(py0);
        const z0 = parseInt(pz0);
        const x1 = parseInt(px1);
        const y1 = parseInt(py1);
        const z1 = parseInt(pz1);
        const x2 = parseInt(px2);
        const y2 = parseInt(py2);
        const z2 = parseInt(pz2);

        const minX = Math.min(...[x0,x1,x2])-distanceFieldBoundingBoxBufferSpace;
        const maxX = Math.max(...[x0,x1,x2])+distanceFieldBoundingBoxBufferSpace;
        const minY = Math.min(...[y0,y1,y2])-distanceFieldBoundingBoxBufferSpace;
        const maxY = Math.max(...[y0,y1,y2])+distanceFieldBoundingBoxBufferSpace;
        const minZ = Math.min(...[z0,z1,z2])-distanceFieldBoundingBoxBufferSpace;
        const maxZ = Math.max(...[z0,z1,z2])+distanceFieldBoundingBoxBufferSpace;

        for(let x = minX; x <= maxX; x++){
            for(let y = minY; y <= maxY; y++){
                for(let z = minZ; z <= maxZ; z++){
                    callback(x,y,z);
                }
            }
        }
}

function generateDistanceField(worldObjectIndex){
    const preciseSquareRoot = true;
    const worldObject = worldObjects[worldObjectIndex];
    const mesh = worldObject.mesh;

    const box = new THREE.Box3().setFromObject(mesh);
    const layerOneDistanceScale = 254/8;

    const boundingBoxMinX = Math.floor(box.min.x)-distanceFieldBoundingBoxBufferSpace;
    const boundingBoxMinY = Math.floor(box.min.y)-distanceFieldBoundingBoxBufferSpace;
    const boundingBoxMinZ = Math.floor(box.min.z)-distanceFieldBoundingBoxBufferSpace;

    const boundingBoxMaxX = Math.ceil(box.max.x)+distanceFieldBoundingBoxBufferSpace;
    const boundingBoxMaxY = Math.ceil(box.max.y)+distanceFieldBoundingBoxBufferSpace;
    const boundingBoxMaxZ = Math.ceil(box.max.z)+distanceFieldBoundingBoxBufferSpace;

    const displacementX = (0-boundingBoxMinX);
    const displacementY = (0-boundingBoxMinY);
    const displacementZ = (0-boundingBoxMinZ);

    const xRange = boundingBoxMaxX-boundingBoxMinX;
    const yRange = boundingBoxMaxY-boundingBoxMinY;
    const zRange = boundingBoxMaxZ-boundingBoxMinZ;

    const distanceFieldLayerOneArrayLength = parseInt((xRange+2)*(yRange+2)*(zRange+2));

    const distanceFieldLayerOneArrayBuffer = new ArrayBuffer(distanceFieldLayerOneArrayLength*Uint8ByteLength);
    const distanceFieldLayerOneArray = new Uint8Array(distanceFieldLayerOneArrayBuffer);

    for(let i = 0; i < distanceFieldLayerOneArray.length; i++){
        distanceFieldLayerOneArray[i] = 255;
    }

    const position = mesh.geometry.getAttribute('position');
    const positions = position.array;
    const itemSize = position.itemSize;
    const polygonSize = itemSize*3;
    const count = position.count;
    const polygonsCount = count/3;

    for(let i = 0; i < polygonsCount; i++){
        const j = i*polygonSize;

        const px0 = positions[j];
        const py0 = positions[j+1];
        const pz0 = positions[j+2];
        const px1 = positions[j+3];
        const py1 = positions[j+4];
        const pz1 = positions[j+5];
        const px2 = positions[j+6];
        const py2 = positions[j+7];
        const pz2 = positions[j+8];
        
        const vec1x = px0-px1;
        const vec1y = py0-py1;
        const vec1z = pz0-pz1;
        const vec2x = px0-px2;
        const vec2y = py0-py2;
        const vec2z = pz0-pz2;

        //cross product of vectors
        const cProdx = vec1y*vec2z-vec1z*vec2y;
        const cPrody = vec1z*vec2x-vec1x*vec2z;
        const cProdz = vec1x*vec2y-vec1y*vec2x;

        const d = -(cProdx * -px0 + cPrody * -py0 + cProdz * -pz0);
        const cProdMagnitude = calculateSquareRoot(cProdx, cPrody, cProdz, preciseSquareRoot);

        const x0 = parseInt(px0);
        const y0 = parseInt(py0);
        const z0 = parseInt(pz0);
        const x1 = parseInt(px1);
        const y1 = parseInt(py1);
        const z1 = parseInt(pz1);
        const x2 = parseInt(px2);
        const y2 = parseInt(py2);
        const z2 = parseInt(pz2);

        const minX = Math.min(...[x0,x1,x2])-distanceFieldBoundingBoxBufferSpace;
        const maxX = Math.max(...[x0,x1,x2])+distanceFieldBoundingBoxBufferSpace;
        const minY = Math.min(...[y0,y1,y2])-distanceFieldBoundingBoxBufferSpace;
        const maxY = Math.max(...[y0,y1,y2])+distanceFieldBoundingBoxBufferSpace;
        const minZ = Math.min(...[z0,z1,z2])-distanceFieldBoundingBoxBufferSpace;
        const maxZ = Math.max(...[z0,z1,z2])+distanceFieldBoundingBoxBufferSpace;

        for(let x = minX; x <= maxX; x++){
            for(let y = minY; y <= maxY; y++){
                for(let z = minZ; z <= maxZ; z++){
                    const index = (x+displacementX)*yRange*zRange+(y+displacementY)*zRange+(z+displacementZ);
                    const xVal = x+0.5;
                    const yVal = y+0.5;
                    const zVal = z+0.5;
                    
                    const t = -((cProdx * xVal + cPrody * yVal + cProdz * zVal - d) / (Math.pow(cProdx, 2) + Math.pow(cPrody, 2) + Math.pow(cProdz, 2)));

                    const closestPointx = cProdx*t+xVal;
                    const closestPointy = cPrody*t+yVal;
                    const closestPointz = cProdz*t+zVal;

                    const bcVec1x = closestPointx-px0;
                    const bcVec1y = closestPointy-py0;
                    const bcVec1z = closestPointz-pz0;

                    const bcVec2x = closestPointx-px1;
                    const bcVec2y = closestPointy-py1;
                    const bcVec2z = closestPointz-pz1;

                    const bcVec3x = closestPointx-px2;
                    const bcVec3y = closestPointy-py2;
                    const bcVec3z = closestPointz-pz2;

                    const bcCross1x = bcVec2y*bcVec3z-bcVec2z*bcVec3y;
                    const bcCross1y = bcVec2z*bcVec3x-bcVec2x*bcVec3z;
                    const bcCross1z = bcVec2x*bcVec3y-bcVec2y*bcVec3x;

                    const bcCross2x = bcVec3y*bcVec1z-bcVec3z*bcVec1y;
                    const bcCross2y = bcVec3z*bcVec1x-bcVec3x*bcVec1z;
                    const bcCross2z = bcVec3x*bcVec1y-bcVec3y*bcVec1x;

                    const bcCross1Magnitude = calculateSquareRoot(bcCross1x, bcCross1y, bcCross1z, preciseSquareRoot);
                    const bcCross2Magnitude = calculateSquareRoot(bcCross2x, bcCross2y, bcCross2z, preciseSquareRoot);


                    const area1 = bcCross1Magnitude/cProdMagnitude;
                    const area2 = bcCross2Magnitude/cProdMagnitude;
                    const area3 = 1 - area1 - area2;

                    const distanceVecx = closestPointx-xVal;
                    const distanceVecy = closestPointy-yVal;
                    const distanceVecz = closestPointz-zVal;
                    const distance = calculateSquareRoot(distanceVecx, distanceVecy, distanceVecz, preciseSquareRoot);
                    const distanceScaled = parseInt(distance*layerOneDistanceScale)+1 > 255 ? 255 : parseInt(distance*layerOneDistanceScale)+1;
                    if(distanceFieldLayerOneArray[index] > distanceScaled){
                        if(area1 < 1.0 && area1 > 0.0 && area2 < 1.0 && area2 > 0.0 && area3 < 1.0 && area3 > 0.0){
                            distanceFieldLayerOneArray[index] = distanceScaled;
                        } else {
                            //Point is outside polygon. The distance is calculated as the closest point to any of the three lines
                            const vecM1x = px1-px0;
                            const vecM1y = py1-py0;
                            const vecM1z = pz1-pz0;

                            const vecPT1x = xVal-px0;
                            const vecPT1y = yVal-py0;
                            const vecPT1z = zVal-pz0;

                            const dotPP1 = vecPT1x*vecM1x+vecPT1y*vecM1y+vecPT1z*vecM1z;
                            const dotPM1 = vecM1x*vecM1x+vecM1y*vecM1y+vecM1z*vecM1z;

                            const t0 = dotPP1/dotPM1;

                            const distance0 = t0 <= 0 ? calculateSquareRoot(vecPT1x, vecPT1y, vecPT1z, preciseSquareRoot) : 
                                                (t0 >= 1 ? calculateSquareRoot(xVal-px1, yVal-py1, zVal-pz1, preciseSquareRoot) :
                                                calculateSquareRoot(xVal-(px0+t0*vecM1x), yVal-(py0+t0*vecM1y), zVal-(pz0+t0*vecM1z), preciseSquareRoot)+Math.pow(zVal-(pz0+t0*vecM1z),2));

                            const vecM2x = px2-px1;
                            const vecM2y = py2-py1;
                            const vecM2z = pz2-pz1;

                            const vecPT2x = xVal-px1;
                            const vecPT2y = yVal-py1;
                            const vecPT2z = zVal-pz1;

                            const dotPP2 = vecPT2x*vecM2x+vecPT2y*vecM2y+vecPT2z*vecM2z;
                            const dotPM2 = vecM2x*vecM2x+vecM2y*vecM2y+vecM2z*vecM2z;

                            const t1 = dotPP2/dotPM2;

                            const distance1 = t1 <= 0 ? calculateSquareRoot(vecPT2x, vecPT2y, vecPT2z, preciseSquareRoot) : 
                                                (t1 >= 1 ? calculateSquareRoot(xVal-px2, yVal-py2, zVal-pz2, preciseSquareRoot) :
                                                calculateSquareRoot(xVal-(px1+t1*vecM2x), yVal-(py1+t1*vecM2y), zVal-(pz1+t1*vecM2z), preciseSquareRoot)+Math.pow(zVal-(pz1+t1*vecM2z),2));

                            const vecM3x = px0-px2;
                            const vecM3y = py0-py2;
                            const vecM3z = pz0-pz2;

                            const vecPT3x = xVal-px2;
                            const vecPT3y = yVal-py2;
                            const vecPT3z = zVal-pz2;

                            const dotPP3 = vecPT3x*vecM3x+vecPT3y*vecM3y+vecPT3z*vecM3z;
                            const dotPM3 = vecM3x*vecM3x+vecM3y*vecM3y+vecM3z*vecM3z;

                            const t2 = dotPP3/dotPM3;

                            const distance2 = t2 <= 0 ? calculateSquareRoot(vecPT3x, vecPT3y, vecPT3z, preciseSquareRoot) : 
                                                (t2 >= 1 ? calculateSquareRoot(xVal-px0, yVal-py0, zVal-pz0, preciseSquareRoot) :
                                                calculateSquareRoot(xVal-(px2+t2*vecM3x), yVal-(py2+t2*vecM3y), zVal-(pz2+t2*vecM3z), preciseSquareRoot)+Math.pow(zVal-(pz2+t2*vecM3z),2));

                            const minDistance = Math.min(...[distance0, distance1, distance2]);
                            const minDistanceScaled = parseInt(minDistance*layerOneDistanceScale)+1 > 255 ? 255 : parseInt(minDistance*layerOneDistanceScale)+1;

                            if(distanceFieldLayerOneArray[index] > minDistanceScaled){
                                distanceFieldLayerOneArray[index] = minDistanceScaled;
                            }
                        }
                    }   

                    
                }
            }
        }
    }

    worldObjectsUpdateWithIndex(worldObjectIndex,{distanceFieldBoundingBox: {displacement: {x:displacementX, y:displacementY,  z:displacementZ}, min: {x: boundingBoxMinX, y: boundingBoxMinY, z: boundingBoxMinZ}, max:{x: boundingBoxMaxX, y: boundingBoxMaxY, z: boundingBoxMaxZ}}, distanceFieldLayerOne: distanceFieldLayerOneArray, distanceFieldLayerTwo: null})
 
}




function generateDistanceFieldv2(worldObjectIndex){
    const worldObject = worldObjects[worldObjectIndex];
    const mesh = worldObject.mesh;

    const box = new THREE.Box3().setFromObject(mesh);

    const boundingBoxMinX = Math.floor(box.min.x)-distanceFieldBoundingBoxBufferSpace;
    const boundingBoxMinY = Math.floor(box.min.y)-distanceFieldBoundingBoxBufferSpace;
    const boundingBoxMinZ = Math.floor(box.min.z)-distanceFieldBoundingBoxBufferSpace;

    const boundingBoxMaxX = Math.ceil(box.max.x)+distanceFieldBoundingBoxBufferSpace;
    const boundingBoxMaxY = Math.ceil(box.max.y)+distanceFieldBoundingBoxBufferSpace;
    const boundingBoxMaxZ = Math.ceil(box.max.z)+distanceFieldBoundingBoxBufferSpace;

    const displacementX = 0-Math.floor(box.min.x);
    const displacementY = 0-Math.floor(box.min.y);
    const displacementZ = 0-Math.floor(box.min.z);

    const xRange = boundingBoxMaxX-boundingBoxMinX;
    const yRange = boundingBoxMaxY-boundingBoxMinY;
    const zRange = boundingBoxMaxZ-boundingBoxMinZ;

    console.log(xRange,yRange,zRange);

    const distanceFieldLayerOneArrayLength = parseInt((xRange+2)*(yRange+2)*(zRange+2));

    const distanceFieldLayerOneArrayBuffer = new ArrayBuffer(distanceFieldLayerOneArrayLength*Uint16ByteLength);
    const distanceFieldLayerOneArray = new Uint16Array(distanceFieldLayerOneArrayBuffer);

    const position = mesh.geometry.getAttribute('position');
    const positions = position.array;
    const itemSize = position.itemSize;
    const polygonSize = itemSize*3;
    const count = position.count;
    const polygonsCount = count/3;
    let counter = 1;

    let polygonInspect = 20;
    let polygonCount = 0;


    const distanceFieldTestBuffer = new ArrayBuffer(count*itemSize*Float32ByteLength);
    const distanceFieldTestArray = new Float32Array(distanceFieldTestBuffer);


    for(let i = 0; i < polygonsCount; i++){
        const j = i*polygonSize;

        const px0 = positions[j]-boundingBoxMinX;
        const py0 = positions[j+1]-boundingBoxMinY;
        const pz0 = positions[j+2]-boundingBoxMinZ;
        const px1 = positions[j+3]-boundingBoxMinX;
        const py1 = positions[j+4]-boundingBoxMinY;
        const pz1 = positions[j+5]-boundingBoxMinZ;
        const px2 = positions[j+6]-boundingBoxMinX;
        const py2 = positions[j+7]-boundingBoxMinY;
        const pz2 = positions[j+8]-boundingBoxMinZ;

        const x0 = parseInt(px0);
        const y0 = parseInt(py0);
        const z0 = parseInt(pz0);
        const x1 = parseInt(px1);
        const y1 = parseInt(py1);
        const z1 = parseInt(pz1);
        const x2 = parseInt(px2);
        const y2 = parseInt(py2);
        const z2 = parseInt(pz2);

        const minX = Math.min(...[x0,x1,x2])-distanceFieldBoundingBoxBufferSpace;
        const maxX = Math.max(...[x0,x1,x2])+distanceFieldBoundingBoxBufferSpace;
        const minY = Math.min(...[y0,y1,y2])-distanceFieldBoundingBoxBufferSpace;
        const maxY = Math.max(...[y0,y1,y2])+distanceFieldBoundingBoxBufferSpace;
        const minZ = Math.min(...[z0,z1,z2])-distanceFieldBoundingBoxBufferSpace;
        const maxZ = Math.max(...[z0,z1,z2])+distanceFieldBoundingBoxBufferSpace;

        for(let x = minX; x <= maxX; x++){
            for(let y = minY; y <= maxY; y++){
                for(let z = minZ; z <= maxZ; z++){
                    const index = x*yRange*zRange+y*zRange+z;
                    
                    if(!distanceFieldLayerOneArray[index]){
                        counter++
                        distanceFieldLayerOneArray[index] = 1;
                    } 
                }
            }
        }
    }
    console.log(distanceFieldLayerOneArray);

    for(let i = 0; i < distanceFieldLayerOneArray.length; i++){
        distanceFieldLayerOneArray[i] = 0;
    }

    const distanceFieldLayerTwoArrayBuffer = new ArrayBuffer(counter*8+8); //times 8 because 8 bytes of UInt8Bytes
    const distanceFieldLayerTwoArray = new Uint8Array(distanceFieldLayerTwoArrayBuffer);

    for(let i = 0; i < distanceFieldLayerTwoArray.length; i++){
        distanceFieldLayerTwoArray[i] = 255;
    }

    counter = 1;
    let once = false;
    const layerTwoDistanceScale = 254/8;

    for(let i = 0; i < polygonsCount; i++){
        const j = i*polygonSize;
        polygonCount++;
        once = true;
        if(polygonInspect == polygonCount){
            once = true;
        }

        const px0 = positions[j]-boundingBoxMinX;
        const py0 = positions[j+1]-boundingBoxMinY;
        const pz0 = positions[j+2]-boundingBoxMinZ;
        const px1 = positions[j+3]-boundingBoxMinX;
        const py1 = positions[j+4]-boundingBoxMinY;
        const pz1 = positions[j+5]-boundingBoxMinZ;
        const px2 = positions[j+6]-boundingBoxMinX;
        const py2 = positions[j+7]-boundingBoxMinY;
        const pz2 = positions[j+8]-boundingBoxMinZ;

        const vec1x = px0-px1;
        const vec1y = py0-py1;
        const vec1z = pz0-pz1;
        const vec2x = px0-px2;
        const vec2y = py0-py2;
        const vec2z = pz0-pz2;

        //cross product of vectors
        const cProdx = vec1y*vec2z-vec1z*vec2y;
        const cPrody = vec1z*vec2x-vec1x*vec2z;
        const cProdz = vec1x*vec2y-vec1y*vec2x;

        const d = -(cProdx * -px0 + cPrody * -py0 + cProdz * -pz0);
        const cProdMagnitude = Math.sqrt(Math.pow(cProdx,2)+Math.pow(cPrody,2)+Math.pow(cProdz,2));

        const x0 = parseInt(px0);
        const y0 = parseInt(py0);
        const z0 = parseInt(pz0);
        const x1 = parseInt(px1);
        const y1 = parseInt(py1);
        const z1 = parseInt(pz1);
        const x2 = parseInt(px2);
        const y2 = parseInt(py2);
        const z2 = parseInt(pz2);

        const minX = Math.min(...[x0,x1,x2])-distanceFieldBoundingBoxBufferSpace;
        const maxX = Math.max(...[x0,x1,x2])+distanceFieldBoundingBoxBufferSpace;
        const minY = Math.min(...[y0,y1,y2])-distanceFieldBoundingBoxBufferSpace;
        const maxY = Math.max(...[y0,y1,y2])+distanceFieldBoundingBoxBufferSpace;
        const minZ = Math.min(...[z0,z1,z2])-distanceFieldBoundingBoxBufferSpace;
        const maxZ = Math.max(...[z0,z1,z2])+distanceFieldBoundingBoxBufferSpace;

        let smallX = 0;
        let smallY = 0;
        let smallZ = 0;

        for(let x = minX+0.25; x <= maxX; x = x + 0.5){
            for(let y = minY+0.25; y <= maxY; y = y + 0.5){
                for(let z = minZ+0.25; z <= maxZ; z = z + 0.5){
                    const indexLayerOne = parseInt(x)*yRange*zRange+parseInt(y)*zRange+parseInt(z);
                    const indexLayerTwo = smallX*4+smallY*2+smallZ*1;


                    const t = -((cProdx * x + cPrody * y + cProdz * z - d) / (Math.pow(cProdx, 2) + Math.pow(cPrody, 2) + Math.pow(cProdz, 2)));

                    const closestPointx = cProdx*t+x;
                    const closestPointy = cPrody*t+y;
                    const closestPointz = cProdz*t+z;


                    const bcVec1x = closestPointx-px0;
                    const bcVec1y = closestPointy-py0;
                    const bcVec1z = closestPointz-pz0;

                    const bcVec2x = closestPointx-px1;
                    const bcVec2y = closestPointy-py1;
                    const bcVec2z = closestPointz-pz1;

                    const bcVec3x = closestPointx-px2;
                    const bcVec3y = closestPointy-py2;
                    const bcVec3z = closestPointz-pz2;

                    const bcCross1x = bcVec2y*bcVec3z-bcVec2z*bcVec3y;
                    const bcCross1y = bcVec2z*bcVec3x-bcVec2x*bcVec3z;
                    const bcCross1z = bcVec2x*bcVec3y-bcVec2y*bcVec3x;

                    const bcCross2x = bcVec3y*bcVec1z-bcVec3z*bcVec1y;
                    const bcCross2y = bcVec3z*bcVec1x-bcVec3x*bcVec1z;
                    const bcCross2z = bcVec3x*bcVec1y-bcVec3y*bcVec1x;

                    const bcCross1Magnitude = Math.sqrt(Math.pow(bcCross1x,2)+Math.pow(bcCross1y,2)+Math.pow(bcCross1z,2));
                    const bcCross2Magnitude = Math.sqrt(Math.pow(bcCross2x,2)+Math.pow(bcCross2y,2)+Math.pow(bcCross2z,2));

                    const area1 = bcCross1Magnitude/cProdMagnitude;
                    const area2 = bcCross2Magnitude/cProdMagnitude;
                    const area3 = 1 - area1 - area2;
                    
                    if(distanceFieldLayerOneArray[indexLayerOne] == 0){
                        distanceFieldLayerOneArray[indexLayerOne] = counter;
                        counter++; 
                    }
                    const newIndex = (distanceFieldLayerOneArray[indexLayerOne])*8+indexLayerTwo;
                    
                    

                    if((area1 < 1.0 && area1 > 0.0 && area2 < 1.0 && area2 > 0.0 && area3 < 1.0 && area3 > 0.0) && once){
                        
                        const distanceVecx = closestPointx-x;
                        const distanceVecy = closestPointy-y;
                        const distanceVecz = closestPointz-z;
                        const distance = Math.sqrt(Math.pow(distanceVecx,2)+Math.pow(distanceVecy,2)+Math.pow(distanceVecz,2));
                        
                        const distanceScaled = parseInt(distance*layerTwoDistanceScale)+1 > 255 ? 255 : parseInt(distance*layerTwoDistanceScale)+1;
                        
                        //console.log("indexLayerOne: ",indexLayerOne);
                        //console.log("index layer two: ", newIndex)
                        if(distanceFieldLayerTwoArray[newIndex] > distanceScaled) {
                            distanceFieldLayerTwoArray[newIndex] = distanceScaled;
                        }
                        
                    } 

                    smallZ = smallZ ? 0 : 1;
                }
                smallY = smallY ? 0 : 1;
            }
            smallX = smallX ? 0 : 1;
        }
        once = false;
    }

    const distanceFieldGeometry = new THREE.BufferGeometry();

    // itemSize = 3 because there are 3 values (components) per vertex
    distanceFieldGeometry.setAttribute( 'position', new THREE.BufferAttribute( distanceFieldTestArray, 3 ) );
    
    const distanceFieldMesh = new THREE.Mesh( distanceFieldGeometry, greyPhongMaterial);

    scene.add( distanceFieldMesh);

    worldObjectsUpdateWithIndex(worldObjectIndex,{distanceFieldBoundingBox: {displacement: {x:displacementX, y:displacementY,  z:displacementZ}, min: {x: boundingBoxMinX, y: boundingBoxMinY, z: boundingBoxMinZ}, max:{x: boundingBoxMaxX, y: boundingBoxMaxY, z: boundingBoxMaxZ}}, distanceFieldLayerOne: distanceFieldLayerOneArray, distanceFieldLayerTwo: distanceFieldLayerTwoArray})
 
}*/