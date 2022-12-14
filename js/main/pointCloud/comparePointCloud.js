const jetpack = require("fs-jetpack");
const fs = require("fs");
const distanceFieldBoundingBoxBufferSpace = 10;
const Uint16ByteLength = 2;
const Float32ByteLength = 4;
const Uint8ByteLength = 1;
const polygonPointCords = 9;
const worldObjectInListMaxNameLength = 16;
const Uint16MaxPossibleValues = 65535;
 

function numDigits(x) {
    return (Math.log10((x ^ (x >> 31)) - (x >> 31)) | 0) + 1;
}

function scale (number, inMin, inMax, outMin, outMax) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  }
  
  function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

async function comparePointCloud(app, filepath, customDisplacement, cubeResolution) {
    const rs = fs.createReadStream(filepath);

    const tempDirLocation = app.getPath("temp");
    let dfData = JSON.parse(jetpack.read(tempDirLocation + "/digitalInspectionApp/distanceFieldData.json"));

    const distanceField = jetpack.read(tempDirLocation + "/digitalInspectionApp/distanceField.json");

    dfData.distanceField = JSON.parse(distanceField);

    console.log(dfData.distanceField[0]);

    let remainder = [];
    let globalPointCloudErrorPoints = new Map();
    const coordsSize = 3;
    const normalsSize = 3;
    //const maxValueAccepted = parseInt((Uint16MaxPossibleValues-1)/(distanceFieldBoundingBoxBufferSpace+1));
    const maxValueAccepted = 60000;

    const lengthOfDistanceField = Object.keys(dfData.distanceField).length;
    const space = ' '.charCodeAt(0);
    const dot = '.'.charCodeAt(0);
    const newline = '\n'.charCodeAt(0);

    //parse point cloud as buffers
    for await (const buf of rs) {
   
        const buffer = Buffer.concat([Buffer.from(remainder), buf]);
        remainder = [];
        //remainder = parseBuffer(, remainder.length+buf.length), dfData, lengthOfDistanceField, errorPoints);
        
        let cursorAt = 0;
        while(cursorAt < buffer.length){
            let intPart = [];
            let floatPart = [];
            let normals = [];
            let normalsCodes = [];
            let intCodes = [];
            let floatCodes = [];
            let cursorAtPrepend = cursorAt;

            //get coords
            for(let i = 0; i < coordsSize; i++){
                while(buffer[cursorAt] != dot && cursorAt < buffer.length){
                    intCodes.push(buffer[cursorAt]);
                    cursorAt += 1;
                }
                intCodes.push(dot);
                cursorAt += 1;
                while(buffer[cursorAt] != space && cursorAt < buffer.length){
                    intCodes.push(buffer[cursorAt]);
                    floatCodes.push(buffer[cursorAt]);
                    cursorAt += 1;
                }
                cursorAt += 1;
                intPart[i] = Number(intCodes.reduce((acc, curr) => acc + String.fromCharCode(curr), ""));
                floatPart[i] = Number(floatCodes.reduce((acc, curr) => acc + String.fromCharCode(curr), ""));
                intCodes = [];
                floatCodes = [];
            }

            //get normals
            for(let i = 0; i < normalsSize; i++){
                while(buffer[cursorAt] != space && buffer[cursorAt] != newline && cursorAt < buffer.length){
                    normalsCodes.push(buffer[cursorAt]);
                    cursorAt += 1;
                }
                cursorAt += 1;
                normals[i] = Number(normalsCodes.reduce((acc, curr) => acc + String.fromCharCode(curr), ""));
                normalsCodes = [];
            }

            if(cursorAt >= buffer.length){
                for(let i = cursorAtPrepend; i < buffer.length; i++){
                    remainder.push(buffer[i]);
                }
                break;  
            } else {
                const xCord = parseInt(intPart[0]+dfData.displacement.x+customDisplacement.x);
                const yCord = parseInt(intPart[1]+dfData.displacement.y+customDisplacement.y);
                const zCord = parseInt(intPart[2]+dfData.displacement.z+customDisplacement.z);
                const index = xCord*dfData.range.y*dfData.range.z+yCord*dfData.range.z+zCord;
                const indexOutOfBounds = (index < 0 && index >= lengthOfDistanceField);
                if(indexOutOfBounds){
                    console.log("index out of bounds");

                }
                
                if(indexOutOfBounds || dfData.distanceField[index] >= maxValueAccepted) {
                    let commaCoords = [];

                    //Get CommaPart;
                    for(let i = 0; i < coordsSize; i++){
                        commaCoords.push(floatPart[i] != 0 ? parseInt(floatPart[i]/((10/cubeResolution) * (10 ** (numDigits(floatPart[i])-1)))) : 0);
                    }

                    let ccoords = [(xCord-dfData.displacement.x)*cubeResolution+commaCoords[0],(yCord-dfData.displacement.y)*cubeResolution+commaCoords[1],(zCord-dfData.displacement.z)*cubeResolution+commaCoords[2]]
                    globalPointCloudErrorPoints.set(ccoords.join(","),indexOutOfBounds ? 0 : dfData.distanceField[index]);
                }
            }
        }
    }
    return globalPointCloudErrorPoints;

}

module.exports.comparePointCloud = comparePointCloud;