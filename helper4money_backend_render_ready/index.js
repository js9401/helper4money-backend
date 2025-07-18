const express = require('express');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const vaultFile = './vault.json';

app.use(cors());
app.use(express.json());

app.post('/transfert', async (req, res) => {
  try {
    const vault = JSON.parse(fs.readFileSync(vaultFile));
    if (vault.total <= 0) return res.status(400).json({ success: false, message: 'Aucun solde disponible.' });

    const transfer = await stripe.transfers.create({
      amount: Math.floor(vault.total * 100),
      currency: 'eur',
      destination: process.env.STRIPE_ACCOUNT_ID,
      description: 'Versement Helper4Money'
    });

    vault.total = 0;
    vault.transactions = [];
    fs.writeFileSync(vaultFile, JSON.stringify(vault, null, 2));

    res.json({ success: true, transfer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log('✅ Vault API running on http://localhost:3000'));