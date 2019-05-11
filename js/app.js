(function () {
	window.addEventListener("tizenhwkey", function (ev) {
		var activePopup = null,
			page = null,
			pageid = "";

		if (ev.keyName === "back") {
			activePopup = document.querySelector(".ui-popup-active");
			page = document.getElementsByClassName("ui-page-active")[0];
			pageid = page ? page.id : "";

			if (pageid === "main" && !activePopup) {
				try {
					tizen.application.getCurrentApplication().exit();
				} catch (ignore) {
				}
			} else {
				window.history.back();
			}
		}
	});
}());

var api_token = "";
var printServer = "";

$.getJSON("documents/secrets.json", function(x) {
	console.log(x.apiToken);
	console.log(x.server);
	
	api_token = x.apiToken;
	printServer = x.server;
});
