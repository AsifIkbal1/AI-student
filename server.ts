import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Stripe from "stripe";
import SSLCommerzPayment from "sslcommerz-lts";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };
import cron from "node-cron";
import nodemailer from "nodemailer";
import pool, { initMySQL } from "./src/lib/mysql.js";

dotenv.config();

// Initialize Firebase Admin (Safe check)
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
if (serviceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`
    });
    console.log("Firebase Admin initialized successfully.");
  } catch (error) {
    console.error("Firebase Admin Initialization Failed:", error);
  }
} else {
  console.warn("FIREBASE_SERVICE_ACCOUNT missing. Subscription updates will fail.");
}

const db = admin.apps.length > 0 ? getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId) : null;

// Cortex Collections (References)
const cortexAgents = db?.collection("cortex_agents");
const cortexTasks = db?.collection("cortex_tasks");
const cortexChats = db?.collection("cortex_chats");
const cortexSettings = db?.collection("cortex_settings");

const stripeSecret = (process.env.STRIPE_SECRET_KEY || "").trim();
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

const sslStoreId = (process.env.SSLCOMMERZ_STORE_ID || "").trim();
const sslStorePass = (process.env.SSLCOMMERZ_STORE_PASSWORD || "").trim();
const sslcz = (sslStoreId && sslStorePass) ? new SSLCommerzPayment(
  sslStoreId,
  sslStorePass,
  process.env.SSLCOMMERZ_IS_LIVE === "true"
) : null;



// Shared Plans Configuration
const PLANS = {
  pro: {
    monthly_usd: 9.99,
    yearly_usd: 99.99,
    monthly_bdt: 1200,
    yearly_bdt: 11500,
    credits: 5000,
  },
  premium: {
    monthly_usd: 19.99,
    yearly_usd: 199.99,
    monthly_bdt: 2400,
    yearly_bdt: 23000,
    credits: 15000,
  }
};


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize MySQL Database
  await initMySQL();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const getOpenAI = () => {
    let key = (process.env.OPENAI_API_KEY || "").trim();
    if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
    if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
    
    let baseURL = (process.env.OPENAI_BASE_URL || "").trim();
    if (baseURL) {
      try {
        // Ensure it's a valid URL
        const url = new URL(baseURL);
        
        // If the URL is just a domain or doesn't end with /v1, and it's not a known non-v1 API
        // we try to be helpful. But if it's already a full path, we leave it.
        if (!baseURL.includes("/v1") && !baseURL.includes("/v2") && !baseURL.includes("/api")) {
          baseURL = baseURL.replace(/\/+$/, "") + "/v1";
        }
      } catch (e) {
        console.warn(`Invalid OPENAI_BASE_URL ignored: "${baseURL}".`);
        baseURL = "";
      }
    }

    return new OpenAI({ 
      apiKey: key,
      timeout: 15000,
      maxRetries: 2,
      ...(baseURL ? { baseURL } : {})
    });
  };

  const getGemini = () => {
    let key = (process.env.GEMINI_API_KEY || "").trim();
    if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
    if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
    return new GoogleGenAI({ apiKey: key });
  };

  const MODELS = {
    GPT4: "gpt-4o-mini",
    GPT3: "gpt-4o-mini",
    GEMINI: "gemini-1.5-flash",
  };

  // API Routes
  app.post("/api/openai/chat", async (req, res) => {
    const { prompt, history } = req.body;
    
    let openaiKey = (process.env.OPENAI_API_KEY || "").trim();
    if (openaiKey.startsWith('"') && openaiKey.endsWith('"')) openaiKey = openaiKey.slice(1, -1);
    
    if (!openaiKey || openaiKey === "MY_OPENAI_API_KEY") {
      return res.status(401).json({ error: "OpenAI API Key is missing on server." });
    }

    try {
      const openai = getOpenAI();
      const response = await openai.chat.completions.create({
        model: MODELS.GPT3,
        messages: [
          { role: "system", content: `You are an advanced AI assistant designed to provide highly accurate, reliable, and well-structured answers for students.

Your task is to respond to the user's query with:
1. Clear, concise, and well-organized explanations
2. Factually correct and up-to-date information
3. References or sources (if applicable)
4. Step-by-step breakdowns (when needed)
5. Examples or real-world use cases (if helpful)

Rules:
- Always prioritize accuracy over speed
- If unsure, clearly mention uncertainty instead of guessing
- Avoid vague or generic answers
- Use bullet points, headings, and formatting for clarity
- When possible, include source names (e.g., research papers, official docs) and data points
- For technical questions: Provide code and explain logic simply
- For comparison: Use tables or structured comparison
- For opinion-based questions: Provide balanced perspectives

Tone: Professional but easy to understand, avoiding unnecessary complexity.
Output Format: Title, Explanation, Key Points, References.

Goal: Act like a combination of ChatGPT + Google + Research Assistant + Expert Consultant.` },
          ...(history || []).map((h: any) => ({ 
            role: h.role === "user" ? "user" : "assistant", 
            content: h.content || (h.parts ? h.parts[0].text : "")
          })),
          { role: "user", content: prompt }
        ] as any[],
      });
      res.json({ 
        text: response.choices[0].message.content, 
        usage: response.usage 
      });
    } catch (error: any) {
      console.error("Server OpenAI Error:", error.message);
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.post("/api/openai/generate", async (req, res) => {
    const { prompt, systemPrompt, model, response_format, fileData } = req.body;
    
    let openaiKey = (process.env.OPENAI_API_KEY || "").trim();
    if (openaiKey.startsWith('"') && openaiKey.endsWith('"')) openaiKey = openaiKey.slice(1, -1);
    
    if (!openaiKey || openaiKey === "MY_OPENAI_API_KEY") {
      return res.status(401).json({ error: "OpenAI API Key is missing on server." });
    }

    try {
      const openai = getOpenAI();
      const messages: any[] = [];
      if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
      
      const userContent: any[] = [{ type: "text", text: prompt }];
      if (fileData && fileData.mimeType?.startsWith("image/")) {
        userContent.push({ type: "image_url", image_url: { url: `data:${fileData.mimeType};base64,${fileData.data}` } });
      }
      messages.push({ role: "user", content: userContent });

      const response = await openai.chat.completions.create({
        model: (fileData && fileData.mimeType?.startsWith("image/")) ? MODELS.GPT4 : (model || MODELS.GPT3),
        messages: messages as any[],
        response_format
      });
      res.json({ 
        text: response.choices[0].message.content, 
        usage: response.usage 
      });
    } catch (error: any) {
      console.error("Server OpenAI Error:", error.message);
      res.status(error.status || 500).json({ error: error.message });
    }
  });

  app.post("/api/gemini/generate", async (req, res) => {
    const { prompt, systemPrompt, responseMimeType, fileData } = req.body;
    
    let geminiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (geminiKey.startsWith('"') && geminiKey.endsWith('"')) geminiKey = geminiKey.slice(1, -1);

    if (!geminiKey || geminiKey === "MY_GEMINI_API_KEY") {
      return res.status(401).json({ error: "Gemini API Key is missing on server." });
    }

    try {
      const genAI = getGemini();
      
      const response = await genAI.models.generateContent({
        model: MODELS.GEMINI,
        contents: [{ 
          role: "user", 
          parts: [
            { text: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt },
            ...(fileData ? [{ inlineData: { data: fileData.data, mimeType: fileData.mimeType } }] : [])
          ] 
        }],
        config: { responseMimeType }
      });

      res.json({ 
        text: response.text || "", 
        usage: { 
          total_tokens: response.usageMetadata?.totalTokenCount || 0, 
          prompt_tokens: response.usageMetadata?.promptTokenCount || 0, 
          completion_tokens: response.usageMetadata?.candidatesTokenCount || 0 
        } 
      });
    } catch (error: any) {
      console.error("Server Gemini Error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Auth MySQL Sync Endpoint ---
  app.post("/api/auth/sync", async (req, res) => {
    try {
      const { uid, email, displayName, photoURL, isLogin } = req.body;
      const userAgent = req.headers["user-agent"] || "Unknown";

      // 1. Sync User (Insert or Update)
      await pool.query(`
        INSERT INTO users (uid, email, displayName, photoURL) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        displayName = VALUES(displayName),
        photoURL = VALUES(photoURL)
      `, [uid, email, displayName, photoURL]);

      // 2. If it's a login, record the login log
      if (isLogin) {
        await pool.query(`
          INSERT INTO login_logs (uid, email, userAgent)
          VALUES (?, ?, ?)
        `, [uid, email, userAgent]);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error syncing auth to MySQL:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Payment Routes ---

  // Stripe Session Initialization
  app.post("/api/payment/stripe/init", async (req, res) => {
    const { planId, interval, userId } = req.body;

    if (!stripeSecret) {
      return res.status(400).json({ error: "Configuration Error: STRIPE_SECRET_KEY is missing in .env file." });
    }

    const plan = PLANS[planId as keyof typeof PLANS];

    if (!plan) return res.status(400).json({ error: "Invalid plan" });

    const unitAmount = interval === "month" ? plan.monthly_usd : plan.yearly_usd;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `AI Student ${planId.toUpperCase()} - ${interval}`,
                description: `Subscription for ${interval}ly access to ${planId.toUpperCase()} features.`,
              },
              unit_amount: Math.round(unitAmount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment", // Using 'payment' for simple credits/status update, could be 'subscription' for recurring
        success_url: `${req.headers.origin}/dashboard?payment=success`,
        cancel_url: `${req.headers.origin}/subscription?payment=cancelled`,
        metadata: {
          planId,
          interval,
          userId,
        }
      });

      res.json({ sessionId: session.id });
    } catch (error: any) {
      console.error("Stripe Session Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // SSLCommerz Initialization
  app.post("/api/payment/sslcommerz/init", async (req, res) => {
    const { planId, interval, userId } = req.body;

    if (!sslStoreId || !sslStorePass) {
      return res.status(400).json({ error: "Configuration Error: SSLCOMMERZ_STORE_ID or PASSWORD missing in .env file." });
    }

    const plan = PLANS[planId as keyof typeof PLANS];

    if (!plan) return res.status(400).json({ error: "Invalid plan" });

    const total_amount = interval === "month" ? plan.monthly_bdt : plan.yearly_bdt;
    const tran_id = `TRAN_${Date.now()}`;

    const data = {
      total_amount,
      currency: "BDT",
      tran_id,
      success_url: `${req.headers.origin}/api/payment/sslcommerz/success?userId=${userId}&planId=${planId}&interval=${interval}`,
      fail_url: `${req.headers.origin}/api/payment/sslcommerz/fail`,
      cancel_url: `${req.headers.origin}/api/payment/sslcommerz/cancel`,
      ipn_url: `${req.headers.origin}/api/payment/sslcommerz/ipn`,
      shipping_method: "No",
      product_name: `AI Student ${planId.toUpperCase()}`,
      product_category: "Education",
      product_profile: "non-physical-goods",
      cus_name: "Student",
      cus_email: "student@example.com",
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: "01700000000",
    };

    try {
      const response = await sslcz.init(data);
      if (response.GatewayPageURL) {
        res.json({ GatewayPageURL: response.GatewayPageURL });
      } else {
        throw new Error("Failed to get GatewayPageURL");
      }
    } catch (error: any) {
      console.error("SSLCommerz Init Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // SSLCommerz Callbacks
  app.post("/api/payment/sslcommerz/success", async (req, res) => {
    const { userId, planId, interval } = req.query;
    
    // For SSLCommerz, we can update directly here if trusted, 
    // but better to use IPN for production.
    if (userId && planId && interval && db) {
      const userRef = db.collection("users").doc(userId as string);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (interval === "year" ? 365 : 30));

      await userRef.update({
        "subscription.plan": planId,
        "subscription.expiresAt": expiresAt.toISOString(),
        "subscription.active": true,
        credits: admin.firestore.FieldValue.increment(PLANS[planId as keyof typeof PLANS].credits)
      });

      // Log to MySQL subscriptions
      try {
        await pool.query(`
          INSERT INTO subscriptions (uid, planId, interval_period, paymentMethod)
          VALUES (?, ?, ?, ?)
        `, [userId, planId, interval, "sslcommerz"]);
      } catch (mysqlError) {
        console.error("MySQL Insert Error in SSLCommerz Success:", mysqlError);
      }
    }

    res.redirect("/dashboard?payment=success");
  });

  app.post("/api/payment/sslcommerz/fail", async (req, res) => {
    res.redirect("/subscription?payment=fail");
  });

  app.post("/api/payment/sslcommerz/cancel", async (req, res) => {
    res.redirect("/subscription?payment=cancel");
  });

  // Stripe Webhook
  app.post("/api/payment/webhook/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error("Webhook Signature Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, planId, interval } = session.metadata!;
      
      if (db) {
        // Update User in Firestore
        const userRef = db.collection("users").doc(userId);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (interval === "year" ? 365 : 30));

        await userRef.update({
          "subscription.plan": planId,
          "subscription.expiresAt": expiresAt.toISOString(),
          "subscription.active": true,
          credits: admin.firestore.FieldValue.increment(PLANS[planId as keyof typeof PLANS].credits)
        });

        // Log Payment
        await db.collection("payments").add({
          userId,
          planId,
          interval,
          amount: session.amount_total! / 100,
          currency: session.currency,
          gateway: "stripe",
          transactionId: session.id,
          status: "success",
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      
      // Log to MySQL subscriptions
      try {
        await pool.query(`
          INSERT INTO subscriptions (uid, planId, interval_period, amount, paymentMethod, transactionId)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, planId, interval, session.amount_total! / 100, "stripe", session.id]);
      } catch (mysqlError) {
        console.error("MySQL Insert Error in Stripe Webhook:", mysqlError);
      }
    }


    res.json({ received: true });
  });

  // SSLCommerz IPN (Webhook)
  app.post("/api/payment/sslcommerz/ipn", async (req, res) => {
    const data = req.body;
    // In a real app, validate with sslcz.validate(data)
    if (data.status === "VALID") {
      // Logic similar to Stripe success...
      console.log("SSLCommerz IPN Success:", data.tran_id);
    }
    res.json({ status: "OK" });
  });

  app.post("/api/payment/manual/submit", async (req, res) => {
    try {
      const { uid, email, displayName, method, planId, interval, amount, transactionId } = req.body;
      
      if (!db) {
        return res.status(500).json({ error: "Firebase Admin is not initialized." });
      }

      await db.collection("manual_payments").add({
        uid,
        email,
        displayName,
        method,
        planId,
        interval,
        amount,
        transactionId,
        status: "pending",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Manual payment submit error:", error);
      res.status(500).json({ error: "Failed to submit manual payment: " + error.message });
    }
  });

  app.get("/api/payment/manual/all", async (req, res) => {
    try {
      if (!db) return res.status(500).json({ error: "Database not initialized" });
      
      const snapshot = await db.collection("manual_payments")
        .orderBy("timestamp", "desc")
        .get();

      const payments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp ? {
          seconds: doc.data().timestamp.seconds,
          nanoseconds: doc.data().timestamp.nanoseconds
        } : null
      }));

      res.json(payments);
    } catch (error: any) {
      console.error("Error fetching manual payments:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/payment/manual/approve", async (req, res) => {
    const { paymentId, uid, planId, interval } = req.body;
    try {
      if (!db) return res.status(500).json({ error: "Database not initialized" });

      const expiresAt = new Date();
      if (interval === "year") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      await db.collection("manual_payments").doc(paymentId).update({ status: "approved" });
      await db.collection("users").doc(uid).update({
        "subscription.plan": planId,
        "subscription.active": true,
        "subscription.expiresAt": expiresAt.toISOString(),
        isApproved: true
      });

      // Insert into MySQL subscriptions
      try {
        await pool.query(`
          INSERT INTO subscriptions (uid, planId, interval_period, paymentMethod, transactionId)
          VALUES (?, ?, ?, ?, ?)
        `, [uid, planId, interval, "manual", paymentId]);
      } catch (mysqlError) {
        console.error("MySQL Insert Error:", mysqlError);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error approving payment:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/payment/manual/reject", async (req, res) => {
    const { paymentId } = req.body;
    try {
      if (!db) return res.status(500).json({ error: "Database not initialized" });
      await db.collection("manual_payments").doc(paymentId).update({ status: "rejected" });
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error rejecting payment:", error);
      res.status(500).json({ error: error.message });
    }
  });



  // --- NeuroTest AI Routes ---
  app.post("/api/neurotest/save-result", async (req, res) => {
    const { testType, score, unit, accuracy, userId: customUserId } = req.body;
    const userId = customUserId || "guest";

    if (!db) return res.status(500).json({ error: "Database not initialized" });

    try {
      await db.collection("neurotest_results").add({
        userId,
        testType,
        score,
        unit,
        accuracy: accuracy || null,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error saving NeuroTest result:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/neurotest/get-results", async (req, res) => {
    const { userId } = req.query;
    if (!db) return res.status(500).json({ error: "Database not initialized" });

    try {
      const snapshot = await db.collection("neurotest_results")
        .where("userId", "==", userId)
        .orderBy("timestamp", "desc")
        .limit(50)
        .get();

      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toISOString()
      }));

      res.json(results);
    } catch (error: any) {
      console.error("Error fetching NeuroTest results:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/neurotest/ai-analysis", async (req, res) => {
    const { results } = req.body;
    let geminiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (geminiKey.startsWith('"') && geminiKey.endsWith('"')) geminiKey = geminiKey.slice(1, -1);
    if (!geminiKey) return res.status(401).json({ error: "Gemini API Key missing" });

    try {
      const genAI = getGemini();
      const model = genAI.getGenerativeModel({ model: MODELS.GEMINI });
      const prompt = `
        Analyze the following cognitive test results for a user and provide insights.
        Results: ${JSON.stringify(results)}
        Provide a structured response with:
        1. Overall cognitive profile summary.
        2. Strengths (identify which tests had elite/good scores).
        3. Weaknesses (identify areas for improvement).
        4. Specific recommendations for study habits or cognitive training.
        Keep the tone professional, encouraging, and scientific.
      `;
      const response = await model.generateContent(prompt);
      res.json({ analysis: response.response.text() });
    } catch (error: any) {
      console.error("NeuroTest AI Analysis Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // --- Cortex Studio AI Routes ---

  // Agents CRUD
  app.get("/api/cortex/agents", async (req, res) => {
    const { userId } = req.query;
    if (!cortexAgents) return res.status(500).json({ error: "Database not initialized" });

    try {
      const snapshot = await cortexAgents.where("userId", "==", userId).get();
      const agents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(agents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cortex/agents", async (req, res) => {
    const { userId, name, role, instructions, tools, memoryEnabled } = req.body;
    if (!cortexAgents) return res.status(500).json({ error: "Database not initialized" });

    try {
      const docRef = await cortexAgents.add({
        userId,
        name,
        role,
        instructions,
        tools: tools || [],
        memoryEnabled: memoryEnabled || false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.json({ id: docRef.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cortex/agents/:id", async (req, res) => {
    const { id } = req.params;
    if (!cortexAgents) return res.status(500).json({ error: "Database not initialized" });

    try {
      await cortexAgents.doc(id).delete();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Settings CRUD
  app.get("/api/cortex/settings", async (req, res) => {
    const { userId } = req.query;
    if (!cortexSettings) return res.status(500).json({ error: "Database not initialized" });

    try {
      const doc = await cortexSettings.doc(userId as string).get();
      res.json(doc.exists ? doc.data() : {});
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cortex/settings", async (req, res) => {
    const { userId, smtpHost, smtpPort, smtpUser, smtpPass } = req.body;
    if (!cortexSettings) return res.status(500).json({ error: "Database not initialized" });

    try {
      await cortexSettings.doc(userId).set({
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Helper for Email Tool
  const sendEmail = async (userId: string, to: string, subject: string, body: string) => {
    if (!cortexSettings) throw new Error("Settings DB not available");
    const settingsDoc = await cortexSettings.doc(userId).get();
    if (!settingsDoc.exists) throw new Error("Email settings not configured. Please go to Cortex Studio Settings.");
    
    const { smtpHost, smtpPort, smtpUser, smtpPass } = settingsDoc.data()!;
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpPort === "465",
      auth: { user: smtpUser, pass: smtpPass }
    });

    await transporter.sendMail({
      from: `Cortex AI Agent <${smtpUser}>`,
      to,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>')
    });
    return `Email successfully sent to ${to}`;
  };

  // Helper for Notification Tool
  const sendNotification = async (userId: string, title: string, message: string) => {
    if (!db) throw new Error("Database not available");
    await db.collection("cortex_notifications").add({
      userId,
      title,
      message,
      read: false,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return `Notification sent to user: ${title}`;
  };

  // Update Streaming Chat with Notification Tool Support
  app.post("/api/cortex/chat/stream", async (req, res) => {
    const { userId, agentId, prompt, history } = req.body;
    if (!cortexAgents) return res.status(500).json({ error: "Database not initialized" });

    try {
      const agentDoc = await cortexAgents.doc(agentId).get();
      if (!agentDoc.exists) return res.status(404).json({ error: "Agent not found" });
      const agentData = agentDoc.data()!;

      const openai = getOpenAI();
      const messages = [
        { role: "system", content: `Role: ${agentData.role}\nInstructions: ${agentData.instructions}\nGoal: ${agentData.goal || "Be a helpful AI assistant."}\n\nYou have access to tools. If the user asks to send an email, use send_email. If the user asks for a reminder or notification, use send_notification.` },
        ...(history || []).map((h: any) => ({ role: h.role, content: h.content })),
        { role: "user", content: prompt }
      ];

      const tools: any[] = [
        {
          type: "function",
          function: {
            name: "send_email",
            description: "Send an email to a recipient.",
            parameters: {
              type: "object",
              properties: {
                to: { type: "string", description: "Recipient email address" },
                subject: { type: "string", description: "Email subject" },
                body: { type: "string", description: "Email body content" }
              },
              required: ["to", "subject", "body"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "send_notification",
            description: "Send a real-time browser notification/reminder to the user.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Notification title" },
                message: { type: "string", description: "Notification message" }
              },
              required: ["title", "message"]
            }
          }
        }
      ];

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const response = await openai.chat.completions.create({
        model: MODELS.GPT3,
        messages: messages as any,
        tools: tools, // Always provide tools for Cortex Agents
        stream: true,
      });

      let toolCalls: any[] = [];
      for await (const chunk of response) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
        }

        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            if (!toolCalls[tc.index]) toolCalls[tc.index] = { id: tc.id, name: "", args: "" };
            if (tc.function?.name) toolCalls[tc.index].name += tc.function.name;
            if (tc.function?.arguments) toolCalls[tc.index].args += tc.function.arguments;
          }
        }
      }

      // If tools were called, execute them
      for (const tc of toolCalls) {
        if (!tc) continue;
        if (tc.name === "send_email") {
          try {
            const args = JSON.parse(tc.args);
            res.write(`data: ${JSON.stringify({ content: `\n\n*System: Sending email to ${args.to}...*\n` })}\n\n`);
            const result = await sendEmail(userId, args.to, args.subject, args.body);
            res.write(`data: ${JSON.stringify({ content: `\n\n✅ ${result}\n` })}\n\n`);
          } catch (e: any) {
            res.write(`data: ${JSON.stringify({ content: `\n\n❌ Error: ${e.message}\n` })}\n\n`);
          }
        } else if (tc.name === "send_notification") {
          try {
            const args = JSON.parse(tc.args);
            res.write(`data: ${JSON.stringify({ content: `\n\n*System: Triggering notification...*\n` })}\n\n`);
            const result = await sendNotification(userId, args.title, args.message);
            res.write(`data: ${JSON.stringify({ content: `\n\n✅ ${result}\n` })}\n\n`);
          } catch (e: any) {
            res.write(`data: ${JSON.stringify({ content: `\n\n❌ Notification Error: ${e.message}\n` })}\n\n`);
          }
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      console.error("Cortex Chat Error:", error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  });

  // Tasks CRUD

  // Tasks CRUD
  app.get("/api/cortex/tasks", async (req, res) => {
    const { userId } = req.query;
    if (!cortexTasks) return res.status(500).json({ error: "Database not initialized" });

    try {
      const snapshot = await cortexTasks.where("userId", "==", userId).get();
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cortex/tasks", async (req, res) => {
    const { userId, agentId, title, schedule, action } = req.body;
    if (!cortexTasks) return res.status(500).json({ error: "Database not initialized" });

    try {
      const docRef = await cortexTasks.add({
        userId,
        agentId,
        title,
        schedule, // cron format e.g. "0 0 * * *"
        action,
        status: "active",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.json({ id: docRef.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/cortex/tasks/:id", async (req, res) => {
    const { id } = req.params;
    if (!cortexTasks) return res.status(500).json({ error: "Database not initialized" });

    try {
      await cortexTasks.doc(id).delete();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Task Automation Engine (Cron)
  cron.schedule("* * * * *", async () => {
    if (!cortexTasks || !cortexAgents) return;

    try {
      const now = new Date();
      // In a real app, you'd check schedule match here.
      // For simplicity, we'll log that the scheduler is active.
      // console.log("Cortex Cron: Checking tasks...");
    } catch (error) {
      console.error("Cron Error:", error);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
