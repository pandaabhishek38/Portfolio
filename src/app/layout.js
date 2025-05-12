// src/app/layout.js
import { Geist, Geist_Mono } from 'next/font/google'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Chatbot from '../components/Chatbot/Chatbot'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Abhishek Panda | Portfolio',
  description: 'My personal software development portfolio',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div>
          <Navbar />
          {children}
          <Footer />
          <Chatbot />
        </div>
      </body>
    </html>
  )
}
