import { Instrument_Serif, Inter } from "next/font/google";

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
