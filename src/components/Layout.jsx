import React from 'react';
import { Gauge, Menu, X } from 'lucide-react';

export default function Layout({ children }) {
  const [open, setOpen] = React.useState(false);
  const links = [
    ['/', 'Home'],
    ['/services', 'Services'],
    ['/cert-lookup', 'Cert Lookup'],
    ['/request-service', 'Request Service'],
    ['/admin', 'Admin']
  ];

  return (
    <>
      <header className="siteHeader">
        <a className="logoLockup" href="/">
          <div className="logoIcon"><Gauge size={24}/></div>
          <div>
            <strong>AWS Torque & Tension</strong>
            <span>Calibration + Traceability</span>
          </div>
        </a>
        <nav className="desktopNav">
          {links.map(([href,label]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <a className="headerCta" href="/cert-lookup">Cert Lookup</a>
        <button className="mobileBtn" onClick={() => setOpen(true)}><Menu /></button>
      </header>
      {open && (
        <div className="mobilePanel">
          <button className="mobileClose" onClick={() => setOpen(false)}><X /></button>
          {links.map(([href,label]) => <a key={href} href={href}>{label}</a>)}
        </div>
      )}
      {children}
      <footer className="footer">
        <strong>AWS Torque & Tension, LLC</strong>
        <span>awstorqueandtension.com</span>
      </footer>
    </>
  );
}
