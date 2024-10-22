function startRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Update status to show that recognition has started
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Voice recognition status: Listening...';
    statusDiv.className = 'alert alert-warning';

    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('transcript').textContent = transcript;
        translateText(transcript);

        // Update status to show that recognition has successfully recognized speech
        statusDiv.textContent = 'Voice recognition status: Processing...';
        statusDiv.className = 'alert alert-success';
    };

    recognition.onerror = (event) => {
        console.error('Error occurred in recognition: ', event.error);

        // Update status to show error
        statusDiv.textContent = 'Voice recognition status: Error occurred';
        statusDiv.className = 'alert alert-danger';
    };

    recognition.onend = () => {
        console.log('Recognition ended');

        // Update status to idle after recognition ends
        statusDiv.textContent = 'Voice recognition status: Idle';
        statusDiv.className = 'alert alert-info';
    };
}

async function translateText(text) {
    try {
        const response = await fetch('http://localhost:3000/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const translations = await response.json();
        const translationsDiv = document.getElementById('translations');
        translationsDiv.innerHTML = '';

        for (const [lang, translation] of Object.entries(translations)) {
            const paragraph = document.createElement('p');
            paragraph.textContent = `Translation in ${lang}: ${translation}`;
            paragraph.className = 'alert alert-secondary';
            translationsDiv.appendChild(paragraph);
        }
    } catch (error) {
        console.error('Error translating text:', error);

        // Update status to show translation error
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = 'Translation error occurred';
        statusDiv.className = 'alert alert-danger';
    }
}
