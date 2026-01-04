require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Simple health check
app.get("/", (req, res) => res.send("One Hit Wonder backend running ✅"));
app.get("/health", (req, res) => res.json({ ok: true }));

// Sample competitions (we'll replace with database later)
app.get("/competitions", (req, res) => {
  res.json([
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
  ]);
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
