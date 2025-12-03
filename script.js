// Function to show sections
function showSection(sectionId) {
    document.querySelectorAll('.tool-section').forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
    if (sectionId === 'text-to-video') {
        document.getElementById('sound-style').style.display = document.getElementById('add-audio').checked ? 'block' : 'none';
    }
}

// Toggle sound options
document.getElementById('add-audio').addEventListener('change', function() {
    document.getElementById('sound-style').style.display = this.checked ? 'block' : 'none';
});

// Image to Video Generation (using Hugging Face API)
async function generateImageVideo() {
    const file = document.getElementById('image-upload').files[0];
    const style = document.getElementById('animation-style').value;
    if (!file) return alert('Please upload an image.');
    
    document.getElementById('loading').style.display = 'block';
    const reader = new FileReader();
    reader.onload = async () => {
        const imageData = reader.result.split(',')[1]; // Base64
        try {
            const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer YOUR_HUGGING_FACE_API_KEY' },
                body: JSON.stringify({ inputs: imageData, parameters: { num_frames: 16, motion_bucket_id: 127 } }) // Adjust for style
            });
            const result = await response.json();
            document.getElementById('output-video').src = result.video; // Assume API returns video URL
            document.getElementById('output-video').style.display = 'block';
        } catch (error) {
            alert('Error generating video: ' + error.message);
        }
        document.getElementById('loading').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

// Text to Video with Audio (using Runway ML for video, Google TTS for audio)
async function generateTextVideo() {
    const text = document.getElementById('text-input').value;
    const addAudio = document.getElementById('add-audio').checked;
    const soundStyle = document.getElementById('sound-style').value;
    if (!text) return alert('Please enter text.');
    
    document.getElementById('loading-text').style.display = 'block';
    try {
        // Generate video from text (Runway ML example)
        const videoResponse = await fetch('https://api.runwayml.com/v1/image_to_video', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer YOUR_RUNWAY_API_KEY' },
            body: JSON.stringify({ prompt: text, model: 'gen-2', duration: 5 })
        });
        const videoResult = await videoResponse.json();
        const videoUrl = videoResult.video; // Assume API returns video URL
        document.getElementById('output-video-text').src = videoUrl;
        document.getElementById('output-video-text').style.display = 'block';
        
        if (addAudio) {
            // Generate audio narration
            const audioResponse = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=YOUR_GOOGLE_API_KEY', {
                method: 'POST',
                body: JSON.stringify({
                    input: { text: text },
                    voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
                    audioConfig: { audioEncoding: 'MP3' }
                })
            });
            const audioResult = await audioResponse.json();
            const audioUrl = 'data:audio/mp3;base64,' + audioResult.audioContent;
            document.getElementById('output-audio').src = audioUrl;
            document.getElementById('output-audio').style.display = 'block';
            // Note: For background sound, you'd need to integrate another API or library (e.g., add pre-made sounds)
        }
    } catch (error) {
        alert('Error generating video/audio: ' + error.message);
    }
    document.getElementById('loading-text').style.display = 'none';
}

// AI Chat (using Hugging Face's conversational AI)
async function sendChatMessage() {
    const input = document.getElementById('chat-input').value;
    if (!input) return;
    
    const chatHistory = document.getElementById('chat-history');
    chatHistory.innerHTML += `<p><strong>You:</strong> ${input}</p>`;
    document.getElementById('chat-input').value = '';
    
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer YOUR_HUGGING_FACE_API_KEY' },
            body: JSON.stringify({ inputs: { past_user_inputs: [], generated_responses: [], text: input } })
        });
        const result = await response.json();
        const aiResponse = result.generated_text || 'Sorry, I couldn\'t generate a response.';
        chatHistory.innerHTML += `<p><strong>AI:</strong> ${aiResponse}</p>`;
        chatHistory.scrollTop = chatHistory.scrollHeight;
    } catch (error) {
        chatHistory.innerHTML += `<p><strong>AI:</strong> Error: ${error.message}</p>`;
    }
}