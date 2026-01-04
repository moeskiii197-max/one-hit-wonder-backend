require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const app = express();

// --- CORS ---
app.use(cors({ origin: true }));
app.use(express.json());

// --- Stripe ---
const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.warn("⚠️ STRIPE_SECRET_KEY is missing. /checkout will fail until you set it in Render env vars.");
}
const stripe = Stripe(stripeSecret || "sk_test_placeholder");

// --- Sample competitions (replace with DB later) ---
const competitions = [
  {
    id: "cash-1000",
    title: "£1,000 Cash Prize",
    description: "Win £1,000 cash instantly!",
    price: 2.99,
    currency: "GBP",
    totalTickets: 1000,
    soldTickets: 233,
    endDate: "2026-06-30T23:59:59Z",
    instantWin: true
  },
  {
    id: "rolex",
    title: "Luxury Rolex Watch",
    description: "Win a luxury Rolex watch worth £15,000!",
    price: 5.99,
    currency: "GBP",
    totalTickets: 500,
    soldTickets: 120,
    endDate: "2026-07-15T23:59:59Z",
    instantWin: false
  },
  {
    id: "gaming-pc",
    title: "Gaming PC Giveaway",
    description: "Win a custom gaming PC setup!",
    price: 3.99,
    currency: "GBP",
    totalTickets: 300,
    soldTickets: 80,
    endDate: "2026-06-25T23:59:59Z",
    instantWin: true
  }
];

// --- Routes ---
app.get("/", (req, res) => res.send("One Hit Wonder backend running ✅"));
app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/competitions", (req, res) => {
  res.json(competitions);
});

/**
 * POST /checkout
 * Body: { competitionId: string, quantity: number }
 * Returns: { url: string }
 */
app.post("/checkout", async (req, res) => {
  try {
    const { competitionId, quantity } = req.body || {};
    const qty = Math.max(1, Math.min(50, Number(quantity || 1)));

    const comp = competitions.find(c => c.id === competitionId);
    if (!comp) return res.status(400).json({ error: "Invalid competitionId" });

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "STRIPE_SECRET_KEY not set on server" });
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const currency = (comp.currency || "GBP").toLowerCase();

    // Stripe expects amounts in the smallest currency unit (pence for GBP)
    const unitAmount = Math.round(Number(comp.price) * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: comp.title,
              description: comp.description
            },
            unit_amount: unitAmount
          },
          quantity: qty
        }
      ],
      metadata: {
        competitionId: comp.id,
        quantity: String(qty)
      },
      success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/cancel`
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: "Checkout failed" });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
