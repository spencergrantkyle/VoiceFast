# 🎙️ VoiceFast - AI Realtime Voice Agent

A real-time voice conversation application powered by OpenAI's Realtime API. Talk naturally with an AI assistant using your voice in the browser!

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/-NvLj4?referralCode=CRJ8FE)

## ✨ Features

- 🎤 **Real-time voice conversations** with AI
- 🔊 **Natural speech** using OpenAI's latest voice models
- 🌐 **Browser-based** - no app installation needed
- 🚀 **One-click deployment** to Railway
- 🔒 **Secure** - API keys never exposed to the client
- 📝 **Live transcription** of both you and the AI

## 🏗️ Architecture

- **Backend**: FastAPI server that generates ephemeral OpenAI session tokens
- **Frontend**: Pure JavaScript client using WebRTC for real-time audio streaming
- **API**: OpenAI's Realtime API with GPT-4o voice capabilities

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd VoiceFast
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   OPENAI_API_KEY=sk-proj-your-key-here
   ```

4. **Run the server**
   ```bash
   hypercorn main:app --reload
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:8000` and click "Connect" to start talking!

### Railway Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to [Railway](https://railway.app)
   - Create a new project
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Add environment variable: `OPENAI_API_KEY=sk-proj-...`
   - Railway will automatically detect the configuration and deploy!

3. **Access your app**
   
   Railway will provide a live URL like `https://voicefast.up.railway.app`

## 🎯 How to Use

1. **Click "Connect"** to establish a connection with the AI
2. **Allow microphone access** when prompted by your browser
3. **Start talking!** The AI will listen and respond automatically
4. **View transcriptions** of the conversation in real-time

## 🔧 Configuration

### Environment Variables

- `OPENAI_API_KEY` (required): Your OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
- `PORT` (optional): Server port (default: 8000, Railway sets this automatically)

### Customizing the AI

Edit the session configuration in `static/app.js`:

```javascript
{
    type: 'session.update',
    session: {
        instructions: 'Your custom instructions here...',
        voice: 'verse', // Options: alloy, echo, fable, onyx, nova, shimmer, verse
        // ... other settings
    }
}
```

## 📁 Project Structure

```
VoiceFast/
├── main.py              # FastAPI backend server
├── requirements.txt     # Python dependencies
├── railway.json         # Railway deployment config
├── static/
│   ├── index.html      # Frontend UI
│   └── app.js          # WebRTC voice client
└── README.md
```

## 🛠️ Technical Details

- **WebRTC**: Direct peer-to-peer audio streaming for low latency
- **Ephemeral Keys**: Backend generates temporary session tokens for security
- **Voice Activity Detection**: Server-side VAD automatically detects when you stop speaking
- **Audio Format**: PCM16 for high-quality audio transmission

## 🔐 Security Notes

- ✅ API keys are stored securely on the server (never sent to the client)
- ✅ Ephemeral session tokens expire automatically
- ✅ HTTPS enforced in production (Railway provides this automatically)

## 📝 API Endpoints

- `GET /` - Serves the web interface
- `GET /session` - Generates ephemeral OpenAI session token
- `GET /health` - Health check endpoint
- `GET /docs` - Interactive API documentation

## 🐛 Troubleshooting

**Microphone not working?**
- Make sure you've granted microphone permissions in your browser
- Check that your microphone is not being used by another application

**Connection failed?**
- Verify your `OPENAI_API_KEY` is set correctly
- Check that you have an active OpenAI account with Realtime API access

**No audio from AI?**
- Check your system audio settings
- Try refreshing the page and reconnecting

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)
- [Railway Documentation](https://docs.railway.app/)

## 📄 License

See [LICENSE.md](LICENSE.md) for details.

---

Built with ❤️ using FastAPI and OpenAI's Realtime API
