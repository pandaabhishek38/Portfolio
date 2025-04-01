import './Navbar.css'

export default function Navbar() {
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
    </nav>
  )
}
