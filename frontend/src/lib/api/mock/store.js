// LocalStorage backed mock DB for Krishi Fare
// Data shape mirrors the Postman collection responses.

const KEY = "krishi-mock-db";

const SEED_USERS = [
  {
    id: "u_admin_1",
    name: "Krishi Admin",
    email: "admin@krishifare.com",
    phone: "9000000001",
    password: "Admin@123",
    role: "ADMIN",
    kycStatus: "VERIFIED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u_farmer_1",
    name: "Ramu Kisan",
    email: "ramu@farmer.com",
    phone: "9876543210",
    password: "Farmer@123",
    role: "FARMER",
    state: "Punjab",
    district: "Amritsar",
    kycStatus: "VERIFIED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u_farmer_2",
    name: "Sita Devi",
    email: "sita@farmer.com",
    phone: "9876500021",
    password: "Farmer@123",
    role: "FARMER",
    state: "Haryana",
    district: "Karnal",
    kycStatus: "VERIFIED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u_farmer_3",
    name: "Bhola Patil",
    email: "bhola@farmer.com",
    phone: "9876500032",
    password: "Farmer@123",
    role: "FARMER",
    state: "Maharashtra",
    district: "Nashik",
    kycStatus: "VERIFIED",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u_buyer_1",
    name: "Suresh Trader",
    email: "suresh@buyer.com",
    phone: "9876543211",
    password: "Buyer@123",
    role: "BUYER",
    kycStatus: "VERIFIED",
    kyc: {
      aadharNumber: "1234-5678-9012",
      gstNumber: "22AAAAA0000A1Z5",
      panNumber: "ABCDE1234F",
      kycDocumentId: "doc_img_001",
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: "u_buyer_2",
    name: "Anita Wholesalers",
    email: "anita@buyer.com",
    phone: "9876543212",
    password: "Buyer@123",
    role: "BUYER",
    kycStatus: "PENDING",
    kyc: {
      aadharNumber: "9876-5432-1098",
      gstNumber: "27BBBBB1111B1Z2",
      panNumber: "FGHIJ5678K",
      kycDocumentId: "doc_img_002",
    },
    createdAt: new Date().toISOString(),
  },
];

const now = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const SEED_CROPS = [
  {
    id: "c_001",
    farmerId: "u_farmer_1",
    title: "Organic Wheat — Premium HD-2967",
    description:
      "Freshly harvested organic wheat from Amritsar fields. Pesticide-free, Grade A quality. Available for bulk pickup at Amritsar Mandi.",
    category: "Grain",
    variety: "HD-2967",
    quantity: 100,
    unit: "quintal",
    basePrice: 2500,
    minBidPrice: 2200,
    allowBidding: true,
    location: "Amritsar Mandi",
    state: "Punjab",
    district: "Amritsar",
    images: [
      "https://images.pexels.com/photos/20445181/pexels-photo-20445181.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "OPEN",
    biddingEndsAt: new Date(now + 36 * HOUR).toISOString(),
    createdAt: new Date(now - 6 * HOUR).toISOString(),
  },
  {
    id: "c_002",
    farmerId: "u_farmer_2",
    title: "Basmati Rice — Pusa 1121",
    description:
      "Premium aged basmati from Karnal. Long grain, aromatic. Direct purchase only.",
    category: "Grain",
    variety: "Pusa 1121",
    quantity: 200,
    unit: "quintal",
    basePrice: 3500,
    minBidPrice: 3500,
    allowBidding: false,
    location: "Karnal Mandi",
    state: "Haryana",
    district: "Karnal",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "OPEN",
    biddingEndsAt: null,
    createdAt: new Date(now - DAY).toISOString(),
  },
  {
    id: "c_003",
    farmerId: "u_farmer_3",
    title: "Nashik Onions — Red Premium",
    description:
      "Freshly graded red onions, export quality. Bulk lots from Nashik APMC.",
    category: "Vegetable",
    variety: "N-53",
    quantity: 50,
    unit: "quintal",
    basePrice: 1800,
    minBidPrice: 1600,
    allowBidding: true,
    location: "Nashik APMC",
    state: "Maharashtra",
    district: "Nashik",
    images: [
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "OPEN",
    biddingEndsAt: new Date(now + 18 * HOUR).toISOString(),
    createdAt: new Date(now - 4 * HOUR).toISOString(),
  },
  {
    id: "c_004",
    farmerId: "u_farmer_1",
    title: "Chana Dal — Desi",
    description:
      "Cleaned and graded chana dal. Bagged in 50kg lots. Suitable for retail packaging.",
    category: "Pulse",
    variety: "Desi",
    quantity: 30,
    unit: "quintal",
    basePrice: 6200,
    minBidPrice: 5800,
    allowBidding: true,
    location: "Amritsar Mandi",
    state: "Punjab",
    district: "Amritsar",
    images: [
      "https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "OPEN",
    biddingEndsAt: new Date(now + 60 * HOUR).toISOString(),
    createdAt: new Date(now - 10 * HOUR).toISOString(),
  },
  {
    id: "c_005",
    farmerId: "u_farmer_3",
    title: "Tomatoes — Hybrid F1",
    description: "Plump tomatoes, perfect ripeness for retail. Picked yesterday.",
    category: "Vegetable",
    variety: "Hybrid F1",
    quantity: 20,
    unit: "quintal",
    basePrice: 1400,
    minBidPrice: 1200,
    allowBidding: true,
    location: "Nashik APMC",
    state: "Maharashtra",
    district: "Nashik",
    images: [
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "OPEN",
    biddingEndsAt: new Date(now + 8 * HOUR).toISOString(),
    createdAt: new Date(now - 2 * HOUR).toISOString(),
  },
  {
    id: "c_006",
    farmerId: "u_farmer_2",
    title: "Mustard Seeds — Yellow",
    description: "Sun-dried yellow mustard seeds, oil content 38%+.",
    category: "Oilseed",
    variety: "Pusa Bold",
    quantity: 80,
    unit: "quintal",
    basePrice: 5200,
    minBidPrice: 4900,
    allowBidding: true,
    location: "Karnal Mandi",
    state: "Haryana",
    district: "Karnal",
    images: [
      "https://images.pexels.com/photos/4424568/pexels-photo-4424568.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    ],
    status: "OPEN",
    biddingEndsAt: new Date(now + 24 * HOUR).toISOString(),
    createdAt: new Date(now - 12 * HOUR).toISOString(),
  },
];

const SEED_BIDS = [
  {
    id: "b_001",
    cropId: "c_001",
    buyerId: "u_buyer_1",
    amount: 2400,
    message: "Interested in bulk. Can pick up tomorrow.",
    status: "PENDING",
    createdAt: new Date(now - 2 * HOUR).toISOString(),
  },
  {
    id: "b_002",
    cropId: "c_001",
    buyerId: "u_buyer_2",
    amount: 2350,
    message: "Will lift 50 quintals immediately.",
    status: "PENDING",
    createdAt: new Date(now - 1 * HOUR).toISOString(),
  },
  {
    id: "b_003",
    cropId: "c_003",
    buyerId: "u_buyer_1",
    amount: 1700,
    message: "Need export grade — confirming.",
    status: "PENDING",
    createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
  },
];

const SEED_CHATS = [
  {
    id: "ch_001",
    participants: ["u_buyer_1", "u_farmer_1"],
    lastMessage: "Namaste! Wheat ke liye bid bheja hai.",
    lastMessageAt: new Date(now - 1 * HOUR).toISOString(),
  },
];

const SEED_MESSAGES = {
  ch_001: [
    {
      id: "m_1",
      chatId: "ch_001",
      senderId: "u_buyer_1",
      content: "Namaste Ramu ji, aapke wheat ke liye 2400 ka bid bheja hai.",
      createdAt: new Date(now - 75 * 60 * 1000).toISOString(),
    },
    {
      id: "m_2",
      chatId: "ch_001",
      senderId: "u_farmer_1",
      content: "Namaste. Quantity kitni chahiye?",
      createdAt: new Date(now - 70 * 60 * 1000).toISOString(),
    },
  ],
};

const SEED_SETTINGS = {
  defaultBiddingDurationHours: 48,
  platformName: "Krishi Fare",
  updatedAt: new Date().toISOString(),
};

const DEFAULT_DB = {
  users: SEED_USERS,
  crops: SEED_CROPS,
  bids: SEED_BIDS,
  chats: SEED_CHATS,
  messages: SEED_MESSAGES,
  settings: SEED_SETTINGS,
  purchases: [],
  aiHistory: [],
};

function read() {
  if (typeof window === "undefined") return DEFAULT_DB;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(DEFAULT_DB));
      return DEFAULT_DB;
    }
    return JSON.parse(raw);
  } catch {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_DB));
    return DEFAULT_DB;
  }
}

function write(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

export const db = {
  read,
  write,
  reset() {
    localStorage.setItem(KEY, JSON.stringify(DEFAULT_DB));
  },
  uid(prefix = "id") {
    return `${prefix}_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;
  },
};
