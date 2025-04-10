export default function ImageTestPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>🧪 Image Test</h1>
      <p>Testing raw static image:</p>
      <img
        src="/static/avatar-test.jpeg"
        alt="Debug Image"
        width={200}
        height={200}
        style={{ border: '1px solid red' }}
      />
      <p>If the image appears above, it was bundled correctly.</p>
    </main>
  )
}
