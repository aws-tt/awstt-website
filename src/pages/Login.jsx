import React from 'react';
import Layout from '../components/Layout.jsx';
import { supabase } from '../lib/supabase.js';

export default function Login() {
  const [message, setMessage] = React.useState('');

  async function login(e) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget).entries());
    if (!supabase) return setMessage('Supabase is not configured.');
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    });
    if (error) setMessage(error.message);
    else window.location.href = '/admin';
  }

  return (
    <Layout>
      <main className="page centerSection">
        <form className="heroCard requestForm" onSubmit={login}>
          <p className="eyebrow">Admin Login</p>
          <h1>Sign in.</h1>
          <label>Email<input name="email" type="email" required /></label>
          <label>Password<input name="password" type="password" required /></label>
          <button className="primaryBtn">Login</button>
          {message && <p className="muted">{message}</p>}
        </form>
      </main>
    </Layout>
  );
}
