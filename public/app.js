// File: /chatbot-project/chatbot-project/public/app.js

document.addEventListener("DOMContentLoaded", function() {
    const inputField = document.querySelector(".input-area input");
    const sendButton = document.querySelector(".input-area button");
    const chatBox = document.querySelector(".chat-box");

    sendButton.addEventListener("click", async function() {
        const userMessage = inputField.value.trim();
        if (userMessage) {
            displayMessage(userMessage, "user");
            inputField.value = "";
            // Send to backend for OpenAI response
            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userMessage })
                });
                const data = await res.json();
                if (data.reply) {
                    displayMessage(data.reply, "bot");
                } else {
                    displayMessage("OpenAI 응답 오류", "bot");
                }
            } catch (e) {
                displayMessage("서버 오류: OpenAI API에 연결할 수 없습니다.", "bot");
            }
        }
    });

    inputField.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            sendButton.click();
        }
    });

    function displayMessage(message, sender) {
        const messageElement = document.createElement("div");
        messageElement.classList.add(sender === "user" ? "user-message" : "bot-message");
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    }

    // getBotResponse function is no longer needed
});
