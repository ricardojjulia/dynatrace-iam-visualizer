import React, { useEffect, useState } from 'react';
import './App.css';

interface Policy {
  id: string;
  name: string;
  description?: string;
  lastModified?: string;
}

const App: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/policies`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setPolicies(data.policies || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPolicy = (policy: Policy) => {
    setSelectedPolicy(policy);
  };

  const handleRefresh = () => {
    fetchPolicies();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Dynatrace IAM Policy Visualizer</h1>
        <button onClick={handleRefresh} disabled={loading} className="refresh-btn">
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="content-wrapper">
          <section className="policies-list-section">
            <h2>IAM Policies</h2>
            {loading && !policies.length && (
              <div className="loading">Loading policies...</div>
            )}
            {!loading && policies.length === 0 && !error && (
              <div className="empty-state">No IAM policies found. Configure Dynatrace credentials to get started.</div>
            )}
            {policies.length > 0 && (
              <ul className="policies-list">
                {policies.map((policy) => (
                  <li
                    key={policy.id}
                    className={`policy-item ${selectedPolicy?.id === policy.id ? 'active' : ''}`}
                    onClick={() => handleSelectPolicy(policy)}
                  >
                    <div className="policy-name">{policy.name}</div>
                    {policy.lastModified && (
                      <div className="policy-meta">Modified: {new Date(policy.lastModified).toLocaleDateString()}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {selectedPolicy && (
            <section className="policy-details-section">
              <h2>Policy Details</h2>
              <div className="policy-details">
                <div className="detail-item">
                  <label>ID:</label>
                  <span>{selectedPolicy.id}</span>
                </div>
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{selectedPolicy.name}</span>
                </div>
                {selectedPolicy.description && (
                  <div className="detail-item">
                    <label>Description:</label>
                    <span>{selectedPolicy.description}</span>
                  </div>
                )}
                {selectedPolicy.lastModified && (
                  <div className="detail-item">
                    <label>Last Modified:</label>
                    <span>{new Date(selectedPolicy.lastModified).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
