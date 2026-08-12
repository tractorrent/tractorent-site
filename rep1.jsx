function App() {
  return (
    <div style={{ color: '#fff', backgroundColor: '#173626', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>🚜 TractoRent</h1>
      <p>Chargement de la plateforme...</p>
    </div>
  );
}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
