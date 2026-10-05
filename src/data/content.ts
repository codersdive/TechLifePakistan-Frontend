// Static content — candidates for Strapi single types / collections later.

export const faqs = [
  {
    group: "Orders & payment",
    items: [
      ["How do I place an order?", "Add products to your cart and checkout with your name, phone and address. You can also order directly on WhatsApp from any product page."],
      ["Do you offer Cash on Delivery?", "Yes — COD is available across Pakistan (except restricted regions). You can also pay by bank transfer or JazzCash/Easypaisa."],
      ["Can I change or cancel my order?", "Yes, before it’s dispatched. Call or WhatsApp us with your order number and we’ll update it."],
    ],
  },
  {
    group: "Delivery",
    items: [
      ["How long does delivery take?", "2–3 working days in major cities and 3–5 working days elsewhere."],
      ["How much is shipping?", "Free on orders above Rs. 5,000. A flat Rs. 250 applies below that."],
      ["Which areas do you deliver to?", "All of Pakistan except Balochistan and Azad Kashmir at the moment."],
    ],
  },
  {
    group: "Warranty & returns",
    items: [
      ["Are your products genuine?", "100%. We source directly from brands and authorised distributors, and every product ships with its official warranty card."],
      ["How do I claim warranty?", "Contact us with your order number and a short video of the issue. We’ll arrange repair or replacement per the brand’s warranty terms."],
      ["What is your return policy?", "Unused products in original packaging can be returned or exchanged within 3 days of delivery."],
    ],
  },
] as const

export const policies: Record<string, { title: string; body: string[] }> = {
  privacy: {
    title: "Privacy policy",
    body: [
      "We collect only the information needed to process your order — name, phone, email and delivery address.",
      "Your data is never sold or shared with third parties except courier partners for delivery.",
      "You can request deletion of your account data at any time by contacting support.",
    ],
  },
  delivery: {
    title: "Delivery policy",
    body: [
      "Orders are dispatched within 24 hours on working days.",
      "Delivery takes 2–5 working days depending on your city.",
      "Free delivery on orders above Rs. 5,000; otherwise a flat Rs. 250 applies.",
      "We currently do not deliver to Balochistan and Azad Kashmir.",
    ],
  },
  returns: {
    title: "Refund & returns",
    body: [
      "Unused products in original packaging can be returned within 3 days of delivery.",
      "Refunds are processed within 5–7 working days after the returned item passes inspection.",
      "Warranty claims for manufacturing defects are handled per the brand’s warranty terms.",
    ],
  },
  terms: {
    title: "Terms & conditions",
    body: [
      "Prices and availability are subject to change without notice.",
      "Orders are confirmed only after verification by phone or WhatsApp.",
      "By placing an order you agree to our delivery, returns and privacy policies.",
    ],
  },
}
