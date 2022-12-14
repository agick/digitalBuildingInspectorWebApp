// main.js

// Modules to control application life and create native browser window


const {
  app,
  BrowserWindow,
  ipcMain
} = require("electron");
const NodeStl = require("node-stl");
const path = require("path");

const { comparePointCloud } = require("./js/main/pointCloud/comparePointCloud");
const fs = require("fs");
const { generateDistanceFieldFromMain, generateDistanceFieldFromMainQuickly } = require("./js/main/generateDistanceFieldFromMain");
const { marchingCubesCallback } = require("./js/main/marchingCubes.js")
const three = require("three");
const jetpack = require("fs-jetpack");
var STLLoader = require('three-stl-loader')(three);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let worldObjectsInMain = [];
let df = null;

const modelLoader = new STLLoader()

const createWindow = () => {
  // Create the browser window.
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true, // <--- flag
      nodeIntegrationInWorker: true // <---  for web workers
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})



let currentDistanceFieldPath = "";

function replaceMapValues(key, value) {
  if(value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

function convertMapToArray(map, distanceField){
  let length = 0;
  let index = 0;
  for(let [key, value] of map.entries()){
    length++;
    for(let [key2, value2] of value.entries()){
      length++;
    }
  }
  const entangledPolygonsArrayBuffer = new ArrayBuffer(length*4);
  const entangledPolygonsArray = new Uint32Array(entangledPolygonsArrayBuffer);

  for(let [key, value] of map.entries()){
    distanceField[key+1] = index;
    let numOfPolygons = 0;
    for(let [key2, value2] of value.entries()){
      numOfPolygons++;
      entangledPolygonsArray[index+numOfPolygons] = key2;
    }
    entangledPolygonsArray[index] = numOfPolygons;
    index += numOfPolygons+1;
  }

  return entangledPolygonsArray;
}


ipcMain.on("toMain", async (event, args) => {
  if(args.event == "pointCloudUpload") {
    const cubeResolution = 2;
      const errorPoints = await comparePointCloud(app, args.path, {x: 0, y: 0, z: 0}, cubeResolution);
      const responseObj = marchingCubesCallback(errorPoints, cubeResolution);
      // Send result back to renderer process
      mainWindow.webContents.send("fromMain", { type: "geometry", data: responseObj }); 
  } else if(args.event == "modelUpload") {
    console.log("model uploaded");
    const Date1 = new Date();
    df = generateDistanceFieldFromMain(args.boundingBox, args.positions, args.itemSize, args.itemCount);
    const Date2 = new Date();
    console.log("time to generate distance field: ", Date2.getTime()-Date1.getTime());


    // Send result back to renderer process
    const tempDirLocation = app.getPath("temp") + "digitalInspectionApp";
    currentDistanceFieldPath = tempDirLocation;
    //jetpack.write(tempDirLocation + "digitalInspectionApp/file.json", df);    


    await fs.promises.mkdir(tempDirLocation, { recursive: true }).catch(console.error);


    fs.writeFile(tempDirLocation + "/distanceFieldData.json", JSON.stringify({ displacement: df.displacement, range: df.range }), () => {});    
    fs.writeFile(tempDirLocation + "/distanceField.json", JSON.stringify(df.distanceField), () => {
      console.log("success!");
    }); 
    /*fs.writeFile(tempDirLocation + "/polygons.json",JSON.stringify(df.polygons), (test) => {
      console.log(test);
      console.log("success!");
    }); 

    const entangledPolygonsArray = convertMapToArray(df.entangledPolygons, df.distanceField);;
    
    fs.writeFile(tempDirLocation + "/entangledPolygons.json", JSON.stringify(entangledPolygonsArray), (error) => {
      console.log(error);
      console.log("success!");
    });
*/
    
    console.log(tempDirLocation);
          
    mainWindow.webContents.send("fromMain", "finished"); 
  }
});