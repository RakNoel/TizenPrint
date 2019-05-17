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

    (function(tau) {
        if (tau.support.shape.circle) {
            document.addEventListener('pagebeforeshow', function() {
                window.addEventListener('rotarydetent', rotaryHandler);
            });

            document.addEventListener('pagebeforehide', function(e) {
                if (list) {
                    snapListviewWidget.destroy();
                    window.removeEventListener('rotarydetent', rotaryHandler);
                }
            });
        }
    }(tau));
}());