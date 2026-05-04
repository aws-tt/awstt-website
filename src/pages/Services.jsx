import React from 'react';
import Layout from '../components/Layout.jsx';

export default function Services() {
  return (
    <Layout>
      <main className="page">
        <p className="eyebrow">Services</p>
        <h1>Calibration services.</h1>
        <p className="muted">Torque tester calibration, torque wrench calibration, mobile service, and QR-accessible records.</p>
        <section className="serviceGrid">
          <article className="serviceCard"><h3>Torque Tester Calibration</h3><p>Serial and lot based records for equipment with one or many transducers.</p></article>
          <article className="serviceCard"><h3>Torque Tool Calibration</h3><p>As-found and as-left cert workflows.</p></article>
          <article className="serviceCard"><h3>Mobile Calibration</h3><p>On-site service support and future mobile pricing integration.</p></article>
        </section>
      </main>
    </Layout>
  );
}
