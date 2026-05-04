import React from 'react';
import { Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Layout from '../components/Layout.jsx';
import { supabase, portalBaseUrl } from '../lib/supabase.js';
import { formatDate, isPastDue } from '../lib/date.js';

export default function AssetPage({ publicIdentifier }) {
  const [loading, setLoading] = React.useState(true);
  const [unit, setUnit] = React.useState(null);
  const [status, setStatus] = React.useState(null);
  const [components, setComponents] = React.useState([]);
  const [selected, setSelected] = React.useState(null);
  const [certs, setCerts] = React.useState([]);

  React.useEffect(() => { load(); }, [publicIdentifier]);

  async function load() {
    if (!supabase) { setLoading(false); return; }

    const { data: u } = await supabase.from('units').select('*').eq('public_identifier', publicIdentifier).maybeSingle();
    setUnit(u);
    if (!u) { setLoading(false); return; }

    const { data: s } = await supabase.from('unit_status').select('*').eq('unit_id', u.id).maybeSingle();
    setStatus(s);

    const { data: comps } = await supabase
      .from('component_latest_cert')
      .select('*')
      .eq('unit_id', u.id)
      .order('channel_label');

    setComponents(comps || []);
    if (comps?.[0]) await choose(comps[0]);
    setLoading(false);
  }

  async function choose(component) {
    setSelected(component);
    const { data } = await supabase
      .from('certificates')
      .select('*')
      .eq('component_id', component.component_id)
      .order('created_at', { ascending: false });
    setCerts(data || []);
  }

  if (loading) return <Layout><main className="page"><div className="card">Loading...</div></main></Layout>;
  if (!supabase) return <Layout><main className="page"><div className="card">Supabase not configured.</div></main></Layout>;
  if (!unit) return <Layout><main className="page"><div className="card">Asset not found: {publicIdentifier}</div></main></Layout>;

  const qrUrl = `${portalBaseUrl}/asset/${encodeURIComponent(unit.public_identifier)}`;
  const active = certs.filter(c => c.lifecycle_status === 'ACTIVE');
  const superseded = certs.filter(c => c.lifecycle_status !== 'ACTIVE');

  return (
    <Layout>
      <main className="page">
        <div className="topbar">
          <div>
            <p className="eyebrow">Asset Portal</p>
            <h1>{unit.public_identifier}</h1>
            <p className="muted">{unit.model || 'Unit'} {unit.description ? `• ${unit.description}` : ''}</p>
          </div>
          <span className={`status status-${status?.status}`}>{status?.status || 'UNKNOWN'}</span>
        </div>

        <section className="grid">
          <div className="card">
            <h3>Unit Summary</h3>
            <p>Type: {unit.identifier_type}</p>
            <p>Display Unit: {unit.has_display ? 'Yes' : 'No'}</p>
            <p>Latest Calibration: {formatDate(status?.latest_calibration_date)}</p>
            <p>Earliest Due: {formatDate(status?.earliest_due_date)}</p>
          </div>
          <div className="card qrCard">
            <QRCodeSVG value={qrUrl} size={150} includeMargin />
            <p className="muted small">{qrUrl}</p>
          </div>
        </section>

        <section className="card">
          <h3>Components / Transducers</h3>
          <div className="componentGrid">
            {components.map(c => (
              <button key={c.component_id} className={`componentCard ${selected?.component_id === c.component_id ? 'active' : ''}`} onClick={() => choose(c)}>
                <strong>{c.channel_label || 'Component'}</strong>
                <p>Serial: {c.serial_number}</p>
                <p>Range: {c.range_text || '—'}</p>
                <Mini comp={c}/>
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <h3>Active Certificate History {selected ? `— ${selected.serial_number}` : ''}</h3>
          {active.map(c => <CertRow key={c.id} cert={c}/>)}
          {!active.length && <p className="muted">No active certs.</p>}
        </section>

        <section className="card">
          <h3>Superseded / Corrected Certificates</h3>
          {superseded.map(c => <CertRow key={c.id} cert={c}/>)}
          {!superseded.length && <p className="muted">None.</p>}
        </section>
      </main>
    </Layout>
  );
}

function Mini({ comp }) {
  if (!comp.certificate_id) return <span className="mini warn">NO CERT</span>;
  if (comp.result_status === 'FAIL' || comp.result_status === 'LIMITED') return <span className="mini bad">{comp.result_status}</span>;
  if (isPastDue(comp.due_date)) return <span className="mini bad">EXPIRED</span>;
  return <span className="mini good">IN CAL</span>;
}

function CertRow({ cert }) {
  return (
    <article className="certRow">
      <div>
        <strong>{cert.cert_number}</strong>
        <p className="muted">Cal: {formatDate(cert.calibration_date)} • Due: {formatDate(cert.due_date)} • {cert.result_status} • {cert.lifecycle_status}</p>
        {cert.correction_reason && <p className="muted">Correction: {cert.correction_reason}</p>}
      </div>
      {cert.pdf_url && <a className="buttonLink" href={cert.pdf_url} target="_blank" rel="noreferrer"><Download size={17}/> PDF</a>}
    </article>
  );
}
