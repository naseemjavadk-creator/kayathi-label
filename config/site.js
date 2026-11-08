export const SHOW_SAMPLE_PRODUCTS =
  process.env.NEXT_PUBLIC_SHOW_SAMPLE_PRODUCTS === 'true';

export const SITE_CONFIG = {
  brandName: 'KAYATHI LABEL',
  tagline: 'The Art of Ethnic Elegance',
  valueProposition:
    'Handpicked sarees & jewellery. Order easily on WhatsApp. Delivery across India.',
  whatsapp: '+917907139297',
  phone: '+917907139297',
  email: 'kayathilabel@gmail.com',
  instagramUrl: 'https://www.instagram.com/kayathilabel/',
  instagramHandle: '@kayathilabel',
  brandColor: '#64152D',
  showSampleProducts: SHOW_SAMPLE_PRODUCTS,
  minSectionProducts: 3,
  newBadgeDays: 30,

  wheelDiscount: {
    enabled: false,
    code: 'KAYATHI5',
    message: 'Mention code KAYATHI5 on WhatsApp for a special 5% welcome offer on your order.',
  },

  trustItems: [
    {
      id: 'authentic',
      title: 'Authentic Products',
      description: 'Handpicked sarees, jewellery & ethnic accessories checked for quality.',
    },
    {
      id: 'exchange',
      title: 'Easy Exchange',
      description: 'Quick, personal assistance on WhatsApp for eligible exchanges.',
    },
    {
      id: 'packaging',
      title: 'Secure Packaging',
      description: 'Carefully packed to protect delicate weaves, stones & finishes.',
    },
    {
      id: 'delivery',
      title: 'Delivery Across India',
      description: 'Reliable, tracked doorstep shipping to pin codes across India.',
    },
  ],

  // Leave empty [] to hide the testimonials section automatically.
  testimonials: [
    {
      id: 't1',
      quote:
        'The silk saree looked even richer in person than in the photos. Ordering on WhatsApp was effortless and delivery was prompt.',
      author: 'Ananya R.',
      location: 'Kochi',
      item: 'Silk Saree Collection',
    },
    {
      id: 't2',
      quote:
        'Loved the antique gold jhumkas and bangle set! The packaging was so careful and nothing was damaged in transit.',
      author: 'Meera K.',
      location: 'Bengaluru',
      item: 'Traditional Jewellery & Bangles',
    },
    {
      id: 't3',
      quote:
        'Super quick replies on WhatsApp—they shared close-up details and helped me pick the right festive saree for a family wedding.',
      author: 'Priya S.',
      location: 'Chennai',
      item: 'Festive Saree',
    },
  ],

  // Static Instagram grid tiles (used when database instagram_posts has fewer than 6 items).
  instagramTiles: [
    {
      id: 'ig-1',
      imageUrl: '/brand/hero-banner.jpg',
      alt: 'KAYATHI LABEL festive silk saree and traditional jewellery',
      caption: 'Festive Silk Sarees',
      href: 'https://www.instagram.com/kayathilabel/',
    },
    {
      id: 'ig-2',
      imageUrl: '/brand/logo-on-burgundy.png',
      alt: 'KAYATHI LABEL — The Art of Ethnic Elegance',
      caption: 'The Art of Ethnic Elegance',
      href: 'https://www.instagram.com/kayathilabel/',
    },
    {
      id: 'ig-3',
      imageUrl: '/brand/hero-banner.jpg',
      alt: 'KAYATHI LABEL bridal and party wear sarees',
      caption: 'Handpicked Weaves',
      href: 'https://www.instagram.com/kayathilabel/',
    },
    {
      id: 'ig-4',
      imageUrl: '/brand/logo-on-burgundy.png',
      alt: 'KAYATHI LABEL traditional jewellery and ornaments',
      caption: 'Statement Ornaments',
      href: 'https://www.instagram.com/kayathilabel/',
    },
    {
      id: 'ig-5',
      imageUrl: '/brand/hero-banner.jpg',
      alt: 'KAYATHI LABEL designer bangles and rings',
      caption: 'Bangles & Rings',
      href: 'https://www.instagram.com/kayathilabel/',
    },
    {
      id: 'ig-6',
      imageUrl: '/brand/logo-on-burgundy.png',
      alt: 'Follow @kayathilabel on Instagram',
      caption: 'Follow @kayathilabel',
      href: 'https://www.instagram.com/kayathilabel/',
    },
  ],

  faqs: [
    {
      question: 'How do I place an order on WhatsApp?',
      answer:
        'Browse any product and tap "Order on WhatsApp" (or add multiple items to your bag and tap "Order bag on WhatsApp"). A pre-filled message with the product name, price, and link opens in WhatsApp—just send it and our team will confirm availability, shipping charges, and payment details.',
    },
    {
      question: 'What is the delivery time across India?',
      answer:
        'Orders are typically dispatched within 1–2 business days after payment confirmation. Standard delivery takes 3–5 business days in South India and 5–7 business days across the rest of India. Tracking details are shared directly on WhatsApp.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept UPI (GPay, PhonePe, Paytm), Bank Transfer (NEFT/IMPS), and other digital payment options shared officially via our verified WhatsApp number (+91 7907139297).',
    },
    {
      question: 'What is your exchange and return policy?',
      answer:
        'We offer easy exchanges for items that arrive damaged, defective, or incorrect. Please record an unboxing video when opening the parcel and contact us on WhatsApp within 48 hours of delivery.',
    },
  ],

  policies: {
    shippingReturns: {
      title: 'Shipping & Returns Policy',
      lastUpdated: 'November 2026',
      sections: [
        {
          heading: '1. Order Processing & Dispatch',
          body: 'TODO (Owner: confirm dispatch window): All confirmed orders are packed and dispatched within 1–2 business days from our boutique. Once dispatched, we share the courier name and tracking number with you on WhatsApp.',
        },
        {
          heading: '2. Delivery Timelines & Charges',
          body: 'TODO (Owner: confirm shipping rates & free-shipping threshold): We deliver across India. Standard delivery takes 3–7 business days depending on your pin code. Shipping charges (if applicable) are confirmed with you on WhatsApp before payment.',
        },
        {
          heading: '3. Exchanges & Damaged Parcels',
          body: 'TODO (Owner: confirm exchange rules & parcel opening video requirement): Every piece is inspected before dispatch. In the rare event that you receive a damaged or wrong item, please share a 360-degree parcel unboxing video on WhatsApp (+91 7907139297) within 48 hours of delivery for a prompt replacement or exchange.',
        },
        {
          heading: '4. Non-Returnable Items',
          body: 'TODO (Owner: review hygiene/custom exclusions): For hygiene and quality reasons, earrings, nose pins, and custom-altered items are not eligible for return unless received in a damaged condition.',
        },
      ],
    },
    privacyPolicy: {
      title: 'Privacy Policy',
      lastUpdated: 'November 2026',
      sections: [
        {
          heading: '1. Information We Collect',
          body: 'TODO (Owner: review privacy details): When you contact or order from KAYATHI LABEL via WhatsApp, phone, or email, we collect only the details needed to fulfil your order—such as your name, phone number, delivery address, and order preferences.',
        },
        {
          heading: '2. How We Use Your Information',
          body: 'We use your contact and address details solely to confirm orders, process deliveries, share tracking updates, and provide customer support on WhatsApp.',
        },
        {
          heading: '3. Data Sharing & Security',
          body: 'We never sell or rent your personal data. Your delivery address and phone number are shared only with our trusted courier partners to deliver your parcel safely.',
        },
        {
          heading: '4. Contact Us About Privacy',
          body: 'If you wish to update or delete your contact details from our records, please message us at kayathilabel@gmail.com or on WhatsApp at +91 7907139297.',
        },
      ],
    },
    terms: {
      title: 'Terms & Conditions',
      lastUpdated: 'November 2026',
      sections: [
        {
          heading: '1. Ordering via WhatsApp',
          body: 'TODO (Owner: review terms): KAYATHI LABEL operates as a curated boutique where orders are finalised personally via WhatsApp (+91 7907139297). An order is confirmed only after our team verifies stock availability and receives payment confirmation.',
        },
        {
          heading: '2. Product Colours & Handloom Variations',
          body: 'We photograph every piece in natural/studio light to represent colours accurately. Slight variations in shade or weave may occur due to screen settings and the handcrafted nature of traditional textiles and ornaments.',
        },
        {
          heading: '3. Pricing & Availability',
          body: 'All prices are listed in Indian Rupees (INR, ₹). Because many pieces are limited-stock boutique items, availability is subject to change until your order is confirmed on WhatsApp.',
        },
        {
          heading: '4. Contact & Support',
          body: 'For any questions regarding these terms, reach out to KAYATHI LABEL at kayathilabel@gmail.com or +91 7907139297.',
        },
      ],
    },
  },
};
