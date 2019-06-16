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

    (function (tau) {
        if (tau.support.shape.circle) {
            document.addEventListener("pagebeforeshow", () => {
                window.addEventListener("rotarydetent", rotaryHandler);
            });
        }
    }(tau));
}());

function fakeRotate(dir) {
    let event = {
        detail: {
            direction: dir,
            fake: "true"
        }
    };
    document.dispatchEvent(new CustomEvent("hardwareRotate", event));
    console.log("event sent with dir: " + dir);
}