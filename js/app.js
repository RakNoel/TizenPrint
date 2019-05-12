//Document load
$(function() {
    let secrets = loadSecrets();
    $("#streamImage").attr("src", "http://" + secrets.printServer + ":" + secrets.printerPort + "/webcam/?action=stream");
});