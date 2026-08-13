// ===========================================================================
// 1. CARROUSEL D'IMAGES (Balayable & Premium)
// ===========================================================================
function ImageSlider({ images }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) handleNext();
    if (touchStart - touchEnd < -50) handlePrev();
  };

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#2a2a2a', borderRadius: '12px', overflow: 'hidden', userSelect: 'none' }} 
         onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <img src={images[currentIndex]} alt="Tracteur" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <button onClick={handlePrev} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}>❮</button>
      <button onClick={handleNext} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}>❯</button>
      {/* Indicateurs de photos (Dots) */}
      <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10 }}>
        {images.map((_, idx) => (
          <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: idx === currentIndex ? '#1b9842' : 'rgba(255,255,255,0.5)' }} />
        ))}
      </div>
    </div>
  );
}

// ===========================================================================
// 2. WIDGET IA FLOTTANT
// ===========================================================================
function ChatWidget({ settings, isChatOpen, setIsChatOpen, chatMessages, setChatMessages, chatInput, setChatInput, isAiLoading, setIsAiLoading }) {
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAiLoading(true);

    if (!settings.openAiApiKey) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'assistant', content: "🤖 (Assistant virtuel) : Je suis l'agent IA de TractoRent. Je suis configuré pour répondre à vos questions. Pour débloquer mon intelligence artificielle avancée, veuillez entrer votre clé API dans le Panneau Administrateur." }]);
        setIsAiLoading(false);
      }, 1200);
      return;
    }

    try {
      const response = await fetch(settings.iaAgentApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.openAiApiKey}` },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "system", content: settings.iaAgentSystemMessage }, ...chatMessages, userMessage]
        })
      });
      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: "Désolé, une erreur est survenue avec l'IA." }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Erreur de connexion à l'intelligence artificielle." }]);
    }
    setIsAiLoading(false);
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 999 }}>
      <div onClick={() => setIsChatOpen(!isChatOpen)} style={{ backgroundColor: settings.primaryColor, width: '65px', height: '65px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 25px rgba(0,0,0,0.6)', transition: '0.3s', transform: isChatOpen ? 'scale(0.9)' : 'scale(1)' }}>
        <span style={{ fontSize: '32px', color: '#fff' }}>🤖</span>
      </div>
      {isChatOpen && (
        <div style={{ position: 'absolute', bottom: '80px', right: '0', width: '320px', height: '450px', backgroundColor: '#262626', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #444' }}>
          <div style={{ padding: '15px', backgroundColor: settings.primaryColor, color: '#fff', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
            <span>🤖 Agent IA 24h/24</span>
            <span onClick={() => setIsChatOpen(false)} style={{ cursor: 'pointer' }}>✕</span>
          </div>
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#1f1f1f' }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '10px 15px', borderRadius: '12px', backgroundColor: msg.role === 'user' ? settings.primaryColor : '#333', color: '#fff', fontSize: '14px', lineHeight: '1.4' }}>
                {msg.content}
              </div>
            ))}
            {isAiLoading && <div style={{ alignSelf: 'flex-start', color: '#888', fontSize: '12px' }}>L'IA réfléchit...</div>}
          </div>
          <div style={{ padding: '10px', borderTop: '1px solid #444', display: 'flex', gap: '10px', backgroundColor: '#262626' }}>
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Posez votre question..." style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff', fontSize: '14px', outline: 'none' }} />
            <button onClick={handleSendMessage} style={{ backgroundColor: settings.primaryColor, border: 'none', padding: '0 15px', borderRadius: '8px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Envoyer</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// 3. COMPOSANT PRINCIPAL APP
// ===========================================================================
function App() {
  // --- CONFIGURATION EMAILJS ---
  const EMAILJS_PUBLIC_KEY = "VOTRE_CLE_PUBLIQUE_EMAILJS";
  const EMAILJS_SERVICE_ID = "VOTRE_SERVICE_ID_EMAILJS";
  const EMAILJS_TEMPLATE_ID = "VOTRE_TEMPLATE_ID_EMAILJS";

  // --- ÉTATS REACT ---
  const [isAdminMode, setIsAdminMode] = React.useState(false);
  const [adminPassword, setAdminPassword] = React.useState('');
  const [editingTractorId, setEditingTractorId] = React.useState(null);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [chatMessages, setChatMessages] = React.useState([]);
  const [chatInput, setChatInput] = React.useState('');
  const [isAiLoading, setIsAiLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [selectedTractor, setSelectedTractor] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);
  const [bookingData, setBookingData] = React.useState({ name: '', email: '', phone: '', days: 1, startDate: '' });

  // --- DONNÉES DES 8 TRACTEURS AVEC 4 PHOTOS ROBUSTES ---
  const defaultTractors = [
    { id: 1, name: "Steyr 6150 Profi", model: "Stage V", pricePerDay: 280, category: "Premium", images: [
      "https://images.unsplash.com/photo-1535201970725-0941f77542c2?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1586528116311-ad8edd3a6e40?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1625246333195-58dba73b5158?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1590605185932-21c251e85f2a?w=600&h=400&fit=crop&auto=format"
    ]},
    { id: 2, name: "Lamborghini Spark", model: "125 VRT", pricePerDay: 350, category: "Premium", images: [
      "https://images.unsplash.com/photo-1590947134131-44872e050e5e?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1590605185932-21c251e85f2a?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1586528116311-ad8edd3a6e40?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1535201970725-0941f77542c2?w=600&h=400&fit=crop&auto=format"
    ]},
    { id: 3, name: "Fendt 728 Vario", model: "Gen7 Profi+", pricePerDay: 420, category: "Premium", images: [
      "https://images.unsplash.com/photo-1506435287758-bb336e5ef418?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1625246333195-58dba73b5158?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1590947134131-44872e050e5e?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1586528116311-ad8edd3a6e40?w=600&h=400&fit=crop&auto=format"
    ]},
    { id: 4, name: "Claas Arion 570", model: "CMATIC CEBIS", pricePerDay: 240, category: "Standard", images: [
      "https://images.unsplash.com/photo-1586528116311-ad8edd3a6e40?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1535201970725-0941f77542c2?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1590605185932-21c251e85f2a?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1506435287758-bb336e5ef418?w=600&h=400&fit=crop&auto=format"
    ]},
    { id: 5, name: "New Holland T6.180", model: "Auto Command", pricePerDay: 190, category: "Standard", images: [
      "https://images.unsplash.com/photo-1590605185932-21c251e85f2a?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1590947134131-44872e050e5e?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1625246333195-58dba73b5158?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1535201970725-0941f77542c2?w=600&h=400&fit=crop&auto=format"
    ]},
    { id: 6, name: "John Deere 6210R", model: "Premium Edition", pricePerDay: 390, category: "Premium", images: [
      "https://images.unsplash.com/photo-1625246333195-58dba73b5158?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1506435287758-bb336e5ef418?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1590947134131-44872e050e5e?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1586528116311-ad8edd3a6e40?w=600&h=400&fit=crop&auto=format"
    ]},
    { id: 7, name: "Kubota M7-171", model: "Premium KVT", pricePerDay: 160, category: "Standard", images: [
      "https://images.unsplash.com/photo-1551334784-c5402ef6356b?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1586528116311-ad8edd3a6e40?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1590605185932-21c251e85f2a?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1625246333195-58dba73b5158?w=600&h=400&fit=crop&auto=format"
    ]},
    { id: 8, name: "Case IH Puma 240", model: "CVXDrive", pricePerDay: 310, category: "Premium", images: [
      "https://images.unsplash.com/photo-1590947134131-44872e050e5e?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1590605185932-21c251e85f2a?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1535201970725-0941f77542c2?w=600&h=400&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1506435287758-bb336e5ef418?w=600&h=400&fit=crop&auto=format"
    ]}
  ];

  const defaultSettings = {
    siteName: "TractoRent",
    adminEmail: "admin@tractorrent.com",
    primaryColor: "#1b9842",
    secondaryColor: "#f59e0b",
    bgColor: "#121212",
    fontFamily: "system-ui",
    iaAgentEnabled: false,
    iaAgentSystemMessage: "Bonjour, je suis l'assistant premium de TractoRent. Je suis disponible 24h/24 pour vous aider à choisir votre tracteur idéal.",
    iaAgentApiUrl: "https://api.openai.com/v1/chat/completions",
    openAiApiKey: "" 
  };

  const [settings, setSettings] = React.useState(() => {
    const saved = localStorage.getItem('tractorrent_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [tractors, setTractors] = React.useState(() => {
    const saved = localStorage.getItem('tractorrent_tractors');
    return saved ? JSON.parse(saved) : defaultTractors;
  });
  const [reservations, setReservations] = React.useState(() => {
    const saved = localStorage.getItem('tractorrent_reservations');
    return saved ? JSON.parse(saved) : [];
  });

  // --- SYNC LOCALSTORAGE ---
  React.useEffect(() => localStorage.setItem('tractorrent_settings', JSON.stringify(settings)), [settings]);
  React.useEffect(() => localStorage.setItem('tractorrent_tractors', JSON.stringify(tractors)), [tractors]);
  React.useEffect(() => localStorage.setItem('tractorrent_reservations', JSON.stringify(reservations)), [reservations]);

  // --- INITIALISATION CHAT IA ---
  React.useEffect(() => {
    if (settings.iaAgentEnabled) {
      setChatMessages([{ role: 'assistant', content: settings.iaAgentSystemMessage }]);
    } else {
      setChatMessages([]); setIsChatOpen(false);
    }
  }, [settings.iaAgentEnabled, settings.iaAgentSystemMessage]);

  // --- LOGIQUE RÉSERVATION ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };
  const calculateTotal = () => {
    if (!selectedTractor) return 0;
    return selectedTractor.pricePerDay * parseInt(bookingData.days || 0);
  };

  const submitBooking = (e) => {
    e.preventDefault();
    const totalPrice = calculateTotal();
    const messageToAdmin = `Bonjour, je sollicite une réservation pour le tracteur ${selectedTractor.name} (Modèle : ${selectedTractor.model}). Période : ${bookingData.days} jours. Montant : ${totalPrice} €. Veuillez communiquer l'IBAN pour paiement. Nom : ${bookingData.name}, Email : ${bookingData.email}, Téléphone : ${bookingData.phone}.`;

    if (typeof window.emailjs !== 'undefined') {
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
      window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_name: "Administrateur",
        from_name: bookingData.name,
        from_email: bookingData.email,
        message: messageToAdmin,
        phone: bookingData.phone,
        tractor_name: selectedTractor.name
      }).then(() => {
        const newReservation = { id: Date.now(), tractorName: selectedTractor.name, model: selectedTractor.model, duration: bookingData.days, totalPrice: totalPrice, startDate: bookingData.startDate, clientName: bookingData.name, clientEmail: bookingData.email, clientPhone: bookingData.phone, status: "En attente d'envoi de l'IBAN" };
        setReservations(prev => [...prev, newReservation]);
        setShowModal(false);
        setMessage("✅ Demande transmise ! Vous recevrez les informations de paiement par email.");
        setTimeout(() => setMessage(''), 6000);
      }, (err) => {
        setMessage("❌ Erreur d'envoi d'email.");
        console.error(err);
      });
    }
  };

  // --- LOGIQUE ADMIN ---
  const confirmPaymentAdmin = (id) => {
    setReservations(prev => prev.map(res => res.id === id ? { ...res, status: "Paiement confirmé - Réservation réussie" } : res));
    setMessage("🎉 Paiement confirmé. Le reçu est disponible pour le client.");
    setTimeout(() => setMessage(''), 4000);
  };

  const addOrUpdateTractor = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const newTractor = { id: editingTractorId || Date.now(), name: data.get('name'), model: data.get('model'), pricePerDay: parseFloat(data.get('price')), category: data.get('category'), images: data.get('images').split(',').map(url => url.trim()) };
    if (editingTractorId) { setTractors(prev => prev.map(t => t.id === editingTractorId ? newTractor : t)); setEditingTractorId(null); } 
    else { setTractors(prev => [...prev, newTractor]); }
    form.reset();
    setMessage(`✅ Tracteur ${editingTractorId ? 'modifié' : 'ajouté'} !`);
    setTimeout(() => setMessage(''), 3000);
  };

  const deleteTractor = (id) => {
    if(confirm("Voulez-vous vraiment supprimer ce tracteur ?")) { setTractors(prev => prev.filter(t => t.id !== id)); setMessage("🗑️ Tracteur supprimé."); setTimeout(() => setMessage(''), 3000); }
  };

  const updateSiteSettings = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    setSettings({ ...settings, siteName: data.get('siteName'), adminEmail: data.get('adminEmail'), primaryColor: data.get('primaryColor'), secondaryColor: data.get('secondaryColor'), bgColor: data.get('bgColor'), iaAgentEnabled: data.get('iaAgentEnabled') === 'on', iaAgentSystemMessage: data.get('iaAgentSystemMessage'), openAiApiKey: data.get('openAiApiKey') });
    setMessage("✅ Configuration du site mise à jour !");
    setTimeout(() => setMessage(''), 3000);
  };

  // --- RENDU VISUEL ---
  const theme = { primary: settings.primaryColor, secondary: settings.secondaryColor, bg: settings.bgColor };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: settings.fontFamily, color: '#fff', paddingBottom: '30px' }}>
      
      {message && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: theme.primary, color: '#fff', padding: '15px 25px', borderRadius: '10px', zIndex: 9999, boxShadow: '0 8px 25px rgba(0,0,0,0.6)', fontWeight: '500', maxWidth: '90%', textAlign: 'center' }}>
          {message}
        </div>
      )}

      {/* NAV PREMIUM */}
      <nav style={{ backgroundColor: theme.primary, padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>☰</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '20px', letterSpacing: '1px' }}>{settings.siteName}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Plateforme de location premium</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => setIsAdminMode(!isAdminMode)}>
          <span style={{ fontSize: '20px', color: '#fff' }}>⚙️</span>
        </div>
      </nav>

      {/* ADMIN PANEL */}
      {isAdminMode && (
        <div style={{ margin: '20px', backgroundColor: '#1f1f1f', padding: '20px', borderRadius: '16px', border: `2px solid ${theme.secondary}` }}>
          <h3 style={{ marginBottom: '15px', color: theme.secondary }}>🔐 Tableau de bord Administrateur</h3>
          {adminPassword !== 'admin123' ? (
            <div style={{ maxWidth: '300px' }}>
              <input type="password" placeholder="Mot de passe Admin (admin123)" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: 'none', marginBottom: '10px', fontSize: '14px' }} />
              <button onClick={() => setAdminPassword('admin123')} style={{ backgroundColor: theme.secondary, border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#121212' }}>Accéder au panneau</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px' }}>
              <div style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '10px' }}>
                <h4 style={{ color: '#fff', marginBottom: '15px' }}>🏗️ Configuration du site & Clé API IA</h4>
                <form onSubmit={updateSiteSettings} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input name="siteName" defaultValue={settings.siteName} style={{ padding: '10px', borderRadius: '6px', background: '#111', color: '#fff', border: '1px solid #555' }} placeholder="Nom du site" />
                  <input name="adminEmail" defaultValue={settings.adminEmail} style={{ padding: '10px', borderRadius: '6px', background: '#111', color: '#fff', border: '1px solid #555' }} placeholder="Email admin" />
                  <input type="color" name="primaryColor" defaultValue={settings.primaryColor} style={{ height: '40px', border: 'none', cursor: 'pointer' }} />
                  <input type="color" name="secondaryColor" defaultValue={settings.secondaryColor} style={{ height: '40px', border: 'none', cursor: 'pointer' }} />
                  <input type="color" name="bgColor" defaultValue={settings.bgColor} style={{ height: '40px', border: 'none', cursor: 'pointer' }} />
                  <input name="openAiApiKey" defaultValue={settings.openAiApiKey} style={{ padding: '10px', borderRadius: '6px', background: '#111', color: '#fff', border: '1px solid #555' }} placeholder="Votre clé API OpenAI (sk-...)" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#eee' }}>
                    <input type="checkbox" name="iaAgentEnabled" defaultChecked={settings.iaAgentEnabled} /> <label>Activer l'IA 24h/24</label>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <textarea name="iaAgentSystemMessage" defaultValue={settings.iaAgentSystemMessage} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#111', color: '#fff', border: '1px solid #555' }} rows="2" placeholder="Message système de l'IA..." />
                  </div>
                  <button type="submit" style={{ gridColumn: 'span 2', backgroundColor: theme.primary, color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Appliquer les modifications</button>
                </form>
              </div>

              <div style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '10px' }}>
                <h4 style={{ color: '#fff', marginBottom: '15px' }}>📦 Gestion des tracteurs (CRUD)</h4>
                <form onSubmit={addOrUpdateTractor} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input name="name" required style={{ padding: '10px', borderRadius: '6px', background: '#111', color: '#fff', border: '1px solid #555' }} placeholder="Nom du tracteur" />
                  <input name="model" required style={{ padding: '10px', borderRadius: '6px', background: '#111', color: '#fff', border: '1px solid #555' }} placeholder="Modèle" />
                  <input name="price" type="number" required style={{ padding: '10px', borderRadius: '6px', background: '#111', color: '#fff', border: '1px solid #555' }} placeholder="Prix / jour" />
                  <input name="category" required style={{ padding: '10px', borderRadius: '6px', background: '#111', color: '#fff', border: '1px solid #555' }} placeholder="Catégorie (Premium)" />
                  <input name="images" required style={{ gridColumn: 'span 2', padding: '10px', borderRadius: '6px', background: '#111', color: '#fff', border: '1px solid #555' }} placeholder="URLs des photos (séparées par des virgules)" />
                  <button type="submit" style={{ gridColumn: 'span 2', backgroundColor: theme.primary, color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{editingTractorId ? "🔄 Modifier" : "➕ Ajouter"}</button>
                </form>
              </div>

              <div style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '10px' }}>
                <h4 style={{ color: '#fff', marginBottom: '15px' }}>📋 Catalogue actuel ({tractors.length})</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {tractors.map(t => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#333', padding: '10px 15px', borderRadius: '6px', alignItems: 'center' }}>
                      <div><div style={{ fontWeight: 'bold' }}>{t.name}</div><div style={{ fontSize: '12px', color: '#aaa' }}>{t.model} - {t.pricePerDay}€/j</div></div>
                      <div>
                        <button onClick={() => { setEditingTractorId(t.id); const form = document.forms[0]; if(form) { form.name.value=t.name; form.model.value=t.model; form.price.value=t.pricePerDay; form.category.value=t.category; form.images.value=t.images.join(', '); } }} style={{ backgroundColor: theme.secondary, border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', marginRight:'5px', color:'#121212', fontWeight:'bold' }}>✏️</button>
                        <button onClick={() => deleteTractor(t.id)} style={{ backgroundColor: '#dc2626', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', color:'#fff' }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '10px' }}>
                <h4 style={{ color: '#fff', marginBottom: '15px' }}>📩 Réservations en attente de paiement</h4>
                {reservations.filter(r => r.status === 'En attente d\'envoi de l\'IBAN').length === 0 ? (
                  <p style={{ color: '#888' }}>Aucune réservation en attente.</p>
                ) : (
                  reservations.filter(r => r.status === 'En attente d\'envoi de l\'IBAN').map(res => (
                    <div key={res.id} style={{ backgroundColor: '#333', padding: '10px', borderRadius: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      <div>
                        <div><b>{res.clientName}</b> - {res.tractorName}</div>
                        <div style={{ fontSize:'12px', color:'#aaa' }}>Email: {res.clientEmail}</div>
                        <div style={{ fontSize:'12px', color:'#aaa' }}>Montant: <b style={{ color: theme.secondary }}>{res.totalPrice}€</b> - Durée: {res.duration}j</div>
                      </div>
                      <button onClick={() => confirmPaymentAdmin(res.id)} style={{ backgroundColor: theme.primary, border:'none', padding:'8px 15px', borderRadius:'4px', fontWeight:'bold', cursor:'pointer', color:'#fff' }}>✅ Confirmer le paiement</button>
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => { setAdminPassword(''); setIsAdminMode(false); }} style={{ marginTop: '10px', backgroundColor: 'transparent', border: `1px solid ${theme.secondary}`, color: theme.secondary, padding:'12px', borderRadius:'6px', cursor:'pointer' }}>Déconnexion</button>
            </div>
          )}
        </div>
      )}

      {/* CATALOGUE TRACTEURS AVEC CARROUSEL 4 PHOTOS */}
      <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {tractors.map(t => (
          <div key={t.id} style={{ backgroundColor: '#262626', borderRadius: '16px', padding: '20px', border: '1px solid #333' }}>
            <ImageSlider images={t.images} />
            <div style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '18px' }}>{t.name}</div>
            <div style={{ color: '#aaa', fontSize: '14px', marginBottom: '5px' }}>{t.model}</div>
            <div style={{ marginTop: '15px', borderTop: '1px solid #333', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: theme.secondary, fontSize: '18px' }}>{t.pricePerDay}€ <span style={{ fontWeight: 'normal', fontSize: '12px', color: '#888' }}>/jour</span></div>
              </div>
              <button onClick={() => { setSelectedTractor(t); setBookingData({ ...bookingData, days: 1 }); setShowModal(true); }} style={{ backgroundColor: theme.primary, border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', color: '#fff', cursor: 'pointer' }}>
                Réserver
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* HISTORIQUE CLIENT */}
      {reservations.length > 0 && (
        <div style={{ margin: '20px 15px', backgroundColor: '#1f1f1f', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ marginBottom: '15px' }}>📋 Mes réservations</h3>
          {reservations.map(res => (
            <div key={res.id} style={{ borderBottom: '1px solid #333', padding: '15px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{res.tractorName} {res.model}</div>
                <div style={{ color: '#aaa', fontSize: '13px' }}>{res.duration} jour(s) • Montant total : <b>{res.totalPrice}€</b></div>
                <div style={{ color: res.status === 'Paiement confirmé - Réservation réussie' ? theme.primary : theme.secondary, fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>
                  {res.status}
                </div>
              </div>
              {res.status === 'Paiement confirmé - Réservation réussie' && (
                <button onClick={() => { alert("Votre reçu PDF va être généré.") }} style={{ backgroundColor: '#fff', color: '#121212', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  📄 Télécharger le reçu PDF
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODALE RÉSERVATION */}
      {showModal && selectedTractor && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div style={{ backgroundColor: '#262626', width: '90%', maxWidth: '500px', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Demande de réservation</h3>
              <span onClick={() => setShowModal(false)} style={{ cursor: 'pointer', fontSize: '24px', color: '#aaa' }}>✕</span>
            </div>
            <div style={{ backgroundColor: '#1f1f1f', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '1px solid #333' }}>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{selectedTractor.name}</div>
              <div style={{ fontSize: '14px', color: '#aaa' }}>{selectedTractor.model}</div>
              <div style={{ color: theme.secondary, fontWeight: 'bold', marginTop: '5px' }}>{selectedTractor.pricePerDay} € / jour</div>
            </div>
            <form onSubmit={submitBooking}>
              <input required name="name" placeholder="Nom complet" value={bookingData.name} onChange={handleInputChange} style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
              <input required type="email" name="email" placeholder="Adresse e-mail" value={bookingData.email} onChange={handleInputChange} style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
              <input required name="phone" placeholder="Numéro de téléphone" value={bookingData.phone} onChange={handleInputChange} style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input required type="date" name="startDate" value={bookingData.startDate} onChange={handleInputChange} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
                <input required type="number" min="1" name="days" placeholder="Durée (jours)" value={bookingData.days} onChange={handleInputChange} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#1a1a1a', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#1f1f1f', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #444' }}>
                <span>Montant total de la réservation :</span>
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: theme.secondary }}>{calculateTotal()} €</span>
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: theme.primary, border: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', color: '#fff', cursor: 'pointer' }}>
                Envoyer la demande
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WIDGET IA */}
      {settings.iaAgentEnabled && (
        <ChatWidget 
          settings={settings}
          isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen}
          chatMessages={chatMessages} setChatMessages={setChatMessages}
          chatInput={chatInput} setChatInput={setChatInput}
          isAiLoading={isAiLoading} setIsAiLoading={setIsAiLoading}
        />
      )}
      
    </div>
  );
}

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
