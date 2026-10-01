# FarmGrade Deployment & SIH 2026 Demonstration Guide

## 1. Overview
**FarmGrade** is a resilient Rural Digital Agricultural Platform designed for the Smart India Hackathon (SIH 2026). It empowers farmers with transparent AI price discovery, kiosk-based quality verification, and direct competitive procurement from verified bulk buyers with automated failover handling.

---

## 2. Environment Variables Specification

All sensitive credentials and AI keys are strictly isolated to server-side execution. **No secret API keys or credentials are leaked to the client bundle.**

| Variable | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | Yes | `3000` | Port for the Node.js/Express fullstack application server. |
| `NODE_ENV` | Yes | `production` | Execution environment (`development` or `production`). |
| `GEMINI_API_KEY` | Optional / Recommended | Injected by AI Studio | Enables server-side Gemini AI for quality grading and price trend synthesis. |
| `DATABASE_URL` | Optional | `postgresql://user:pass@host:5432/farmgrade` | PostgreSQL connection string. FarmGrade defaults to high-performance in-memory persistence when omitted. |
| `JWT_SECRET` | Optional | Random 32+ char string | Secret used to sign session tokens for farmers, buyers, and kiosk operators. |
| `APP_URL` | Optional | `https://your-domain.run.app` | Public canonical base URL for cloud deployment. |

### Verification of Zero Credential Leaks
- Client code in `src/` does NOT contain any hardcoded API keys, JWT secrets, or DB passwords.
- No variables prefixed with `VITE_` contain credentials or secrets.
- `.env` files with credentials are never committed to version control; only `.env.example` is provided as a template.

---

## 3. SIH 2026 Demonstration Scenario

A dedicated, resettable interactive demonstration is integrated for judges and evaluators at `/sih-demo`.

### Demo Scenario Data:
- **Farmer**: Ravi
- **Village**: Salem, Tamil Nadu
- **Produce**: Tomato (Shivam Hybrid Grade A)
- **Quantity**: 500 kg
- **Current APMC Mandi Rate**: ₹24 / kg (Salem Regulated Market)
- **AI-Assisted Expected Price Range**: ₹24–₹27 / kg

### 3 Demo Buyers & Offers:
1. **Buyer A** (Coimbatore Agri Mandi): ₹25 / kg (Total: ₹12,500)
2. **Buyer B** (Erode Organic Traders): ₹27 / kg (Total: ₹13,500) — *Highest Bid*
3. **Buyer C** (Nilgiris Retail Hub): ₹26 / kg (Total: ₹13,000) — *Next Eligible / Backup*

### Step-by-Step Evaluation Walkthrough:
1. **Initial Review**: Evaluator sees Ravi's 500 kg tomato lot, live market price (₹24/kg), AI expected range (₹24–₹27/kg), and the 3 bids.
2. **Buyer Selection**: Evaluator selects **Buyer B** (₹27/kg).
   - System triggers: `✅ Buyer selected! Your produce has been matched with the buyer.`
3. **Simulate Buyer Cancellation**: Click the **"Simulate Buyer Cancellation"** button.
   - System triggers: `⚠️ The selected buyer is no longer available. We are checking the next buyer for you.`
4. **Automatic Fallback to Next Eligible Buyer**:
   - System automatically identifies **Buyer C** (₹26/kg) and presents:
   - `🔄 Another buyer is available! Would you like to continue with this buyer?`
5. **Confirmation Modal**:
   - Displays clear dialog: `"Are you sure?"` with `"Yes, Continue"` and `"Go Back"`.
6. **Sale Completed**:
   - System generates verified Weighment Slip (`WGH-SLM-500`), receipt number (`FG-SLM-2026-9842`), instant UPI settlement verification, and triggers:
   - `🎉 Sale confirmed! Your produce has been successfully matched with the buyer.`
7. **Resetting the Demo**:
   - Evaluators can click **"Demo Reset"** anytime from the top banner or receipt card to repeat the entire workflow.

---

## 4. Farmer-Friendly Notification & Error Handling System

In compliance with the Core Accessibility Rule: **Never show technical messages or stack traces to farmers.**

All alerts, popups, and confirmations use simple, high-contrast human messages across 3 languages:
- **English**
- **Tamil (தமிழ்)**
- **Hindi (हिन्दी)**

### Key Message Mapping:
- **Produce Added**: `🌾 Your produce has been added! Buyers can now see your listing.`
- **Price Ready**: `💰 Your estimated price is ready! Expected range: ₹24–₹27 per kg.`
- **New Bid**: `🔔 New buyer offer! Buyer Ravi offered ₹26/kg for your tomatoes.`
- **Bid Accepted**: `✅ Buyer selected! Your produce has been matched with the buyer.`
- **Buyer Cancelled**: `⚠️ The selected buyer is no longer available. We are checking the next buyer for you.`
- **Backup Buyer**: `🔄 Another buyer is available! Would you like to continue with this buyer?`
- **Sale Completed**: `🎉 Sale confirmed! Your produce has been successfully matched with the buyer.`
- **Error**: `Something went wrong. Please try again.`
- **No Internet**: `📶 Internet connection is weak. Your information is safe. Please try again when the connection is available.`
- **Confirmation**: `"Are you sure?"` followed by `"Yes, Continue"` and `"Go Back"`.
- **Voice Start**: `🎤 Listening... Please say the crop name.`
- **Voice Fail**: `Sorry, we couldn't hear that. Please try again.`

---

## 5. Deployment Instructions

### Prerequisites
- Node.js 20+
- npm 10+

### Build & Run
```bash
# 1. Install dependencies
npm install

# 2. Compile and bundle frontend with Vite
npm run build

# 3. Start fullstack production server on Port 3000
npm start
```
The server serves the compiled frontend assets from `dist/` and runs API proxy endpoints under `/api/*`.
