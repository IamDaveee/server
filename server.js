const express = require("express")
const app = express()
const cors = require('cors')
app.use(express.json())
require('dotenv').config();
app.use(cors({
  origin: 'https://iamdaveee.github.io/Exonault/',
}))

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)
stripe.api_key = 'sk_test_51MYCEYLmmPzbtI7RRp4lupxYnPKSDd0UcWe4kFZ2TUsV6uDS8MVDQ6yZGe7TqiIVkqqdKwOPx04VcmVRwmph09zg00u2ZqdmWU'


const storeItems = new Map([
  [1, { priceInCents: 999, name: "V1 Preset" }],
  [2, { priceInCents: 999, name: "V2 Preset" }],
  [3, { priceInCents: 1699, name: "Ultimate Bundle" }],
])

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map(item => {
        const storeItem = storeItems.get(item.id)
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        }
      }),
      success_url: `${process.env.CLIENT_URL}/success.html`,
      cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
    })
    res.json({ url: session.url })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(3000)