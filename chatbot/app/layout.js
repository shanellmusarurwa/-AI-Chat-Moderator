import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Gemini AI Chat - Google Gemini 2.0 Flash Assistant",
  description:
    "Next.js chat application powered by Google Gemini 2.0 Flash with real-time content safety moderation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
