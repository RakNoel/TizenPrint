# TizenPrint
This project is a Tizen wearable applicaton to controll a 3d printer using octoprint

## Build and compile
To build and compile use Tizen web build-tools

## Important info
Due to the connection being hard-coded it's needed to add a file: "js/secrets.js"
```
function loadSecrets() {
    return {
   		api_token : "MY3X4M9L3T0K3N",
   		printServer : "print.example.com",
   		printerPort : "8081"
    }
}
```