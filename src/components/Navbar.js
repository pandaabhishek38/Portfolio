'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import './Navbar.css'

export default function Navbar() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check if the user is logged in (via token)
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
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/about">About</a>
        </li>
        <li>
          <a href="/projects">Projects</a>
        </li>
        <li>
          <a href="/experience">Experience</a>
        </li>
        <li>
          <a href="/contact">Contact</a>
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
