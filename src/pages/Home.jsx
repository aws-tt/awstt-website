import React from 'react';
import { ArrowRight, FileCheck2, QrCode, Truck } from 'lucide-react';
import Layout from '../components/Layout.jsx';

export default function Home() {
  return (
    <Layout>
      <main className="hero">
        <section>
          <p className="eyebrow">AWS Torque & Tension, LLC</p>
          <h1>Torque calibration with permanent QR traceability.</h1>
          <p className="heroText">
            Mobile and in-shop calibration support with lot-based asset records,
            transducer-level certificate history, and controlled certificate corrections.
          </p>
          <div className="heroActions">
            <a className="primaryBtn" href="/request-service">Request Service <ArrowRight size={18}/></a>
            <a className="secondaryBtn" href="/cert-lookup">Look Up Cert</a>
          </div>
        </section>
        <section className="heroPanel">
          <div className="panelTop"><span>Permanent Asset QR</span><QrCode /></div>
          <div className="mockCert">
            <div><span>Lot</span><strong>M123451</strong></div>
            <div><span>Components</span><strong>4 Transducers</strong></div>
            <div><span>Status</span><strong className="green">IN CAL</strong></div>
            <div><span>Latest Cert</span><strong>AWSTT-2026-000001</strong></div>
          </div>
        </section>
      </main>
      <section className="section serviceGrid">
        <article className="serviceCard"><Truck/><h3>Mobile Calibration</h3><p>On-site calibration workflows for mobile service.</p></article>
        <article className="serviceCard"><FileCheck2/><h3>Cert Portal</h3><p>Permanent QR links to live cert records.</p></article>
        <article className="serviceCard"><QrCode/><h3>QR Labels</h3><p>Brother PT-P900WC-oriented QR label generator.</p></article>
      </section>
    </Layout>
  );
}
