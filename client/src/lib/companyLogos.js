// Popular subscription service logos using logo.dev API
const LOGO_TOKEN = "pk_Lgk1-bQOQdeHCmHCmo4TiQ";

export const COMPANY_LOGOS = {
  netflix: {
    name: "Netflix",
    logo: `https://img.logo.dev/netflix.com?token=${LOGO_TOKEN}`,
    color: "#E50914"
  },
  spotify: {
    name: "Spotify",
    logo: `https://img.logo.dev/spotify.com?token=${LOGO_TOKEN}`,
    color: "#1DB954"
  },
  amazon: {
    name: "Amazon Prime",
    logo: `https://img.logo.dev/amazon.com?token=${LOGO_TOKEN}`,
    color: "#FF9900"
  },
  youtube: {
    name: "YouTube Premium",
    logo: `https://img.logo.dev/youtube.com?token=${LOGO_TOKEN}`,
    color: "#FF0000"
  },
  disney: {
    name: "Disney+",
    logo: `https://img.logo.dev/disneyplus.com?token=${LOGO_TOKEN}`,
    color: "#113CCF"
  },
  hulu: {
    name: "Hulu",
    logo: `https://img.logo.dev/hulu.com?token=${LOGO_TOKEN}`,
    color: "#1CE783"
  },
  hbo: {
    name: "HBO Max",
    logo: `https://img.logo.dev/hbomax.com?token=${LOGO_TOKEN}`,
    color: "#8B5CF6"
  },
  apple: {
    name: "Apple",
    logo: `https://img.logo.dev/apple.com?token=${LOGO_TOKEN}`,
    color: "#000000"
  },
  microsoft: {
    name: "Microsoft 365",
    logo: `https://img.logo.dev/microsoft.com?token=${LOGO_TOKEN}`,
    color: "#00A4EF"
  },
  google: {
    name: "Google One",
    logo: `https://img.logo.dev/google.com?token=${LOGO_TOKEN}`,
    color: "#4285F4"
  },
  dropbox: {
    name: "Dropbox",
    logo: `https://img.logo.dev/dropbox.com?token=${LOGO_TOKEN}`,
    color: "#0061FF"
  },
  github: {
    name: "GitHub",
    logo: `https://img.logo.dev/github.com?token=${LOGO_TOKEN}`,
    color: "#181717"
  },
  linkedin: {
    name: "LinkedIn Premium",
    logo: `https://img.logo.dev/linkedin.com?token=${LOGO_TOKEN}`,
    color: "#0A66C2"
  },
  slack: {
    name: "Slack",
    logo: `https://img.logo.dev/slack.com?token=${LOGO_TOKEN}`,
    color: "#4A154B"
  },
  zoom: {
    name: "Zoom",
    logo: `https://img.logo.dev/zoom.us?token=${LOGO_TOKEN}`,
    color: "#2D8CFF"
  },
  notion: {
    name: "Notion",
    logo: `https://img.logo.dev/notion.so?token=${LOGO_TOKEN}`,
    color: "#000000"
  },
  canva: {
    name: "Canva",
    logo: `https://img.logo.dev/canva.com?token=${LOGO_TOKEN}`,
    color: "#00C4CC"
  },
  adobe: {
    name: "Adobe Creative Cloud",
    logo: `https://img.logo.dev/adobe.com?token=${LOGO_TOKEN}`,
    color: "#DA1F26"
  },
  figma: {
    name: "Figma",
    logo: `https://img.logo.dev/figma.com?token=${LOGO_TOKEN}`,
    color: "#F24E1E"
  },
  trello: {
    name: "Trello",
    logo: `https://img.logo.dev/trello.com?token=${LOGO_TOKEN}`,
    color: "#0052CC"
  },
  evernote: {
    name: "Evernote",
    logo: `https://img.logo.dev/evernote.com?token=${LOGO_TOKEN}`,
    color: "#00A82D"
  },
  grammarly: {
    name: "Grammarly",
    logo: `https://img.logo.dev/grammarly.com?token=${LOGO_TOKEN}`,
    color: "#15C39A"
  },
  nordvpn: {
    name: "NordVPN",
    logo: `https://img.logo.dev/nordvpn.com?token=${LOGO_TOKEN}`,
    color: "#4687FF"
  },
  expressvpn: {
    name: "ExpressVPN",
    logo: `https://img.logo.dev/expressvpn.com?token=${LOGO_TOKEN}`,
    color: "#DA3940"
  },
  other: {
    name: "Other",
    logo: null,
    color: "#64748B"
  }
};

// Get logo URL by company key
export const getCompanyLogo = (companyKey) => {
  if (!companyKey) return null;
  const company = COMPANY_LOGOS[companyKey.toLowerCase()];
  return company?.logo || null;
};

// Get company name by key
export const getCompanyName = (companyKey) => {
  if (!companyKey) return "Unknown";
  const company = COMPANY_LOGOS[companyKey.toLowerCase()];
  return company?.name || companyKey;
};

// Get all company options for dropdown
export const getCompanyOptions = () => {
  return Object.entries(COMPANY_LOGOS).map(([key, value]) => ({
    value: key,
    label: value.name,
    logo: value.logo,
    color: value.color
  }));
};
