// 1. फॉर्म को सेलेक्ट करें
const loginForm = document.getElementById('loginForm');

// 2. सबमिट इवेंट को सुनें
loginForm.addEventListener('submit', function(event) {
    // इस लाइन से पेज रिफ्रेश नहीं होगा और HTTP 405 error नहीं आएगा
    event.preventDefault();

    // 3. यूजर ने जो इनपुट डाला है उसे निकालें
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;

    // 4. पासवर्ड और यूज़रनेम चेक करें
    if (usernameInput === 'admin' && passwordInput === '1234') {
        alert('लॉगिन सफल रहा!');
        // सही होने पर home.html पर भेज देगा
        window.location.href = 'home.html'; 
    } else {
        // गलत होने पर यह मैसेज आएगा
        alert('गलत यूज़रनेम या पासवर्ड! फिर से कोशिश करें।');
    }
});