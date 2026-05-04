import React from 'react';
import { Search } from 'lucide-react';
import Layout from '../components/Layout.jsx';

export default function CertLookup() {
  const [value, setValue] = React.useState('');
  function submit(e) {
    e.preventDefault();
    const v = value.trim();
    if (v) window.location.href = `/asset/${encodeURIComponent(v)}`;
  }

  return (
    <Layout>
      <main className="page centerSection">
        <section className="heroCard">
          <p className="eyebrow">Certificate Lookup</p>
          <h1>Look up a unit.</h1>
          <p className="muted">Enter a lot number for display units or a serial number for single-serial units.</p>
          <form className="lookupForm" onSubmit={submit}>
            <input value={value} onChange={e => setValue(e.target.value)} placeholder="M123451 or 987654" />
            <button><Search size={18}/> Lookup</button>
          </form>
        </section>
      </main>
    </Layout>
  );
}
