import './globals.css'
import Header from '../components/Header'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="main-content">{children}</main>

        <footer className="footer-container">
          <h2 className="footer-title">LumeTV</h2>
          <p className="footer-text">
            🎬 A Brighter Way to Watch. All content is for educational purposes only.
          </p>
          <p className="footer-disclaimer">
            © {new Date().getFullYear()} LumeTV. All rights reserved. 
            Use responsibly. We do not host any content directly.
          </p>
        </footer>
      </body>
    </html>
  )
}
