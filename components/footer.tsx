'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  shop: [
    { label: 'Catálogo', href: '/catalogo' },
    { label: 'Promociones', href: '/promociones' },
    { label: 'Nuevos Ingresos', href: '/catalogo?filter=new' },
    { label: 'Best Sellers', href: '/catalogo?filter=bestsellers' },
  ],
  support: [
    { label: 'Contacto', href: '/contacto' },
    { label: 'Envíos', href: '/envios' },
    { label: 'Devoluciones', href: '/devoluciones' },
    { label: 'FAQ', href: '/faq' },
  ],
  company: [
    { label: 'Nosotros', href: '/nosotros' },
    { label: 'Blog', href: '/blog' },
    { label: 'Trabaja con Nosotros', href: '/empleos' },
    { label: 'Términos y Condiciones', href: '/terminos' },
  ],
}

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

const linkStyle = {
  fontFamily: 'var(--font-sans)',
  fontSize: '11px',
  color: '#555',
  letterSpacing: '0.06em',
  textDecoration: 'none',
  transition: 'color 0.2s',
  display: 'block',
}

const headingStyle = {
  fontFamily: 'var(--font-cinzel)',
  fontSize: '11px',
  color: '#8B8B8B',
  letterSpacing: '0.25em',
  textTransform: 'uppercase' as const,
  fontWeight: 600,
  marginBottom: '20px',
}

export function Footer() {
  return (
    <footer style={{ background: '#050505', borderTop: '1px solid #1a1a1a' }}>
      {/* Colombia tricolor accent */}
      <div className="flex" style={{ height: '3px' }}>
        <div className="flex-1" style={{ background: '#FCD116' }} />
        <div className="flex-1" style={{ background: '#003893' }} />
        <div className="flex-1" style={{ background: '#CE1126' }} />
      </div>

      <div className="container mx-auto px-4 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-16">

          {/* Brand — col span 2 */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-8">
              <div className="flex flex-col">
                {/* Logo "grabado" — tono sobre tono */}
                <span
                  className="block text-3xl font-black tracking-[0.25em] leading-none"
                  style={{
                    fontFamily: 'var(--font-cinzel)',
                    color: '#1a1a1a',
                    letterSpacing: '0.25em',
                    textShadow: '0 1px 0 rgba(255,255,255,0.03)',
                  }}
                >
                  GOL
                </span>
                <span
                  className="block text-3xl font-black tracking-[0.25em] leading-none"
                  style={{
                    fontFamily: 'var(--font-cinzel)',
                    color: '#1a1a1a',
                    letterSpacing: '0.25em',
                    textShadow: '0 1px 0 rgba(255,255,255,0.03)',
                  }}
                >
                  DE ORO
                </span>
                <span
                  className="block text-[9px] mt-2 tracking-[0.5em] uppercase"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    color: '#FCD116',
                    letterSpacing: '0.5em',
                  }}
                >
                  Selección Colombia & Mundial 2026
                </span>
              </div>
            </Link>

            <p
              className="text-xs leading-relaxed mb-8"
              style={{
                fontFamily: 'var(--font-sans)',
                color: '#8B8B8B',
                maxWidth: '320px',
                lineHeight: 1.9,
              }}
            >
              GOL DE ORO trae las mejores camisetas, álbum Panini, cajas de sobres y artículos deportivos de las selecciones más importantes del mundo para vivir la pasión del Mundial 2026.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ y: -2 }}
                  className="w-9 h-9 flex items-center justify-center transition-all duration-300"
                  style={{ border: '1px solid #1a1a1a', color: '#333' }}
                  aria-label={social.label}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = '#FCD116'
                      ; (e.currentTarget as HTMLAnchorElement).style.color = '#FCD116'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1a1a1a'
                      ; (e.currentTarget as HTMLAnchorElement).style.color = '#333'
                  }}
                >
                  <social.icon style={{ width: '14px', height: '14px' }} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 style={headingStyle}>Tienda</h4>
            <ul className="space-y-3.5">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={linkStyle}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#C0C0C0'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#555'}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 style={headingStyle}>Soporte</h4>
            <ul className="space-y-3.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={linkStyle}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#C0C0C0'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#555'}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links + Contact */}
          <div>
            <h4 style={headingStyle}>Empresa</h4>
            <ul className="space-y-3.5 mb-8">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={linkStyle}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#C0C0C0'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#555'}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact */}
            <div className="space-y-3" style={{ borderTop: '1px solid #1a1a1a', paddingTop: '20px' }}>
              {[
                { icon: Phone, text: '3006577286' },
                { icon: Mail, text: 'goldeorocoll@gmail.com' },
                { icon: MapPin, text: 'Colombia' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <Icon style={{ width: '11px', height: '11px', color: '#C8A44D', flexShrink: 0 }} />
                  <span
                    className="text-[11px]"
                    style={{ fontFamily: 'var(--font-sans)', color: '#555', letterSpacing: '0.03em' }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Separador cromado */}
        <div
          style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, #1a1a1a 20%, #1a1a1a 80%, transparent)',
            marginBottom: '28px',
          }}
        />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-[10px] uppercase tracking-[0.25em]"
            style={{ fontFamily: 'var(--font-sans)', color: '#333', letterSpacing: '0.25em' }}
          >
            © 2026 Gol de Oro. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-8">
            {[
              { label: 'Privacidad', href: '/privacidad' },
              { label: 'Términos', href: '/terminos' },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-[10px] uppercase tracking-[0.2em] transition-colors duration-200"
                style={{ fontFamily: 'var(--font-sans)', color: '#333', letterSpacing: '0.2em' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#8B8B8B'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#333'}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
