import React, { useEffect, useState } from 'react';

interface Policy {
  id: string;
  name: string;
}

const App: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/policies`);
        if (!response.ok) throw new Error('Failed to fetch policies');
        const data = await response.json();
        setPolicies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Dynatrace IAM Policy Visualizer</h1>
      {loading && <p>Loading policies...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && (
        <div>
          <h2>IAM Policies</h2>
          {policies.length === 0 ? (
            <p>No policies found</p>
          ) : (
            <ul>
              {policies.map((policy) => (
                <li key={policy.id}>{policy.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
