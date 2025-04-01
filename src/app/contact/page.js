export default function ContactPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Contact Me</h1>
      <p>You can reach me through any of the following ways:</p>

      <ul style={{ lineHeight: '2' }}>
        <li>
          <strong>📞 Phone:</strong>{' '}
          <a href="tel:+12248446987">+1 224-844-6987</a>
        </li>
        <li>
          <strong>📧 Email:</strong>{' '}
          <a href="mailto:pandaabhishek34@gmail.com">
            pandaabhishek34@gmail.com
          </a>
        </li>
        <li>
          <strong>🏠 Address:</strong> 54 Handy Street, New Brunswick, NJ, 08901
        </li>
        <li>
          <strong>💼 LinkedIn:</strong>{' '}
          <a
            href="https://www.linkedin.com/in/abhishek-rabindra-panda/"
            target="_blank"
            rel="noopener noreferrer"
          >
            linkedin.com/in/abhishek-rabindra-panda
          </a>
        </li>
        <li>
          <strong>👨‍💻 GitHub:</strong>{' '}
          <a
            href="https://github.com/pandaabhishek38"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/pandaabhishek38
          </a>
        </li>
      </ul>
    </main>
  )
}
