import './globals.css';
import { Inter, IBM_Plex_Serif } from 'next/font/google';
import { UserProvider } from '@/components/UserContext';
import ChatbotWidget from '@/components/ChatbotWidget';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-ibm-plex-serif',
});

export const metadata = {
  title: 'Shauryan Bank',
  description: 'Personalized digital banking with AI support.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>
        <UserProvider>
          {children}
          <ChatbotWidget />
        </UserProvider>
      </body>
    </html>
  );
}
