import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 1973 Western / Polaroid palette
        dust:      "#C4A882", // çöl kumu — kullanıcı mesaj arka planı
        sepia:     "#704214", // derin sepya — vurgu rengi
        parchment: "#F4E4C1", // eski kağıt — Polaroid yüzey
        rust:      "#8B3A1A", // pas / Western kırmızısı — tehlike / eşik uyarısı
        gunmetal:  "#2C3333", // gece gökyüzü — genel arka plan
        amber:     "#D4A017", // batı güneşi altını — aktif durum
        ash:       "#E8E0D0", // Polaroid beyazı — çerçeve
        charcoal:  "#1C1917", // derin siyah — metin
        sage:      "#5B7B5B", // çöl adaçayı — ikincil elementler
        "film-grain": "#0D0D0D", // film grain efekti katmanı
      },
      fontFamily: {
        mono:  ["Courier New", "Courier", "monospace"],
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      backgroundImage: {
        // Polaroid çerçeve gradyanı
        "polaroid": "linear-gradient(145deg, #E8E0D0 0%, #D4C9B0 100%)",
        // 1973 keten / ahşap doku simülasyonu
        "linen": "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(196,168,130,0.05) 2px, rgba(196,168,130,0.05) 4px)",
        // Gece gökyüzü — chatbot arka planı
        "night-sky": "radial-gradient(ellipse at top, #2C3333 0%, #1C1917 100%)",
      },
      animation: {
        "flicker":   "flicker 3s infinite",
        "typewriter": "typewriter 0.05s steps(1) forwards",
        "door-creak": "doorCreak 1.2s ease-in-out",
        "dust-rise":  "dustRise 2s ease-out forwards",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%":      { opacity: "1" },
          "93%":      { opacity: "0.8" },
          "94%":      { opacity: "1" },
          "96%":      { opacity: "0.6" },
          "97%":      { opacity: "1" },
        },
        typewriter: {
          from: { width: "0" },
          to:   { width: "100%" },
        },
        doorCreak: {
          "0%":   { transform: "rotateY(0deg)" },
          "50%":  { transform: "rotateY(-15deg)" },
          "100%": { transform: "rotateY(0deg)" },
        },
        dustRise: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "polaroid": "0 4px 6px -1px rgba(28,25,23,0.4), 0 2px 4px -2px rgba(28,25,23,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
        "door":     "inset -4px 0 8px rgba(28,25,23,0.5), 4px 0 12px rgba(28,25,23,0.8)",
        "amber-glow": "0 0 20px rgba(212,160,23,0.3), 0 0 40px rgba(212,160,23,0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
