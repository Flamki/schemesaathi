import { useState, useEffect, useRef } from "react";

/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
const C = {
  forest:   "#0A3628", forest2: "#155C40", forest3: "#2A7A58",
  saffron:  "#D4560A", saffron2:"#E8730A", amber:   "#F4A523",
  gold:     "#F7C842", cream:   "#FBF7EF", parch:   "#F5EDD8",
  parch2:   "#EDD9B8", border:  "#E2D4BC", border2: "#D4C0A0",
  ink:      "#0F1F14", ink2:    "#2A4030", ink3:    "#4A6055",
  white:    "#FFFFFF", red:     "#DC2626",
};
const R = { sm:"8px", md:"12px", lg:"20px", xl:"28px" };
const S = {
  cardSm: "0 2px 8px rgba(10,54,40,0.08)",
  cardMd: "0 6px 24px rgba(10,54,40,0.12)",
  cardLg: "0 16px 56px rgba(10,54,40,0.18)",
};

/* ─── GEMINI ─────────────────────────────────────────────────── */
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_ENDPOINT = "/api/gemini";

/* ─── SCHEMES DATABASE ──────────────────────────────────────── */
const SCHEMES = [
  {
    id:"pmjay", name:"Ayushman Bharat – PMJAY",
    ministry:"Health & Family Welfare", category:"health", icon:"🏥",
    benefit:"₹5,00,000 health insurance per family per year",
    benefit_amount:500000, tag:"HEALTH", color:"#1A5C40", light:"#E8F5EE",
    eligibility:{ income_max:300000 },
    documents:["Aadhaar Card","Ration Card or Income Certificate","Mobile linked to Aadhaar"],
    steps:[
      "Visit pmjay.gov.in and enter your mobile number to check eligibility",
      "Go to your nearest empanelled hospital",
      "Ask for the Ayushman Mitra at reception",
      "Complete biometric verification with Aadhaar",
      "Receive Ayushman Card on the spot — completely free",
    ],
    url:"https://pmjay.gov.in", helpline:"14555",
  },
  {
    id:"pmkisan", name:"PM Kisan Samman Nidhi",
    ministry:"Agriculture", category:"agriculture", icon:"🌾",
    benefit:"₹6,000 per year directly to bank (3 instalments of ₹2,000)",
    benefit_amount:6000, tag:"AGRICULTURE", color:"#5C4A1A", light:"#FDF3E3",
    eligibility:{ income_max:9999999, requires_farmer:true },
    documents:["Aadhaar Card","Land ownership or Khasra-Khatauni","Bank account linked to Aadhaar"],
    steps:[
      "Visit pmkisan.gov.in",
      "Click New Farmer Registration",
      "Enter Aadhaar number and land details",
      "Submit bank account information",
      "Verification in 7 days, money credited in 30 days",
    ],
    url:"https://pmkisan.gov.in", helpline:"155261",
  },
  {
    id:"pmay", name:"PM Awas Yojana",
    ministry:"Housing & Urban Affairs", category:"housing", icon:"🏠",
    benefit:"₹1.2 lakh to ₹2.67 lakh housing subsidy",
    benefit_amount:267000, tag:"HOUSING", color:"#1A3A5C", light:"#E8F0F8",
    eligibility:{ income_max:600000 },
    documents:["Aadhaar Card","Income Certificate","Bank account","Photo ID proof"],
    steps:[
      "Apply at pmaymis.gov.in (urban) or pmayg.nic.in (rural)",
      "Contact Gram Panchayat or Urban Local Body office",
      "Submit income and housing documents",
      "Await inspection and government approval",
      "Subsidy credited directly to your bank account",
    ],
    url:"https://pmaymis.gov.in", helpline:"1800-11-6163",
  },
  {
    id:"ujjwala", name:"PM Ujjwala Yojana",
    ministry:"Petroleum & Natural Gas", category:"women", icon:"🔥",
    benefit:"Free LPG gas connection + ₹1,600 cash subsidy",
    benefit_amount:1600, tag:"WOMEN", color:"#5C1A1A", light:"#FAE8E8",
    eligibility:{ income_max:200000, gender:"female" },
    documents:["Aadhaar Card","BPL Ration Card or SECC data","Bank account passbook"],
    steps:[
      "Visit nearest LPG distributor (HP / Bharat / Indane)",
      "Fill the KYC form for new connection",
      "Submit Aadhaar and BPL card copies",
      "Free cylinder delivered to your home",
      "Security deposit fully waived for BPL applicants",
    ],
    url:"https://pmuy.gov.in", helpline:"1800-233-3555",
  },
  {
    id:"jandhan", name:"PM Jan Dhan Yojana",
    ministry:"Finance", category:"finance", icon:"🏦",
    benefit:"Zero-balance account + free RuPay card + ₹2 lakh accident cover",
    benefit_amount:200000, tag:"FINANCE", color:"#1A1A5C", light:"#E8E8FA",
    eligibility:{ income_max:9999999 },
    documents:["Aadhaar Card","Any photo ID (Voter ID or PAN)"],
    steps:[
      "Visit any nationalised bank branch or post office",
      "Fill the account opening form",
      "Submit Aadhaar and one photo ID",
      "Account opened the same day",
      "Free RuPay debit card issued within 15 days",
    ],
    url:"https://pmjdy.gov.in", helpline:"1800-11-0001",
  },
  {
    id:"sukanya", name:"Sukanya Samriddhi Yojana",
    ministry:"Women & Child Development", category:"women", icon:"👧",
    benefit:"8.2% guaranteed interest — highest savings rate in India",
    benefit_amount:0, tag:"WOMEN", color:"#5C1A4A", light:"#FAE8F4",
    eligibility:{ income_max:9999999, requires_girl_child:true },
    documents:["Girl child birth certificate","Parent Aadhaar and PAN","Address proof"],
    steps:[
      "Visit any post office or SBI branch",
      "Fill the SSY account opening form",
      "Submit girl child birth certificate and parent KYC",
      "Deposit minimum ₹250 per year to keep active",
      "Account matures when girl turns 21",
    ],
    url:"https://www.indiapost.gov.in", helpline:"1800-112-011",
  },
  {
    id:"pmmvy", name:"PM Matru Vandana Yojana",
    ministry:"Women & Child Development", category:"women", icon:"🤱",
    benefit:"₹5,000 maternity benefit paid in 3 direct instalments",
    benefit_amount:5000, tag:"WOMEN", color:"#5C3A1A", light:"#FAF0E8",
    eligibility:{ income_max:9999999, requires_pregnant:true, gender:"female" },
    documents:["Aadhaar Card","Bank account linked to Aadhaar","MCP Card from Anganwadi","Marriage certificate"],
    steps:[
      "Register at nearest Anganwadi Centre",
      "Fill PMMVY form with Anganwadi Worker",
      "Submit MCP card and Aadhaar copies",
      "₹1,000 credited on registration",
      "₹2,000 after first ANC checkup and ₹2,000 on child birth registration",
    ],
    url:"https://wcd.nic.in", helpline:"011-23382393",
  },
  {
    id:"mudra", name:"PM Mudra Yojana",
    ministry:"Finance", category:"finance", icon:"💼",
    benefit:"₹50,000 to ₹10 lakh zero-collateral business loan",
    benefit_amount:1000000, tag:"FINANCE", color:"#2A5C1A", light:"#EDF5E8",
    eligibility:{ income_max:9999999, requires_business:true },
    documents:["Aadhaar Card","PAN Card","Business proof or plan","6-month bank statements"],
    steps:[
      "Visit any bank branch or NBFC",
      "Fill the MUDRA loan application form",
      "Submit business plan and KYC documents",
      "Bank does credit assessment",
      "Loan disbursed within 7 to 14 working days",
    ],
    url:"https://www.mudra.org.in", helpline:"1800-180-1111",
  },
  {
    id:"svanidhi", name:"PM SVANidhi Yojana",
    ministry:"Housing & Urban Affairs", category:"finance", icon:"🛒",
    benefit:"₹10,000 to ₹50,000 working capital loan for street vendors",
    benefit_amount:50000, tag:"FINANCE", color:"#1A4A5C", light:"#E8F4FA",
    eligibility:{ income_max:9999999, requires_vendor:true },
    documents:["Aadhaar Card","Vending Certificate from ULB","Bank account"],
    steps:[
      "Visit pmsvanidhi.mohua.gov.in",
      "Apply online or at your nearest bank branch or ULB",
      "Submit vending certificate and Aadhaar",
      "₹10,000 disbursed within 7 days",
      "Repay on time to unlock up to ₹50,000",
    ],
    url:"https://pmsvanidhi.mohua.gov.in", helpline:"1800-11-6163",
  },
  {
    id:"nsap", name:"National Social Assistance Programme",
    ministry:"Rural Development", category:"pension", icon:"👴",
    benefit:"₹200 to ₹500 per month pension for elderly and widows",
    benefit_amount:6000, tag:"PENSION", color:"#3A1A5C", light:"#F0E8FA",
    eligibility:{ income_max:200000, min_age:60 },
    documents:["Aadhaar Card","Age proof","BPL certificate","Bank account"],
    steps:[
      "Apply at Gram Panchayat (rural) or Municipality (urban)",
      "Fill the NSAP application form",
      "Submit age proof and BPL certificate",
      "District collector approves the application",
      "Pension credited monthly to your bank account",
    ],
    url:"https://nsap.nic.in", helpline:"1800-11-2960",
  },
  {
    id:"scholarship_sc", name:"Post-Matric Scholarship (SC/ST)",
    ministry:"Social Justice & Empowerment", category:"education", icon:"🎓",
    benefit:"Full tuition waiver plus monthly maintenance allowance",
    benefit_amount:120000, tag:"EDUCATION", color:"#1A5C5C", light:"#E8FAFA",
    eligibility:{ income_max:250000, requires_student:true, categories:["SC","ST"] },
    documents:["Aadhaar Card","Caste certificate","Income certificate","Marksheet","Admission letter"],
    steps:[
      "Register at scholarships.gov.in (NSP portal)",
      "Select your state and the specific scholarship scheme",
      "Fill application with college and bank details",
      "Upload all required documents",
      "College verifies — state government disburses the funds",
    ],
    url:"https://scholarships.gov.in", helpline:"0120-6619540",
  },
  {
    id:"fasal_bima", name:"PM Fasal Bima Yojana",
    ministry:"Agriculture", category:"agriculture", icon:"🌱",
    benefit:"Full crop insurance at just 2% farmer premium",
    benefit_amount:0, tag:"AGRICULTURE", color:"#3A5C1A", light:"#EFF5E8",
    eligibility:{ income_max:9999999, requires_farmer:true },
    documents:["Aadhaar Card","Land ownership or Khasra","Bank account","Sowing certificate"],
    steps:[
      "Contact your crop loan bank or nearest CSC centre",
      "Apply at pmfby.gov.in before the season cutoff",
      "Submit land and sowing details",
      "Pay only 2% premium — government pays the remaining 98%",
      "Claim processed after verified crop damage",
    ],
    url:"https://pmfby.gov.in", helpline:"1800-200-7710",
  },
  {
    id:"apy", name:"Atal Pension Yojana",
    ministry:"Finance", category:"pension", icon:"📈",
    benefit:"₹1,000 to ₹5,000 per month guaranteed pension after age 60",
    benefit_amount:60000, tag:"PENSION", color:"#5C1A3A", light:"#FAE8F0",
    eligibility:{ income_max:9999999, min_age:18, max_age:40 },
    documents:["Aadhaar Card","Bank account","Mobile number"],
    steps:[
      "Visit your bank branch",
      "Fill the APY registration form",
      "Link your bank account and mobile number",
      "Choose your desired pension amount between ₹1,000 and ₹5,000",
      "Monthly auto-debit starts immediately",
    ],
    url:"https://npscra.nsdl.co.in", helpline:"1800-110-708",
  },
  {
    id:"antyodaya", name:"Antyodaya Anna Yojana",
    ministry:"Consumer Affairs", category:"food", icon:"🍚",
    benefit:"35 kg grain per month at only ₹2 to ₹3 per kg",
    benefit_amount:8400, tag:"FOOD", color:"#5C4A1A", light:"#FAF3E8",
    eligibility:{ income_max:100000 },
    documents:["Aadhaar Card","AAY Ration Card","Income proof"],
    steps:[
      "Apply at Gram Panchayat or tehsil office",
      "Submit income proof for AAY category",
      "Inspector verifies household income",
      "AAY ration card issued within 30 days",
      "Collect grain monthly from your Fair Price Shop",
    ],
    url:"https://dfpd.gov.in", helpline:"1967",
  },
  {
    id:"standup", name:"Stand-Up India",
    ministry:"Finance", category:"finance", icon:"🚀",
    benefit:"₹10 lakh to ₹1 crore priority loan for SC/ST and women entrepreneurs",
    benefit_amount:10000000, tag:"FINANCE", color:"#1A2A5C", light:"#E8ECF5",
    eligibility:{ income_max:9999999, requires_business:true },
    documents:["Aadhaar Card","PAN Card","Business plan","Caste certificate if SC/ST"],
    steps:[
      "Apply at standupmitra.in portal",
      "Or visit your nearest bank branch directly",
      "Submit business plan and complete KYC",
      "Bank appraises project viability",
      "Loan sanctioned for new enterprises only",
    ],
    url:"https://www.standupmitra.in", helpline:"1800-180-1111",
  },
];

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu & Kashmir",
  "Ladakh","Puducherry","Chandigarh",
];

const OCCUPATIONS = [
  { value:"daily_wage",  label:"Daily wage worker / Labour",      icon:"🔨" },
  { value:"farmer",      label:"Farmer / Agricultural labour",     icon:"🌾" },
  { value:"self_employed",label:"Self-employed / Small shop owner",icon:"🏪" },
  { value:"street_vendor",label:"Street vendor / Hawker",          icon:"🛒" },
  { value:"salaried",    label:"Salaried employee",                icon:"💼" },
  { value:"unemployed",  label:"Unemployed / Homemaker",           icon:"🏠" },
  { value:"student",     label:"Student",                          icon:"🎓" },
];

const CATS = ["all","health","finance","housing","agriculture","women","education","pension","food"];
const CAT_META = {
  all:{ label:"All", icon:"◉" }, health:{ label:"Health", icon:"🏥" },
  finance:{ label:"Finance", icon:"💰" }, housing:{ label:"Housing", icon:"🏠" },
  agriculture:{ label:"Agriculture", icon:"🌾" }, women:{ label:"Women", icon:"👩" },
  education:{ label:"Education", icon:"🎓" }, pension:{ label:"Pension", icon:"👴" },
  food:{ label:"Food", icon:"🍽️" },
};

/* ─── LOGIC ──────────────────────────────────────────────────── */
function ruleFilter(p) {
  return SCHEMES.filter(s => {
    const e = s.eligibility;
    if (e.income_max < 9999999 && p.income > e.income_max) return false;
    if (e.requires_farmer && !p.is_farmer) return false;
    if (e.requires_girl_child && !p.has_girl_child) return false;
    if (e.requires_pregnant && !p.is_pregnant) return false;
    if (e.requires_vendor && !p.is_street_vendor) return false;
    if (e.requires_business && !p.owns_business) return false;
    if (e.requires_student && !p.is_student) return false;
    if (e.gender && e.gender !== "all" && e.gender !== p.gender) return false;
    if (e.min_age && p.age < e.min_age) return false;
    if (e.max_age && p.age > e.max_age) return false;
    if (Array.isArray(e.categories) && !e.categories.includes(p.category)) return false;
    return true;
  });
}

function buildReasons(profile, shortlist) {
  const reasons = {
    pmjay: `Your annual income of ₹${(profile.income||0).toLocaleString()} qualifies your family of ${profile.family_size} for ₹5 lakh free health coverage at 25,000+ hospitals across India.`,
    pmkisan: `As a registered farmer in ${profile.state}, you receive ₹6,000 per year credited directly to your Aadhaar-linked bank account in 3 automatic instalments.`,
    pmay: `With a household income of ₹${(profile.income||0).toLocaleString()}, your family qualifies for a housing construction subsidy of up to ₹2.67 lakh under PM Awas Yojana.`,
    ujjwala: `As a woman with low household income in ${profile.state}, you qualify for a free LPG gas connection with ₹1,600 cash subsidy — zero deposit required.`,
    jandhan: `You can open a zero-balance bank account today with a free RuPay debit card and ₹2 lakh accident insurance — no minimum balance, no charges ever.`,
    sukanya: `With a girl child under 10, you can open a Sukanya account earning 8.2% guaranteed interest — the highest government-backed savings rate in India today.`,
    pmmvy: `As a pregnant woman or new mother, the government provides ₹5,000 in maternity benefit in 3 direct instalments to your Aadhaar-linked bank account.`,
    mudra: `As a business owner in ${profile.state}, you qualify for a zero-collateral MUDRA loan from ₹50,000 up to ₹10 lakh at low interest rates.`,
    svanidhi: `As a street vendor, you qualify for an instant ₹10,000 working capital loan with zero collateral — repay on time to unlock up to ₹50,000.`,
    nsap: `Being above 60 with low income in ${profile.state}, you qualify for ₹200–₹500 monthly old-age pension credited directly to your bank account every month.`,
    scholarship_sc: `As an SC/ST student with household income under ₹2.5 lakh, you are entitled to full tuition fee waiver plus a monthly maintenance allowance.`,
    fasal_bima: `As a farmer in ${profile.state}, insure your entire crop at just 2% premium — the government pays the remaining 98% to protect your full harvest investment.`,
    apy: `Starting Atal Pension Yojana now (age ${profile.age}) guarantees you ₹1,000–₹5,000 per month after age 60, fully backed by the Government of India.`,
    antyodaya: `Your household income of ₹${(profile.income||0).toLocaleString()} qualifies for the AAY ration card — giving your family 35 kg grain every month at just ₹2–₹3/kg.`,
    standup: `As an entrepreneur in ${profile.state}, you qualify for priority loan access from ₹10 lakh to ₹1 crore at subsidised interest rates under Stand-Up India.`,
  };
  const actions = {
    pmjay: "Check eligibility at pmjay.gov.in with your mobile number — takes 2 minutes",
    pmkisan: "Register at pmkisan.gov.in with Aadhaar and land documents today",
    pmay: "Visit your nearest Municipal office or Gram Panchayat with income certificate",
    ujjwala: "Walk into your nearest LPG distributor with Aadhaar and BPL card",
    jandhan: "Visit any nationalised bank with just your Aadhaar card — same day account",
    sukanya: "Open account at nearest post office with your daughter's birth certificate",
    pmmvy: "Register at your nearest Anganwadi Centre today — time-sensitive benefit",
    mudra: "Visit any bank and request a MUDRA loan application form",
    svanidhi: "Apply at pmsvanidhi.mohua.gov.in with your vending certificate",
    nsap: "Apply at your Gram Panchayat with age proof and BPL certificate",
    scholarship_sc: "Register at scholarships.gov.in before your college's NSP deadline",
    fasal_bima: "Contact your crop loan bank or visit pmfby.gov.in before season cutoff",
    apy: "Visit your bank branch and fill the APY registration form today",
    antyodaya: "Apply at Gram Panchayat office with income certificate for AAY card",
    standup: "Apply online at standupmitra.in or visit your nearest bank branch",
  };
  return shortlist.map(s => ({
    scheme_id: s.id,
    eligible: true,
    reason: reasons[s.id] || "Based on your profile, you appear eligible. Visit the official portal to confirm.",
    action: actions[s.id] || "Visit the official website for application details.",
    priority: s.benefit_amount > 100000 ? 9 : s.benefit_amount > 10000 ? 7 : 6,
  })).sort((a, b) => b.priority - a.priority);
}

async function callGemini(profile, shortlist, apiKey) {
  const prompt = `You are a Government of India welfare scheme eligibility expert.

Citizen Profile:
State: ${profile.state} | Age: ${profile.age} | Gender: ${profile.gender}
Annual Income: Rs ${profile.income} | Family Size: ${profile.family_size}
Category: ${profile.category} | Occupation: ${profile.occupation}
Has Aadhaar: ${profile.has_aadhaar} | Has BPL Card: ${profile.has_bpl_card}
Has Bank Account: ${profile.has_bank_account} | Is Farmer: ${profile.is_farmer}
Is Street Vendor: ${profile.is_street_vendor} | Is Student: ${profile.is_student}
Has Girl Child: ${profile.has_girl_child} | Pregnant/New Mother: ${profile.is_pregnant}
Above 60: ${profile.above_60} | Has Business: ${profile.owns_business}

Schemes to evaluate:
${JSON.stringify(shortlist.map(s => ({ id: s.id, name: s.name, benefit: s.benefit })))}

Return ONLY a valid JSON array with no markdown formatting:
[{"scheme_id":"id","eligible":true,"reason":"1 specific sentence about why they qualify based on their exact profile values","action":"the single most urgent action step","priority":9}]

Priority 1-10 based on financial impact. Include only eligible schemes.`;

  const raw = await requestGemini({
    prompt,
    apiKey,
    temperature: 0.1,
    maxOutputTokens: 2048,
  });
  const parsed = parseJsonArray(raw);
  return parsed
    .filter(x => x && typeof x.scheme_id === "string")
    .map(x => ({
      scheme_id: x.scheme_id,
      eligible: x.eligible !== false,
      reason: typeof x.reason === "string" && x.reason.trim()
        ? x.reason.trim()
        : "Based on your profile, you appear eligible. Visit the official portal to confirm.",
      action: typeof x.action === "string" && x.action.trim()
        ? x.action.trim()
        : "Visit the official website for application details.",
      priority: Number.isFinite(Number(x.priority))
        ? Math.min(10, Math.max(1, Number(x.priority)))
        : 6,
    }))
    .filter(x => x.eligible);
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .map(p => (typeof p?.text === "string" ? p.text : ""))
    .join("\n")
    .trim();
}

function parseJsonArray(text) {
  const cleaned = String(text || "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  if (!cleaned) throw new Error("Empty Gemini response");

  const tryParse = (value) => {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new Error("Gemini response is not a JSON array");
    return parsed;
  };

  try {
    return tryParse(cleaned);
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) return tryParse(match[0]);
    throw new Error("Could not parse JSON array from Gemini response");
  }
}

async function requestGemini({ prompt, apiKey = "", temperature = 0.2, maxOutputTokens = 1024 }) {
  if (apiKey.trim()) {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey.trim()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens },
      }),
    });
    if (!res.ok) throw new Error(`Gemini direct API error: ${res.status}`);
    const data = await res.json();
    const text = extractGeminiText(data);
    if (!text) throw new Error("Gemini direct API returned empty response");
    return text;
  }

  const res = await fetch(GEMINI_API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, temperature, maxOutputTokens }),
  });
  if (!res.ok) throw new Error(`Gemini server API error: ${res.status}`);
  const data = await res.json();
  if (typeof data?.text !== "string" || !data.text.trim()) {
    throw new Error("Gemini server API returned empty response");
  }
  return data.text.trim();
}

function buildLocalChatReply(q, results) {
  const lc = q.toLowerCase();
  if (lc.includes("document") || lc.includes("papers") || lc.includes("kagaz")) {
    return "Your Aadhaar card is the most critical document for every scheme. Keep your ration card, income certificate, and bank passbook ready. Your nearest Common Service Centre (CSC / Jan Seva Kendra) can help you apply for any scheme â€” they charge just â‚¹20â€“50 per application.";
  }
  if (lc.includes("apply") || lc.includes("kaise") || lc.includes("how")) {
    return `The easiest path is your nearest Common Service Centre (CSC). For online applications, each scheme card has a direct portal link. For ${results.schemes[0]?.name || "any scheme"}, start at ${results.schemes[0]?.url || "the official portal"}.`;
  }
  if (lc.includes("income") || lc.includes("salary") || lc.includes("limit")) {
    return `Your annual income of â‚¹${(results.profile.income || 0).toLocaleString()} qualifies you for ${results.schemes.length} schemes. Most use self-declared income verified by local officials â€” no complex tax returns needed.`;
  }
  if (lc.includes("time") || lc.includes("kitne din") || lc.includes("how long")) {
    return "Most online applications are processed within 30â€“45 days. PMJAY and Jan Dhan accounts can be issued the same day. PM Kisan registrations verify within 7 days. Call the scheme's helpline number for specific timelines.";
  }
  return "For personalised guidance, visit your nearest Common Service Centre (CSC) or call PM Helpline at 7755-99999. They provide free assistance with all central government scheme applications in your language.";
}

/* ─── HOOKS ──────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function useCountUp(end, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const n = parseInt(String(end).replace(/\D/g, "")) || 0;
    let cur = 0;
    const inc = n / 60;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= n) { setVal(n); clearInterval(t); }
      else setVal(Math.floor(cur));
    }, 1800 / 60);
    return () => clearInterval(t);
  }, [end, active]);
  return val;
}

/* ─── GLOBAL STYLES ──────────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: 'DM Sans', sans-serif; background: #FBF7EF; color: #0F1F14; line-height: 1.6; overflow-x: hidden; }
    h1,h2,h3,h4 { font-family: 'Cormorant Garamond', serif; line-height: 1.15; }
    button, input, select, textarea { font-family: 'DM Sans', sans-serif; }
    ::selection { background: #F4A523; color: #0F1F14; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #F5EDD8; }
    ::-webkit-scrollbar-thumb { background: #155C40; border-radius: 4px; }

    /* ── CORE KEYFRAMES ── */
    @keyframes fadeUp   { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes fadeLeft { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
    @keyframes spin     { to { transform: rotate(360deg); } }
    @keyframes spinR    { to { transform: rotate(-360deg); } }
    @keyframes marquee  { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }

    /* ── HERO GRADIENT MESH — slow breathing movement ── */
    @keyframes meshA { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,-30px) scale(1.08); } 66% { transform: translate(-20px,20px) scale(0.95); } }
    @keyframes meshB { 0%,100% { transform: translate(0,0) scale(1); } 40% { transform: translate(-50px,40px) scale(1.1); } 70% { transform: translate(30px,-20px) scale(0.92); } }
    @keyframes meshC { 0%,100% { transform: translate(0,0); } 50% { transform: translate(25px,35px); } }

    /* ── FLOATING PILLS ── */
    @keyframes floatA  { 0%,100%{transform:translateY(0) translateX(0);}  40%{transform:translateY(-14px) translateX(6px);}  70%{transform:translateY(-6px) translateX(-4px);} }
    @keyframes floatB  { 0%,100%{transform:translateY(0) translateX(0);}  30%{transform:translateY(-10px) translateX(-8px);} 65%{transform:translateY(-18px) translateX(3px);} }
    @keyframes floatC  { 0%,100%{transform:translateY(0) translateX(0);}  45%{transform:translateY(-12px) translateX(5px);} 80%{transform:translateY(-5px) translateX(-6px);} }
    @keyframes floatD  { 0%,100%{transform:translateY(0) translateX(0);}  35%{transform:translateY(-16px) translateX(-3px);} 75%{transform:translateY(-8px) translateX(7px);} }
    @keyframes floatE  { 0%,100%{transform:translateY(0) translateX(0);}  50%{transform:translateY(-10px) translateX(4px);} }
    @keyframes floatF  { 0%,100%{transform:translateY(0);}  55%{transform:translateY(-13px);} }

    /* ── PULSE for CTA button ── */
    @keyframes pulseCta { 0%,100%{box-shadow:0 10px 40px rgba(212,86,10,0.45);} 50%{box-shadow:0 14px 52px rgba(212,86,10,0.65);} }

    /* ── LINE DRAW for divider ── */
    @keyframes drawLine { from{width:0;opacity:0;} to{width:56px;opacity:1;} }

    /* ── WORD SLIDE for h1 lines ── */
    @keyframes wordIn { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }

    /* ── GLOW PULSE on stat values ── */
    @keyframes glowAmber { 0%,100%{text-shadow:0 0 0 transparent;} 50%{text-shadow:0 0 24px rgba(247,200,66,0.35);} }

    /* ── CARD SHIMMER on hover ── */
    @keyframes shimmerSlide { from{left:-100%;} to{left:200%;} }

    /* ── SCROLL REVEAL ── */
    .ss-reveal { opacity:0; transform:translateY(32px); transition: opacity 0.72s cubic-bezier(0.22,1,0.36,1), transform 0.72s cubic-bezier(0.22,1,0.36,1); }
    .ss-reveal.visible { opacity:1; transform:translateY(0); }
    .ss-d1 { transition-delay:0.10s; } .ss-d2 { transition-delay:0.20s; } .ss-d3 { transition-delay:0.30s; }

    /* ── CARD HOVER — lift + shimmer ── */
    .ss-card { transition: transform 0.32s cubic-bezier(0.22,1,0.36,1), box-shadow 0.32s ease; cursor:pointer; position:relative; overflow:hidden; }
    .ss-card::after { content:''; position:absolute; top:0; left:-100%; width:60%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent); transition:none; pointer-events:none; }
    .ss-card:hover { transform: translateY(-5px) scale(1.01); box-shadow: 0 20px 60px rgba(10,54,40,0.2) !important; }
    .ss-card:hover::after { animation: shimmerSlide 0.55s ease forwards; }

    /* ── RESULT CARD HOVER ── */
    .ss-result-card { transition: transform 0.28s cubic-bezier(0.22,1,0.36,1), box-shadow 0.28s ease; position:relative; overflow:hidden; }
    .ss-result-card::after { content:''; position:absolute; top:0; left:-100%; width:60%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent); pointer-events:none; }
    .ss-result-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(10,54,40,0.18) !important; }
    .ss-result-card:hover::after { animation: shimmerSlide 0.5s ease forwards; }

    /* ── BUTTONS ── */
    .ss-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border:none; border-radius:10px; font-weight:600; cursor:pointer; transition: all 0.22s ease; position:relative; overflow:hidden; }
    .ss-btn::before { content:''; position:absolute; inset:0; background:rgba(255,255,255,0); transition:background 0.22s; }
    .ss-btn:hover::before { background:rgba(255,255,255,0.08); }
    .ss-btn:active { transform:scale(0.97); }
    .ss-btn-forest  { background:#0A3628; color:#fff; box-shadow:0 4px 14px rgba(10,54,40,0.25); }
    .ss-btn-forest:hover  { background:#155C40; box-shadow:0 8px 24px rgba(10,54,40,0.38); transform:translateY(-1px); }
    .ss-btn-saffron { background:#D4560A; color:#fff; }
    .ss-btn-saffron:hover { background:#E8730A; box-shadow:0 8px 24px rgba(212,86,10,0.45); transform:translateY(-1px); }
    .ss-btn-ghost   { background:transparent; border:1.5px solid #D4C0A0; color:#4A6055; }
    .ss-btn-ghost:hover { border-color:#155C40; color:#0A3628; background:rgba(10,54,40,0.04); }

    /* ── INPUTS ── */
    .ss-input { width:100%; border:1.5px solid #E2D4BC; border-radius:10px; padding:12px 16px; font-size:15px; background:#fff; color:#0F1F14; outline:none; transition: border-color 0.2s, box-shadow 0.2s; }
    .ss-input:focus { border-color:#155C40; box-shadow:0 0 0 3px rgba(21,92,64,0.1); }
    .ss-input::placeholder { color:#9aada6; }

    /* ── MISC ── */
    .ss-tag { display:inline-block; font-size:10px; font-weight:700; letter-spacing:1.5px; padding:3px 10px; border-radius:100px; text-transform:uppercase; }
    .ss-radio { display:flex; align-items:center; gap:12px; padding:13px 16px; border-radius:10px; cursor:pointer; transition: all 0.2s; }
    .ss-radio:hover { background:#F5EDD8; } .ss-radio.selected { background:#0A3628; }
    .ss-check { display:flex; align-items:flex-start; gap:12px; padding:11px 16px; border-radius:10px; cursor:pointer; transition: all 0.2s; border:1.5px solid #E2D4BC; background:#F5EDD8; }
    .ss-check:hover { border-color:#2A7A58; } .ss-check.checked { border-color:#0A3628; background:rgba(10,54,40,0.05); }
    .ticker-wrap { overflow:hidden; background:#0A3628; padding:9px 0; border-bottom:1px solid rgba(255,255,255,0.08); }
    .ticker-inner { display:flex; animation:marquee 32s linear infinite; white-space:nowrap; }
    /* ── RESPONSIVE ── */
    .ss-grid-2      { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
    .ss-grid-3      { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; }
    .ss-grid-4      { display:grid; grid-template-columns:repeat(4,1fr); }
    .ss-grid-auto   { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }
    .ss-grid-scheme { display:grid; grid-template-columns:repeat(auto-fill,minmax(185px,1fr)); gap:14px; }
    .ss-grid-cards  { display:grid; grid-template-columns:repeat(auto-fill,minmax(330px,1fr)); gap:20px; }
    .ss-grid-form   { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .ss-hero-stats  { display:flex; margin-top:60px; border-top:1px solid rgba(255,255,255,0.1); padding-top:32px; }
    .ss-hero-stats > div { flex:1; text-align:center; border-right:1px solid rgba(255,255,255,0.1); padding:0 12px; }
    .ss-hero-stats > div:last-child { border-right:none; }
    .ss-pills       { display:block; }
    .ss-nav-right   { display:flex; align-items:center; gap:10px; }

    @media (max-width:1024px) {
      .ss-grid-2    { grid-template-columns:1fr; gap:36px; }
      .ss-grid-3    { grid-template-columns:1fr; }
      .ss-grid-cards{ grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); }
    }
    @media (max-width:768px) {
      .ss-grid-3    { grid-template-columns:1fr; }
      .ss-grid-4    { grid-template-columns:repeat(2,1fr); }
      .ss-grid-auto { grid-template-columns:1fr 1fr; }
      .ss-grid-scheme{ grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); }
      .ss-grid-cards { grid-template-columns:1fr; }
      .ss-pills     { display:none !important; }
      .ss-hero-stats{ flex-wrap:wrap; }
      .ss-hero-stats > div { flex:1 1 40%; border-right:none; border-bottom:1px solid rgba(255,255,255,0.08); padding:10px; min-width:0; }
      .ss-hero-stats > div:last-child { border-bottom:none; }
    }
    @media (max-width:640px) {
      .ss-grid-2    { grid-template-columns:1fr; gap:28px; }
      .ss-grid-form { grid-template-columns:1fr; }
      .ss-grid-auto { grid-template-columns:1fr; }
      .ss-grid-4    { grid-template-columns:repeat(2,1fr); }
      .ss-modal-footer { flex-direction:column; }
      .ss-section-pad { padding:56px 18px !important; }
      .ss-hero-pad    { padding:64px 18px 80px !important; }
      .ss-story-grid  { grid-template-columns:1fr !important; }
      .ss-results-banner { padding:28px 18px 36px !important; }
    }
    @media (min-width:641px) and (max-width:900px) {
      .ss-grid-form { grid-template-columns:1fr 1fr; }
      .ss-section-pad { padding:72px 22px !important; }
    }

    /* ── HERO WORD LINES ── */
    .hero-line-1 { animation: wordIn 0.7s 0.2s ease both; opacity:0; }
    .hero-line-2 { animation: wordIn 0.7s 0.38s ease both; opacity:0; }
    .hero-line-3 { animation: wordIn 0.7s 0.52s ease both; opacity:0; }
    .hero-divider { animation: drawLine 0.6s 0.68s ease both; opacity:0; }
    .hero-para    { animation: fadeUp 0.6s 0.78s ease both; opacity:0; }
    .hero-btns    { animation: fadeUp 0.6s 0.9s ease both; opacity:0; }
    .hero-stats   { animation: fadeUp 0.6s 1.05s ease both; opacity:0; }
    .hero-badge   { animation: fadeIn 0.5s 0.05s ease both; opacity:0; }

    /* ── STAT CARD GLOW ── */
    .stat-glow { animation: glowAmber 3s ease-in-out infinite; }

    /* ── STORY CARD ── */
    .story-card { transition: transform 0.3s ease, border-color 0.3s ease; }
    .story-card:hover { transform: translateY(-4px); border-color: rgba(244,165,35,0.35) !important; }

    /* ── SCHEME PREVIEW CARD ── */
    .preview-card { transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease; }
    .preview-card:hover { transform: translateY(-4px) rotate(-0.5deg); box-shadow: 0 12px 36px rgba(10,54,40,0.15) !important; border-color: #D4C0A0 !important; }
  `}</style>
);

/* ─── RANGOLI SVG DECORATION ─────────────────────────────────── */
const Rangoli = ({ size = 300, opacity = 0.06, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 300 300"
    style={{ position:"absolute", opacity, pointerEvents:"none", userSelect:"none" }}>
    {[0,30,60,90,120,150].map(r => (
      <g key={r} transform={`rotate(${r} 150 150)`}>
        <ellipse cx="150" cy="75" rx="7" ry="20" fill="none" stroke={color} strokeWidth="1.5"/>
        <ellipse cx="150" cy="225" rx="7" ry="20" fill="none" stroke={color} strokeWidth="1.5"/>
      </g>
    ))}
    {[0,45,90,135].map(r => (
      <line key={r} x1="150" y1="38" x2="150" y2="262"
        transform={`rotate(${r} 150 150)`} stroke={color} strokeWidth="0.8"
        strokeDasharray="4 8" opacity="0.5"/>
    ))}
    <circle cx="150" cy="150" r="58" fill="none" stroke={color} strokeWidth="1"/>
    <circle cx="150" cy="150" r="88" fill="none" stroke={color} strokeWidth="0.6" strokeDasharray="3 6"/>
    <circle cx="150" cy="150" r="28" fill="none" stroke={color} strokeWidth="1.5"/>
    <circle cx="150" cy="150" r="7" fill={color} opacity="0.45"/>
    {[0,60,120,180,240,300].map(a => {
      const x = 150 + 58 * Math.cos(a * Math.PI / 180);
      const y = 150 + 58 * Math.sin(a * Math.PI / 180);
      return <circle key={a} cx={x} cy={y} r="4" fill={color}/>;
    })}
  </svg>
);

/* ─── TICKER ──────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  "Ayushman Bharat — ₹5L Health Insurance","PM Kisan — ₹6,000/year for Farmers",
  "PM Awas — ₹2.67L Housing Subsidy","Mudra Loan — Up to ₹10L Zero Collateral",
  "Ujjwala — Free LPG Connection","Jan Dhan — Zero Balance Banking",
  "Sukanya — 8.2% Guaranteed Returns","SVANidhi — ₹50,000 Vendor Loan",
  "NSAP — Monthly Pension for Elderly","Post-Matric Scholarship — Full Tuition Waiver",
];
const Ticker = () => (
  <div className="ticker-wrap">
    <div className="ticker-inner">
      {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
        <span key={i} style={{ fontSize:12, color:"rgba(255,255,255,0.65)", fontWeight:500, margin:"0 28px", flexShrink:0 }}>
          <span style={{ color:"#F7C842", marginRight:10 }}>◆</span>{t}
        </span>
      ))}
    </div>
  </div>
);

/* ─── STAT COUNTER ────────────────────────────────────────────── */
const StatCounter = ({ value, suffix, label, delay = 0 }) => {
  const [ref, vis] = useReveal();
  const n = useCountUp(value, vis);
  return (
    <div ref={ref} className={`ss-reveal ss-d${delay + 1}`}
      style={{ textAlign:"center", padding:"0 16px" }}>
      <div style={{ fontFamily:"Cormorant Garamond", fontSize:"clamp(40px,5vw,68px)", fontWeight:700, color:C.forest, lineHeight:1 }}>
        {n.toLocaleString("en-IN")}{suffix}
      </div>
      <div style={{ fontSize:13, color:C.ink3, marginTop:6, fontWeight:400 }}>{label}</div>
    </div>
  );
};

/* ─── NAVBAR ──────────────────────────────────────────────────── */
const Navbar = ({ page, setPage, apiKey, setApiKey, showKey, setShowKey }) => {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return (
    <nav style={{ position:"sticky", top:0, zIndex:200, background:"rgba(251,247,239,0.94)", backdropFilter:"blur(16px)", borderBottom:`1px solid ${C.border}` }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 20px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:0, cursor:"pointer", flexShrink:0 }} onClick={() => setPage("landing")}>
          <div style={{ fontFamily:"Cormorant Garamond", fontSize:mobile?20:24, fontWeight:700, color:C.forest, lineHeight:1, letterSpacing:"-0.5px" }}>
            <span style={{ color:C.saffron }}>S</span>cheme<span style={{ color:C.saffron }}>S</span>aathi
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <button onClick={() => setShowKey(!showKey)}
            style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, padding: mobile ? "6px 10px" : "7px 14px", fontSize:12, color:C.ink3, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", gap:4, whiteSpace:"nowrap" }}>
            🔑 {apiKey ? (mobile ? "Key ✓" : "Custom Gemini Key ✓") : (mobile ? "Optional Key" : "Optional Gemini Key")}
          </button>
          {page === "results" && (
            <button onClick={() => setPage("form")} className="ss-btn ss-btn-ghost"
              style={{ padding: mobile ? "8px 12px" : "9px 18px", fontSize:13, whiteSpace:"nowrap" }}>
              {mobile ? "← Back" : "← New Search"}
            </button>
          )}
          {page === "landing" && (
            <button onClick={() => setPage("form")} className="ss-btn ss-btn-saffron"
              style={{ padding: mobile ? "9px 16px" : "10px 22px", fontSize: mobile ? 13 : 14, whiteSpace:"nowrap" }}>
              {mobile ? "Check →" : "Check Eligibility →"}
            </button>
          )}
        </div>
      </div>
      {showKey && (
        <div style={{ borderTop:`1px solid ${C.border}`, padding:"12px 20px", maxWidth:1200, margin:"0 auto", display:"flex", gap:10 }}>
          <input value={apiKey} onChange={e => setApiKey(e.target.value)}
            placeholder={mobile ? "Optional Gemini API key..." : "Optional personal Gemini API key (Vercel env key is used automatically when configured)"}
            className="ss-input" style={{ flex:1, fontSize:13, padding:"8px 14px" }}/>
          <button onClick={() => setShowKey(false)} className="ss-btn ss-btn-forest" style={{ padding:"8px 20px", fontSize:13, whiteSpace:"nowrap" }}>Save</button>
        </div>
      )}
    </nav>
  );
};

/* ─── LANDING PAGE ────────────────────────────────────────────── */
const Landing = ({ setPage }) => {
  const [r1, v1] = useReveal();
  const [r2, v2] = useReveal();
  const [r3, v3] = useReveal();
  const [r4, v4] = useReveal();

  return (
    <div>
      {/* HERO */}
      <section className="ss-hero-pad" style={{ background:"#061E12", color:"#fff", padding:"88px 28px 108px", position:"relative", overflow:"hidden", minHeight:"92vh", display:"flex", alignItems:"center" }}>

        {/* Animated gradient mesh orbs */}
        <div style={{ position:"absolute", top:"-20%", left:"-10%", width:"60%", height:"70%", background:"radial-gradient(ellipse,rgba(42,122,88,0.35) 0%,transparent 70%)", animation:"meshA 14s ease-in-out infinite", willChange:"transform", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:"-15%", right:"-5%", width:"55%", height:"65%", background:"radial-gradient(ellipse,rgba(21,92,64,0.28) 0%,transparent 70%)", animation:"meshB 18s ease-in-out infinite", willChange:"transform", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:"30%", right:"15%", width:"40%", height:"50%", background:"radial-gradient(ellipse,rgba(244,165,35,0.07) 0%,transparent 65%)", animation:"meshC 22s ease-in-out infinite", willChange:"transform", pointerEvents:"none" }}/>

        {/* Rangoli decorations */}
        <div style={{ position:"absolute", top:-60, right:-60, pointerEvents:"none" }}><Rangoli size={480} opacity={0.05} color="#fff"/></div>
        <div style={{ position:"absolute", bottom:-100, left:-60, pointerEvents:"none" }}><Rangoli size={360} opacity={0.04} color="#F4A523"/></div>

        {/* Floating benefit pills */}
        <div className="ss-pills" style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
          {[
            { label:"₹5L Health Cover",   top:"18%", left:"6%",  anim:"floatA 7s ease-in-out infinite",          delay:"0s"    },
            { label:"₹6K Farmer Income",  top:"62%", left:"4%",  anim:"floatB 9s ease-in-out infinite",          delay:"1.2s"  },
            { label:"₹10L Business Loan", top:"22%", right:"4%", anim:"floatC 8s ease-in-out infinite",          delay:"0.6s"  },
            { label:"Free LPG Gas",        top:"70%", right:"6%", anim:"floatD 10s ease-in-out infinite",         delay:"2s"    },
            { label:"Free Housing",        top:"42%", left:"3%",  anim:"floatE 11s ease-in-out infinite",         delay:"0.9s"  },
            { label:"8.2% Savings Rate",  top:"48%", right:"3%", anim:"floatF 8.5s ease-in-out infinite",        delay:"1.5s"  },
          ].map((p, i) => (
            <div key={i} style={{
              position:"absolute", top:p.top, left:p.left, right:p.right,
              animation:p.anim, animationDelay:p.delay,
              background:"rgba(255,255,255,0.07)",
              border:"1px solid rgba(255,255,255,0.14)",
              backdropFilter:"blur(10px)",
              borderRadius:100, padding:"7px 16px",
              fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.8)",
              whiteSpace:"nowrap",
              boxShadow:"0 4px 20px rgba(0,0,0,0.2)",
              opacity:0,
              animationFillMode:"forwards",
            }}
            >{p.label}</div>
          ))}
        </div>

        <div style={{ maxWidth:860, margin:"0 auto", position:"relative", zIndex:2, textAlign:"center" }}>
          <div className="hero-badge" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(244,165,35,0.13)", border:"1px solid rgba(244,165,35,0.32)", borderRadius:100, padding:"6px 22px", fontSize:11, fontWeight:700, letterSpacing:2, color:"#F7C842", marginBottom:32, textTransform:"uppercase" }}>
            ◆ &nbsp; AI For Good Hackathon 2026 · Changemaker League
          </div>
          <h1 style={{ fontSize:"clamp(38px,6.5vw,80px)", fontWeight:600, color:"#fff", lineHeight:1.06, marginBottom:0 }}>
            <div className="hero-line-1"><span style={{ fontStyle:"italic", color:"#F7C842" }}>₹1.5 Lakh Crore</span></div>
            <div className="hero-line-2">in welfare goes</div>
            <div className="hero-line-3">unclaimed every year.</div>
          </h1>
          <div className="hero-divider" style={{ width:56, height:2, background:"#F4A523", margin:"28px auto" }}/>
          <p className="hero-para" style={{ fontSize:"clamp(15px,2vw,19px)", color:"rgba(255,255,255,0.62)", maxWidth:560, margin:"0 auto 44px", lineHeight:1.78, fontWeight:300 }}>
            Not because the schemes don't exist — but because eligible citizens have never heard of them.{" "}
            <strong style={{ color:"rgba(255,255,255,0.9)", fontWeight:500 }}>SchemeSaathi</strong> finds every rupee you are owed in under 2 minutes.
          </p>
          <div className="hero-btns" style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => setPage("form")} className="ss-btn ss-btn-saffron"
              style={{ fontSize:16, padding:"16px 42px", borderRadius:14, animation:"pulseCta 2.5s ease-in-out infinite" }}>
              Find My Government Benefits →
            </button>
            <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior:"smooth" })}
              className="ss-btn ss-btn-ghost"
              style={{ color:"rgba(255,255,255,0.65)", borderColor:"rgba(255,255,255,0.2)", padding:"16px 28px", fontSize:15 }}>
              How It Works ↓
            </button>
          </div>
          <div className="hero-stats ss-hero-stats">
            {[["15+","Schemes Tracked"],["2 min","To Get Results"],["Free","Always"],["AI","Gemini Powered"]].map(([v, l], i) => (
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"Cormorant Garamond", fontSize:34, fontWeight:700, color:"#F4A523" }}>{v}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:3, fontWeight:500, letterSpacing:0.5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position:"absolute", bottom:0, left:0, right:0 }}>
          <svg viewBox="0 0 1440 60" style={{ display:"block", width:"100%" }}>
            <path d="M0,30 C480,70 960,0 1440,30 L1440,60 L0,60 Z" fill="#FBF7EF"/>
          </svg>
        </div>
      </section>

      <Ticker/>

      {/* THE PROBLEM */}
      <section className="ss-section-pad" style={{ padding:"92px 28px", background:C.cream }}>
        <div ref={r1} className={`ss-reveal ${v1 ? "visible" : ""}`} style={{ maxWidth:1100, margin:"0 auto" }}>
          <div className="ss-grid-2">
            <div>
              <span className="ss-tag" style={{ background:"rgba(212,86,10,0.1)", color:C.saffron, marginBottom:20 }}>The Problem</span>
              <h2 style={{ fontSize:"clamp(30px,4vw,50px)", color:C.forest, marginBottom:22, marginTop:12 }}>
                Why do billions in benefits go unclaimed?
              </h2>
              <p style={{ fontSize:16, color:C.ink3, lineHeight:1.8, marginBottom:28, fontWeight:300 }}>
                India's welfare infrastructure is among the world's most extensive — yet the average citizen knows about fewer than 3 of the 300+ schemes available to them. The gap is never funding. It's always{" "}
                <em style={{ fontStyle:"italic", color:C.forest }}>information.</em>
              </p>
              {[
                ["📋","300+ schemes exist","Central and state governments run hundreds of welfare programmes — changing every budget cycle."],
                ["🗺️","Complex eligibility","Each scheme has different income limits, category criteria, and state-specific variations that are hard to navigate."],
                ["🏛️","Bureaucratic maze","Finding the right office, right documents, and right process can take months of trial and error."],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ display:"flex", gap:14, alignItems:"flex-start", padding:"16px 20px", background:C.parch, borderRadius:R.md, border:`1px solid ${C.border}`, marginBottom:10 }}>
                  <span style={{ fontSize:22, flexShrink:0, marginTop:2 }}>{icon}</span>
                  <div>
                    <div style={{ fontWeight:600, color:C.ink, marginBottom:3, fontSize:15 }}>{title}</div>
                    <div style={{ fontSize:13, color:C.ink3, lineHeight:1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ background:C.forest, borderRadius:R.xl, padding:40, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:-40, right:-40 }}><Rangoli size={260} opacity={0.09} color="#fff"/></div>
                <div style={{ position:"relative", zIndex:1 }}>
                  <div style={{ fontFamily:"Cormorant Garamond", fontSize:62, fontWeight:700, color:"#F7C842", lineHeight:1 }}>₹1.5L Cr</div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,0.55)", marginBottom:28, fontWeight:300, marginTop:4 }}>Left unclaimed annually by eligible citizens</div>
                  {[
                    ["40 Crore families","eligible but unaware of their entitlements"],
                    ["85% of citizens","don't know all schemes they qualify for"],
                    ["₹23,000 average","per family going uncollected each year"],
                  ].map(([v, l]) => (
                    <div key={v} style={{ borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:14, marginTop:14 }}>
                      <div style={{ fontFamily:"Cormorant Garamond", fontSize:24, fontWeight:600, color:"#86EFAC" }}>{v}</div>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS — Visual impact section */}
      <section className="ss-section-pad" style={{ background:C.forest, padding:"88px 28px", borderTop:`1px solid rgba(255,255,255,0.06)`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40 }}><Rangoli size={320} opacity={0.05} color="#F4A523"/></div>
        <div style={{ position:"absolute", bottom:-40, left:-40 }}><Rangoli size={280} opacity={0.04} color="#fff"/></div>
        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative", zIndex:1 }}>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <span className="ss-tag" style={{ background:"rgba(244,165,35,0.18)", color:C.amber }}>By The Numbers</span>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)", color:"#fff", marginTop:14 }}>The scale of unclaimed India</h2>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", maxWidth:460, margin:"14px auto 0", fontWeight:300 }}>These numbers represent real families who never received what they were owed.</p>
          </div>

          {/* BIG HERO STAT */}
          <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:R.xl, padding:"40px 48px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:24, backdropFilter:"blur(8px)" }}>
            <div style={{ flex:1, minWidth:260 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:C.amber, marginBottom:12 }}>TOTAL UNCLAIMED ANNUALLY</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                <span style={{ fontFamily:"Cormorant Garamond", fontSize:"clamp(56px,8vw,96px)", fontWeight:700, color:"#F7C842", lineHeight:1 }}>₹1.5</span>
                <span style={{ fontFamily:"Cormorant Garamond", fontSize:"clamp(28px,4vw,48px)", fontWeight:600, color:"rgba(247,200,66,0.7)" }}>Lakh Crore</span>
              </div>
              <p style={{ fontSize:15, color:"rgba(255,255,255,0.55)", marginTop:10, fontWeight:300, maxWidth:400 }}>
                Every year, eligible Indian families miss out on benefits they are legally entitled to — simply because they don't know about them.
              </p>
            </div>
            {/* Coin stack SVG illustration */}
            <svg width="160" height="160" viewBox="0 0 160 160" style={{ flexShrink:0 }}>
              {/* Stacked coins representing unclaimed money */}
              {[0,1,2,3,4].map(i => (
                <g key={i} transform={`translate(0,${-i*18})`}>
                  <ellipse cx="80" cy="135" rx="52" ry="14" fill={`rgba(247,200,66,${0.15+i*0.15})`}/>
                  <rect x="28" y="121" width="104" height="14" fill={`rgba(244,165,35,${0.18+i*0.12})`} rx="2"/>
                  <ellipse cx="80" cy="121" rx="52" ry="14" fill={`rgba(247,200,66,${0.25+i*0.15})`} stroke="rgba(247,200,66,0.3)" strokeWidth="1"/>
                  <text x="80" y="125" textAnchor="middle" fontSize="9" fontWeight="700" fill="rgba(10,54,40,0.7)" fontFamily="sans-serif">₹</text>
                </g>
              ))}
              {/* Arrow going up showing potential */}
              <line x1="80" y1="40" x2="80" y2="10" stroke="#F7C842" strokeWidth="2" strokeDasharray="4 3" opacity="0.6"/>
              <polygon points="80,4 74,14 86,14" fill="#F7C842" opacity="0.6"/>
              <text x="80" y="56" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)" fontFamily="sans-serif">UNCLAIMED</text>
            </svg>
          </div>

          {/* 4 STAT CARDS */}
          <div className="ss-grid-auto">

            {/* Stat 1 — Families */}
            <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:R.lg, padding:"28px 24px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:16, right:16, opacity:0.12 }}>
                <svg width="64" height="64" viewBox="0 0 64 64"><circle cx="20" cy="18" r="8" fill="#fff"/><circle cx="44" cy="18" r="8" fill="#fff"/><circle cx="32" cy="14" r="9" fill="#fff"/><ellipse cx="20" cy="42" rx="14" ry="10" fill="#fff"/><ellipse cx="44" cy="42" rx="14" ry="10" fill="#fff"/><ellipse cx="32" cy="50" rx="16" ry="11" fill="#fff"/></svg>
              </div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, color:"rgba(255,255,255,0.45)", marginBottom:12 }}>FAMILIES UNAWARE</div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:4, marginBottom:8 }}>
                <StatCounter value={40} suffix="" label="" delay={0}/>
                <span style={{ fontFamily:"Cormorant Garamond", fontSize:32, fontWeight:700, color:C.amber, lineHeight:1, marginBottom:4 }}>Cr</span>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontWeight:300, lineHeight:1.5 }}>Families eligible for at least one scheme but completely unaware</p>
              {/* Mini bar visual */}
              <div style={{ marginTop:16, height:4, background:"rgba(255,255,255,0.1)", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:"85%", background:"linear-gradient(90deg,#F4A523,#F7C842)", borderRadius:2 }}/>
              </div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:5 }}>85% of eligible population</div>
            </div>

            {/* Stat 2 — Schemes */}
            <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:R.lg, padding:"28px 24px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:16, right:16, opacity:0.12 }}>
                <svg width="64" height="64" viewBox="0 0 64 64">
                  {[0,1,2,3,4,5].map(i=><rect key={i} x={4+i*10} y={20+Math.sin(i)*12} width="7" height={24-Math.sin(i)*8} rx="2" fill="#fff"/>)}
                </svg>
              </div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, color:"rgba(255,255,255,0.45)", marginBottom:12 }}>GOVT SCHEMES EXIST</div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:4, marginBottom:8 }}>
                <StatCounter value={300} suffix="" label="" delay={0}/>
                <span style={{ fontFamily:"Cormorant Garamond", fontSize:32, fontWeight:700, color:"#86EFAC", lineHeight:1, marginBottom:4 }}>+</span>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontWeight:300, lineHeight:1.5 }}>Central and state government welfare schemes currently active across India</p>
              <div style={{ marginTop:16, display:"flex", gap:4, flexWrap:"wrap" }}>
                {["Health","Housing","Food","Finance","Agri","Women","Education"].map((cat,i) => (
                  <span key={i} style={{ fontSize:9, fontWeight:600, background:"rgba(134,239,172,0.15)", color:"#86EFAC", padding:"2px 7px", borderRadius:100, letterSpacing:0.5 }}>{cat}</span>
                ))}
              </div>
            </div>

            {/* Stat 3 — Awareness */}
            <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:R.lg, padding:"28px 24px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:16, right:16, opacity:0.12 }}>
                <svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="none" stroke="#fff" strokeWidth="3"/><path d="M32 32 L32 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/><path d="M32 32 L50 40" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="32" cy="32" r="4" fill="#fff"/></svg>
              </div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, color:"rgba(255,255,255,0.45)", marginBottom:12 }}>DON'T KNOW RIGHTS</div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:4, marginBottom:8 }}>
                <StatCounter value={85} suffix="" label="" delay={0}/>
                <span style={{ fontFamily:"Cormorant Garamond", fontSize:32, fontWeight:700, color:"#FCA5A5", lineHeight:1, marginBottom:4 }}>%</span>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontWeight:300, lineHeight:1.5 }}>Of eligible citizens are unaware of all schemes they qualify for right now</p>
              {/* Donut-style visual */}
              <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:10 }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6"/>
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#FCA5A5" strokeWidth="6" strokeDasharray="85 15" strokeDashoffset="25" strokeLinecap="round" style={{transform:"rotate(-90deg)",transformOrigin:"center"}}/>
                </svg>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.35)", lineHeight:1.4 }}>Only 15% know all their entitlements</span>
              </div>
            </div>

            {/* Stat 4 — Per family */}
            <div style={{ background:"linear-gradient(135deg,rgba(212,86,10,0.15),rgba(244,165,35,0.1))", border:"1px solid rgba(244,165,35,0.2)", borderRadius:R.lg, padding:"28px 24px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:16, right:16, opacity:0.15 }}>
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <rect x="8" y="24" width="48" height="32" rx="4" fill="none" stroke="#fff" strokeWidth="2.5"/>
                  <path d="M20 24V18a12 12 0 0 1 24 0v6" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="32" cy="38" r="5" fill="#fff" opacity="0.8"/>
                </svg>
              </div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, color:C.amber, marginBottom:12 }}>AVERAGE PER FAMILY</div>
              <div style={{ fontFamily:"Cormorant Garamond", fontSize:"clamp(30px,4vw,44px)", fontWeight:700, color:"#F7C842", lineHeight:1, marginBottom:8 }}>₹23,000</div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontWeight:300, lineHeight:1.5 }}>Average annual benefit going uncollected per eligible household in India</p>
              <div style={{ marginTop:16, background:"rgba(247,200,66,0.1)", borderRadius:8, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:18 }}>💡</span>
                <span style={{ fontSize:11, color:C.amber, fontWeight:500 }}>That's ₹1,916 every month your family is missing</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="ss-section-pad" style={{ padding:"92px 28px", background:C.cream }}>
        <div ref={r2} className={`ss-reveal ${v2 ? "visible" : ""}`} style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <span className="ss-tag" style={{ background:"rgba(212,86,10,0.1)", color:C.saffron }}>How It Works</span>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)", color:C.forest, marginTop:14 }}>
              From profile to entitlements{" "}
              <span style={{ fontStyle:"italic", color:C.saffron }}>in 2 minutes</span>
            </h2>
          </div>
          <div className="ss-grid-3" style={{ background:C.border, borderRadius:R.xl, overflow:"hidden", boxShadow:S.cardMd }}>
            {[
              { n:"01", icon:"📝", title:"Fill a short form", body:"Tell us your state, income, family size, caste category, and occupation. No documents needed — just 8 simple questions.", bg:C.parch },
              { n:"02", icon:"🤖", title:"Gemini AI analyses", body:"Our AI cross-references your exact profile against 15 central government schemes in real time, calculating precise eligibility.", bg:C.cream },
              { n:"03", icon:"🎯", title:"Get your list", body:"See every scheme you qualify for, exactly why, which documents you need, step-by-step application guide, and official portal links.", bg:C.parch },
            ].map((s, i) => (
              <div key={i} style={{ background:s.bg, padding:"44px 36px", position:"relative" }}>
                <div style={{ fontFamily:"Cormorant Garamond", fontSize:80, fontWeight:700, color:C.border2, position:"absolute", top:16, right:24, lineHeight:1 }}>{s.n}</div>
                <div style={{ fontSize:44, marginBottom:20, position:"relative" }}>{s.icon}</div>
                <h3 style={{ fontSize:22, color:C.forest, marginBottom:10, position:"relative" }}>{s.title}</h3>
                <p style={{ fontSize:14, color:C.ink3, lineHeight:1.75, fontWeight:300, position:"relative" }}>{s.body}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:40 }}>
            <button onClick={() => setPage("form")} className="ss-btn ss-btn-forest" style={{ fontSize:16, padding:"15px 44px", borderRadius:14, boxShadow:"0 8px 28px rgba(10,54,40,0.28)" }}>
              Start My Free Eligibility Check →
            </button>
          </div>
        </div>
      </section>

      {/* STORIES */}
      <section className="ss-section-pad" style={{ background:C.forest, padding:"92px 28px", position:"relative", overflow:"hidden", display:"none" }}>
        <div style={{ position:"absolute", top:-50, left:-50 }}><Rangoli size={380} opacity={0.06} color="#F4A523"/></div>
        <div style={{ position:"absolute", bottom:-70, right:-50 }}><Rangoli size={320} opacity={0.05} color="#fff"/></div>
        <div ref={r3} className={`ss-reveal ${v3 ? "visible" : ""}`} style={{ maxWidth:1100, margin:"0 auto", position:"relative", zIndex:1 }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <span className="ss-tag" style={{ background:"rgba(244,165,35,0.2)", color:C.amber }}>Credibility First</span>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)", color:"#fff", marginTop:14 }}>
              Built for <span style={{ fontStyle:"italic", color:C.amber }}>trust and verification</span>
            </h2>
          </div>
          <div className="ss-story-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
            {[
              { n:"Removed", s:"Removed", o:"Removed", e:"-", q:"Removed", schemes:0, val:"-" },
              { n:"Removed", s:"Removed", o:"Removed", e:"-", q:"Removed", schemes:0, val:"-" },
              { n:"Removed", s:"Removed", o:"Removed", e:"-", q:"Removed", schemes:0, val:"-" },
            ].map((story, i) => (
              <div key={i} className="story-card" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:R.xl, padding:32, backdropFilter:"blur(8px)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                  <div style={{ width:48, height:48, background:"linear-gradient(135deg,#D4560A,#F4A523)", borderRadius:14, display:"grid", placeItems:"center", fontSize:22, flexShrink:0 }}>{story.e}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:15, color:"#fff" }}>{story.n}</div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:300 }}>{story.o} · {story.s}</div>
                  </div>
                </div>
                <p style={{ fontSize:16, color:"rgba(255,255,255,0.7)", lineHeight:1.7, fontStyle:"italic", marginBottom:22, fontFamily:"Cormorant Garamond" }}>
                  "{story.q}"
                </p>
                <div style={{ display:"flex", gap:10 }}>
                  <div style={{ flex:1, background:"rgba(244,165,35,0.15)", border:"1px solid rgba(244,165,35,0.25)", borderRadius:R.md, padding:"10px 14px", textAlign:"center" }}>
                    <div style={{ fontFamily:"Cormorant Garamond", fontSize:26, fontWeight:700, color:"#F7C842" }}>{story.schemes}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", letterSpacing:0.5, marginTop:1 }}>SCHEMES</div>
                  </div>
                  <div style={{ flex:1, background:"rgba(42,122,88,0.2)", border:"1px solid rgba(42,122,88,0.4)", borderRadius:R.md, padding:"10px 14px", textAlign:"center" }}>
                    <div style={{ fontFamily:"Cormorant Garamond", fontSize:22, fontWeight:700, color:"#86EFAC" }}>{story.val}</div>
                    <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", letterSpacing:0.5, marginTop:1 }}>IN BENEFITS</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CREDIBILITY */}
      <section className="ss-section-pad" style={{ background:C.forest, padding:"92px 28px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-50, left:-50 }}><Rangoli size={380} opacity={0.06} color="#F4A523"/></div>
        <div style={{ position:"absolute", bottom:-70, right:-50 }}><Rangoli size={320} opacity={0.05} color="#fff"/></div>
        <div ref={r3} className={`ss-reveal ${v3 ? "visible" : ""}`} style={{ maxWidth:1100, margin:"0 auto", position:"relative", zIndex:1 }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <span className="ss-tag" style={{ background:"rgba(244,165,35,0.2)", color:C.amber }}>Credibility First</span>
            <h2 style={{ fontSize:"clamp(28px,4vw,48px)", color:"#fff", marginTop:14 }}>
              Built for <span style={{ fontStyle:"italic", color:C.amber }}>trust and verification</span>
            </h2>
          </div>
          <div className="ss-story-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
            {[
              { icon:"✅", title:"Rule-based matching", desc:"Recommendations are generated from explicit policy criteria such as age, income, occupation, and category." },
              { icon:"🔗", title:"Official-source workflow", desc:"Each scheme includes portal links, helplines, document checklist, and practical application steps." },
              { icon:"🧭", title:"Real-world usability", desc:"Designed for online plus offline journeys through CSCs and official government channels." },
            ].map((item, i) => (
              <div key={i} className="story-card" style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:R.xl, padding:32, backdropFilter:"blur(8px)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <div style={{ width:48, height:48, background:"linear-gradient(135deg,#D4560A,#F4A523)", borderRadius:14, display:"grid", placeItems:"center", fontSize:22, flexShrink:0 }}>{item.icon}</div>
                  <div style={{ fontWeight:600, fontSize:18, color:"#fff" }}>{item.title}</div>
                </div>
                <p style={{ fontSize:15, color:"rgba(255,255,255,0.7)", lineHeight:1.75, fontWeight:300 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ textAlign:"center", marginTop:20, color:"rgba(255,255,255,0.45)", fontSize:12 }}>
            Personal testimonials are not shown unless independently verified.
          </p>
        </div>
      </section>

      {/* SCHEMES PREVIEW */}
      <section className="ss-section-pad" style={{ padding:"92px 28px", background:C.cream }}>
        <div ref={r4} className={`ss-reveal ${v4 ? "visible" : ""}`} style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <span className="ss-tag" style={{ background:"rgba(10,54,40,0.08)", color:C.forest2 }}>What We Cover</span>
            <h2 style={{ fontSize:"clamp(26px,4vw,44px)", color:C.forest, marginTop:14 }}>15 high-impact Central Government schemes</h2>
            <p style={{ fontSize:15, color:C.ink3, maxWidth:480, margin:"14px auto 0", fontWeight:300 }}>Healthcare to housing, agriculture to education — every category that matters most.</p>
          </div>
          <div className="ss-grid-scheme">
            {SCHEMES.slice(0, 9).map((s, i) => (
              <div key={s.id} className="ss-card preview-card" style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:R.lg, padding:"20px 18px", boxShadow:S.cardSm, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${s.color},${s.color}66)` }}/>
                <div style={{ fontSize:28, marginBottom:10 }}>{s.icon}</div>
                <div style={{ fontSize:13, fontWeight:600, color:C.ink, lineHeight:1.35, marginBottom:8 }}>{s.name}</div>
                <span className="ss-tag" style={{ background:s.light, color:s.color, fontSize:9, padding:"2px 8px" }}>{s.tag}</span>
              </div>
            ))}
            <div className="ss-card" onClick={() => setPage("form")}
              style={{ background:C.forest, border:`1px solid ${C.forest2}`, borderRadius:R.lg, padding:"20px 18px", boxShadow:S.cardSm, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>+6</div>
              <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>More schemes</div>
              <div style={{ fontSize:11, color:C.amber, marginTop:4 }}>Check all →</div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="ss-section-pad" style={{ background:C.parch, padding:"80px 28px", borderTop:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:620, margin:"0 auto", textAlign:"center" }}>
          <div style={{ width:72, height:72, background:C.forest, borderRadius:20, display:"grid", placeItems:"center", margin:"0 auto 24px", boxShadow:"0 8px 28px rgba(10,54,40,0.3)", animation:"float 4s ease-in-out infinite" }}>
              <svg width="40" height="40" viewBox="0 0 38 38" fill="none"><ellipse cx="19" cy="22" rx="3.5" ry="6" fill="#2A7A58"/><ellipse cx="19" cy="22" rx="3.5" ry="6" transform="rotate(45 19 22)" fill="#2A7A58"/><ellipse cx="19" cy="22" rx="3.5" ry="6" transform="rotate(90 19 22)" fill="#2A7A58"/><ellipse cx="19" cy="22" rx="3.5" ry="6" transform="rotate(135 19 22)" fill="#2A7A58"/><text x="19" y="24" textAnchor="middle" fontSize="13" fontWeight="700" fill="#F7C842" fontFamily="serif">₹</text></svg>
            </div>
          <h2 style={{ fontSize:"clamp(26px,4vw,42px)", color:C.forest, marginBottom:14 }}>
            Your entitlements are waiting.<br/><span style={{ fontStyle:"italic", color:C.saffron }}>Claim them today.</span>
          </h2>
          <p style={{ color:C.ink3, fontSize:15, lineHeight:1.75, marginBottom:34, fontWeight:300 }}>Fill a 2-minute form. Get a personalised scheme list. Step-by-step application guidance. No login, no account, no cost — ever.</p>
          <button onClick={() => setPage("form")} className="ss-btn ss-btn-saffron" style={{ fontSize:17, padding:"17px 52px", borderRadius:16, boxShadow:"0 10px 36px rgba(212,86,10,0.4)" }}>
            Find My Government Benefits →
          </button>
          <div style={{ marginTop:18, fontSize:12, color:C.ink3, display:"flex", alignItems:"center", justifyContent:"center", gap:14, flexWrap:"wrap" }}>
            <span>🔒 No data stored</span>
            <span style={{ color:C.border2 }}>·</span>
            <span>✓ No login needed</span>
            <span style={{ color:C.border2 }}>·</span>
            <span>♻ Always free</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:C.ink, padding:"32px 28px", color:"rgba(255,255,255,0.4)", fontSize:12, textAlign:"center" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ fontFamily:"Cormorant Garamond", fontSize:18, color:"rgba(255,255,255,0.7)", marginBottom:6, fontWeight:600 }}>◆ SchemeSaathi</div>
          <div>Built for the Changemaker League: AI for Good Hackathon 2026 · Connecting Dreams Foundation</div>
          <div style={{ marginTop:6, opacity:0.5 }}>Powered by Google Gemini AI · Informational only — verify on official government portals</div>
        </div>
      </footer>
    </div>
  );
};

/* ─── FORM PAGE ───────────────────────────────────────────────── */
const FormPage = ({ form, updateForm, handleOcc, step, setStep, onSubmit }) => {
  const [errs, setErrs] = useState({});

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.state) e.state = "Please select your state";
      if (!form.age || parseInt(form.age) < 18 || parseInt(form.age) > 100) e.age = "Enter valid age (18–100)";
      if (!form.gender) e.gender = "Please select gender";
    }
    if (s === 2) {
      if (form.income === "" || form.income === null || form.income === undefined) e.income = "Enter annual income (enter 0 if none)";
      if (!form.occupation) e.occupation = "Please select your occupation";
    }
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(step + 1); };

  const Lbl = ({ children }) => (
    <label style={{ fontSize:13, fontWeight:600, color:C.ink2, marginBottom:7, display:"block", letterSpacing:0.2 }}>{children}</label>
  );
  const ErrMsg = ({ k }) => errs[k]
    ? <p style={{ fontSize:11, color:C.red, marginTop:4 }}>⚠ {errs[k]}</p>
    : null;

  return (
    <div style={{ minHeight:"calc(100vh - 64px)", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"40px 24px", background:`linear-gradient(160deg,${C.cream} 0%,${C.parch} 100%)` }}>
      <div style={{ width:"100%", maxWidth:620 }}>
        {/* Step indicator */}
        <div style={{ marginBottom:28, display:"flex", background:C.white, borderRadius:R.lg, border:`1px solid ${C.border}`, overflow:"hidden", boxShadow:S.cardSm }}>
          {["Personal Details","Financial Info","Additional Flags"].map((l, i) => (
            <div key={i} style={{ flex:1, padding:"13px 10px", textAlign:"center", background: step === i+1 ? C.forest : step > i+1 ? C.forest3 : "transparent", color: step >= i+1 ? "#fff" : C.ink3, transition:"all 0.3s", borderRight: i < 2 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:0.6 }}>
                {step > i+1 ? "✓ " : `0${i+1} `}{l}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:R.xl, padding:40, boxShadow:S.cardMd }}>
          <h2 style={{ fontSize:28, color:C.forest, marginBottom:6 }}>
            {step === 1 ? "Tell us about yourself" : step === 2 ? "Your financial picture" : "A few more details"}
          </h2>
          <p style={{ color:C.ink3, fontSize:14, marginBottom:30, fontWeight:300 }}>
            {step === 1 ? "This personalises your scheme matches precisely to your situation"
              : step === 2 ? "This helps filter schemes by income and occupation eligibility criteria"
              : "Each item below unlocks additional specific scheme matches"}
          </p>

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div>
                <Lbl>State / Union Territory *</Lbl>
                <select value={form.state} onChange={e => updateForm("state", e.target.value)} className="ss-input">
                  <option value="">Choose your state or UT...</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ErrMsg k="state"/>
              </div>
              <div className="ss-grid-form">
                <div>
                  <Lbl>Your Age *</Lbl>
                  <input type="number" min={18} max={100} value={form.age} onChange={e => updateForm("age", e.target.value)} placeholder="e.g. 34" className="ss-input"/>
                  <ErrMsg k="age"/>
                </div>
                <div>
                  <Lbl>Gender *</Lbl>
                  <select value={form.gender} onChange={e => updateForm("gender", e.target.value)} className="ss-input">
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                  <ErrMsg k="gender"/>
                </div>
              </div>
              <div>
                <Lbl>Caste Category *</Lbl>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                  {["General","OBC","SC","ST"].map(cat => (
                    <button key={cat} onClick={() => updateForm("category", cat)}
                      style={{ padding:"12px 8px", border:`2px solid ${form.category === cat ? C.forest : C.border}`, borderRadius:R.md, background: form.category === cat ? C.forest : "transparent", color: form.category === cat ? "#fff" : C.ink3, fontWeight:600, fontSize:14, cursor:"pointer", transition:"all 0.2s" }}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
              <div>
                <Lbl>Annual Household Income (₹) *</Lbl>
                <input type="number" min={0} value={form.income} onChange={e => updateForm("income", e.target.value)} placeholder="Total yearly income of all family members (enter 0 if none)" className="ss-input"/>
                <p style={{ fontSize:11, color:C.ink3, marginTop:5, fontWeight:300 }}>Combined income of all earning members per year</p>
                <ErrMsg k="income"/>
              </div>
              <div>
                <Lbl>Family Size</Lbl>
                <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                  <button onClick={() => updateForm("family_size", Math.max(1, parseInt(form.family_size || 1) - 1))}
                    style={{ width:40, height:40, borderRadius:"50%", border:`1.5px solid ${C.border2}`, background:C.parch, fontSize:22, fontWeight:700, color:C.forest, cursor:"pointer", display:"grid", placeItems:"center" }}>−</button>
                  <span style={{ fontFamily:"Cormorant Garamond", fontSize:42, fontWeight:700, color:C.forest, minWidth:48, textAlign:"center", lineHeight:1 }}>{form.family_size}</span>
                  <button onClick={() => updateForm("family_size", Math.min(20, parseInt(form.family_size || 1) + 1))}
                    style={{ width:40, height:40, borderRadius:"50%", border:`1.5px solid ${C.border2}`, background:C.parch, fontSize:22, fontWeight:700, color:C.forest, cursor:"pointer", display:"grid", placeItems:"center" }}>+</button>
                  <span style={{ fontSize:14, color:C.ink3, fontWeight:300 }}>members in household</span>
                </div>
              </div>
              <div>
                <Lbl>Primary Occupation *</Lbl>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {OCCUPATIONS.map(o => (
                    <label key={o.value} className={`ss-radio ${form.occupation === o.value ? "selected" : ""}`}
                      style={{ border:`1.5px solid ${form.occupation === o.value ? C.forest : C.border}` }}>
                      <input type="radio" name="occ" value={o.value} checked={form.occupation === o.value} onChange={() => handleOcc(o.value)}
                        style={{ accentColor:C.amber, width:16, height:16, flexShrink:0 }}/>
                      <span style={{ fontSize:16 }}>{o.icon}</span>
                      <span style={{ fontSize:14, fontWeight: form.occupation === o.value ? 600 : 400, color: form.occupation === o.value ? "#fff" : C.ink }}>{o.label}</span>
                    </label>
                  ))}
                </div>
                <ErrMsg k="occupation"/>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
              <p style={{ fontSize:13, color:C.ink3, marginBottom:6, fontWeight:300 }}>Check every box that applies — each one unlocks additional scheme matches:</p>
              {[
                ["has_aadhaar","I have an Aadhaar card","🪪","Unlocks most government schemes"],
                ["has_bpl_card","I have a BPL or ration card","📋","Priority access for many schemes"],
                ["has_bank_account","I have a bank account","🏦","Required for direct benefit transfers"],
                ["has_girl_child","I have a girl child below 10 years","👧","Unlocks Sukanya Samriddhi Yojana"],
                ["is_pregnant","I am pregnant or have a child under 6 months","🤱","Unlocks PMMVY maternity benefit"],
                ["is_farmer","I own or cultivate agricultural land","🌾","Unlocks PM Kisan and Fasal Bima"],
                ["is_street_vendor","I am a street vendor or hawker","🛒","Unlocks SVANidhi working capital loan"],
                ["owns_business","I own or want to start a small business","💼","Unlocks Mudra and Stand-Up India"],
                ["is_student","I am currently enrolled as a student","🎓","Unlocks post-matric scholarship"],
                ["has_disability","I have a certified disability (40% or above)","♿","Additional priority access"],
                ["above_60","I am above 60 years of age","👴","Unlocks NSAP old-age pension"],
              ].map(([key, label, icon, hint]) => (
                <label key={key} className={`ss-check ${form[key] ? "checked" : ""}`}>
                  <input type="checkbox" checked={!!form[key]} onChange={e => updateForm(key, e.target.checked)}
                    style={{ marginTop:3, accentColor:C.forest, width:16, height:16, flexShrink:0, cursor:"pointer" }}/>
                  <div>
                    <div style={{ fontSize:14, fontWeight: form[key] ? 600 : 400, color: form[key] ? C.forest : C.ink }}>{icon} {label}</div>
                    <div style={{ fontSize:11, color:C.ink3, marginTop:2, fontWeight:300 }}>{hint}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* NAV BUTTONS */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:32, paddingTop:24, borderTop:`1px solid ${C.border}` }}>
            {step > 1
              ? <button onClick={() => setStep(step - 1)} className="ss-btn ss-btn-ghost" style={{ padding:"13px 26px", fontSize:14 }}>← Back</button>
              : <div/>
            }
            {step < 3
              ? <button onClick={next} className="ss-btn ss-btn-forest" style={{ padding:"14px 32px", fontSize:15 }}>Continue →</button>
              : <button onClick={onSubmit} className="ss-btn ss-btn-saffron" style={{ padding:"15px 36px", fontSize:16, borderRadius:14, boxShadow:"0 6px 22px rgba(212,86,10,0.4)" }}>
                  🔍 Find My Schemes
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── LOADING PAGE ────────────────────────────────────────────── */
const LOAD_MSGS = [
  "Checking 15 central government schemes...",
  "Analysing income and category eligibility...",
  "Cross-referencing occupation-based schemes...",
  "Running Gemini AI eligibility engine...",
  "Calculating your total potential benefit...",
  "Preparing your personalised application guide...",
];
const LoadingPage = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % LOAD_MSGS.length), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ minHeight:"calc(100vh - 64px)", display:"flex", alignItems:"center", justifyContent:"center", background:`linear-gradient(160deg,${C.cream},${C.parch})`, padding:40 }}>
      <div style={{ textAlign:"center", maxWidth:500 }}>
        <div style={{ position:"relative", width:96, height:96, margin:"0 auto 40px" }}>
          <div style={{ width:96, height:96, border:`3px solid ${C.parch2}`, borderTop:`3px solid ${C.forest}`, borderRadius:"50%", animation:"spin 1s linear infinite", position:"absolute" }}/>
          <div style={{ width:72, height:72, border:`3px solid ${C.parch2}`, borderTop:`3px solid ${C.saffron}`, borderRadius:"50%", animation:"spinR 1.5s linear infinite", position:"absolute", top:12, left:12 }}/>
          <div style={{ position:"absolute", inset:0, display:"grid", placeItems:"center", fontSize:32 }}>🇮🇳</div>
        </div>
        <h2 style={{ fontSize:32, color:C.forest, marginBottom:10 }}>Analysing your profile</h2>
        <p style={{ color:C.ink3, fontSize:15, minHeight:26, fontWeight:300 }}>{LOAD_MSGS[i]}</p>
        <div style={{ display:"flex", gap:8, justifyContent:"center", margin:"28px 0" }}>
          {LOAD_MSGS.map((_, j) => (
            <div key={j} style={{ width: j === i ? 24 : 8, height:8, borderRadius:4, background: j === i ? C.saffron : C.parch2, transition:"all 0.35s" }}/>
          ))}
        </div>
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:R.lg, padding:"18px 24px", fontSize:13, color:C.ink3, lineHeight:1.65, boxShadow:S.cardSm }}>
          🤖 Powered by <strong style={{ color:C.forest }}>Google Gemini AI</strong> — cross-checking eligibility criteria against 15 government schemes and generating your personalised benefit report
        </div>
      </div>
    </div>
  );
};

/* ─── SCHEME MODAL ────────────────────────────────────────────── */
const SchemeModal = ({ scheme: s, onClose }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(s.helpline).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(10,30,20,0.65)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(8px)", animation:"fadeIn 0.2s ease" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:R.xl, maxWidth:580, width:"100%", maxHeight:"90vh", overflow:"auto", boxShadow:S.cardLg }}>
        {/* Header */}
        <div style={{ position:"sticky", top:0, background:C.white, borderBottom:`1px solid ${C.border}`, padding:"20px 28px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", borderRadius:`${R.xl} ${R.xl} 0 0` }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:52, height:52, background:s.light, borderRadius:14, display:"grid", placeItems:"center", fontSize:26, flexShrink:0 }}>{s.icon}</div>
            <div>
              <span className="ss-tag" style={{ background:s.light, color:s.color, marginBottom:4 }}>{s.tag}</span>
              <h3 style={{ fontFamily:"Cormorant Garamond", fontSize:20, fontWeight:700, color:C.forest, lineHeight:1.2 }}>{s.name}</h3>
              <div style={{ fontSize:12, color:C.ink3, fontWeight:300 }}>{s.ministry}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:"50%", border:`1.5px solid ${C.border}`, background:"none", fontSize:16, cursor:"pointer", color:C.ink3, display:"grid", placeItems:"center" }}>✕</button>
        </div>
        <div style={{ padding:28 }}>
          {/* Why you qualify */}
          <div style={{ background:"rgba(10,54,40,0.05)", borderLeft:`4px solid ${C.forest}`, borderRadius:`0 ${R.md} ${R.md} 0`, padding:"14px 18px", marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:C.forest, marginBottom:6 }}>WHY YOU QUALIFY</div>
            <p style={{ fontSize:14, color:C.ink, lineHeight:1.65 }}>{s.reason}</p>
          </div>
          {/* Benefit */}
          <div style={{ background:s.light, borderRadius:R.lg, padding:"16px 20px", marginBottom:20, border:`1px solid ${s.color}22` }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:s.color, marginBottom:6 }}>BENEFIT</div>
            <p style={{ fontSize:16, fontWeight:600, color:C.ink }}>{s.benefit}</p>
          </div>
          {/* Documents */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:C.ink3, marginBottom:12 }}>DOCUMENTS NEEDED</div>
            {s.documents.map((d, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom: i < s.documents.length - 1 ? `1px solid ${C.parch2}` : "none" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
                <span style={{ fontSize:14, color:C.ink }}>{d}</span>
              </div>
            ))}
          </div>
          {/* Steps */}
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:C.ink3, marginBottom:12 }}>HOW TO APPLY — STEP BY STEP</div>
            {s.steps.map((st, i) => (
              <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom: i < s.steps.length - 1 ? `1px solid ${C.parch2}` : "none" }}>
                <div style={{ width:26, height:26, borderRadius:"50%", background:s.color, color:"#fff", display:"grid", placeItems:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>{i+1}</div>
                <span style={{ fontSize:14, color:C.ink, lineHeight:1.6, paddingTop:3 }}>{st}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Footer buttons */}
        <div className="ss-modal-footer" style={{ padding:"18px 28px", borderTop:`1px solid ${C.border}`, display:"flex", gap:10, flexWrap:"wrap" }}>
          <a href={s.url} target="_blank" rel="noreferrer"
            style={{ flex:1, background:C.forest, color:"#fff", textDecoration:"none", borderRadius:R.md, padding:"13px 20px", fontSize:14, fontWeight:600, textAlign:"center", display:"block" }}>
            Apply on Official Portal →
          </a>
          <button onClick={copy}
            style={{ background:C.parch, border:`1px solid ${C.border}`, borderRadius:R.md, padding:"13px 18px", fontSize:13, fontWeight:600, color:C.ink3, cursor:"pointer" }}>
            {copied ? "✓ Copied!" : `📞 ${s.helpline}`}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── RESULTS PAGE ────────────────────────────────────────────── */
const ResultsPage = ({ results, setPage, apiKey }) => {
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [msgs, setMsgs] = useState([{
    role:"a",
    text:`Namaste! 🙏 I found ${results.schemes.length} schemes worth an estimated ₹${results.totalBenefit.toLocaleString()} in annual benefits for you. What would you like to know?`,
  }]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const chatEl = useRef(null);

  const filtered = cat === "all" ? results.schemes : results.schemes.filter(s => s.category === cat);

  useEffect(() => {
    if (chatEl.current) chatEl.current.scrollTop = chatEl.current.scrollHeight;
  }, [msgs]);

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const q = chatInput.trim();
    setChatInput("");
    setMsgs(m => [...m, { role:"u", text:q }]);
    setChatBusy(true);
    try {
      let reply;
      if (apiKey.trim()) {
        const hist = msgs.map(m => `${m.role === "u" ? "User" : "Assistant"}: ${m.text}`).join("\n");
        const prompt = `You are SchemeSaathi, a friendly Indian government welfare assistant. The user was matched to these schemes: ${results.schemes.map(s => s.name).join(", ")}. Their profile: income ₹${results.profile.income}, state: ${results.profile.state}, occupation: ${results.profile.occupation}.\n\nConversation:\n${hist}\nUser: ${q}\n\nAnswer in 2-3 sentences. Be specific and practical. Reply in Hindi if the user writes in Hindi.`;
        reply = await requestGemini({
          prompt,
          apiKey,
          temperature: 0.3,
          maxOutputTokens: 350,
        });
      } else {
        const hist = msgs.map(m => `${m.role === "u" ? "User" : "Assistant"}: ${m.text}`).join("\n");
        const prompt = `You are SchemeSaathi, a friendly Indian government welfare assistant. The user was matched to these schemes: ${results.schemes.map(s => s.name).join(", ")}. Their profile: income ₹${results.profile.income}, state: ${results.profile.state}, occupation: ${results.profile.occupation}.\n\nConversation:\n${hist}\nUser: ${q}\n\nAnswer in 2-3 sentences. Be specific and practical. Reply in Hindi if the user writes in Hindi.`;
        try {
          reply = await requestGemini({
            prompt,
            temperature: 0.3,
            maxOutputTokens: 350,
          });
        } catch {
          await new Promise(r => setTimeout(r, 600));
          const lc = q.toLowerCase();
        if (lc.includes("document") || lc.includes("papers") || lc.includes("kagaz"))
          reply = "Your Aadhaar card is the most critical document for every scheme. Keep your ration card, income certificate, and bank passbook ready. Your nearest Common Service Centre (CSC / Jan Seva Kendra) can help you apply for any scheme — they charge just ₹20–50 per application.";
        else if (lc.includes("apply") || lc.includes("kaise") || lc.includes("how"))
          reply = `The easiest path is your nearest Common Service Centre (CSC). For online applications, each scheme card has a direct portal link. For ${results.schemes[0]?.name || "any scheme"}, start at ${results.schemes[0]?.url || "the official portal"}.`;
        else if (lc.includes("income") || lc.includes("salary") || lc.includes("limit"))
          reply = `Your annual income of ₹${(results.profile.income||0).toLocaleString()} qualifies you for ${results.schemes.length} schemes. Most use self-declared income verified by local officials — no complex tax returns needed.`;
        else if (lc.includes("time") || lc.includes("kitne din") || lc.includes("how long"))
          reply = "Most online applications are processed within 30–45 days. PMJAY and Jan Dhan accounts can be issued the same day. PM Kisan registrations verify within 7 days. Call the scheme's helpline number for specific timelines.";
        else
          reply = "For personalised guidance, visit your nearest Common Service Centre (CSC) or call PM Helpline at 7755-99999. They provide free assistance with all central government scheme applications in your language.";
      }
      }
      setMsgs(m => [...m, { role:"a", text:reply }]);
    } catch {
      setMsgs(m => [...m, { role:"a", text:"I'm having trouble connecting right now. Please call PM Helpline at 7755-99999 for direct assistance." }]);
    }
    setChatBusy(false);
  };

  return (
    <div style={{ background:C.cream, minHeight:"calc(100vh - 64px)" }}>
      {/* Hero banner */}
      <div className="ss-results-banner" style={{ background:"linear-gradient(148deg,#061E12,#0A3628,#0E4A34)", color:"#fff", padding:"40px 28px 52px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:-50 }}><Rangoli size={360} opacity={0.06} color="#F4A523"/></div>
        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:20 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:C.amber, marginBottom:10 }}>
                ELIGIBILITY RESULTS · {(results.profile.state || "").toUpperCase()}
              </div>
              <h1 style={{ fontSize:"clamp(26px,4vw,46px)", fontWeight:600, color:"#fff", lineHeight:1.1, marginBottom:10 }}>
                You may qualify for{" "}
                <span style={{ color:"#F7C842", fontStyle:"italic" }}>{results.schemes.length} government schemes</span>
              </h1>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:15, fontWeight:300 }}>
                Estimated annual benefit:{" "}
                <strong style={{ fontFamily:"Cormorant Garamond", fontSize:26, fontWeight:700, color:C.gold }}>
                  ₹{results.totalBenefit.toLocaleString()}
                </strong>
              </p>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignSelf:"flex-end" }}>
              <button onClick={() => setChatOpen(true)}
                style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:R.md, padding:"11px 20px", fontSize:14, fontWeight:500, color:"#fff", cursor:"pointer", backdropFilter:"blur(4px)" }}>
                💬 Ask SchemeSaathi
              </button>
              <button onClick={() => setPage("form")} className="ss-btn ss-btn-ghost"
                style={{ color:"rgba(255,255,255,0.6)", borderColor:"rgba(255,255,255,0.15)", padding:"11px 20px", fontSize:14 }}>
                ← New Search
              </button>
            </div>
          </div>
          {/* Mini stats row */}
          <div style={{ display:"flex", gap:0, marginTop:32, background:"rgba(255,255,255,0.06)", borderRadius:R.lg, border:"1px solid rgba(255,255,255,0.08)", overflow:"hidden" }}>
            {[
              [`${results.schemes.filter(s => s.priority >= 8).length} High-Impact`, "Priority schemes"],
              [`${results.schemes.length} Total`, "Matched schemes"],
              [`₹${Math.round(results.totalBenefit / 12).toLocaleString()}/mo`, "Avg monthly benefit"],
              ["Free", "Application help"],
            ].map(([v, l], i) => (
              <div key={i} style={{ flex:1, padding:"14px 12px", textAlign:"center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <div style={{ fontFamily:"Cormorant Garamond", fontSize:20, fontWeight:700, color:C.amber }}>{v}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", fontWeight:500, marginTop:2, letterSpacing:0.5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 28px", position:"sticky", top:64, zIndex:100 }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", gap:5, overflowX:"auto", padding:"10px 0" }}>
          {CATS.map(c => {
            const cnt = c === "all" ? results.schemes.length : results.schemes.filter(s => s.category === c).length;
            if (!cnt && c !== "all") return null;
            return (
              <button key={c} onClick={() => setCat(c)}
                style={{ flexShrink:0, padding:"7px 18px", borderRadius:100, border:`1.5px solid ${cat === c ? C.forest : C.border}`, background: cat === c ? C.forest : "transparent", color: cat === c ? "#fff" : C.ink3, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:5 }}>
                {CAT_META[c].icon} {CAT_META[c].label}
                {cnt > 0 && <span style={{ background: cat === c ? "rgba(255,255,255,0.2)" : C.parch2, borderRadius:100, padding:"1px 7px", fontSize:10 }}>{cnt}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 28px" }}>
        <div className="ss-grid-cards">
          {filtered.map((s, i) => (
            <div key={s.id} className={`ss-result-card fade-card-${Math.min(i + 1, 6)}`}
              style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:R.xl, overflow:"hidden", boxShadow:S.cardSm }}>
              <div style={{ height:4, background:`linear-gradient(90deg,${s.color},${s.color}66)` }}/>
              <div style={{ padding:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:48, height:48, background:s.light, borderRadius:14, display:"grid", placeItems:"center", fontSize:24, flexShrink:0 }}>{s.icon}</div>
                    <div>
                      <span className="ss-tag" style={{ background:s.light, color:s.color, marginBottom:4 }}>{s.tag}</span>
                      <div style={{ fontSize:11, color:C.ink3, fontWeight:300 }}>{s.ministry}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:4, background: s.priority >= 8 ? "rgba(22,163,74,0.1)" : s.priority >= 6 ? "rgba(217,119,6,0.1)" : "rgba(107,114,128,0.1)", borderRadius:100, padding:"4px 10px" }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background: s.priority >= 8 ? "#16A34A" : s.priority >= 6 ? "#D97706" : "#9CA3AF" }}/>
                    <span style={{ fontSize:10, fontWeight:700, color: s.priority >= 8 ? "#15803D" : s.priority >= 6 ? "#B45309" : "#6B7280" }}>
                      {s.priority >= 8 ? "HIGH" : s.priority >= 6 ? "MED" : "STD"}
                    </span>
                  </div>
                </div>
                <h3 style={{ fontFamily:"Cormorant Garamond", fontSize:19, fontWeight:600, color:C.forest, marginBottom:10, lineHeight:1.25 }}>{s.name}</h3>
                <div style={{ background:C.parch, borderRadius:R.md, padding:"11px 14px", marginBottom:12, borderLeft:`3px solid ${s.color}` }}>
                  <p style={{ fontSize:13, color:C.ink, lineHeight:1.6 }}>{s.reason}</p>
                </div>
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10, fontWeight:600, letterSpacing:0.8, color:C.ink3, marginBottom:3 }}>BENEFIT</div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.ink }}>{s.benefit}</div>
                </div>
                <div style={{ fontSize:12, color:s.color, fontWeight:600, background:s.light, borderRadius:R.sm, padding:"8px 12px", marginBottom:18, lineHeight:1.5 }}>
                  → {s.action}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => setSelected(s)}
                    style={{ flex:1, background:C.forest, color:"#fff", border:"none", borderRadius:R.md, padding:"11px 14px", fontSize:13, fontWeight:600, cursor:"pointer", transition:"background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.forest2}
                    onMouseLeave={e => e.currentTarget.style.background = C.forest}>
                    View Details & Apply
                  </button>
                  <a href={s.url} target="_blank" rel="noreferrer"
                    style={{ background:C.parch, border:`1px solid ${C.border}`, borderRadius:R.md, padding:"11px 15px", fontSize:14, color:C.ink3, textDecoration:"none", display:"grid", placeItems:"center" }}>
                    ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"80px 20px", color:C.ink3 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <h3 style={{ fontFamily:"Cormorant Garamond", fontSize:24, color:C.forest, marginBottom:8 }}>No schemes in this category</h3>
            <p style={{ fontWeight:300 }}>Try a different category or start a new search.</p>
          </div>
        )}
      </div>

      {selected && <SchemeModal scheme={selected} onClose={() => setSelected(null)}/>}

      {/* CHAT SIDEBAR */}
      {chatOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", justifyContent:"flex-end" }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(10,20,15,0.35)", backdropFilter:"blur(3px)" }} onClick={() => setChatOpen(false)}/>
          <div style={{ position:"relative", width:400, maxWidth:"100vw", background:C.white, display:"flex", flexDirection:"column", boxShadow:S.cardLg, animation:"fadeIn 0.25s ease" }}>
            <div style={{ background:C.forest, padding:"20px 22px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:"Cormorant Garamond", fontSize:20, fontWeight:700, color:"#fff" }}>Ask SchemeSaathi</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:2, fontWeight:300 }}>AI assistant · English & Hindi</div>
              </div>
              <button onClick={() => setChatOpen(false)}
                style={{ width:34, height:34, borderRadius:"50%", background:"rgba(255,255,255,0.12)", border:"none", color:"#fff", fontSize:16, cursor:"pointer", display:"grid", placeItems:"center" }}>✕</button>
            </div>
            <div ref={chatEl} style={{ flex:1, overflowY:"auto", padding:20, display:"flex", flexDirection:"column", gap:12, minHeight:0 }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ display:"flex", justifyContent: m.role === "u" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth:"85%", background: m.role === "u" ? C.forest : C.parch, color: m.role === "u" ? "#fff" : C.ink, borderRadius: m.role === "u" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", padding:"11px 15px", fontSize:14, lineHeight:1.6, border: m.role === "a" ? `1px solid ${C.border}` : "none" }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {chatBusy && (
                <div style={{ display:"flex", gap:5, padding:"10px 14px", background:C.parch, borderRadius:"16px 16px 16px 4px", width:"fit-content", border:`1px solid ${C.border}` }}>
                  {[0,1,2].map(j => <div key={j} style={{ width:8, height:8, borderRadius:"50%", background:C.forest3, animation:`pulse 1s ${j*0.2}s infinite` }}/>)}
                </div>
              )}
            </div>
            {/* Quick questions */}
            <div style={{ padding:"0 16px 6px", display:"flex", flexWrap:"wrap", gap:5 }}>
              {["What documents do I need?","How to apply offline?","Nearest CSC centre?","What's the deadline?"].map(q => (
                <button key={q} onClick={() => setChatInput(q)}
                  style={{ fontSize:11, border:`1px solid ${C.border}`, borderRadius:100, padding:"4px 11px", background:C.parch, color:C.ink3, fontWeight:500, cursor:"pointer" }}>
                  {q}
                </button>
              ))}
            </div>
            <div style={{ borderTop:`1px solid ${C.border}`, padding:16, display:"flex", gap:10 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder="Ask about schemes, documents, eligibility..."
                className="ss-input" style={{ flex:1, fontSize:13, padding:"10px 14px" }}/>
              <button onClick={sendChat} className="ss-btn ss-btn-saffron" style={{ padding:"10px 18px", fontSize:16, borderRadius:R.md }}>→</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating chat button */}
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)}
          style={{ position:"fixed", bottom:28, right:28, width:58, height:58, borderRadius:"50%", background:C.forest, color:"#fff", border:`3px solid ${C.white}`, fontSize:22, boxShadow:S.cardLg, zIndex:100, cursor:"pointer", animation:"float 4s ease-in-out infinite", display:"grid", placeItems:"center" }}>
          💬
        </button>
      )}
    </div>
  );
};

/* ─── APP ROOT ────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("landing");
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [results, setResults] = useState(null);
  const [form, setForm] = useState({
    state:"", age:"", gender:"", category:"General",
    income:"", family_size:4, occupation:"",
    has_aadhaar:true, has_bpl_card:false, has_bank_account:false,
    has_girl_child:false, is_pregnant:false, is_farmer:false,
    is_street_vendor:false, owns_business:false, is_student:false,
    has_disability:false, above_60:false,
  });

  const updateForm = (k, v) => setForm(f => ({ ...f, [k]:v }));
  const handleOcc = v => setForm(f => ({
    ...f, occupation:v,
    is_farmer: v === "farmer",
    is_street_vendor: v === "street_vendor",
    is_student: v === "student",
  }));

  const onSubmit = async () => {
    setPage("loading");
    const profile = {
      ...form,
      income: parseInt(form.income) || 0,
      age: parseInt(form.age) || 30,
      family_size: parseInt(form.family_size) || 4,
    };
    const shortlist = ruleFilter(profile);
    let aiResults;
    try {
      aiResults = await callGemini(profile, shortlist, apiKey.trim());
    } catch {
      await new Promise(r => setTimeout(r, 600));
      aiResults = buildReasons(profile, shortlist);
    }
    const merged = aiResults
      .map(ai => { const s = SCHEMES.find(x => x.id === ai.scheme_id); return s ? { ...s, ...ai } : null; })
      .filter(Boolean)
      .sort((a, b) => b.priority - a.priority);
    const total = merged.reduce((sum, s) => sum + (s.benefit_amount || 0), 0);
    setResults({ schemes:merged, profile, totalBenefit:total });
    setPage("results");
  };

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  return (
    <>
      <GlobalStyle/>
      <Navbar page={page} setPage={setPage} apiKey={apiKey} setApiKey={setApiKey} showKey={showKey} setShowKey={setShowKey}/>
      {page === "landing"  && <Landing setPage={setPage}/>}
      {page === "form"     && <FormPage form={form} updateForm={updateForm} handleOcc={handleOcc} step={step} setStep={setStep} onSubmit={onSubmit}/>}
      {page === "loading"  && <LoadingPage/>}
      {page === "results"  && results && <ResultsPage results={results} setPage={setPage} apiKey={apiKey}/>}
    </>
  );
}
