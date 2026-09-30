import Link from 'next/link'
import './Navbar.css'

// The admin area is intentionally not linked here; it is reached
// directly at /admin/login.
export default function Navbar() {
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
    </nav>
  )
}
