import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Layout from '../components/Layout.jsx';
import { supabase, helperApi, portalBaseUrl, getSessionProfile, isAdmin } from '../lib/supabase.js';
import { formatDate } from '../lib/date.js';

export default function Admin() {
  const [ready, setReady] = React.useState(false);
  const [authorized, setAuthorized] = React.useState(false);
  const [tab, setTab] = React.useState('dashboard');

  React.useEffect(() => { check(); }, []);

  async function check() {
    const { session, profile } = await getSessionProfile();
    if (!session) {
      window.location.href = '/login';
      return;
    }
    setAuthorized(isAdmin(profile));
    setReady(true);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  if (!ready) return <Layout><main className="page"><div className="card">Checking admin access...</div></main></Layout>;
  if (!authorized) return <Layout><main className="page"><div className="card">Not authorized. Your profile must have role = admin.</div></main></Layout>;

  return (
    <Layout>
      <main className="page">
        <div className="topbar">
          <div><p className="eyebrow">Admin</p><h1>AWSTT Admin Dashboard</h1></div>
          <button className="secondaryBtn" onClick={logout}>Logout</button>
        </div>
        <div className="tabbar">
          {['dashboard','units','components','certs','correct','labels','requests'].map(t => (
            <button className={tab === t ? 'active' : ''} key={t} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'units' && <Units />}
        {tab === 'components' && <Components />}
        {tab === 'certs' && <Certs />}
        {tab === 'correct' && <CorrectCert />}
        {tab === 'labels' && <Labels />}
        {tab === 'requests' && <Requests />}
      </main>
    </Layout>
  );
}

function Dashboard() {
  const [counts, setCounts] = React.useState({});
  React.useEffect(() => { load(); }, []);

  async function load() {
    const [u,c,cert,r] = await Promise.all([
      supabase.from('units').select('id', { count: 'exact', head: true }),
      supabase.from('components').select('id', { count: 'exact', head: true }),
      supabase.from('certificates').select('id', { count: 'exact', head: true }),
      supabase.from('service_requests').select('id', { count: 'exact', head: true })
    ]);
    setCounts({ units:u.count, components:c.count, certs:cert.count, requests:r.count });
  }

  return <section className="statsGrid">{Object.entries(counts).map(([k,v]) => <div className="card" key={k}><h3>{k}</h3><strong className="big">{v ?? 0}</strong></div>)}</section>;
}

function Units() {
  const [units, setUnits] = React.useState([]);
  React.useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('units').select('*').order('created_at', { ascending: false });
    setUnits(data || []);
  }

  async function submit(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget).entries());
    await supabase.from('units').insert({
      public_identifier: f.public_identifier,
      identifier_type: f.identifier_type,
      model: f.model || null,
      description: f.description || null,
      has_display: f.identifier_type === 'LOT'
    });
    e.currentTarget.reset();
    load();
  }

  return (
    <section className="adminGrid">
      <form className="card requestForm" onSubmit={submit}>
        <h3>Create Unit</h3>
        <label>Lot or Serial<input name="public_identifier" required /></label>
        <label>Type<select name="identifier_type"><option>LOT</option><option>SERIAL</option></select></label>
        <label>Model<input name="model" /></label>
        <label>Description<input name="description" /></label>
        <button className="primaryBtn">Create</button>
      </form>
      <div className="card">
        <h3>Units</h3>
        {units.map(u => <div className="listRow" key={u.id}><strong>{u.public_identifier}</strong><span>{u.identifier_type}</span><a href={`/asset/${u.public_identifier}`}>Open</a></div>)}
      </div>
    </section>
  );
}

function Components() {
  const [units, setUnits] = React.useState([]);
  const [components, setComponents] = React.useState([]);
  React.useEffect(() => { load(); }, []);

  async function load() {
    const { data: u } = await supabase.from('units').select('id, public_identifier').order('public_identifier');
    const { data: c } = await supabase.from('components').select('*, units(public_identifier)').order('created_at', { ascending: false });
    setUnits(u || []);
    setComponents(c || []);
  }

  async function submit(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget).entries());
    await supabase.from('components').insert({
      unit_id: f.unit_id,
      serial_number: f.serial_number,
      channel_label: f.channel_label || null,
      range_text: f.range_text || null,
      units: f.units || null
    });
    e.currentTarget.reset();
    load();
  }

  return (
    <section className="adminGrid">
      <form className="card requestForm" onSubmit={submit}>
        <h3>Add Component / Transducer</h3>
        <label>Parent Unit<select name="unit_id">{units.map(u => <option key={u.id} value={u.id}>{u.public_identifier}</option>)}</select></label>
        <label>Serial Number<input name="serial_number" required /></label>
        <label>Channel Label<input name="channel_label" placeholder="Channel A" /></label>
        <label>Range<input name="range_text" placeholder="0-500 lb-ft" /></label>
        <label>Units<input name="units" placeholder="lb-ft" /></label>
        <button className="primaryBtn">Add</button>
      </form>
      <div className="card">
        <h3>Components</h3>
        {components.map(c => <div className="listRow" key={c.id}><strong>{c.serial_number}</strong><span>{c.channel_label}</span><span>{c.units?.public_identifier}</span></div>)}
      </div>
    </section>
  );
}

function Certs() {
  const [certs, setCerts] = React.useState([]);
  React.useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from('certificates')
      .select('*, components(serial_number, channel_label, units(public_identifier))')
      .order('created_at', { ascending:false })
      .limit(200);
    setCerts(data || []);
  }

  return (
    <section className="card">
      <h3>Recent Certs</h3>
      {certs.map(c => (
        <div className="listRow" key={c.id}>
          <strong>{c.cert_number}</strong>
          <span>{c.components?.serial_number}</span>
          <span>{formatDate(c.calibration_date)}</span>
          <span>{c.lifecycle_status}</span>
          {c.pdf_url && <a href={c.pdf_url} target="_blank" rel="noreferrer">PDF</a>}
        </div>
      ))}
    </section>
  );
}

function CorrectCert() {
  const [file, setFile] = React.useState(null);
  const [msg, setMsg] = React.useState('');

  async function submit(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget).entries());
    const form = new FormData();
    form.append('oldCertNumber', f.oldCertNumber);
    form.append('reason', f.reason);
    form.append('actor', f.actor || 'admin');
    if (file) form.append('pdf', file);
    const res = await fetch(`${helperApi}/api/certificates/correct`, { method: 'POST', body: form });
    setMsg(await res.text());
  }

  return (
    <section className="card">
      <h3>Correct Certificate</h3>
      <p className="muted">Creates a new cert and marks the old cert SUPERSEDED. It does not overwrite history.</p>
      <form className="requestForm" onSubmit={submit}>
        <label>Old Cert Number<input name="oldCertNumber" required /></label>
        <label>Correction Reason<textarea name="reason" required /></label>
        <label>Actor<input name="actor" placeholder="Alex Coleman" /></label>
        <label>Corrected PDF<input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0])} required /></label>
        <button className="primaryBtn">Create Corrected Cert</button>
      </form>
      {msg && <pre className="resultBox">{msg}</pre>}
    </section>
  );
}

function Labels() {
  const [id, setId] = React.useState('M123451');
  const url = `${portalBaseUrl}/asset/${encodeURIComponent(id)}`;
  return (
    <section className="labelWorkspace">
      <div className="card requestForm">
        <h3>QR Sticker Generator</h3>
        <p className="muted">Designed for Brother PT-P900WC workflow. Browser print first; Brother SDK integration can be added later.</p>
        <label>Lot / Serial<input value={id} onChange={e => setId(e.target.value)} /></label>
        <button className="primaryBtn" onClick={() => window.print()}>Print Label</button>
      </div>
      <div className="labelPreview">
        <div className="ptLabel">
          <QRCodeSVG value={url} size={104}/>
          <div><strong>AWS TORQUE & TENSION</strong><span>{id}</span><small>SCAN FOR CAL RECORDS</small></div>
        </div>
      </div>
    </section>
  );
}

function Requests() {
  const [rows, setRows] = React.useState([]);
  React.useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('service_requests').select('*').order('created_at', { ascending:false });
    setRows(data || []);
  }

  return <section className="card"><h3>Service Requests</h3>{rows.map(r => <div className="listRow" key={r.id}><strong>{r.company_name}</strong><span>{r.email}</span><span>{r.service_type}</span><span>{r.status}</span></div>)}</section>;
}
