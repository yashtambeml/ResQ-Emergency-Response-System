/* =====================================================
   RESQ - INTELLIGENT EMERGENCY RESPONSE SYSTEM
   ===================================================== */


let userLocation = null;

let selectedPhoto = null;

let incidentTime = null;

let currentEmergency = null;



// ================================
// PAGE NAVIGATION
// ================================

function showPage(pageName) {

    document.querySelectorAll(".page").forEach(page => {

        page.classList.remove("active");

    });


    const page =
        document.getElementById(pageName);


    if (page) {

        page.classList.add("active");

    }


    window.scrollTo(0, 0);

}



// ================================
// LOCATION
// ================================

function detectLocation() {

    if (!navigator.geolocation) {

        showToast(
            "Geolocation is not supported by your browser."
        );

        return;

    }


    showToast(
        "Detecting your location..."
    );


    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            const accuracy =
                position.coords.accuracy;


            userLocation = {

                latitude: latitude,

                longitude: longitude,

                accuracy: accuracy

            };


            document.getElementById(
                "locationText"
            ).innerText =
                "Location detected";


            document.getElementById(
                "emergencyLocation"
            ).innerText =

                latitude.toFixed(6) +
                ", " +
                longitude.toFixed(6);


            document.getElementById(
                "locationAccuracy"
            ).innerText =

                "Accuracy: approximately " +
                Math.round(accuracy) +
                " meters";


            showToast(
                "Location detected successfully."
            );

        },


        function(error) {

            console.log(error);


            showToast(
                "Location permission was denied or unavailable."
            );

        },


        {

            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0

        }

    );

}



// ================================
// START EMERGENCY
// ================================

function startEmergency() {

    /*
        First open the emergency page.
    */

    showPage("emergency");


    /*
        Start location detection.
    */

    detectLocation();


    /*
        Open camera automatically after
        a short delay so the user can
        capture the incident.
    */

    setTimeout(function() {

        const photoInput =
            document.getElementById("photo");


        if (photoInput) {

            photoInput.click();

        }

    }, 500);

}



// ================================
// PHOTO PREVIEW
// ================================

function previewPhoto() {

    const fileInput =
        document.getElementById("photo");


    const preview =
        document.getElementById("photoPreview");


    const file =
        fileInput.files[0];


    if (!file) {

        return;

    }


    selectedPhoto = file;


    const reader =
        new FileReader();


    reader.onload = function(event) {


        preview.innerHTML = `

            <img
                src="${event.target.result}"
                alt="Incident Photo"
            >

            <p>
                📸 Incident photo captured
            </p>

        `;


        /*
            Capture exact time when
            photo was selected/captured.
        */

        captureIncidentTime();


        showToast(
            "Incident photo captured."
        );

    };


    reader.readAsDataURL(file);

}



// ================================
// INCIDENT TIME
// ================================

function captureIncidentTime() {

    const now =
        new Date();


    incidentTime =
        now.toISOString();


    document.getElementById(
        "incidentTime"
    ).innerText =
        now.toLocaleString();

}



// ================================
// GET SELECTED SERVICES
// ================================

function getSelectedServices() {

    const checkboxes =
        document.querySelectorAll(
            'input[name="services"]:checked'
        );


    const services = [];


    checkboxes.forEach(function(checkbox) {

        services.push(
            checkbox.value
        );

    });


    return services;

}



// ================================
// SEND EMERGENCY
// ================================

function sendEmergency() {


    // -----------------------------
    // CHECK LOCATION
    // -----------------------------

    if (!userLocation) {

        showToast(
            "Please allow location access first."
        );


        detectLocation();


        return;

    }



    // -----------------------------
    // CHECK PHOTO
    // -----------------------------

    if (!selectedPhoto) {

        showToast(
            "Please capture an incident photo first."
        );


        return;

    }



    // -----------------------------
    // GET EMERGENCY TYPE
    // -----------------------------

    const type =
        document.getElementById(
            "emergencyType"
        ).value;



    // -----------------------------
    // GET DESCRIPTION
    // -----------------------------

    const description =
        document.getElementById(
            "description"
        ).value;



    // -----------------------------
    // GET PEOPLE COUNT
    // -----------------------------

    const peopleCount =
        document.getElementById(
            "peopleCount"
        ).value;



    // -----------------------------
    // GET SERVICES
    // -----------------------------

    const services =
        getSelectedServices();


    if (services.length === 0) {

        showToast(
            "Please select at least one emergency service."
        );


        return;

    }



    // -----------------------------
    // CREATE EMERGENCY OBJECT
    // -----------------------------

    const emergency = {

        id:
            "RESQ-" +
            Date.now(),

        type:
            type,

        description:
            description,

        peopleInvolved:
            peopleCount,

        services:
            services,

        latitude:
            userLocation.latitude,

        longitude:
            userLocation.longitude,

        locationAccuracy:
            userLocation.accuracy,

        incidentTime:
            incidentTime ||
            new Date().toISOString(),

        createdAt:
            new Date().toISOString(),

        status:
            "ACTIVE"

    };


    currentEmergency =
        emergency;



    // -----------------------------
    // SAVE HISTORY
    // -----------------------------

    let history =
        JSON.parse(
            localStorage.getItem("resqHistory")
        ) || [];


    history.push(
        emergency
    );


    localStorage.setItem(
        "resqHistory",
        JSON.stringify(history)
    );



    // -----------------------------
    // DISPLAY SEARCHING PAGE
    // -----------------------------

    showPage("searching");



    /*
        Simulate emergency-service
        matching.

        Later this will be replaced
        by FastAPI + PostgreSQL.
    */

    setTimeout(function() {

        prepareTrackingPage(
            emergency
        );


        showPage("tracking");


        loadHistory();

    }, 3000);

}



// ================================
// PREPARE TRACKING PAGE
// ================================

function prepareTrackingPage(emergency) {


    const services =
        emergency.services;



    // -----------------------------
    // TRACKING TITLE
    // -----------------------------

    document.getElementById(
        "trackingTitle"
    ).innerText =

        "Emergency responders are on the way 🚨";



    // -----------------------------
    // HOSPITAL ALERT
    // -----------------------------

    const hospitalAlert =
        document.getElementById(
            "hospitalAlert"
        );


    /*
        Hospital is involved only when
        ambulance / medical assistance
        is requested.
    */

    if (
        services.includes("Ambulance") ||
        emergency.type === "Medical Emergency" ||
        emergency.type === "Injury"
    ) {

        hospitalAlert.style.display =
            "flex";

    } else {

        hospitalAlert.style.display =
            "none";

    }



    // -----------------------------
    // MAP MARKERS
    // -----------------------------

    document.getElementById(
        "ambulanceMarker"
    ).style.display =
        services.includes("Ambulance")
            ? "flex"
            : "none";


    document.getElementById(
        "fireMarker"
    ).style.display =
        services.includes("Fire Brigade")
            ? "flex"
            : "none";


    document.getElementById(
        "policeMarker"
    ).style.display =
        services.includes("Police")
            ? "flex"
            : "none";


    document.getElementById(
        "rescueMarker"
    ).style.display =
        services.includes("Rescue Team")
            ? "flex"
            : "none";



    // -----------------------------
    // RESPONDER CARDS
    // -----------------------------

    const container =
        document.getElementById(
            "responderCards"
        );


    container.innerHTML = "";



    services.forEach(function(service) {


        let icon = "🚨";


        if (service === "Ambulance") {

            icon = "🚑";

        }


        if (service === "Fire Brigade") {

            icon = "🚒";

        }


        if (service === "Police") {

            icon = "🚓";

        }


        if (service === "Rescue Team") {

            icon = "🆘";

        }



        const card =
            document.createElement("div");


        card.className =
            "responder-card";


        card.innerHTML = `

            <div class="responder-icon">

                ${icon}

            </div>


            <div class="responder-info">

                <h3>
                    ${service}
                </h3>

                <p>
                    Nearby ${service.toLowerCase()}
                    has been assigned.
                </p>

                <span class="responder-status">
                    RESPONSE ACTIVE
                </span>

            </div>

        `;


        container.appendChild(card);

    });

}



// ================================
// HISTORY
// ================================

function loadHistory() {

    const history =
        JSON.parse(
            localStorage.getItem("resqHistory")
        ) || [];


    const historyList =
        document.getElementById(
            "historyList"
        );


    if (history.length === 0) {

        historyList.innerHTML = `

            <div class="empty-history">

                📜

                <h3>
                    No emergencies yet
                </h3>

                <p>
                    Your emergency requests
                    will appear here.
                </p>

            </div>

        `;


        return;

    }



    historyList.innerHTML = "";



    /*
        Show newest emergencies first.
    */

    const reversedHistory =
        [...history].reverse();



    reversedHistory.forEach(function(item) {


        const card =
            document.createElement("div");


        card.className =
            "history-card";


        const services =
            item.services
                ? item.services.join(", ")
                : "Not specified";


        card.innerHTML = `

            <strong>
                🚨 ${item.type}
            </strong>


            <p>

                ${
                    item.description ||
                    "No description provided"
                }

            </p>


            <div class="history-services">

                Services:
                ${services}

            </div>


            <small style="color:#888;">

                ${new Date(
                    item.createdAt
                ).toLocaleString()}

            </small>

        `;


        historyList.appendChild(
            card
        );

    });

}



// ================================
// TOAST MESSAGE
// ================================

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.innerText =
        message;


    toast.style.display =
        "block";


    setTimeout(function() {

        toast.style.display =
            "none";

    }, 3000);

}



// ================================
// INITIALIZATION
// ================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadHistory();

    }
);