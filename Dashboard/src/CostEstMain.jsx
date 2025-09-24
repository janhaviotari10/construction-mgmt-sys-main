import React, { useState } from 'react';
import CostEstimationForm from './components/CostEstimation/CostEstimationForm';
import ResultDisplay from './components/CostEstimation/ResultDisplay';
import './components/CostEstimation/CostEstimation.css';

const CostEstMain = () => {
  const [result, setResult] = useState('');
  const [contributions, setContributions] = useState(null);

  const handleResult = (cost, contrib) => {
    setResult(cost ? `${cost}` : '');
    setContributions(contrib);
  };

  const fetchPrediction = async (inputData) => {
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.predicted_cost);
        setContributions(data.contributions);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  return (
    <div className="app-cost">
      <nav className="navbar-cost">
        <div className="navbar-title">Cost Estimation</div>
        <div className="navbar-links">
          <a href="/home">Home</a>
          <a href="/dashboard">Dashboard</a>
        </div>
      </nav>
      <main className="main-cost">
        <CostEstimationForm onResult={handleResult} />
        {result && contributions && (
          <ResultDisplay result={result} contributions={contributions} />
        )}
      </main>
    </div>
  );
};

export default CostEstMain;