const cubeResolution = 2;
const jetpack = require("fs-jetpack");

function checkCollisionWithDistanceField(coords, dfData, customDisplacement){
  const index = (coords[0]+dfData.displacement.x+customDisplacement.x)*dfData.range.y*dfData.range.z
                +(coords[1]+dfData.displacement.y+customDisplacement.y)*dfData.range.z
                +(coords[2]+dfData.displacement.z+customDisplacement.z);
  const indexOutOfBounds = (index < 0 && index >= lengthOfDistanceField);
  
  if(indexOutOfBounds || dfData.distanceField[index] >= 40) {
    errorsInPoints++;
    let commaCoords = [];
    for(let i = 0; i < coordSize; i++){
      let commaPart = false;
      while(buffer[cursorAtPrepend] != 32){
        if(commaPart){
          charCodes.push(buffer[cursorAtPrepend]);
        }
        if(buffer[cursorAtPrepend] == 46){
          commaPart = true;
        }
        cursorAtPrepend += 1;
      }
      cursorAtPrepend += 1;
      let commaNumber = Number(charCodes.reduce((acc, curr) => acc + String.fromCharCode(curr), ""));
      commaCoords[i] = commaNumber != 0 ? parseInt(commaNumber/((10/cubeResolution) * (10 ** (charCodes.length-1)))) : 0;
      charCodes = [];
    }

    let cubesCoordinates = [coords[0]*cubeResolution+commaCoords[0],coords[1]*cubeResolution+commaCoords[1],coords[2]*cubeResolution+commaCoords[2]]

    if(!errorPoints[cubesCoordinates[0]]){
      errorPoints[cubesCoordinates[0]] = {}
      errorPoints[cubesCoordinates[0]][cubesCoordinates[1]] = {}
      errorPoints[cubesCoordinates[0]][cubesCoordinates[1]][cubesCoordinates[2]] = indexOutOfBounds ? 255 : dfData.distanceField[index];
    } else if(!errorPoints[cubesCoordinates[0]][cubesCoordinates[1]]){
      errorPoints[cubesCoordinates[0]][cubesCoordinates[1]] = {}
      errorPoints[cubesCoordinates[0]][cubesCoordinates[1]][cubesCoordinates[2]] = indexOutOfBounds ? 255 : dfData.distanceField[index];
    } else if(!errorPoints[cubesCoordinates[0]][cubesCoordinates[1]][cubesCoordinates[2]]){
      errorPoints[cubesCoordinates[0]][cubesCoordinates[1]][cubesCoordinates[2]] = indexOutOfBounds ? 255 : dfData.distanceField[index];
    } 
  }
}

function parseBuffer(buffer, dfData, lengthOfDistanceField, errorPoints) {
  /*const tab = '\t'.charCodeAt(0);
	const f0 = line.indexOf(tab, start || 0);
	const f1 = line.indexOf(tab, f0 + 1);
	const data = line.slice(f0 + 1, f1).toString();*/
  /*
  for(let i = 0; i < 1; i++){
    const index = (parseInt(coords[i*PointCloudLineLength])+dfData.displacement.x)*dfData.range.y*dfData.range.z+(parseInt(coords[i*PointCloudLineLength])+dfData.displacement.y)*dfData.range.z+(parseInt(coords[i*PointCloudLineLength])+dfData.displacement.z);
    if(dfData.distanceField[index] == 255){
      errors++;
    }
  }
  */
  
  const tab = '\t'.charCodeAt(0);
  const newline = '\n'.charCodeAt(0);
  
  let doTest = 1;
  let cursorAt = 0;

  let coords = [];
  let charCodes = [];
  while(cursorAt < buffer.length){
    let cursorAtPrepend = cursorAt;
    const coordsPreLength = coords.length;
    for(let i = 0; i < coordSize-coordsPreLength; i++){
      while(buffer[cursorAt] != 46 && cursorAt < buffer.length){
        charCodes.push(buffer[cursorAt]);
        cursorAt += 1;
      }
      cursorAt += 6;
      coords[i] = Number(charCodes.reduce((acc, curr) => acc + String.fromCharCode(curr), ""));
      charCodes = [];
    }
    cursorAt += 27;
    if(cursorAt >= buffer.length){
      const remainder = [];
      for(let i = cursorAtPrepend; i < buffer.length; i++){
        remainder.push(buffer[i]);
      }
      return Buffer.from(remainder);
    }
    
    doTest--;
    coords = [];
  }
  return [];
}

async function loadPointCloud(filepath) {
  const rs = fs.createReadStream(filepath);
  const nl = '\n'.charCodeAt(0);

  const tempDirLocation = app.getPath("temp");
  let dfData = JSON.parse(jetpack.read(tempDirLocation + "/digitalInspectionApp/file.json"));
  console.log(dfData.displacement);
  console.log(dfData.range);
  errorsInPoints = 0;
  let numberOfBuffers = 0;
  data = ""
  let errors = 0;
  let remainder = Buffer.from([]);
  let errorPoints = {};

  const lengthOfDistanceField = Object.keys(dfData.distanceField).length;
	for await (const buf of rs) {
    remainder = parseBuffer(Buffer.concat([remainder, buf], remainder.length+buf.length), dfData, lengthOfDistanceField, errorPoints);
	}
  let geometry = marchingCubesCallback(errorPoints);
  return geometry;

}