function App() {
  return (
    <div id="root-app">
      {/* On injecte le CSS classique directement ici, c'est infaillible */}
      <style>{`
        #root-app {
          min-height: 100vh;
          width: 100%;
          background-color: #173626;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-family: sans-serif;
        }
        h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .subtitle {
          font-size: 1.2rem;
          color: #d1d5db;
          margin-bottom: 2rem;
        }
        .loader {
          width: 2rem;
          height: 2rem;
          border: 4px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .status-text {
          margin-top: 1rem;
          font-size: 0.875rem;
          opacity: 0.6;
        }
      `}</style>

      {/* Le contenu HTML */}
      <h1>🚜 TractoRent</h1>
      <p className="subtitle">Plateforme de location de tracteurs</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div className="loader"></div>
        <p className="status-text">Chargement de la plateforme...</p>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
