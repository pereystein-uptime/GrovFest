export interface Vendor {
  id: string;
  name: string;
  initials: string;
  logoBg: string;
  category: string;
  description: string;
  rating: number;
  stat1: { value: string; label: string };
  stat2: { value: string; label: string };
  tags: string[];
  contact: {
    email: string;
    phone: string;
    website: string;
    orgNr: string;
    address: string;
  };
  prices: { service: string; range: string }[];
}

export interface DiscouragedVendor {
  name: string;
  initials: string;
  category: string;
  description: string;
  complaints: string[];
  rating: number;
  complaintCount: number;
}

export const verifiedVendors: Vendor[] = [
  {
    id: "fristil",
    name: "Fristil AS",
    initials: "F",
    logoBg: "bg-[#1a1f36]",
    category: "Bussutleie og transport",
    description: "Norges største russebussutleier. Leverer ferdig oppbygde busser med lyd, lys og wrapping. Alt-i-ett-løsning.",
    rating: 4.8,
    stat1: { value: "320+", label: "Busser levert" },
    stat2: { value: "Bergen", label: "Lokasjon" },
    tags: ["Bussutleie", "Wrapping", "Lyd & lys"],
    contact: { email: "post@fristil.no", phone: "+47 55 32 10 00", website: "fristil.no", orgNr: "912 345 678", address: "Damsgårdsveien 82, Bergen" },
    prices: [
      { service: "Bussleie standard", range: "450 000 – 800 000 kr" },
      { service: "Komplett pakke", range: "700 000 – 1 200 000 kr" },
      { service: "Wrapping", range: "40 000 – 80 000 kr" },
      { service: "Serviceavtale", range: "25 000 – 50 000 kr" },
    ],
  },
  {
    id: "russedress",
    name: "Russedress AS",
    initials: "R",
    logoBg: "bg-[#c41e3a]",
    category: "Russeklær og merch",
    description: "Markedsleder på russedresser i Norge. Kvalitetsprodukter med kort leveringstid og mulighet for full tilpasning.",
    rating: 4.9,
    stat1: { value: "15 000+", label: "Dresser/år" },
    stat2: { value: "Oslo", label: "Lokasjon" },
    tags: ["Russedress", "Merch", "Tilpasning"],
    contact: { email: "hei@russedress.no", phone: "+47 22 44 55 66", website: "russedress.no", orgNr: "923 456 789", address: "Storgata 12, Oslo" },
    prices: [
      { service: "Standard dress", range: "1 200 – 1 800 kr/stk" },
      { service: "Premium dress", range: "1 800 – 2 500 kr/stk" },
      { service: "Russelue", range: "150 – 300 kr/stk" },
      { service: "Merch-pakke", range: "200 – 500 kr/stk" },
    ],
  },
  {
    id: "busskompaniet",
    name: "Busskompaniet",
    initials: "BK",
    logoBg: "bg-[#2563eb]",
    category: "Bussutleie og oppbygging",
    description: "Spesialisert på skreddersydde russebusser. Tilbyr fleksible betalingsplaner og teknisk support gjennom hele russetiden.",
    rating: 4.6,
    stat1: { value: "180+", label: "Busser levert" },
    stat2: { value: "Oslo", label: "Lokasjon" },
    tags: ["Bussutleie", "Oppbygging", "Support"],
    contact: { email: "info@busskompaniet.no", phone: "+47 21 33 44 55", website: "busskompaniet.no", orgNr: "934 567 890", address: "Brobekkveien 54, Oslo" },
    prices: [
      { service: "Bussleie", range: "400 000 – 750 000 kr" },
      { service: "Oppbygging", range: "600 000 – 1 000 000 kr" },
      { service: "Teknisk support", range: "30 000 – 60 000 kr" },
    ],
  },
  {
    id: "merkbart",
    name: "Merkbart",
    initials: "M",
    logoBg: "bg-[#7c3aed]",
    category: "Design og trykk",
    description: "Logodesign, wrapping-design, russekort og merch-trykk. Erfarne designere som har jobbet med hundrevis av russegrupper.",
    rating: 4.7,
    stat1: { value: "500+", label: "Grupper" },
    stat2: { value: "Trondheim", label: "Lokasjon" },
    tags: ["Logo", "Wrapping", "Russekort"],
    contact: { email: "hello@merkbart.no", phone: "+47 73 50 60 70", website: "merkbart.no", orgNr: "945 678 901", address: "Fjordgata 30, Trondheim" },
    prices: [
      { service: "Logodesign", range: "8 000 – 25 000 kr" },
      { service: "Wrapping-design", range: "15 000 – 35 000 kr" },
      { service: "Russekort (1000 stk)", range: "3 000 – 6 000 kr" },
      { service: "Merch-design", range: "5 000 – 15 000 kr" },
    ],
  },
  {
    id: "russeservice",
    name: "Russeservice",
    initials: "RS",
    logoBg: "bg-[#059669]",
    category: "Lyd, lys og teknisk",
    description: "Komplett lydanlegg, lysrigg og teknisk installasjon for russebusser. Tilbyr serviceavtaler gjennom hele russetiden.",
    rating: 4.5,
    stat1: { value: "200+", label: "Installasjoner" },
    stat2: { value: "Landsdekkende", label: "Lokasjon" },
    tags: ["Lyd", "Lys", "Installasjon"],
    contact: { email: "kontakt@russeservice.no", phone: "+47 40 00 50 60", website: "russeservice.no", orgNr: "956 789 012", address: "Landsdekkende, Drammen" },
    prices: [
      { service: "Lydanlegg komplett", range: "80 000 – 200 000 kr" },
      { service: "Lysrigg", range: "40 000 – 100 000 kr" },
      { service: "Installasjon", range: "20 000 – 40 000 kr" },
      { service: "Serviceavtale", range: "15 000 – 30 000 kr" },
    ],
  },
];

export const discouragedVendors: DiscouragedVendor[] = [
  {
    name: "Russens Bestevenn",
    initials: "RB",
    category: "Bussutleie",
    description: "Flere rapporter om forsinket levering, skjulte kostnader i kontrakter, og manglende teknisk support underveis i russetiden.",
    complaints: ["Forsinket levering (8 rapporter)", "Skjulte kostnader i kontrakt", "Manglende support"],
    rating: 1.8,
    complaintCount: 12,
  },
  {
    name: "Centrum Records",
    initials: "CR",
    category: "Musikk og artister",
    description: "Booking av artister som ikke dukker opp, dårlig kommunikasjon og manglende refusjon ved avlysning.",
    complaints: ["Artister møtte ikke opp (5 rapporter)", "Nekter refusjon ved avlysning"],
    rating: 1.5,
    complaintCount: 9,
  },
  {
    name: "151 Records",
    initials: "151",
    category: "Musikk og artister",
    description: "Overprisede bookinger, aggressive salgsmetoder rettet mot unge. Bruker press og FOMO-taktikker for å signere kontrakter raskt.",
    complaints: ["Overpriset sammenlignet med markedet", "Aggressive salgsmetoder", "Låser grupper i lange kontrakter"],
    rating: 2.0,
    complaintCount: 15,
  },
  {
    name: "Edge",
    initials: "E",
    category: "Events og arrangementer",
    description: "Lover store arrangementer som aldri blir som lovet. Dårlig sikkerhet, underdimensjonert kapasitet, og uklare vilkår for refusjon.",
    complaints: ["Arrangementer leverer ikke som lovet", "Mangelfull sikkerhet"],
    rating: 2.1,
    complaintCount: 7,
  },
];
