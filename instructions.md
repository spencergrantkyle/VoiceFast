Here’s the simplest way to set up and deploy your Realtime API Voice Bot using Railway with a Docker container—step-by-step from zero to talking bot:

⸻

1. Create your project directory

In your projects folder:

mkdir realtimeSpenny
cd realtimeSpenny


⸻

2. Initialize a Vite project

npm create vite@latest my-realtime-bot -- --template vanilla-ts
cd my-realtime-bot


⸻

3. Install dependencies

npm install @openai/agents zod@3

If you’ll run this in Node only (not browser):

npm install @openai/agents-realtime


⸻

4. Add your core bot logic

In src/main.ts:

import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';

async function main() {
  const agent = new RealtimeAgent({
    name: 'SpennyBot',
    instructions: 'You are a friendly assistant who loves to chat about projects.',
  });

  const session = new RealtimeSession(agent, {
    model: 'gpt-realtime',
  });

  try {
    await session.connect({
      // You can temporarily hardcode this for testing
      apiKey: 'ek_...(ephemeral key)',
    });
    console.log('Connected to Realtime API!');
  } catch (err) {
    console.error('Connection error:', err);
  }
}

main();


⸻

5. Create a backend endpoint to issue ephemeral keys

In the project root, create server.js:

import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.get("/session", async (req, res) => {
  const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session: { type: "realtime", model: "gpt-realtime" },
    }),
  });

  const data = await response.json();
  res.json(data);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));


⸻

6. Add a Dockerfile

Create Dockerfile in your project root:

FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "dev"]


⸻

7. Add a .dockerignore

node_modules
dist
.git


⸻

8. Add railway.json (optional for auto-build)

{
  "build": {
    "builder": "DOCKERFILE"
  }
}


⸻

9. Commit to GitHub

git init
git add .
git commit -m "Initial realtime bot commit"
gh repo create realtimeSpenny --private --source=. --push


⸻

10. Deploy on Railway
	•	Go to https://railway.app
	•	Create a new project → “Deploy from GitHub repo”
	•	Select your realtimeSpenny repo
	•	Add your environment variables:
	•	OPENAI_API_KEY=sk-proj-...
	•	Railway will automatically build and deploy from your Dockerfile.

⸻

11. Run

Railway will assign a live URL.
You can access your backend at https://<your-app>.up.railway.app/session.

In your frontend code, replace:

await session.connect({ apiKey: 'ek_...' })

with a fetch call to your endpoint:

const { value } = await fetch('/session').then(res => res.json());
await session.connect({ apiKey: value });


⸻

12. Test locally

Before deployment:

export OPENAI_API_KEY=sk-proj-...
npm run dev

Then open http://localhost:5173, allow mic access, and chat away.

⸻

Result:
A fully working Voice Realtime API bot running on Railway, automatically deployed via Docker, serving ephemeral tokens from your backend, and instantly usable in the browser.

⸻

Would you like me to add automatic ephemeral key rotation (so it refreshes without manual curl calls)?