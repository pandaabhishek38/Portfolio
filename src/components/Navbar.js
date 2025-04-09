'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import './Navbar.css'

export default function Navbar() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar__logo">Abhishek Panda</div>
      <ul className="navbar__links">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/projects">Projects</Link>
        </li>
        <li>
          <Link href="/experience">Experience</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
      <div className="navbar__admin">
        {!isLoggedIn ? (
          <button onClick={() => router.push('/admin/login')}>
            Admin Login
          </button>
        ) : (
          <button onClick={() => router.push('/admin/dashboard')}>
            Admin Dashboard
          </button>
        )}
      </div>
    </nav>
  )
}
