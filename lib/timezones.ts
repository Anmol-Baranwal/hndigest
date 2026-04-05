export const TIMEZONES = [
  { label: "UTC", value: "UTC" },

  // Americas
  { label: "US Eastern (ET)", value: "America/New_York" },
  { label: "US Central (CT)", value: "America/Chicago" },
  { label: "US Mountain (MT)", value: "America/Denver" },
  { label: "US Pacific (PT)", value: "America/Los_Angeles" },
  { label: "US Alaska (AKT)", value: "America/Anchorage" },
  { label: "US Hawaii (HST)", value: "Pacific/Honolulu" },
  { label: "Canada Atlantic (AT)", value: "America/Halifax" },
  { label: "Canada Newfoundland (NT)", value: "America/St_Johns" },
  { label: "Greenland (WGT)", value: "America/Godthab" },
  { label: "Mexico City (CST)", value: "America/Mexico_City" },
  { label: "Panama (EST)", value: "America/Panama" },
  { label: "Cuba (CST)", value: "America/Havana" },
  { label: "Bogotá (COT)", value: "America/Bogota" },
  { label: "Lima (PET)", value: "America/Lima" },
  { label: "Caracas (VET)", value: "America/Caracas" },
  { label: "Santiago (CLT)", value: "America/Santiago" },
  { label: "São Paulo (BRT)", value: "America/Sao_Paulo" },
  { label: "Buenos Aires (ART)", value: "America/Argentina/Buenos_Aires" },

  // Europe
  { label: "Lisbon (WET)", value: "Europe/Lisbon" },
  { label: "London (GMT/BST)", value: "Europe/London" },
  { label: "Paris/Berlin (CET)", value: "Europe/Paris" },
  { label: "Helsinki/Kyiv (EET)", value: "Europe/Helsinki" },
  { label: "Istanbul (TRT)", value: "Europe/Istanbul" },
  { label: "Moscow (MSK)", value: "Europe/Moscow" },
  { label: "Yekaterinburg (YEKT)", value: "Asia/Yekaterinburg" },
  { label: "Novosibirsk (NOVT)", value: "Asia/Novosibirsk" },
  { label: "Vladivostok (VLAT)", value: "Asia/Vladivostok" },

  // Caucasus
  { label: "Baku (AZT)", value: "Asia/Baku" },
  { label: "Tbilisi (GET)", value: "Asia/Tbilisi" },
  { label: "Yerevan (AMT)", value: "Asia/Yerevan" },

  // Africa
  { label: "Accra/Dakar (GMT)", value: "Africa/Accra" },
  { label: "Lagos (WAT)", value: "Africa/Lagos" },
  { label: "Casablanca (WET)", value: "Africa/Casablanca" },
  { label: "Cairo (EET)", value: "Africa/Cairo" },
  { label: "Johannesburg (SAST)", value: "Africa/Johannesburg" },
  { label: "Nairobi (EAT)", value: "Africa/Nairobi" },
  { label: "Addis Ababa (EAT)", value: "Africa/Addis_Ababa" },

  // Middle East
  { label: "Beirut (EET)", value: "Asia/Beirut" },
  { label: "Baghdad (AST)", value: "Asia/Baghdad" },
  { label: "Riyadh (AST)", value: "Asia/Riyadh" },
  { label: "Tehran (IRST)", value: "Asia/Tehran" },
  { label: "Dubai (GST)", value: "Asia/Dubai" },

  // Central Asia
  { label: "Kabul (AFT)", value: "Asia/Kabul" },
  { label: "Tashkent (UZT)", value: "Asia/Tashkent" },
  { label: "Almaty (ALMT)", value: "Asia/Almaty" },

  // South Asia
  { label: "Pakistan (PKT)", value: "Asia/Karachi" },
  { label: "India (IST)", value: "Asia/Kolkata" },
  { label: "Nepal (NPT)", value: "Asia/Kathmandu" },
  { label: "Bangladesh (BST)", value: "Asia/Dhaka" },
  { label: "Sri Lanka (SLST)", value: "Asia/Colombo" },
  { label: "Myanmar (MMT)", value: "Asia/Yangon" },

  // Southeast Asia
  { label: "Bangkok (ICT)", value: "Asia/Bangkok" },
  { label: "Jakarta (WIB)", value: "Asia/Jakarta" },
  { label: "Singapore/KL (SGT)", value: "Asia/Singapore" },
  { label: "Manila (PHT)", value: "Asia/Manila" },

  // East Asia
  { label: "Hong Kong (HKT)", value: "Asia/Hong_Kong" },
  { label: "China/Taipei (CST)", value: "Asia/Shanghai" },
  { label: "Seoul (KST)", value: "Asia/Seoul" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },

  // Oceania
  { label: "Perth (AWST)", value: "Australia/Perth" },
  { label: "Adelaide (ACST)", value: "Australia/Adelaide" },
  { label: "Brisbane (AEST)", value: "Australia/Brisbane" },
  { label: "Sydney/Melbourne (AEDT)", value: "Australia/Sydney" },
  { label: "Lord Howe Island (LHST)", value: "Australia/Lord_Howe" },
  { label: "Auckland (NZST)", value: "Pacific/Auckland" },
  { label: "Chatham Islands (CHAST)", value: "Pacific/Chatham" },
  { label: "Guam (ChST)", value: "Pacific/Guam" },
  { label: "Fiji (FJT)", value: "Pacific/Fiji" },
  { label: "Samoa (SST)", value: "Pacific/Apia" },
  { label: "Tonga (TOT)", value: "Pacific/Tongatapu" },
];

function getTzOffset(timezone: string): number {
  const now = new Date();
  const utcStr = now.toLocaleString("en-CA", { timeZone: "UTC", hour12: false });
  const tzStr = now.toLocaleString("en-CA", { timeZone: timezone, hour12: false });
  return (new Date(tzStr).getTime() - new Date(utcStr).getTime()) / 60000;
}

export function localTimeToUtc(timeHHMM: string, timezone: string): string {
  if (timezone === "UTC") return timeHHMM;
  const [h, m] = timeHHMM.split(":").map(Number);
  const offset = getTzOffset(timezone);
  const utcMins = (((h * 60 + m) - offset) % 1440 + 1440) % 1440;
  return `${String(Math.floor(utcMins / 60)).padStart(2, "0")}:${String(utcMins % 60).padStart(2, "0")}`;
}

export function utcTimeToLocal(utcHHMM: string, timezone: string): string {
  if (timezone === "UTC") return utcHHMM;
  const [h, m] = utcHHMM.split(":").map(Number);
  const offset = getTzOffset(timezone);
  const localMins = (((h * 60 + m) + offset) % 1440 + 1440) % 1440;
  return `${String(Math.floor(localMins / 60)).padStart(2, "0")}:${String(localMins % 60).padStart(2, "0")}`;
}

export function getTzAbbr(timezone: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "shortOffset" })
    .formatToParts(new Date())
    .find((p) => p.type === "timeZoneName")?.value ?? timezone;
}
