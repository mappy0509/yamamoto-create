document.addEventListener("DOMContentLoaded", function() {
    // Fetch and insert the header
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("main-header").innerHTML = data;
            // After header is loaded, initialize header-related logic
            if (typeof initializeHeader === "function") {
                initializeHeader();
            }
        });

    // Fetch and insert the footer and chat widget
    fetch("footer_chat.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-container").innerHTML = data;
            // After footer and chat widget are loaded, initialize the chatbot logic
            if (typeof initializeChatbot === "function") {
                initializeChatbot();
            }
        });
});

