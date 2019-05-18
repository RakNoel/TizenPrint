//Global variables
let activeWindow = "mainMenu";
const possibleAxisSpeeds = [5, 10, 50];
const possibleAxisName = ["x", "y", "z"];
let axisControl = {
    currentAxis: 0,
    currentSpeed: 0,
};

//Document load
$(function () {
    //Events
    document.addEventListener("hardwareRotate", controlAxis);
    document.addEventListener("pagechange", updateActiveWindow);

    $("#axisSpeed").on("click", rotateAxisSpeed);
    $("#imgXYZContainer").on("click", rotateAxisName);

    //Setup
    $("#axisSpeedText").text(possibleAxisSpeeds[axisControl.currentSpeed]);
    setAxisDisplay();

    //Connect and run
    automaticConnection().then(() => {
        console.log("Connected");
        fillMenu();
        window.setInterval(() => {
            fillMenu();
        }, 1000);
    });
});

function controlAxis(event) {
    if (activeWindow !== "axis") {
        return true;
    }

    console.log(event);
    let rotaryDirection = (event.detail.direction === undefined) ? event.detail.direction : "CW";

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
    updateActiveWindow();
    document.dispatchEvent(new CustomEvent("hardwareRotate", event));
}

function updateActiveWindow() {
    activeWindow = $(".ui-page-active")[0].id;
    console.log(activeWindow);
}

async function automaticConnection() {
    getStatus("api/connection").then(result => {
        if (result.current.state !== "Operational") {
            let data = {
                command: "connect"
            };
            postPrinter("api/connection", data).then(() => {
                console.log("Connecting");
            });
        }
    });
}

function fillMenu() {
    getStatus("api/printer").then(result => {
        $("#printerStatus").text("State: " + result.state.text);
        if (typeof result.temperature.tool0 !== undefined) {
            $("#hotend").text(result.temperature.tool0.actual + " / " + result.temperature.tool0.target);
        }
        if (typeof result.temperature.bed !== undefined) {
            $("#heatbed").text(result.temperature.bed.actual + " / " + result.temperature.bed.target);
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