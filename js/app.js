//Global variables
let activeWindow = "mainMenu";
let printerStatus = "";
const possibleAxisSpeeds = [5, 10, 15];
const possibleAxisName = ["x", "y", "z"];
let axisControl = {
    currentAxis: 0,
    currentSpeed: 0,
};
let printerFiles = [];
let selectedPrinterFile = 0;

//Document load
$(function () {
    //Events
    document.addEventListener("hardwareRotate", controlAxis);
    document.addEventListener("hardwareRotate", changePrintFile);
    document.addEventListener("pagechange", updateActiveWindow);
    document.addEventListener("printerStatusChange", setPrintingMode);

    $("#axisSpeed").on("click", rotateAxisSpeed);
    $("#imgXYZContainer").on("click", rotateAxisName);

    //Setup
    $("#axisSpeedText").text(possibleAxisSpeeds[axisControl.currentSpeed]);
    setAxisDisplay();

    //Connect and run
    automaticConnection().then(() => {
        console.log("Connected");
        fillMenu();
        loadAllPrinterFiles();
        window.setInterval(() => {
            fillMenu();
        }, 1000);
    });
});

function setPrintingMode() {
    let visible = (printerStatus !== "Operational") ? "hidden" : "";
    try {
        $("#axisLink").css("visibility", visible);
        $("#printLink").css("visibility", visible);
    } catch (err) {
        //Ignore
    }
}

function controlAxis(event) {
    if (activeWindow !== "axis") {
        return true;
    }
    if (printerStatus !== "Operational") {
        return true;
    }

    console.log(event);
    let rotaryDirection = (event.detail.direction === undefined) ? "CW" : event.detail.direction;

    let moves = [0, 0, 0];
    let dirMod = (rotaryDirection === "CW") ? 1 : -1;
    moves[axisControl.currentAxis] += dirMod * possibleAxisSpeeds[axisControl.currentSpeed];

    let printerAction = {
        "command": "jog",
        "speed": 1000,
        "x": moves[0],
        "y": moves[1],
        "z": moves[2],
    };
    console.log(printerAction);
    postPrinter("api/printer/printhead", printerAction);
}

function rotateAxisSpeed() {
    axisControl.currentSpeed = ++axisControl.currentSpeed % possibleAxisSpeeds.length;
    $("#axisSpeedText").text(possibleAxisSpeeds[axisControl.currentSpeed]);
}

function rotateAxisName() {
    axisControl.currentAxis = ++axisControl.currentAxis % possibleAxisName.length;
    setAxisDisplay();
}

function setAxisDisplay() {
    $(".cls-2").attr("hidden", true);
    $(".cls-3").removeClass("cls-3");
    let axisLetter = possibleAxisName[axisControl.currentAxis];

    //Show axis letter
    let svgAxisLetter = "#" + axisLetter + "AxisImg";
    $(svgAxisLetter).attr("hidden", null);

    //Set axis red
    let svgAxisLine = "#" + axisLetter + "Line";
    let svgAxisArrow = "#" + axisLetter + "Arrow";
    $(svgAxisLine).addClass("cls-3");
    $(svgAxisArrow).addClass("cls-3");
}

function rotaryHandler(event) {
    document.dispatchEvent(new CustomEvent("hardwareRotate", event));
}

function updateActiveWindow() {
    activeWindow = $(".ui-page-active")[0].id;
    console.log(activeWindow);
}

async function automaticConnection() {
    getStatus("api/connection").then(result => {
        if (result.current.state === "Closed") {
            let data = {
                command: "connect"
            };
            postPrinter("api/connection", data).then(() => {
                console.log("Connecting");
            });
        }
        setPrintingMode();
    });
}

function fillMenu() {
    getStatus("api/printer").then(result => {

        if (printerStatus !== result.state.text) {
            printerStatus = result.state.text;
            let e = {bubbles: false, cancelable: false, detail: null};
            document.dispatchEvent(new CustomEvent("printerStatusChange", e));
        }
        $("#printerStatus").text("State: " + result.state.text);
        if (typeof result.temperature.tool0 !== undefined) {
            $("#hotend").text(result.temperature.tool0.actual + " / " + result.temperature.tool0.target);
        }
        if (typeof result.temperature.bed !== undefined) {
            $("#heatbed").text(result.temperature.bed.actual + " / " + result.temperature.bed.target);
        }
        if (printerStatus === "Printing") {
            getStatus("api/job").then(result => {
                if (typeof result.job.file.display !== undefined) {
                    $("#menuSelectedFile").text(result.job.file.display);
                }
                if (typeof result.progress.completion !== undefined) {
                    $("#menuProgress").text(parseInt(result.progress.completion, 10) + "%");
                }
                if (typeof result.progress.printTimeLeft !== undefined) {
                    $("#menuTimeLeft").text(secondsToHms(result.progress.printTimeLeft));
                }
            }, () => {
                console.error("Unable to read job");
            });
        }
    }, () => {
        $("#printerStatus").text("State: Not operational");
        console.log("non operational");
    });
}

async function postPrinter(requestUrl, data) {
    let secrets = loadSecrets();
    return $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "http://" + secrets.printServer + ":" + secrets.printerPort + "/" + requestUrl,
        data: JSON.stringify(data),
        success: result => {
            return result;
        },
        error: error => {
            return error;
        },
        dataType: "json",
        beforeSend: setHeaders
    });
}

async function getStatus(requestUrl) {
    let secrets = loadSecrets();
    return $.ajax({
        url: "http://" + secrets.printServer + ":" + secrets.printerPort + "/" + requestUrl,
        type: "GET",
        datatype: "json",
        success: result => {
            return result;
        },
        error: () => {
            console.error("Connection failure");
            return null;
        },
        beforeSend: setHeaders
    });
}

function setHeaders(xhr) {
    let secrets = loadSecrets();
    xhr.setRequestHeader("X-Api-Key", secrets.api_token);
}

async function loadStream() {
    let secrets = loadSecrets();
    $("#streamImage").attr("src", "http://" + secrets.printServer + ":" + secrets.printerPort + "/webcam/?action=stream");
}

async function unloadStream() {
    $("#streamImage").attr("src", "");
}

function terminalCommand(gcode) {
    let printerAction = {
        "command": gcode
    };
    console.log(printerAction);
    postPrinter("api/printer/command", printerAction);
}

function preHeat(filament) {
    let temp = {
        hotEnd: 0,
        heatbed: 0
    };
    switch (filament) {
        case "PA12":
            temp.hotEnd = 250;
            temp.heatbed = 100;
            break;
        case "PETG":
            temp.hotEnd = 230;
            temp.heatbed = 85;
            break;
        case "PLA":
            temp.hotEnd = 215;
            temp.heatbed = 60;
            break;
        default:
            break;
    }

    let printerToolAction = {
        "command": "target",
        "targets": {
            "tool0": temp.hotEnd
        }
    };
    postPrinter("api/printer/tool", printerToolAction);

    let printerBedAction = {
        "command": "target",
        "target": temp.heatbed
    };
    postPrinter("api/printer/bed", printerBedAction);

}

function loadAllPrinterFiles() {
    getStatus("/api/files").then(result => {
        printerFiles = fileObjectToList(result.files).sort(function (a, b) {
            return b.date - a.date;
        });
        console.log(printerFiles);
        if (printerFiles.length > 0) {
            displayPrinterFile();
        }
    });
}

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    return h + ":" + m + ":" + s;
}

function fileObjectToList(object) {
    let list = [];
    for (let item in object) {
        if (object[item].type === "folder") {
            list = list.concat(fileObjectToList(object[item].children));
        } else {
            list.push(object[item]);
        }
    }
    return list;
}

function displayPrinterFile(){
    $("#printFileName").text(printerFiles[selectedPrinterFile].path);
    $("#printFileType").text(printerFiles[selectedPrinterFile].type);
    $("#printFileOrigin").text(printerFiles[selectedPrinterFile].origin);
    if (printerFiles[selectedPrinterFile].origin === "local"){
        $("#printFileTime").text(secondsToHms(printerFiles[selectedPrinterFile].gcodeAnalysis.estimatedPrintTime));
    } else {
        $("#printFileTime").text("unavalible");
    }
}

function changePrintFile(rotaryEvent) {
    if (activeWindow !== "print") {
        return true;
    }
    if (printerStatus !== "Operational") {
        return true;
    }

    let rotaryDirection = (rotaryEvent.detail.direction === undefined) ? "CW" : rotaryEvent.detail.direction;

    selectedPrinterFile += (rotaryDirection === "CW") ? 1 : -1;
    selectedPrinterFile = mod(selectedPrinterFile, printerFiles.length);
    displayPrinterFile();
}

function startPrint() {
    let postUri = "api/files/" + printerFiles[selectedPrinterFile].origin + "/" + printerFiles[selectedPrinterFile].path;
    let printerCommand = {
        "command": "select",
        "print": true
    };
    postPrinter(postUri,printerCommand);
}

//Fixes negative number modulo
function mod(n, m) {
    return ((n % m) + m) % m;
}