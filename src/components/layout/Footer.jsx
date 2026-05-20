// src/components/layout/Footer.jsx
import * as React from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    platform: [
      { name: "Curriculum", href: "/catalog" },
      { name: "My Courses", href: "/my-courses" },
      { name: "Dashboard", href: "/dashboard" },
      { name: "Certificates", href: "/certificates" },
      { name: "Instructor Portal", href: "/admin" },
    ],
    company: [
      { name: "About STAR LMS", href: "/#about" },
      { name: "Operational Status", href: "#" },
      { name: "Security & Safety", href: "#" },
      { name: "Contact Us", href: "#" },
      { name: "Careers", href: "#" },
    ],
    legal: [
      { name: "Terms & Conditions", href: "/terms" },
      { name: "Privacy Policy", href: "/privacy" },
      // { name: "Cookie Policy", href: "#" },
      // { name: "Data Processing", href: "#" },
    ],
  };

  return (
    <footer className="bg-surface-container-lowest border-t border-primary/20 pt-16 md:pt-24 pb-12 font-body relative overflow-hidden">
      {/* Background Ambient Hologram Shards */}
      <div className="absolute inset-0 cyber-grid-bg opacity-20 pointer-events-none" />
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow"
        style={{ animationDuration: "12s" }}
      />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-tertiary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-y-12 sm:gap-x-8 lg:gap-x-12 lg:gap-y-8 mb-16 md:mb-24 cyber-glass p-8 sm:p-12 rounded-[3rem] border border-primary/20 shadow-2xl">
          {/* Brand Shard */}
          <div className="sm:col-span-2 lg:col-span-4">
            <Link
              to="/"
              className="inline-flex items-center gap-3 mb-6 sm:mb-8 group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 signature-gradient rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,85,255,0.5)] group-hover:rotate-12 transition-all duration-500">
                <span className="text-white font-headline font-black text-xl sm:text-2xl tracking-tighter">
                  ★
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-headline font-black tracking-tighter text-foreground dark:text-white drop-shadow-[0_0_10px_rgba(0,85,255,0.4)]">
                STAR LMS
              </span>
            </Link>
            <p className="text-on-surface-variant text-sm font-medium leading-relaxed max-w-sm mb-8 opacity-80">
              Empowering modern learners with industry-aligned skill building courses and
              comprehensive learning performance tracking.
            </p>
            <div className="flex items-center gap-4">
              {[
                { Icon: Twitter, href: "#", label: "Twitter Profile" },
                {
                  Icon: Instagram,
                  href: "https://www.instagram.com/adhocnetworktech?igsh=MXFkcXZqb2w2ajRubg%3D%3D&utm_source=qr",
                  label: "Instagram Channel",
                },
                {
                  Icon: Linkedin,
                  href: "https://www.linkedin.com/company/adhocnetwork/",
                  label: "LinkedIn Network",
                },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl cyber-glass border border-primary/30 flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary hover:scale-110 hover:border-primary transition-all duration-300 shadow-md"
                  aria-label={social.label}
                >
                  <social.Icon
                    className="w-4 h-4 sm:w-5 sm:h-5 transition-transform"
                    strokeWidth={2}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter Transmission Hub */}
          <div className="sm:col-span-2 lg:col-span-4">
            <h4 className="text-xs font-mono font-extrabold text-primary uppercase tracking-[0.3em] mb-6 sm:mb-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>NEWSLETTER</span>
            </h4>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed font-medium">
              Subscribe to our newsletter for learning tips, course updates, and
              announcements.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <input
                  type="email"
                  placeholder="student@starlms.in"
                  className="w-full px-5 py-3.5 bg-background/90 border border-primary/30 rounded-2xl text-sm font-mono text-foreground dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                />
                <button className="w-full sm:w-auto lg:w-full px-6 py-3.5 signature-gradient text-white rounded-2xl text-xs font-mono font-extrabold tracking-widest uppercase hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(0,85,255,0.4)]">
                  <Send className="w-4 h-4 animate-pulse" />
                  <span>Subscribe</span>
                </button>
              </div>
              <p className="text-[10px] font-mono text-secondary uppercase tracking-widest opacity-60">
                We value your privacy. Unsubscribe anytime with one click.
              </p>
            </div>
          </div>

          {/* Operational Headquarters */}
          <div className="sm:col-span-2 lg:col-span-4">
            <h4 className="text-xs font-mono font-extrabold text-primary uppercase tracking-[0.3em] mb-6 sm:mb-8 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>CONTACT DETAILS</span>
            </h4>
            <ul className="space-y-5 font-mono text-xs">
              <li className="flex items-start gap-3.5 cyber-glass p-3.5 rounded-2xl border border-primary/10">
                <MapPin
                  className="w-5 h-5 text-primary shrink-0 mt-0.5 animate-bounce"
                  style={{ animationDuration: "3s" }}
                  strokeWidth={2}
                />
                <span className="text-on-surface leading-relaxed font-medium">
                  STAR LMS Headquarters <br />
                  Sector 62, Tower B, 4th Floor <br />
                  Noida, Uttar Pradesh 201301
                </span>
              </li>
              <li className="flex items-center gap-3.5 cyber-glass p-3.5 rounded-2xl border border-primary/10">
                <Phone
                  className="w-5 h-5 text-primary shrink-0 animate-pulse"
                  strokeWidth={2}
                />
                <span className="text-on-surface font-semibold tracking-wide">
                  +91 98765 43210
                </span>
              </li>
              <li className="flex items-center gap-3.5 cyber-glass p-3.5 rounded-2xl border border-primary/10">
                <Mail
                  className="w-5 h-5 text-primary shrink-0"
                  strokeWidth={2}
                />
                <span className="text-on-surface font-semibold tracking-wide">
                  support@starlms.in
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Links Hub */}
        <div className="pt-8 pb-6 border-t border-primary/20">
          <div className="flex flex-wrap justify-center gap-8 mb-6 font-mono text-xs font-bold uppercase tracking-widest">
            {links.legal.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-secondary hover:text-primary transition-all px-4 py-2 cyber-glass rounded-xl border border-primary/10 hover:border-primary/40 shadow-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Blockchain Shard Stamp */}
        <div className="pt-6 border-t border-primary/20 flex flex-col lg:flex-row justify-between items-center gap-6">
          <p className="text-xs font-mono font-extrabold text-secondary uppercase tracking-[0.3em] text-center lg:text-left">
            &copy; {currentYear} STAR LMS Inc. All Rights Reserved.
          </p>
          <div className="text-[10px] font-mono text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 uppercase tracking-widest">
            System Status: 100% Operational • v6.4.0
          </div>
        </div>
      </div>
    </footer>
  );
}
