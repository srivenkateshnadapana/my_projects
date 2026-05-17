// src/components/layout/Footer.jsx
import * as React from "react"
import { Link } from "react-router-dom"
import { Instagram, Twitter, Linkedin, Mail, MapPin, Phone, Send } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    platform: [
      { name: "Curriculum", href: "/catalog" },
      { name: "My Courses", href: "/my-courses" },
      { name: "Dashboard", href: "/dashboard" },
      { name: "Certificates", href: "/certificates" },
      { name: "Instructor Portal", href: "/admin" },
    ],
    company: [
      { name: "About Adhoc", href: "/#about" },
      { name: "Operational Status", href: "#" },
      { name: "Security Protocol", href: "#" },
      { name: "Contact Base", href: "#" },
      { name: "Careers", href: "#" },
    ],
    legal: [
      { name: "Terms of Engagement", href: "/terms" },
      { name: "Privacy Protocol", href: "/privacy" },
      // { name: "Cookie Policy", href: "#" },
      // { name: "Data Processing", href: "#" },
    ]
  }

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/20 pt-12 md:pt-20 pb-12 lg:pb-12 font-body relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-tertiary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-y-12 sm:gap-x-8 lg:gap-x-12 lg:gap-y-8 mb-16 md:mb-20">
          {/* Brand Shard */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3 mb-6 sm:mb-8 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 signature-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-white font-headline font-bold text-lg sm:text-xl">A</span>
              </div>
              <span className="text-lg sm:text-xl font-headline font-bold tracking-tighter text-primary">Adhoc Network Tech</span>
            </Link>
            <p className="text-on-surface-variant text-sm font-medium leading-relaxed max-w-sm mb-8 opacity-70 italic">
              Empowering the next generation of academic leaders through sophisticated learning ecosystems and decentralized knowledge protocols.
            </p>
            <div className="flex items-center gap-4">
              {[
                { Icon: Twitter, href: "#", label: "Twitter" },
                { Icon: Instagram, href: "https://www.instagram.com/adhocnetworktech?igsh=MXFkcXZqb2w2ajRubg%3D%3D&utm_source=qr", label: "Instagram" },
                { Icon: Linkedin, href: "https://www.linkedin.com/company/adhocnetwork/", label: "LinkedIn" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-[var(--shape-large)] bg-surface-container border border-outline-variant flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary transition-m3-standard shadow-sm state-layer-primary"
                  aria-label={social.label}
                >
                  <social.Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="sm:col-span-2 lg:col-span-4">
            <h4 className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-[0.3em] mb-6 sm:mb-8 italic">NEWSLETTER</h4>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Subscribe to receive tactical insights, curriculum updates, and exclusive content.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
                <button className="w-full sm:w-auto lg:w-full px-6 py-2.5 signature-gradient-expressive text-white rounded-[var(--shape-full)] text-sm font-semibold hover:opacity-90 transition-m3-emphasized active:scale-95 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Subscribe
                </button>
              </div>
              <p className="text-[10px] text-on-surface-variant opacity-60">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>

          {/* Contact Base */}
          <div className="sm:col-span-2 lg:col-span-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-6 sm:mb-8 italic">Base</h4>
            <ul className="space-y-4 sm:space-y-6">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm font-medium text-on-surface-variant leading-relaxed opacity-70">
                  Adhoc Network <br />
                  Sunrise Towers, 1st floor, IT Sez, Hill-03, Rushikonda <br />
                  Visakhapatnam, Andhra Pradesh, India - 530048
                </span>             
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" strokeWidth={2.5} />
                <span className="text-sm font-medium text-on-surface-variant opacity-70">+91 7815823764</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" strokeWidth={2.5} />
                <span className="text-sm font-medium text-on-surface-variant opacity-70">hr@adhocnetwork.tech</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links Row (Mobile Friendly) */}
        <div className="pt-8 pb-6 border-t border-surface-dim/20">
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {links.legal.map(link => (
              <Link key={link.name} to={link.href} className="text-sm text-on-surface-variant hover:text-primary transition-m3-standard state-layer-primary px-3 py-1 rounded-[var(--shape-small)]">
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Shard */}
        <div className="pt-4 border-t border-surface-dim/20 flex flex-col lg:flex-row justify-between items-center gap-6">
          <p className="text-[10px] sm:text-xs font-bold text-outline uppercase tracking-widest text-center lg:text-left">
            &copy; {currentYear} Adhoc Network Tech.
          </p>
        </div>
      </div>
    </footer>
  )
}