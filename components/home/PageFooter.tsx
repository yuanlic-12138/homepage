import { config } from '@/config/site.config'

export default function HomePageFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="gh-footer">
      <div className="footer-main">© {currentYear} {config.name} · 基于 React / Next.js 构建</div>
      <div className="footer-beian">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer" className="footer-link">
          鄂ICP备2025157857号
        </a>
        <span className="footer-separator">·</span>
        <a
          href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=42018502008592"
          target="_blank"
          rel="noreferrer"
          className="footer-link"
        >
          鄂公网安备 42018502008592号
        </a>
      </div>
    </footer>
  )
}
