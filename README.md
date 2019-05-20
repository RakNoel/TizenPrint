# TizenPrint

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/2a6d51ee83b24970809c5a7ded3165c5)](https://app.codacy.com/app/RakNoel/TizenPrint?utm_source=github.com&utm_medium=referral&utm_content=RakNoel/TizenPrint&utm_campaign=Badge_Grade_Dashboard)

This project is a Tizen wearable applicaton to controll a 3d printer using octoprint. This entire project is only made as a proof-of-consept and not intended for full use and/or distrobution, with the goal of learning and therefore also contain deliverables.

## Build and compile
To build and compile use Tizen web build-tools, mainly Tizen-studio.

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
