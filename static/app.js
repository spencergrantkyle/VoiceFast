// VoiceFast - Realtime Voice Agent Client
class VoiceAgent {
    constructor() {
        this.pc = null;
        this.dc = null;
        this.audioElement = null;
        this.isConnected = false;
        this.isListening = false;
        
        // UI Elements
        this.statusEl = document.getElementById('status');
        this.micButton = document.getElementById('micButton');
        this.connectBtn = document.getElementById('connectBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.transcriptEl = document.getElementById('transcript');
        this.errorEl = document.getElementById('error');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.connectBtn.addEventListener('click', () => this.connect());
        this.disconnectBtn.addEventListener('click', () => this.disconnect());
        this.micButton.addEventListener('click', () => this.toggleMicrophone());
    }

    updateStatus(status, className) {
        this.statusEl.textContent = status;
        this.statusEl.className = `status ${className}`;
    }

    showError(message) {
        this.errorEl.textContent = message;
        this.errorEl.style.display = 'block';
        setTimeout(() => {
            this.errorEl.style.display = 'none';
        }, 5000);
    }

    addTranscript(role, text) {
        this.transcriptEl.style.display = 'block';
        const item = document.createElement('div');
        item.className = `transcript-item ${role}`;
        item.innerHTML = `<strong>${role === 'user' ? 'You' : 'Assistant'}:</strong>${text}`;
        this.transcriptEl.appendChild(item);
        this.transcriptEl.scrollTop = this.transcriptEl.scrollHeight;
    }

    async connect() {
        try {
            this.updateStatus('Connecting...', 'connecting');
            this.connectBtn.disabled = true;

            // Get ephemeral key from backend
            const response = await fetch('/session');
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to get session');
            }

            const data = await response.json();
            const EPHEMERAL_KEY = data.client_secret.value;

            // Create peer connection
            this.pc = new RTCPeerConnection();

            // Set up audio element for playback
            this.audioElement = document.createElement('audio');
            this.audioElement.autoplay = true;
            this.pc.ontrack = (e) => {
                this.audioElement.srcObject = e.streams[0];
            };

            // Add microphone to peer connection
            const ms = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            this.pc.addTrack(ms.getTracks()[0]);

            // Set up data channel for sending/receiving events
            this.dc = this.pc.createDataChannel('oai-events');
            this.dc.addEventListener('message', (e) => {
                this.handleRealtimeEvent(JSON.parse(e.data));
            });

            // Start the session using WebRTC
            const offer = await this.pc.createOffer();
            await this.pc.setLocalDescription(offer);

            const baseUrl = 'https://api.openai.com/v1/realtime';
            const model = 'gpt-4o-realtime-preview-2024-12-17';

            const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
                method: 'POST',
                body: offer.sdp,
                headers: {
                    Authorization: `Bearer ${EPHEMERAL_KEY}`,
                    'Content-Type': 'application/sdp'
                }
            });

            if (!sdpResponse.ok) {
                throw new Error(`Failed to connect to OpenAI: ${sdpResponse.statusText}`);
            }

            const answer = {
                type: 'answer',
                sdp: await sdpResponse.text()
            };
            await this.pc.setRemoteDescription(answer);

            this.isConnected = true;
            this.updateStatus('Connected - Ready to talk!', 'connected');
            this.micButton.disabled = false;
            this.connectBtn.disabled = true;
            this.disconnectBtn.disabled = false;

            // Send session configuration
            this.sendRealtimeEvent({
                type: 'session.update',
                session: {
                    modalities: ['text', 'audio'],
                    instructions: 'You are a helpful and friendly AI assistant. Be conversational, engaging, and concise in your responses. You can hear the user through voice and respond with voice.',
                    voice: 'verse',
                    input_audio_format: 'pcm16',
                    output_audio_format: 'pcm16',
                    turn_detection: {
                        type: 'server_vad',
                        threshold: 0.5,
                        prefix_padding_ms: 300,
                        silence_duration_ms: 500
                    }
                }
            });

        } catch (error) {
            console.error('Connection error:', error);
            this.showError(`Connection failed: ${error.message}`);
            this.updateStatus('Connection failed', 'disconnected');
            this.connectBtn.disabled = false;
            this.disconnect();
        }
    }

    disconnect() {
        if (this.dc) {
            this.dc.close();
            this.dc = null;
        }
        if (this.pc) {
            this.pc.close();
            this.pc = null;
        }
        if (this.audioElement) {
            this.audioElement.srcObject = null;
            this.audioElement = null;
        }

        this.isConnected = false;
        this.isListening = false;
        this.updateStatus('Disconnected', 'disconnected');
        this.micButton.disabled = true;
        this.micButton.classList.remove('listening');
        this.connectBtn.disabled = false;
        this.disconnectBtn.disabled = true;
    }

    toggleMicrophone() {
        if (!this.isConnected) return;

        this.isListening = !this.isListening;
        
        if (this.isListening) {
            this.micButton.classList.add('listening');
            this.updateStatus('Listening...', 'connected');
        } else {
            this.micButton.classList.remove('listening');
            this.updateStatus('Connected - Click mic to talk', 'connected');
        }
    }

    sendRealtimeEvent(event) {
        if (this.dc && this.dc.readyState === 'open') {
            this.dc.send(JSON.stringify(event));
        }
    }

    handleRealtimeEvent(event) {
        console.log('Realtime event:', event);

        switch (event.type) {
            case 'session.created':
                console.log('Session created:', event.session);
                break;

            case 'session.updated':
                console.log('Session updated:', event.session);
                break;

            case 'conversation.item.created':
                if (event.item.type === 'message') {
                    console.log('Message created:', event.item);
                }
                break;

            case 'conversation.item.input_audio_transcription.completed':
                // User's speech transcription
                if (event.transcript) {
                    this.addTranscript('user', event.transcript);
                }
                break;

            case 'response.audio_transcript.delta':
                // Assistant's speech transcription (streaming)
                if (event.delta) {
                    // For now, we'll collect these and show on done
                    if (!this.currentAssistantTranscript) {
                        this.currentAssistantTranscript = '';
                    }
                    this.currentAssistantTranscript += event.delta;
                }
                break;

            case 'response.audio_transcript.done':
                // Assistant's complete transcription
                if (event.transcript) {
                    this.addTranscript('assistant', event.transcript);
                    this.currentAssistantTranscript = '';
                }
                break;

            case 'response.done':
                console.log('Response completed');
                break;

            case 'error':
                console.error('Realtime API error:', event.error);
                this.showError(`API Error: ${event.error.message}`);
                break;

            case 'input_audio_buffer.speech_started':
                this.updateStatus('You are speaking...', 'connected');
                break;

            case 'input_audio_buffer.speech_stopped':
                this.updateStatus('Processing...', 'connected');
                break;

            case 'response.audio.delta':
                // Audio is being played through the RTCPeerConnection
                break;

            default:
                // Log unhandled events for debugging
                if (event.type && !event.type.includes('delta')) {
                    console.log('Unhandled event:', event.type);
                }
        }
    }
}

// Initialize the voice agent when the page loads
let agent;
window.addEventListener('DOMContentLoaded', () => {
    agent = new VoiceAgent();
    console.log('VoiceFast initialized!');
});

