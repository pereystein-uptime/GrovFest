export interface Message {
  id: string;
  sender: string;
  initials: string;
  color: string;
  badge?: string;
  content: string;
  time: string;
  reactions?: { emoji: string; count: number }[];
  isOwn?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  icon: string;
  preview: string;
  time: string;
  unread?: number;
  locked?: boolean;
  memberCount?: number;
}

export interface DirectMessage {
  id: string;
  name: string;
  initials: string;
  color: string;
  preview: string;
  time: string;
  online?: boolean;
  lastActive?: string;
  unread?: number;
}

export const channels: Channel[] = [
  { id: "gruppechat", name: "Gruppechat", icon: "#", preview: "Haha, enig! 😂", time: "14:52", unread: 3 },
  { id: "kunngjøringer", name: "Kunngjøringer", icon: "📢", preview: "Påminnelse: Neste innbetaling...", time: "I går" },
  { id: "ledelse", name: "Ledelse", icon: "🔒", preview: "Vi må snakke om Olav sin...", time: "I går", locked: true, memberCount: 4 },
];

export const dms: DirectMessage[] = [
  { id: "erik", name: "Erik Hansen", initials: "EH", color: "bg-blue-500", preview: "Du: Kan du fikse spillelisten?", time: "12:15", online: true },
  { id: "maria", name: "Maria Nilsen", initials: "MN", color: "bg-green-500", preview: "Maria: Sendt over kvittering 👍", time: "I går" },
  { id: "thomas", name: "Thomas Kristiansen", initials: "TK", color: "bg-purple-500", preview: "Thomas: Hva er status på bussen?", time: "20. feb", lastActive: "5t siden" },
  { id: "julie", name: "Julie Berg", initials: "JB", color: "bg-amber-500", preview: "Du: Hei! Har du snakket med DJ-en?", time: "18. feb" },
];

export const channelMessages: Record<string, Message[]> = {
  gruppechat: [
    { id: "1", sender: "Erik Hansen", initials: "EH", color: "bg-blue-500", content: "Noen som vet når bussen er klar for henting?", time: "14:23", reactions: [{ emoji: "👀", count: 3 }] },
    { id: "2", sender: "Thomas Kristiansen", initials: "TK", color: "bg-purple-500", content: "Fristil sa uke 15, men vi bør dobbeltsjekke med Sara", time: "14:25", reactions: [{ emoji: "👍", count: 2 }] },
    { id: "3", sender: "Sara Kvalvik", initials: "SK", color: "bg-primary", badge: "Bussjef", content: "Bekreftet med Fristil i dag — henting 14. april kl 10:00! 🚌", time: "14:32", isOwn: true, reactions: [{ emoji: "🎉", count: 8 }] },
    { id: "4", sender: "Maria Nilsen", initials: "MN", color: "bg-green-500", content: "LFG!! Gleder meg!", time: "14:45", reactions: [{ emoji: "🔥", count: 4 }] },
    { id: "5", sender: "Julie Berg", initials: "JB", color: "bg-amber-500", content: "Haha, enig! 😂", time: "14:52" },
  ],
  kunngjøringer: [
    { id: "k1", sender: "Sara Kvalvik", initials: "SK", color: "bg-primary", badge: "Bussjef", content: "Hei alle! Påminnelse om at neste innbetaling på 4 200 kr forfaller 1. april. Dere kan betale direkte fra Bank-siden i appen. Spørsmål? Skriv i gruppechatten.", time: "I går 18:00", isOwn: true },
    { id: "k2", sender: "Sara Kvalvik", initials: "SK", color: "bg-primary", badge: "Bussjef", content: "Avstemning om artist til slippfesten er nå live! Gå til Avstemninger for å stemme. Frist: torsdag.", time: "I dag 09:15", isOwn: true },
  ],
  ledelse: [
    { id: "l1", sender: "Sara Kvalvik", initials: "SK", color: "bg-primary", badge: "Bussjef", content: "Vi må diskutere Olav sin manglende betaling. Han skylder nå to innbetalinger.", time: "I går 16:30", isOwn: true },
    { id: "l2", sender: "Erik Hansen", initials: "EH", color: "bg-blue-500", badge: "Kasserer", content: "Jeg har sendt purring. Foreslår vi gir frist til fredag.", time: "I går 16:45" },
  ],
};

export const dmMessages: Record<string, Message[]> = {
  erik: [
    { id: "d1", sender: "Erik Hansen", initials: "EH", color: "bg-blue-500", content: "Hei Sara! Har du oversikt over hvem som mangler innbetaling for mars?", time: "12:10" },
    { id: "d2", sender: "Sara Kvalvik", initials: "SK", color: "bg-primary", content: "Ja, det er Olav og Kristoffer. Sender deg lista.", time: "12:12", isOwn: true },
    { id: "d3", sender: "Erik Hansen", initials: "EH", color: "bg-blue-500", content: "Topp, takk! Kan du fikse spillelisten også?", time: "12:15" },
  ],
  maria: [
    { id: "m1", sender: "Maria Nilsen", initials: "MN", color: "bg-green-500", content: "Hei! Sendt over kvittering for slippfest-lokalet 👍", time: "I går 15:30" },
    { id: "m2", sender: "Sara Kvalvik", initials: "SK", color: "bg-primary", content: "Supert, takk Maria! Legger det inn i budsjettet.", time: "I går 15:45", isOwn: true },
  ],
  thomas: [
    { id: "t1", sender: "Thomas Kristiansen", initials: "TK", color: "bg-purple-500", content: "Hva er status på bussen? Fristil sa noe om wrapping?", time: "14:20" },
    { id: "t2", sender: "Sara Kvalvik", initials: "SK", color: "bg-primary", content: "Wrapping starter uka før levering. Logo-designet er nesten ferdig, sender preview i gruppa snart!", time: "14:35", isOwn: true },
  ],
  julie: [
    { id: "j1", sender: "Sara Kvalvik", initials: "SK", color: "bg-primary", content: "Hei! Har du snakket med DJ-en?", time: "18. feb", isOwn: true },
    { id: "j2", sender: "Julie Berg", initials: "JB", color: "bg-amber-500", content: "Ja, han er klar! Sender kontrakt i morgen.", time: "18. feb" },
  ],
};
