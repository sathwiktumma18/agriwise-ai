# 🌱 AGENTIC AI POWERED FARM ADVISOR SYSTEM

An AI-powered multi-agent crop recommendation system that analyzes soil, water, weather & pest data to deliver precision farming advice.

---

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your computer:

### 1. Install Node.js

Node.js is required to run this project.

1. Go to **https://nodejs.org/**
2. Download the **LTS** (Long Term Support) version (recommended)
3. Run the installer — click **Next** through all steps and finish
4. Verify the installation by opening **Command Prompt** or **PowerShell** and typing:
   ```
   node --version
   npm --version
   ```
   You should see version numbers like `v20.x.x` and `10.x.x`

### 2. Install VS Code

1. Go to **https://code.visualstudio.com/**
2. Download and install VS Code
3. Open VS Code

---

## 🚀 Step-by-Step: Running the Project

### Step 1: Open the Project in VS Code

1. Open **VS Code**
2. Click **File** → **Open Folder...**
3. Navigate to the project folder: `agriwise-ai-main`
4. Click **Select Folder**

You should now see all the project files in the left sidebar (Explorer panel).

### Step 2: Open the Terminal in VS Code

1. Click **Terminal** → **New Terminal** from the top menu bar
   - Or press **Ctrl + `** (backtick key, above Tab)
2. A terminal panel will appear at the bottom of VS Code

### Step 3: Install Dependencies

In the terminal, type this command and press **Enter**:

```bash
npm install
```

⏳ **Wait** — this will take 1-2 minutes. It downloads all the libraries the project needs. You'll see a progress bar and some text scrolling.

When it finishes, you should see something like:
```
added XXX packages in XXs
```

### Step 4: Start the Project

In the same terminal, type this command and press **Enter**:

```bash
npm run dev
```

✅ After a few seconds, you'll see:
```
VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:8080/
```

### Step 5: Open in Browser

1. Hold **Ctrl** and click on **http://localhost:8080/** in the terminal
   - Or open your browser (Chrome/Edge) and go to `http://localhost:8080/`
2. 🎉 **The app is running!**

---

## 🔐 How to Use the App

### Creating an Account (Sign Up)

1. You'll see the login page with **"AGENTIC AI POWERED FARM ADVISOR SYSTEM"**
2. Click the **Sign Up** tab
3. Enter your:
   - **Full Name** (e.g., "John Doe")
   - **Email** (e.g., "john@example.com")
   - **Password** (minimum 6 characters)
4. Click **Create Account**
5. ✅ You're **instantly logged in** — no email verification needed!

### Signing In

1. On the auth page, make sure the **Sign In** tab is selected
2. Enter the **same email and password** you used during signup
3. Click **Sign In**

### Using the Farm Advisor

1. After logging in, you'll see the main dashboard
2. Click **Get Started** to scroll to the input form
3. Fill in your farm details:
   - **State** — select your state
   - **Location/District** — enter your district
   - **Soil Type** — select from dropdown
   - **Water Source** — select from dropdown
   - **Season** — select current season
   - **Farm Area** — enter in acres
4. Click **Analyze & Recommend**
5. Wait for the AI agents to process (about 3 seconds)
6. View your personalized crop recommendations!

### Downloading the Report

After analysis, scroll down and click **Download Advisory Report** to save an HTML report of the recommendations.

---

## 🛑 How to Stop the Project

In the VS Code terminal, press **Ctrl + C** to stop the development server.

---

## 🔄 How to Restart the Project

If you've stopped the project and want to run it again:

1. Open VS Code with the project folder
2. Open the terminal (**Ctrl + `**)
3. Run:
   ```bash
   npm run dev
   ```
   (No need to run `npm install` again unless you've deleted the `node_modules` folder)

---

## 🛠️ Tech Stack

| Technology     | Purpose                          |
|----------------|----------------------------------|
| React          | UI Framework                     |
| TypeScript     | Type-safe JavaScript             |
| Vite           | Fast development server & build  |
| Tailwind CSS   | Styling                          |
| shadcn/ui      | UI component library             |
| Framer Motion  | Animations                       |
| Recharts       | Charts and visualizations        |
| Supabase       | Backend database                 |

---

## 📁 Project Structure

```
agriwise-ai-main/
├── src/
│   ├── components/     → Reusable UI components
│   ├── hooks/          → Custom React hooks (auth, speech, etc.)
│   ├── lib/            → Core logic (AI engine, translations)
│   ├── pages/          → App pages (Auth, Index, NotFound)
│   └── integrations/   → Supabase client & types
├── public/             → Static assets
├── index.html          → Main HTML file
├── package.json        → Dependencies & scripts
├── vite.config.ts      → Vite configuration
└── tailwind.config.ts  → Tailwind CSS configuration
```

---

## ❓ Troubleshooting

### "npm is not recognized"
→ Node.js is not installed. Follow **Step 1** in Prerequisites above.

### "npm install" shows errors
→ Try deleting `node_modules` folder and `package-lock.json`, then run `npm install` again:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 8080 is already in use
→ Another application is using port 8080. Either close it or change the port in `vite.config.ts`.

### Page shows a blank screen
→ Open browser DevTools (press **F12**), go to the **Console** tab, and check for error messages.
