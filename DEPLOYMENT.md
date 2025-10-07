# Deployment Guide

This guide covers deploying VoiceFast to Railway (recommended) and other platforms.

## 🚂 Railway Deployment (Recommended)

Railway provides automatic deployments from GitHub with zero configuration.

### Prerequisites

1. GitHub account with this repository
2. Railway account ([railway.app](https://railway.app))
3. All API keys ready (OpenAI, Telegram, Notion)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/VoiceFast.git

# Push to GitHub
git push -u origin main
```

### Step 2: Connect to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your VoiceFast repository
5. Railway will automatically detect Node.js project

### Step 3: Configure Environment Variables

In Railway dashboard, go to **Variables** tab and add:

```bash
# Required Variables
OPENAI_API_KEY=sk-...
TELEGRAM_API_KEY=123456789:ABC...
NOTION_API_KEY=ntn_...
NOTION_DATABASE_ID=your-database-id

# Optional Variables
TELEGRAM_CHAT_ID=your-chat-id
NODE_ENV=production
```

### Step 4: Configure Build & Start

Railway auto-detects from `package.json`, but verify:

- **Build Command**: `npm install` (automatic)
- **Start Command**: `npm start` (runs webhook bot)
- **Node Version**: 18.x or higher

The `railway.json` file is already configured for **webhook mode**:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Note:** Railway uses webhook mode for production (no polling conflicts). See [RAILWAY_WEBHOOK_SETUP.md](docs/RAILWAY_WEBHOOK_SETUP.md) for details.

### Step 5: Deploy

1. Railway will automatically deploy on push to main branch
2. Check **Deployments** tab for build logs
3. Once deployed, bot will start automatically
4. Test by sending a message to your Telegram bot

### Auto-Deploy on Push

Every push to GitHub `main` branch triggers automatic deployment:

```bash
git add .
git commit -m "Update bot"
git push
```

Railway will:
1. Pull latest code
2. Install dependencies
3. Build (if needed)
4. Restart bot service
5. Show deployment logs

## 🔄 Continuous Deployment Workflow

```
Local Development → Git Push → GitHub → Railway Auto-Deploy → Bot Live
```

1. **Develop locally**: Make changes and test with `npm run bot:dev`
2. **Test Notion**: Run `npm run test-notion-save` to verify integration
3. **Commit changes**: `git add .` and `git commit -m "message"`
4. **Push to GitHub**: `git push origin main`
5. **Automatic deployment**: Railway detects push and deploys
6. **Verify**: Check Railway logs and test Telegram bot

## 📊 Monitoring in Railway

### Deployment Logs
- Go to **Deployments** tab
- Click latest deployment
- View build and runtime logs

### Runtime Logs
- Go to **Logs** tab
- Filter by service
- Monitor bot activity in real-time

### Metrics
- Go to **Metrics** tab
- Monitor CPU, memory, and network usage
- Set up alerts for issues

## 🔧 Troubleshooting Deployment

### Build Fails

**Check TypeScript compilation**:
```bash
npm run type-check
```

**Verify dependencies**:
```bash
npm install
npm run build
```

### Bot Doesn't Start

**Check environment variables**:
- All required vars are set in Railway dashboard
- No typos in variable names
- API keys are valid

**Check Railway logs**:
- Look for error messages on startup
- Verify start command is `npm run bot`

### Bot Crashes/Restarts

**Railway restart policy**:
- Configured for 10 retries on failure
- Check logs for crash reason
- Fix issue and push update

**Common causes**:
- Invalid API keys
- Database connection issues
- Missing environment variables

## 🌐 Alternative Deployment Options

### Heroku

```bash
# Install Heroku CLI
heroku create voicefast-bot

# Set environment variables
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set TELEGRAM_API_KEY=...
heroku config:set NOTION_API_KEY=...
heroku config:set NOTION_DATABASE_ID=...

# Deploy
git push heroku main
```

**Procfile**:
```
worker: npm run bot
```

### Docker

**Dockerfile** (create if needed):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["npm", "run", "bot"]
```

**Build and run**:
```bash
docker build -t voicefast .
docker run -d \
  -e OPENAI_API_KEY=sk-... \
  -e TELEGRAM_API_KEY=... \
  -e NOTION_API_KEY=... \
  -e NOTION_DATABASE_ID=... \
  voicefast
```

### VPS (Ubuntu/Debian)

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/YOUR_USERNAME/VoiceFast.git
cd VoiceFast

# Install dependencies
npm install

# Configure environment
nano .env  # Add your API keys

# Run with PM2 (process manager)
sudo npm install -g pm2
pm2 start npm --name voicefast -- run bot
pm2 save
pm2 startup
```

## 🔐 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Railway's encrypted variable storage
- ✅ Rotate API keys regularly
- ✅ Use different keys for dev/production

### API Key Management
- Store keys in Railway dashboard only
- Never log or expose keys in code
- Use environment variables exclusively
- Revoke compromised keys immediately

### Notion Security
- Use minimum required permissions
- Share database with integration only
- Regularly audit integration access
- Monitor for unusual activity

## 📈 Scaling Considerations

### Current Setup
- Single bot instance
- Processes messages sequentially
- Good for moderate traffic

### Scaling Options
1. **Vertical**: Increase Railway plan for more resources
2. **Horizontal**: Deploy multiple bot instances (requires load balancing)
3. **Queue**: Add message queue (Bull, RabbitMQ) for high volume

### Performance Tips
- Monitor response times in Railway logs
- Optimize OpenAI API calls (batch when possible)
- Cache frequent web searches
- Consider adding Redis for session management

## 🚨 Emergency Rollback

If deployment breaks production:

### Quick Rollback in Railway
1. Go to **Deployments** tab
2. Find last working deployment
3. Click **⋯** menu → **Redeploy**
4. Previous version restored instantly

### Git Rollback
```bash
# Find last working commit
git log

# Revert to that commit
git revert HEAD
git push origin main

# Railway auto-deploys fixed version
```

## ✅ Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally
- [ ] TypeScript compiles without errors
- [ ] Notion integration tested (`npm run test-notion-save`)
- [ ] Environment variables documented
- [ ] `.gitignore` includes `.env`
- [ ] Railway.json configuration verified
- [ ] GitHub repository is up to date
- [ ] Railway project created and connected
- [ ] All environment variables set in Railway
- [ ] Deployment logs show successful start
- [ ] Telegram bot responds to test message
- [ ] Notion database receives test data
- [ ] Monitoring and alerts configured

## 📞 Support

For deployment issues:

1. Check **Railway logs** for errors
2. Review **GitHub Actions** (if configured)
3. Test locally with `npm run bot`
4. Verify environment variables
5. Check API key validity
6. Review documentation in `docs/`

---

**Your bot is now deployed and running 24/7!** 🎉

