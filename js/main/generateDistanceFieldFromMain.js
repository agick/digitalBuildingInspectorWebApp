const distanceFieldBoundingBoxBufferSpace = 10;
const Uint16ByteLength = 2;
const Float32ByteLength = 4;
const Uint8ByteLength = 1;
const polygonPointCords = 9;
const worldObjectInListMaxNameLength = 16;
const Uint16MaxPossibleValues = 65534;



function generateDistanceFieldFromMain(boundingBox, positions, itemSize, itemCount){
    const layerOneDistanceScale = (Uint16MaxPossibleValues-1)/(distanceFieldBoundingBoxBufferSpace+1);
    const maxRangeErrorScaled = parseInt(0.87*layerOneDistanceScale)+1;
    const maxValueAccepted = parseInt(1*(Uint16MaxPossibleValues-1)/(distanceFieldBoundingBoxBufferSpace+1));
    
    let entangledPolygons = new Map();

    const boundingBoxMinX = Math.floor(boundingBox.min.x)-distanceFieldBoundingBoxBufferSpace;
    const boundingBoxMinY = Math.floor(boundingBox.min.y)-distanceFieldBoundingBoxBufferSpace;
    const boundingBoxMinZ = Math.floor(boundingBox.min.z)-distanceFieldBoundingBoxBufferSpace;

    const boundingBoxMaxX = Math.ceil(boundingBox.max.x)+distanceFieldBoundingBoxBufferSpace;
    const boundingBoxMaxY = Math.ceil(boundingBox.max.y)+distanceFieldBoundingBoxBufferSpace;
    const boundingBoxMaxZ = Math.ceil(boundingBox.max.z)+distanceFieldBoundingBoxBufferSpace;

    const displacementX = (0-boundingBoxMinX);
    const displacementY = (0-boundingBoxMinY);
    const displacementZ = (0-boundingBoxMinZ);

    const xRange = boundingBoxMaxX-boundingBoxMinX;
    const yRange = boundingBoxMaxY-boundingBoxMinY;
    const zRange = boundingBoxMaxZ-boundingBoxMinZ;

    const distanceFieldLayerOneArrayLength = parseInt((xRange)*(yRange)*(zRange));

    const distanceFieldLayerOneArrayBuffer = new ArrayBuffer(distanceFieldLayerOneArrayLength*Uint16ByteLength*2);
    const distanceFieldLayerOneArray = new Uint16Array(distanceFieldLayerOneArrayBuffer);
    
    for(let i = 0; i < distanceFieldLayerOneArray.length; i++){
        distanceFieldLayerOneArray[i] = Uint16MaxPossibleValues;
    }

    const polygonSize = itemSize*3;
    const polygonsCount = itemCount/3;

    const polygonsAsFloatArrayBuffer = new ArrayBuffer(polygonsCount*polygonSize*Float32ByteLength);
    const polygonsAsFloatArray = new Float32Array(polygonsAsFloatArrayBuffer);

    for(let i = 0; i < polygonsCount; i++){
        const pIndex = i*polygonSize;

        const px0 = positions[pIndex];
        const py0 = positions[pIndex+1];
        const pz0 = positions[pIndex+2];
        const px1 = positions[pIndex+3];
        const py1 = positions[pIndex+4];
        const pz1 = positions[pIndex+5];
        const px2 = positions[pIndex+6];
        const py2 = positions[pIndex+7];
        const pz2 = positions[pIndex+8];

        polygonsAsFloatArray[pIndex] = px0;
        polygonsAsFloatArray[pIndex+1] = py0;
        polygonsAsFloatArray[pIndex+2] = pz0;
        polygonsAsFloatArray[pIndex+3] = px1;
        polygonsAsFloatArray[pIndex+4] = py1;
        polygonsAsFloatArray[pIndex+5] = pz1;
        polygonsAsFloatArray[pIndex+6] = px2;
        polygonsAsFloatArray[pIndex+7] = py2;
        polygonsAsFloatArray[pIndex+8] = pz2;
        
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

        for(let x = minX; x <= maxX; x++){
            for(let y = minY; y <= maxY; y++){
                for(let z = minZ; z <= maxZ; z++){
                    const index = ((x+displacementX)*yRange*zRange+(y+displacementY)*zRange+(z+displacementZ))*2;
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

                    const bcCross1Magnitude = Math.sqrt(Math.pow(bcCross1x,2)+Math.pow(bcCross1y,2)+Math.pow(bcCross1z,2));
                    const bcCross2Magnitude = Math.sqrt(Math.pow(bcCross2x,2)+Math.pow(bcCross2y,2)+Math.pow(bcCross2z,2));

                    const area1 = bcCross1Magnitude/cProdMagnitude;
                    const area2 = bcCross2Magnitude/cProdMagnitude;
                    const area3 = 1 - area1 - area2;

                    const distanceVecx = closestPointx-xVal;
                    const distanceVecy = closestPointy-yVal;
                    const distanceVecz = closestPointz-zVal;
                    const distance = Math.sqrt(Math.pow(distanceVecx,2)+Math.pow(distanceVecy,2)+Math.pow(distanceVecz,2));
                    const distanceScaled = parseInt(distance*layerOneDistanceScale)+1 > Uint16MaxPossibleValues ? Uint16MaxPossibleValues : parseInt(distance*layerOneDistanceScale)+1;
                    let minDistanceScaled = distanceScaled;
                    if(distanceFieldLayerOneArray[index] > distanceScaled+maxRangeErrorScaled){
                        if(distanceFieldLayerOneArray[index] > distanceScaled && area1 < 1.0 && area1 > 0.0 && area2 < 1.0 && area2 > 0.0 && area3 < 1.0 && area3 > 0.0){
                            /*if(distanceFieldLayerOneArray[index] > minDistanceScaled+maxRangeErrorScaled && minDistanceScaled-maxRangeErrorScaled < maxValueAccepted){
                                if(entangledPolygons.get(index) !== undefined){
                                    let map = entangledPolygons.get(index);
                                    map.set(pIndex, minDistanceScaled);
                                    entangledPolygons.set(index, map);
                                } else {
                                    let map = new Map()
                                    map.set(pIndex, minDistanceScaled);
                                    entangledPolygons.set(index, map);
                                }
                            } */
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

                            const distance0 = t0 <= 0 ? Math.sqrt(Math.pow(vecPT1x,2)+Math.pow(vecPT1y,2)+Math.pow(vecPT1z,2)) : 
                                                (t0 >= 1 ? Math.sqrt(Math.pow(xVal-px1,2)+Math.pow(yVal-py1,2)+Math.pow(zVal-pz1,2)) :
                                                Math.sqrt(Math.pow(xVal-(px0+t0*vecM1x),2)+Math.pow(yVal-(py0+t0*vecM1y),2)+Math.pow(zVal-(pz0+t0*vecM1z),2)));

                            const vecM2x = px2-px1;
                            const vecM2y = py2-py1;
                            const vecM2z = pz2-pz1;

                            const vecPT2x = xVal-px1;
                            const vecPT2y = yVal-py1;
                            const vecPT2z = zVal-pz1;

                            const dotPP2 = vecPT2x*vecM2x+vecPT2y*vecM2y+vecPT2z*vecM2z;
                            const dotPM2 = vecM2x*vecM2x+vecM2y*vecM2y+vecM2z*vecM2z;

                            const t1 = dotPP2/dotPM2;

                            const distance1 = t1 <= 0 ? Math.sqrt(Math.pow(vecPT2x,2)+Math.pow(vecPT2y,2)+Math.pow(vecPT2z,2)) : 
                                                (t1 >= 1 ? Math.sqrt(Math.pow(xVal-px2,2)+Math.pow(yVal-py2,2)+Math.pow(zVal-pz2,2)) :
                                                Math.sqrt(Math.pow(xVal-(px1+t1*vecM2x),2)+Math.pow(yVal-(py1+t1*vecM2y),2)+Math.pow(zVal-(pz1+t1*vecM2z),2)));
                                
                            const vecM3x = px0-px2;
                            const vecM3y = py0-py2;
                            const vecM3z = pz0-pz2;

                            const vecPT3x = xVal-px2;
                            const vecPT3y = yVal-py2;
                            const vecPT3z = zVal-pz2;

                            const dotPP3 = vecPT3x*vecM3x+vecPT3y*vecM3y+vecPT3z*vecM3z;
                            const dotPM3 = vecM3x*vecM3x+vecM3y*vecM3y+vecM3z*vecM3z;

                            const t2 = dotPP3/dotPM3;

                            const distance2 = t2 <= 0 ? Math.sqrt(Math.pow(vecPT3x,2)+Math.pow(vecPT3y,2)+Math.pow(vecPT3z,2)) : 
                                                (t2 >= 1 ? Math.sqrt(Math.pow(xVal-px0,2)+Math.pow(yVal-py0,2)+Math.pow(zVal-pz0,2)) :
                                                Math.sqrt(Math.pow(xVal-(px2+t2*vecM3x),2)+Math.pow(yVal-(py2+t2*vecM3y),2)+Math.pow(zVal-(pz2+t2*vecM3z),2)));
        
                            const minDistance = Math.min(...[distance0, distance1, distance2]);
                            minDistanceScaled = parseInt(minDistance*layerOneDistanceScale)+1 > Uint16MaxPossibleValues ? Uint16MaxPossibleValues : parseInt(minDistance*layerOneDistanceScale)+1;

                            /*if(distanceFieldLayerOneArray[index] > minDistanceScaled+maxRangeErrorScaled && minDistanceScaled-maxRangeErrorScaled < maxValueAccepted){
                                if(entangledPolygons.get(index) !== undefined){
                                    let map = entangledPolygons.get(index);
                                    map.set(pIndex, minDistanceScaled);
                                    entangledPolygons.set(index, map);
                                } else {
                                    let map = new Map()
                                    map.set(pIndex, minDistanceScaled);
                                    entangledPolygons.set(index, map);
                                }
                            } */
                            if(distanceFieldLayerOneArray[index] > minDistanceScaled){
                                distanceFieldLayerOneArray[index] = minDistanceScaled;
                            }
                        }
                    }  
                }
            }
        }
    }

    return { 
        distanceField: distanceFieldLayerOneArray, 
        polygons: polygonsAsFloatArray, 
        entangledPolygons: entangledPolygons, 
        displacement: { x: displacementX, y: displacementY, z: displacementZ}, 
        range: { x: xRange, y: yRange, z: zRange },
        maxDistanceToPolygon: 2,
        scaleValue: Uint16MaxPossibleValues,
    };
}

module.exports.generateDistanceFieldFromMain = generateDistanceFieldFromMain
