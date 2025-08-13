import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function CreatorDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/creator/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleWithdraw = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/creator/earnings/withdraw', 
        { amount: withdrawAmount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setWithdrawAmount(0);
      // Refresh analytics
      const updated = await axios.get('/creator/analytics', { headers: { Authorization: `Bearer ${token}` } });
      setAnalytics(updated.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error requesting withdrawal');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!analytics) return <p>No data found.</p>;

  const { totalCourses, courseStatus, totalRevenue, totalOrders, topCourses, earnings, revenueTrends } = analytics;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Creator Dashboard</h1>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
        <div style={cardStyle}>
          <h3>Total Courses</h3>
          <p>{totalCourses}</p>
        </div>
        <div style={cardStyle}>
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
        </div>
        <div style={cardStyle}>
          <h3>Total Revenue</h3>
          <p>₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div style={cardStyle}>
          <h3>Available Balance</h3>
          <p>₹{earnings?.available_balance.toFixed(2) || 0}</p>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Request Withdrawal</h3>
        <input 
          type="number" 
          placeholder="Amount" 
          value={withdrawAmount} 
          onChange={e => setWithdrawAmount(Number(e.target.value))} 
          style={{ marginRight: '10px', padding: '5px', width: '150px' }}
        />
        <button onClick={handleWithdraw}>Withdraw</button>
      </div>

      {/* Course Status Chart */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Course Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={Object.entries(courseStatus).map(([status, count]) => ({ status, count }))}>
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4caf50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Trend Chart */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Revenue Trends (Last 12 months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart 
            data={revenueTrends.map(r => ({
              month: `${r._id.month}-${r._id.year}`,
              revenue: r.revenue
            }))}
          >
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#1976d2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Courses Table */}
      <div>
        <h3>Top 5 Courses</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Purchases</th>
              <th style={thStyle}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {topCourses.map(course => (
              <tr key={course._id}>
                <td style={tdStyle}>{course.title}</td>
                <td style={tdStyle}>{course.purchase_count}</td>
                <td style={tdStyle}>{course.average_rating.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

const cardStyle = {
  flex: '1 1 200px',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '10px',
  textAlign: 'center',
  backgroundColor: '#f9f9f9'
};

const thStyle = { border: '1px solid #ccc', padding: '10px', backgroundColor: '#eee' };
const tdStyle = { border: '1px solid #ccc', padding: '10px' };
