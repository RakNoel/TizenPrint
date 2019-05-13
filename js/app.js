//Document load
$(function () {
    automaticConnection().then(() => {
        console.log("Connected");
        fillMenu();
        window.setInterval(() => {
            fillMenu();
        }, 1000);
    });
});

async function automaticConnection() {
    getStatus("api/connection").then(result => {
        if (result.current.state !== "Operational"){
            let data = {
                command : "connect"
            };
            postPrinter("api/connection", data).then(() => {
                console.log("Connecting");
            });
        }
    });
}

function fillMenu() {
    getStatus("api/printer").then(result => {
        $("#hotend").text(result.temperature.tool0.actual + " / " + result.temperature.tool0.target);
        $("#heatbed").text(result.temperature.bed.actual + " / " + result.temperature.bed.target);
        $("#printerStatus").text("State: " + result.state.text);
        //console.log(result);
    });
}

async function postPrinter(requestUrl, data) {
    let secrets = loadSecrets();
    return $.ajax({
        type: "POST",
        contentType:"application/json; charset=utf-8",
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
        type: 'GET',
        datatype: 'json',
        success: result => {
            return result;
        },
        error: function () {
            console.log("AJAX failed");
        },
        beforeSend: setHeaders
    });
}

function setHeaders(xhr) {
    let secrets = loadSecrets();
    xhr.setRequestHeader('X-Api-Key', secrets.api_token);
}

async function loadStream() {
    let secrets = loadSecrets();
    $("#streamImage").attr("src", "http://" + secrets.printServer + ":" + secrets.printerPort + "/webcam/?action=stream");
}

async function unloadStream() {
    $("#streamImage").attr("src", "");
}