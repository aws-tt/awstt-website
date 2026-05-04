import React from 'react';
import Layout from '../components/Layout.jsx';
import { supabase } from '../lib/supabase.js';

export default function RequestService() {
  const [sent, setSent] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    if (supabase) await supabase.from('service_requests').insert(payload);
    setSent(true);
  }

  return (
    <Layout>
      <main className="page">
        <p className="eyebrow">Request Service</p>
        <h1>Request calibration support.</h1>
        {sent ? <div className="card">Request received.</div> : (
          <form className="requestForm" onSubmit={submit}>
            <div className="formGrid">
              <label>Company<input name="company_name" required /></label>
              <label>Contact<input name="contact_name" /></label>
              <label>Email<input name="email" type="email" required /></label>
              <label>Phone<input name="phone" /></label>
              <label>Service Type<input name="service_type" /></label>
              <label>Location<input name="location" /></label>
            </div>
            <label>Notes<textarea name="notes" placeholder="Equipment, serials, lot numbers, ranges, and requested date." /></label>
            <button className="primaryBtn">Submit Request</button>
          </form>
        )}
      </main>
    </Layout>
  );
}
