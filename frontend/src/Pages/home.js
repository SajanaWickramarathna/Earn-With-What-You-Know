import React from 'react';
import Nav from '../components/navigation';

const HomePage = () => {
  return (
    <div style={{ fontFamily: 'sans-serif', background: '#f6f8fb', minHeight: '100vh' }}>
      <Nav />
      <header style={{ padding: '24px 0', background: '#3b82f6', color: '#fff', textAlign: 'center' }}>
        <h1>Earn With What You Know</h1>
        <p>Empowering you to monetize your knowledge and skills.</p>
      </header>

      <main style={{ maxWidth: 900, margin: '40px auto', background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.06)' }}>
        <section style={{ marginBottom: 40 }}>
          <h2>Welcome!</h2>
          <p>
            Unlock opportunities to earn by sharing what you know. Whether you’re a teacher, expert, or enthusiast, 
            this platform connects you with learners eager for your experience. Start creating courses, offering mentoring, or sharing insights today!
          </p>
        </section>
        <section style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div style={{
            flex: 1,
            minWidth: 250,
            background: '#f1f5f9',
            borderRadius: 10,
            padding: 24,
            textAlign: 'center'
          }}>
            <h3>Share Knowledge</h3>
            <p>Create courses, guides, or lessons in your field of expertise.</p>
          </div>
          <div style={{
            flex: 1,
            minWidth: 250,
            background: '#f1f5f9',
            borderRadius: 10,
            padding: 24,
            textAlign: 'center'
          }}>
            <h3>Connect & Grow</h3>
            <p>Engage with learners, answer questions, and build your reputation.</p>
          </div>
          <div style={{
            flex: 1,
            minWidth: 250,
            background: '#f1f5f9',
            borderRadius: 10,
            padding: 24,
            textAlign: 'center'
          }}>
            <h3>Earn Rewards</h3>
            <p>Get paid for your time, insights, and teaching.</p>
          </div>
        </section>
        <section style={{ marginTop: 48, display: 'flex', justifyContent: 'center', gap: '24px' }}>
          <a href="/signup" style={{
            background: '#3b82f6',
            color: '#fff',
            padding: '16px 40px',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 20,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(59,130,246,0.15)'
          }}>
            Sign Up
          </a>
          <a href="/signin" style={{
            background: '#6366f1',
            color: '#fff',
            padding: '16px 40px',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 20,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(99,102,241,0.15)'
          }}>
            Sign In
          </a>
          <a href="/courses" style={{
            background: '#22c55e',
            color: '#fff',
            padding: '16px 40px',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 20,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(34,197,94,0.15)'
          }}>
            View Courses
          </a>
        </section>
      </main>

      <footer style={{ background: '#e2e8f0', textAlign: 'center', padding: 16, marginTop: 40 }}>
        <small>© {new Date().getFullYear()} Earn With What You Know. All rights reserved.</small>
      </footer>
    </div>
  );
};

export default HomePage;