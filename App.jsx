import React, { useState, useEffect, useRef } from 'react';
import { Package, Wrench, HardHat, Plus, Edit2, Trash2, MapPin, Camera, Check, X, FileText, ClipboardList, Search, ChevronRight, ChevronLeft, Upload, Eye, Users, Phone, Mail, Building2, User, Download, Calendar, Bell, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ============ HELPERS DE FECHAS ============
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

const daysBetween = (start, end) => {
  if (!start || !end) return 0;
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  return Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
};

const addDays = (dateStr, days) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const daysUntil = (dateStr) => {
  if (!dateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
};

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [inventoryFilter, setInventoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  const [inventory, setInventory] = useState([
    { id: 1, name: 'Excavadora CAT 320', category: 'maquinaria', quantity: 3, available: 2, rented: 1, location: 'Bodega Central', status: 'disponible', photo: null, price: 8500, description: 'Excavadora hidráulica 20 ton' },
    { id: 2, name: 'Generador 50KW', category: 'equipo', quantity: 5, available: 5, rented: 0, location: 'Bodega Norte', status: 'disponible', photo: null, price: 1200, description: 'Generador eléctrico diésel' },
    { id: 3, name: 'Taladro Industrial', category: 'herramienta', quantity: 15, available: 12, rented: 3, location: 'Bodega Central', status: 'disponible', photo: null, price: 180, description: 'Taladro de impacto 850W' },
    { id: 4, name: 'Retroexcavadora JCB', category: 'maquinaria', quantity: 2, available: 0, rented: 2, location: 'Obra Cliente A', status: 'rentada', photo: null, price: 6800, description: 'Retroexcavadora 4x4' },
    { id: 5, name: 'Compresor de Aire', category: 'equipo', quantity: 8, available: 6, rented: 2, location: 'Bodega Sur', status: 'disponible', photo: null, price: 450, description: 'Compresor 185 CFM' },
    { id: 6, name: 'Sierra Circular', category: 'herramienta', quantity: 20, available: 18, rented: 2, location: 'Bodega Central', status: 'disponible', photo: null, price: 95, description: 'Sierra circular 7-1/4"' },
  ]);

  const [clients, setClients] = useState([
    { id: 1, name: 'Constructora Hernández', contact: 'Roberto Hernández', email: 'roberto@constructorah.mx', phone: '33 1234 5678', rfc: 'COH950312AB1', address: 'Av. Vallarta 1234, Guadalajara, JAL', type: 'empresa', notes: 'Cliente frecuente, paga a 30 días' },
    { id: 2, name: 'Inmobiliaria del Valle', contact: 'María Solís', email: 'maria.solis@invalle.com', phone: '33 9876 5432', rfc: 'IDV880715CD2', address: 'Calle Reforma 567, Zapopan, JAL', type: 'empresa', notes: '' },
    { id: 3, name: 'Juan Pérez García', contact: 'Juan Pérez', email: 'jperez@gmail.com', phone: '33 5555 1234', rfc: 'PEGJ750101XYZ', address: 'Col. Providencia, Guadalajara', type: 'persona', notes: 'Renta esporádica' },
  ]);

  const [budgets, setBudgets] = useState([]);
  const [rentals, setRentals] = useState([]);

  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const filteredInventory = inventory.filter(item => {
    const matchesCategory = inventoryFilter === 'all' || item.category === inventoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSaveItem = (itemData) => {
    if (editingItem?.id) {
      setInventory(inventory.map(i => i.id === editingItem.id ? { ...itemData, id: editingItem.id } : i));
    } else {
      const newId = Math.max(0, ...inventory.map(i => i.id)) + 1;
      setInventory([...inventory, { ...itemData, id: newId }]);
    }
    setShowInventoryModal(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id) => {
    if (confirm('¿Eliminar este artículo del inventario?')) setInventory(inventory.filter(i => i.id !== id));
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    c.contact.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  const handleSaveClient = (clientData) => {
    if (editingClient?.id) {
      setClients(clients.map(c => c.id === editingClient.id ? { ...clientData, id: editingClient.id } : c));
    } else {
      const newId = Math.max(0, ...clients.map(c => c.id), 0) + 1;
      setClients([...clients, { ...clientData, id: newId }]);
    }
    setShowClientModal(false);
    setEditingClient(null);
  };

  const handleDeleteClient = (id) => {
    if (confirm('¿Eliminar este cliente?')) setClients(clients.filter(c => c.id !== id));
  };

  const getClientStats = (clientId) => {
    const clientBudgets = budgets.filter(b => b.clientId === clientId);
    const clientRentals = rentals.filter(r => r.clientId === clientId);
    const totalSpent = clientRentals.reduce((sum, r) => sum + r.total, 0);
    return { budgets: clientBudgets.length, rentals: clientRentals.length, total: totalSpent };
  };

  const handleSaveBudget = (budgetData) => {
    if (editingBudget?.id) {
      setBudgets(budgets.map(b => b.id === editingBudget.id ? { ...budgetData, id: editingBudget.id } : b));
    } else {
      const newId = Math.max(0, ...budgets.map(b => b.id), 0) + 1;
      setBudgets([...budgets, { ...budgetData, id: newId }]);
    }
    setShowBudgetModal(false);
    setEditingBudget(null);
  };

  const handleValidateBudget = (budget) => {
    if (budget.items.length === 0) { alert('No se puede validar un presupuesto vacío'); return; }
    if (!budget.clientId) { alert('Falta seleccionar el cliente'); return; }
    if (!budget.startDate || !budget.endDate) { alert('Falta definir las fechas de la renta'); return; }
    
    const client = clients.find(c => c.id === budget.clientId);
    const newRental = {
      id: Math.max(0, ...rentals.map(r => r.id), 0) + 1,
      clientId: budget.clientId,
      client: client?.name || 'Sin cliente',
      startDate: budget.startDate,
      endDate: budget.endDate,
      items: budget.items,
      total: budget.total,
      status: 'activa',
      budgetId: budget.id,
      notes: budget.notes
    };
    setRentals([...rentals, newRental]);
    
    const updatedInventory = [...inventory];
    budget.items.forEach(budgetItem => {
      const invIndex = updatedInventory.findIndex(i => i.id === budgetItem.itemId);
      if (invIndex !== -1) {
        updatedInventory[invIndex] = {
          ...updatedInventory[invIndex],
          available: Math.max(0, updatedInventory[invIndex].available - budgetItem.quantity),
          rented: updatedInventory[invIndex].rented + budgetItem.quantity,
          status: updatedInventory[invIndex].available - budgetItem.quantity <= 0 ? 'rentada' : 'disponible'
        };
      }
    });
    setInventory(updatedInventory);
    setBudgets(budgets.map(b => b.id === budget.id ? { ...b, status: 'validado' } : b));
    alert('Presupuesto validado y movido a Rentas');
  };

  const handleDeleteBudget = (id) => {
    if (confirm('¿Eliminar este presupuesto?')) setBudgets(budgets.filter(b => b.id !== id));
  };

  const handleCloseRental = (rental) => {
    if (!confirm('¿Cerrar esta renta y devolver los artículos al inventario?')) return;
    const updatedInventory = [...inventory];
    rental.items.forEach(rentalItem => {
      const invIndex = updatedInventory.findIndex(i => i.id === rentalItem.itemId);
      if (invIndex !== -1) {
        updatedInventory[invIndex] = {
          ...updatedInventory[invIndex],
          available: updatedInventory[invIndex].available + rentalItem.quantity,
          rented: Math.max(0, updatedInventory[invIndex].rented - rentalItem.quantity),
          status: 'disponible'
        };
      }
    });
    setInventory(updatedInventory);
    setRentals(rentals.map(r => r.id === rental.id ? { ...r, status: 'cerrada' } : r));
  };

  // ============ ALERTAS ============
  const getAlerts = () => {
    return rentals
      .filter(r => r.status === 'activa' && r.endDate)
      .map(r => ({ ...r, daysLeft: daysUntil(r.endDate) }))
      .filter(r => r.daysLeft <= 1)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  };

  const alerts = getAlerts();

  const stats = {
    totalItems: inventory.reduce((sum, i) => sum + i.quantity, 0),
    available: inventory.reduce((sum, i) => sum + i.available, 0),
    rented: inventory.reduce((sum, i) => sum + i.rented, 0),
    activeBudgets: budgets.filter(b => b.status === 'borrador').length,
    activeRentals: rentals.filter(r => r.status === 'activa').length,
    totalClients: clients.length,
    alerts: alerts.length,
  };

  const generatePDF = (section) => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    const drawHeader = (title, subtitle) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(28); doc.setTextColor(20, 20, 20);
      doc.text('rent-r', 14, 20);
      doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.3); doc.line(14, 25, 196, 25);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(140, 140, 140);
      doc.text('EQUIPMENT CRM', 14, 31);
      doc.text(today.toUpperCase(), 196, 31, { align: 'right' });
      doc.setFontSize(8); doc.text(subtitle.toUpperCase(), 14, 50);
      doc.setFontSize(28); doc.setTextColor(20, 20, 20); doc.text(title, 14, 62);
    };
    const drawFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(160, 160, 160);
        doc.text(`rent-r · ${today}`, 14, 287);
        doc.text(`Página ${i} de ${pageCount}`, 196, 287, { align: 'right' });
      }
    };

    if (section === 'dashboard') {
      drawHeader('Dashboard', 'Reporte General');
      doc.autoTable({
        startY: 75,
        head: [['Métrica', 'Valor', 'Detalle']],
        body: [
          ['TOTAL PIEZAS', stats.totalItems.toString(), 'en inventario'],
          ['DISPONIBLES', stats.available.toString(), 'listas para rentar'],
          ['RENTADAS', stats.rented.toString(), 'actualmente'],
          ['CLIENTES', stats.totalClients.toString(), 'registrados'],
          ['RENTAS ACTIVAS', stats.activeRentals.toString(), 'en curso'],
          ['ALERTAS', stats.alerts.toString(), 'devoluciones próximas'],
        ],
        theme: 'plain',
        headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 10, cellPadding: 5 },
        alternateRowStyles: { fillColor: [248, 248, 246] },
      });
    } else if (section === 'inventory') {
      drawHeader('Inventario', inventoryFilter === 'all' ? 'Inventario Completo' : `Inventario · ${inventoryFilter}`);
      const items = inventory.filter(i => inventoryFilter === 'all' || i.category === inventoryFilter);
      doc.autoTable({
        startY: 75,
        head: [['Artículo', 'Categoría', 'Total', 'Disp.', 'Rent.', 'Ubicación', 'Estatus', 'Precio/día']],
        body: items.map(i => [i.name, i.category.toUpperCase(), i.quantity.toString(), i.available.toString(), i.rented.toString(), i.location, i.status === 'disponible' ? 'Disponible' : 'Rentada', `$${i.price.toLocaleString()}`]),
        theme: 'plain',
        headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 248, 246] },
      });
    } else if (section === 'clients') {
      drawHeader('Clientes', 'Directorio Completo');
      doc.autoTable({
        startY: 75,
        head: [['Cliente', 'Tipo', 'Contacto', 'Email', 'Teléfono', 'Rentas', 'Total gastado']],
        body: clients.map(c => {
          const cs = getClientStats(c.id);
          return [c.name, c.type === 'empresa' ? 'Empresa' : 'Persona', c.contact || '-', c.email || '-', c.phone || '-', cs.rentals.toString(), `$${cs.total.toLocaleString()}`];
        }),
        theme: 'plain',
        headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 248, 246] },
      });
    } else if (section === 'budgets') {
      drawHeader('Presupuestos', 'Reporte de Cotizaciones');
      doc.autoTable({
        startY: 75,
        head: [['N°', 'Cliente', 'Inicio', 'Fin', 'Días', 'Artículos', 'Estado', 'Total']],
        body: budgets.map(b => {
          const client = clients.find(c => c.id === b.clientId);
          const days = b.startDate && b.endDate ? daysBetween(b.startDate, b.endDate) : '-';
          return [`#${b.id.toString().padStart(3, '0')}`, client?.name || 'Sin cliente', formatDate(b.startDate), formatDate(b.endDate), days.toString(), `${b.items.length}`, b.status.toUpperCase(), `$${b.total.toLocaleString()}`];
        }),
        theme: 'plain',
        headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 248, 246] },
      });
    } else if (section === 'rentals') {
      drawHeader('Rentas', 'Contratos Activos');
      const totalRevenue = rentals.reduce((s, r) => s + r.total, 0);
      doc.autoTable({
        startY: 75,
        head: [['N°', 'Cliente', 'Inicio', 'Devolución', 'Días', 'Estado', 'Total']],
        body: rentals.map(r => [`#${r.id.toString().padStart(3, '0')}`, r.client, formatDate(r.startDate), formatDate(r.endDate), daysBetween(r.startDate, r.endDate).toString(), r.status.toUpperCase(), `$${r.total.toLocaleString()}`]),
        foot: [['', '', '', '', '', 'TOTAL', `$${totalRevenue.toLocaleString()}`]],
        theme: 'plain',
        headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        footStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9, cellPadding: 4 },
        alternateRowStyles: { fillColor: [248, 248, 246] },
      });
    } else if (section === 'calendar') {
      drawHeader('Calendario', 'Rentas Programadas');
      const sorted = [...rentals].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      doc.autoTable({
        startY: 75,
        head: [['N°', 'Cliente', 'Inicio', 'Devolución', 'Días', 'Estado', 'Total']],
        body: sorted.map(r => [`#${r.id.toString().padStart(3, '0')}`, r.client, formatDate(r.startDate), formatDate(r.endDate), daysBetween(r.startDate, r.endDate).toString(), r.status.toUpperCase(), `$${r.total.toLocaleString()}`]),
        theme: 'plain',
        headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9, cellPadding: 4 },
        alternateRowStyles: { fillColor: [248, 248, 246] },
      });
    }
    drawFooter();
    doc.save(`rent-r_${section}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <style>{`
        * { -webkit-font-smoothing: antialiased; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        .logo-font { font-weight: 900; letter-spacing: -0.04em; }
        .display-font { font-weight: 300; letter-spacing: -0.02em; }
        .display-bold { font-weight: 700; letter-spacing: -0.02em; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 3px; }
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="flex h-screen overflow-hidden">
        <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
          <div className="p-8 border-b border-stone-100">
            <div className="logo-font text-4xl text-stone-900 leading-none">rent<span className="text-stone-400">-</span>r</div>
            <div className="text-[10px] tracking-[0.3em] text-stone-400 mt-2 uppercase">Equipment CRM</div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Eye },
              { id: 'inventory', label: 'Inventario', icon: Package },
              { id: 'clients', label: 'Clientes', icon: Users },
              { id: 'budgets', label: 'Presupuestos', icon: FileText },
              { id: 'rentals', label: 'Rentas', icon: ClipboardList },
              { id: 'calendar', label: 'Calendario', icon: Calendar },
            ].map(item => {
              const Icon = item.icon;
              const showBadge = item.id === 'rentals' && alerts.length > 0;
              return (
                <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${activeSection === item.id ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-50'}`}>
                  <Icon size={16} strokeWidth={1.5} />
                  <span className="font-medium">{item.label}</span>
                  {showBadge && <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{alerts.length}</span>}
                  {activeSection === item.id && !showBadge && <ChevronRight size={14} className="ml-auto" />}
                </button>
              );
            })}
          </nav>
          <div className="p-6 border-t border-stone-100">
            <div className="text-[10px] tracking-widest text-stone-400 uppercase">v2.0 — 2026</div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {/* ============ DASHBOARD ============ */}
          {activeSection === 'dashboard' && (
            <div className="p-12 fade-in">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <div className="text-[10px] tracking-[0.3em] text-stone-400 uppercase mb-3">Vista General</div>
                  <h1 className="display-font text-6xl text-stone-900">Dashboard</h1>
                </div>
                <button onClick={() => generatePDF('dashboard')} className="border border-stone-300 px-5 py-3 text-sm hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all flex items-center gap-2">
                  <Download size={14} strokeWidth={1.5} />Exportar PDF
                </button>
              </div>

              {/* ALERTAS */}
              {alerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-6 mb-8 slide-up">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle size={20} className="text-red-600" />
                    <h2 className="display-bold text-lg text-red-900">
                      {alerts.length} {alerts.length === 1 ? 'renta requiere atención' : 'rentas requieren atención'}
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {alerts.map(alert => (
                      <div key={alert.id} className="flex items-center justify-between bg-white px-4 py-3 border border-red-100">
                        <div>
                          <div className="font-medium text-stone-900">{alert.client}</div>
                          <div className="text-xs text-stone-500 mt-1">
                            Renta #{alert.id.toString().padStart(3, '0')} · Devolución: {formatDate(alert.endDate)}
                          </div>
                        </div>
                        <div className={`text-xs tracking-widest uppercase px-3 py-1 ${alert.daysLeft < 0 ? 'bg-red-600 text-white' : alert.daysLeft === 0 ? 'bg-orange-500 text-white' : 'bg-yellow-100 text-yellow-900'}`}>
                          {alert.daysLeft < 0 ? `Vencida hace ${Math.abs(alert.daysLeft)} día${Math.abs(alert.daysLeft) > 1 ? 's' : ''}` : alert.daysLeft === 0 ? 'Vence hoy' : `Vence mañana`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-6 gap-px bg-stone-200 mb-12">
                {[
                  { label: 'Total Piezas', value: stats.totalItems, sub: 'en inventario' },
                  { label: 'Disponibles', value: stats.available, sub: 'listas' },
                  { label: 'Rentadas', value: stats.rented, sub: 'actualmente' },
                  { label: 'Clientes', value: stats.totalClients, sub: 'registrados' },
                  { label: 'Rentas', value: stats.activeRentals, sub: 'activas' },
                  { label: 'Alertas', value: stats.alerts, sub: 'devoluciones' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-6">
                    <div className="text-[9px] tracking-[0.2em] text-stone-400 uppercase mb-3">{stat.label}</div>
                    <div className="display-font text-4xl text-stone-900 mb-1">{stat.value}</div>
                    <div className="text-xs text-stone-500">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6">
                {[
                  { id: 'maquinaria', label: 'Maquinaria', icon: HardHat, count: inventory.filter(i => i.category === 'maquinaria').length },
                  { id: 'equipo', label: 'Equipo', icon: Package, count: inventory.filter(i => i.category === 'equipo').length },
                  { id: 'herramienta', label: 'Herramienta', icon: Wrench, count: inventory.filter(i => i.category === 'herramienta').length },
                ].map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button key={cat.id} onClick={() => { setActiveSection('inventory'); setInventoryFilter(cat.id); }} className="bg-white border border-stone-200 p-8 text-left hover:border-stone-900 transition-all group">
                      <Icon size={28} strokeWidth={1.2} className="text-stone-900 mb-6" />
                      <div className="display-font text-3xl text-stone-900 mb-2">{cat.label}</div>
                      <div className="text-sm text-stone-500 flex items-center justify-between">
                        <span>{cat.count} tipos registrados</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============ INVENTARIO ============ */}
          {activeSection === 'inventory' && (
            <div className="p-12 fade-in">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <div className="text-[10px] tracking-[0.3em] text-stone-400 uppercase mb-3">Control de Activos</div>
                  <h1 className="display-font text-6xl text-stone-900">Inventario</h1>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => generatePDF('inventory')} className="border border-stone-300 px-5 py-3 text-sm hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all flex items-center gap-2">
                    <Download size={14} />Exportar PDF
                  </button>
                  <button onClick={() => { setEditingItem({}); setShowInventoryModal(true); }} className="bg-stone-900 text-white px-6 py-3 text-sm font-medium hover:bg-stone-700 transition-colors flex items-center gap-2">
                    <Plus size={16} />Nuevo Artículo
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-px bg-stone-200 mb-6 w-fit">
                {[{ id: 'all', label: 'Todo' }, { id: 'maquinaria', label: 'Maquinaria' }, { id: 'equipo', label: 'Equipo' }, { id: 'herramienta', label: 'Herramienta' }].map(filter => (
                  <button key={filter.id} onClick={() => setInventoryFilter(filter.id)} className={`px-6 py-3 text-xs tracking-wider uppercase ${inventoryFilter === filter.id ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}>{filter.label}</button>
                ))}
              </div>
              <div className="mb-8 relative max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 text-sm focus:outline-none focus:border-stone-900" />
              </div>
              <div className="grid grid-cols-3 gap-6">
                {filteredInventory.map(item => (
                  <div key={item.id} className="bg-white border border-stone-200 overflow-hidden hover:border-stone-900 transition-all slide-up">
                    <div className="aspect-[4/3] bg-stone-100 relative">
                      {item.photo ? <img src={item.photo} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-300"><Camera size={32} strokeWidth={1} /></div>}
                      <div className={`absolute top-3 right-3 px-3 py-1 text-[10px] tracking-widest uppercase ${item.available > 0 ? 'bg-white text-stone-900' : 'bg-stone-900 text-white'}`}>{item.available > 0 ? 'Disponible' : 'Rentada'}</div>
                      <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 text-[10px] tracking-widest uppercase text-stone-600">{item.category}</div>
                    </div>
                    <div className="p-6">
                      <h3 className="display-bold text-xl text-stone-900 mb-2">{item.name}</h3>
                      <p className="text-xs text-stone-500 mb-4">{item.description}</p>
                      <div className="flex items-center gap-1 text-xs text-stone-600 mb-4"><MapPin size={12} /><span>{item.location}</span></div>
                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div className="bg-stone-50 py-2"><div className="display-bold text-lg">{item.quantity}</div><div className="text-[9px] tracking-widest text-stone-400 uppercase">Total</div></div>
                        <div className="bg-stone-50 py-2"><div className="display-bold text-lg">{item.available}</div><div className="text-[9px] tracking-widest text-stone-400 uppercase">Disp.</div></div>
                        <div className="bg-stone-50 py-2"><div className="display-bold text-lg">{item.rented}</div><div className="text-[9px] tracking-widest text-stone-400 uppercase">Rent.</div></div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                        <div>
                          <div className="text-[10px] tracking-widest text-stone-400 uppercase">Precio/día</div>
                          <div className="display-bold text-lg">${item.price.toLocaleString()}</div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingItem(item); setShowInventoryModal(true); }} className="p-2 hover:bg-stone-100"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteItem(item.id)} className="p-2 hover:bg-stone-100"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ CLIENTES ============ */}
          {activeSection === 'clients' && (
            <div className="p-12 fade-in">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <div className="text-[10px] tracking-[0.3em] text-stone-400 uppercase mb-3">Directorio</div>
                  <h1 className="display-font text-6xl text-stone-900">Clientes</h1>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => generatePDF('clients')} className="border border-stone-300 px-5 py-3 text-sm hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all flex items-center gap-2">
                    <Download size={14} />Exportar PDF
                  </button>
                  <button onClick={() => { setEditingClient({ name: '', contact: '', email: '', phone: '', rfc: '', address: '', type: 'empresa', notes: '' }); setShowClientModal(true); }} className="bg-stone-900 text-white px-6 py-3 text-sm font-medium hover:bg-stone-700 transition-colors flex items-center gap-2">
                    <Plus size={16} />Nuevo Cliente
                  </button>
                </div>
              </div>
              <div className="mb-8 relative max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="text" placeholder="Buscar cliente..." value={clientSearchQuery} onChange={(e) => setClientSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 text-sm focus:outline-none focus:border-stone-900" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                {filteredClients.map(client => {
                  const cstats = getClientStats(client.id);
                  return (
                    <div key={client.id} className="bg-white border border-stone-200 p-8 hover:border-stone-900 transition-all slide-up group">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-stone-900 text-white flex items-center justify-center">
                            {client.type === 'empresa' ? <Building2 size={20} /> : <User size={20} />}
                          </div>
                          <div>
                            <div className="text-[10px] tracking-widest text-stone-400 uppercase mb-1">{client.type === 'empresa' ? 'Empresa' : 'Persona Física'}</div>
                            <h3 className="display-bold text-xl text-stone-900">{client.name}</h3>
                            <div className="text-sm text-stone-500 mt-1">{client.contact}</div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingClient(client); setShowClientModal(true); }} className="p-2 hover:bg-stone-100"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteClient(client.id)} className="p-2 hover:bg-stone-100"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div className="space-y-2 mb-6 text-sm">
                        {client.email && <div className="flex items-center gap-3 text-stone-600"><Mail size={13} className="text-stone-400" /><span>{client.email}</span></div>}
                        {client.phone && <div className="flex items-center gap-3 text-stone-600"><Phone size={13} className="text-stone-400" /><span>{client.phone}</span></div>}
                        {client.address && <div className="flex items-start gap-3 text-stone-600"><MapPin size={13} className="text-stone-400 mt-1" /><span>{client.address}</span></div>}
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-100 text-center">
                        <div><div className="display-bold text-lg">{cstats.budgets}</div><div className="text-[9px] tracking-widest text-stone-400 uppercase">Presup.</div></div>
                        <div><div className="display-bold text-lg">{cstats.rentals}</div><div className="text-[9px] tracking-widest text-stone-400 uppercase">Rentas</div></div>
                        <div><div className="display-bold text-lg">${cstats.total.toLocaleString()}</div><div className="text-[9px] tracking-widest text-stone-400 uppercase">Total</div></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============ PRESUPUESTOS ============ */}
          {activeSection === 'budgets' && (
            <div className="p-12 fade-in">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <div className="text-[10px] tracking-[0.3em] text-stone-400 uppercase mb-3">Cotizaciones</div>
                  <h1 className="display-font text-6xl text-stone-900">Presupuestos</h1>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => generatePDF('budgets')} className="border border-stone-300 px-5 py-3 text-sm hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all flex items-center gap-2">
                    <Download size={14} />Exportar PDF
                  </button>
                  <button onClick={() => { setEditingBudget({ clientId: null, startDate: new Date().toISOString().split('T')[0], endDate: addDays(new Date().toISOString().split('T')[0], 7), items: [], total: 0, status: 'borrador', notes: '' }); setShowBudgetModal(true); }} className="bg-stone-900 text-white px-6 py-3 text-sm font-medium hover:bg-stone-700 transition-colors flex items-center gap-2">
                    <Plus size={16} />Nuevo Presupuesto
                  </button>
                </div>
              </div>
              <div className="bg-white border border-stone-200">
                {budgets.length === 0 ? (
                  <div className="py-24 text-center text-stone-400">
                    <FileText size={40} strokeWidth={1} className="mx-auto mb-4" />
                    <div className="text-sm">No hay presupuestos. Crea uno nuevo.</div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-12 gap-3 px-8 py-4 border-b border-stone-100 text-[10px] tracking-widest uppercase text-stone-400">
                      <div className="col-span-1">N°</div>
                      <div className="col-span-3">Cliente</div>
                      <div className="col-span-2">Inicio</div>
                      <div className="col-span-2">Fin</div>
                      <div className="col-span-1">Días</div>
                      <div className="col-span-1">Total</div>
                      <div className="col-span-1">Estado</div>
                      <div className="col-span-1 text-right">Acc.</div>
                    </div>
                    {budgets.map(budget => {
                      const client = clients.find(c => c.id === budget.clientId);
                      return (
                        <div key={budget.id} className="grid grid-cols-12 gap-3 px-8 py-5 border-b border-stone-50 hover:bg-stone-50 items-center">
                          <div className="col-span-1 display-bold text-lg">#{budget.id.toString().padStart(3, '0')}</div>
                          <div className="col-span-3 font-medium">{client?.name || 'Sin cliente'}</div>
                          <div className="col-span-2 text-sm text-stone-600">{formatDate(budget.startDate)}</div>
                          <div className="col-span-2 text-sm text-stone-600">{formatDate(budget.endDate)}</div>
                          <div className="col-span-1 text-sm">{budget.startDate && budget.endDate ? `${daysBetween(budget.startDate, budget.endDate)}d` : '-'}</div>
                          <div className="col-span-1 display-bold text-sm">${budget.total.toLocaleString()}</div>
                          <div className="col-span-1"><span className={`text-[10px] tracking-widest uppercase px-2 py-1 ${budget.status === 'validado' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'}`}>{budget.status}</span></div>
                          <div className="col-span-1 flex justify-end gap-1">
                            {budget.status === 'borrador' && (
                              <>
                                <button onClick={() => handleValidateBudget(budget)} className="p-2 hover:bg-stone-100 text-green-700"><Check size={14} strokeWidth={2} /></button>
                                <button onClick={() => { setEditingBudget(budget); setShowBudgetModal(true); }} className="p-2 hover:bg-stone-100"><Edit2 size={14} /></button>
                              </>
                            )}
                            <button onClick={() => handleDeleteBudget(budget.id)} className="p-2 hover:bg-stone-100"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ============ RENTAS ============ */}
          {activeSection === 'rentals' && (
            <div className="p-12 fade-in">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <div className="text-[10px] tracking-[0.3em] text-stone-400 uppercase mb-3">Contratos</div>
                  <h1 className="display-font text-6xl text-stone-900">Rentas</h1>
                </div>
                <button onClick={() => generatePDF('rentals')} className="border border-stone-300 px-5 py-3 text-sm hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all flex items-center gap-2">
                  <Download size={14} />Exportar PDF
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {rentals.length === 0 ? (
                  <div className="col-span-2 py-24 text-center text-stone-400 bg-white border border-stone-200">
                    <ClipboardList size={40} strokeWidth={1} className="mx-auto mb-4" />
                    <div className="text-sm">No hay rentas activas.</div>
                    <div className="text-xs mt-2">Valida un presupuesto para crear una renta.</div>
                  </div>
                ) : rentals.map(rental => {
                  const daysLeft = rental.endDate ? daysUntil(rental.endDate) : null;
                  const isUrgent = daysLeft !== null && daysLeft <= 1 && rental.status === 'activa';
                  return (
                    <div key={rental.id} className={`bg-white border p-8 slide-up ${isUrgent ? 'border-red-300' : 'border-stone-200'}`}>
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="text-[10px] tracking-widest text-stone-400 uppercase mb-2">Renta #{rental.id.toString().padStart(3, '0')}</div>
                          <h3 className="display-bold text-2xl">{rental.client}</h3>
                          <div className="text-xs text-stone-500 mt-2 space-y-1">
                            <div>📅 Inicio: {formatDate(rental.startDate)}</div>
                            <div>🏁 Devolución: {formatDate(rental.endDate)}</div>
                            <div>⏱️ {daysBetween(rental.startDate, rental.endDate)} días</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[10px] tracking-widest uppercase px-2 py-1 ${rental.status === 'cerrada' ? 'bg-stone-200 text-stone-600' : 'bg-green-100 text-green-800'}`}>{rental.status}</span>
                          {isUrgent && (
                            <span className="text-[10px] tracking-widest uppercase px-2 py-1 bg-red-100 text-red-700 flex items-center gap-1">
                              <Bell size={10} />
                              {daysLeft < 0 ? `Vencida ${Math.abs(daysLeft)}d` : daysLeft === 0 ? 'Vence hoy' : 'Vence mañana'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-stone-100 pt-4 mb-4">
                        <div className="text-[10px] tracking-widest text-stone-400 uppercase mb-3">Artículos</div>
                        <div className="space-y-2">
                          {rental.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="text-stone-700">{item.name} × {item.quantity}</span>
                              <span className="font-medium">${(item.price * item.quantity * (item.days || 1)).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-stone-100 pt-4 flex items-center justify-between">
                        <div className="text-[10px] tracking-widest text-stone-400 uppercase">Total</div>
                        <div className="display-bold text-3xl">${rental.total.toLocaleString()}</div>
                      </div>
                      {rental.status === 'activa' && (
                        <button onClick={() => handleCloseRental(rental)} className="w-full mt-4 py-2 border border-stone-300 text-sm hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all">
                          Cerrar renta y devolver artículos
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============ CALENDARIO ============ */}
          {activeSection === 'calendar' && (
            <CalendarView rentals={rentals} clients={clients} onExportPDF={() => generatePDF('calendar')} />
          )}
        </main>
      </div>

      {showInventoryModal && <InventoryModal item={editingItem} onSave={handleSaveItem} onClose={() => { setShowInventoryModal(false); setEditingItem(null); }} />}
      {showClientModal && <ClientModal client={editingClient} onSave={handleSaveClient} onClose={() => { setShowClientModal(false); setEditingClient(null); }} />}
      {showBudgetModal && <BudgetModal budget={editingBudget} inventory={inventory} clients={clients} onSave={handleSaveBudget} onClose={() => { setShowBudgetModal(false); setEditingBudget(null); }} />}
    </div>
  );
}

// ============ COMPONENTE CALENDARIO ============
function CalendarView({ rentals, clients, onExportPDF }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Lunes = 0, Domingo = 6 (semana europea)
  let firstDayWeekday = firstDay.getDay() - 1;
  if (firstDayWeekday < 0) firstDayWeekday = 6;
  
  const daysInMonth = lastDay.getDate();
  const monthName = currentMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  
  const days = [];
  for (let i = 0; i < firstDayWeekday; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  
  const getRentalsForDay = (day) => {
    if (!day) return { starting: [], ending: [], active: [] };
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const starting = rentals.filter(r => r.startDate === dateStr);
    const ending = rentals.filter(r => r.endDate === dateStr);
    const active = rentals.filter(r => r.startDate && r.endDate && r.startDate < dateStr && r.endDate > dateStr);
    return { starting, ending, active };
  };
  
  const today = new Date();
  const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  
  return (
    <div className="p-12 fade-in">
      <div className="flex items-end justify-between mb-12">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-stone-400 uppercase mb-3">Programación</div>
          <h1 className="display-font text-6xl text-stone-900">Calendario</h1>
        </div>
        <button onClick={onExportPDF} className="border border-stone-300 px-5 py-3 text-sm hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all flex items-center gap-2">
          <Download size={14} />Exportar PDF
        </button>
      </div>
      
      <div className="bg-white border border-stone-200">
        {/* Navegación de mes */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-stone-100">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-2 hover:bg-stone-100">
            <ChevronLeft size={20} />
          </button>
          <h2 className="display-font text-3xl text-stone-900 capitalize">{monthName}</h2>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-2 hover:bg-stone-100">
            <ChevronRight size={20} />
          </button>
        </div>
        
        {/* Leyenda */}
        <div className="flex items-center gap-6 px-8 py-3 bg-stone-50 border-b border-stone-100 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500"></div>
            <span className="text-stone-600">Inicia renta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500"></div>
            <span className="text-stone-600">Devolución</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-stone-300"></div>
            <span className="text-stone-600">En curso</span>
          </div>
        </div>
        
        {/* Encabezado días de semana */}
        <div className="grid grid-cols-7 border-b border-stone-100">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="px-3 py-3 text-[10px] tracking-widest uppercase text-stone-400 text-center border-r border-stone-100 last:border-r-0">
              {d}
            </div>
          ))}
        </div>
        
        {/* Grid del calendario */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayRentals = getRentalsForDay(day);
            const hasEvents = day && (dayRentals.starting.length > 0 || dayRentals.ending.length > 0 || dayRentals.active.length > 0);
            
            return (
              <div key={idx} className={`min-h-[110px] p-2 border-r border-b border-stone-100 last:border-r-0 ${!day ? 'bg-stone-50/50' : ''} ${isToday(day) ? 'bg-yellow-50' : ''}`}>
                {day && (
                  <>
                    <div className={`text-xs mb-2 ${isToday(day) ? 'display-bold text-stone-900' : 'text-stone-500'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayRentals.starting.map(r => {
                        const client = clients.find(c => c.id === r.clientId);
                        return (
                          <div key={`s-${r.id}`} className="text-[10px] bg-green-100 text-green-900 px-2 py-1 truncate" title={`Inicia: ${client?.name}`}>
                            ▶ {client?.name?.split(' ')[0] || r.client}
                          </div>
                        );
                      })}
                      {dayRentals.ending.map(r => {
                        const client = clients.find(c => c.id === r.clientId);
                        return (
                          <div key={`e-${r.id}`} className="text-[10px] bg-red-100 text-red-900 px-2 py-1 truncate" title={`Devuelve: ${client?.name}`}>
                            ◀ {client?.name?.split(' ')[0] || r.client}
                          </div>
                        );
                      })}
                      {dayRentals.active.length > 0 && (
                        <div className="text-[10px] bg-stone-100 text-stone-600 px-2 py-1">
                          {dayRentals.active.length} activa{dayRentals.active.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Lista de rentas del mes */}
      <div className="mt-8 bg-white border border-stone-200">
        <div className="px-8 py-6 border-b border-stone-100">
          <h2 className="display-font text-2xl text-stone-900">Rentas en {monthName}</h2>
        </div>
        <div className="divide-y divide-stone-100">
          {rentals.filter(r => {
            if (!r.startDate || !r.endDate) return false;
            const s = new Date(r.startDate);
            const e = new Date(r.endDate);
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);
            return (s <= monthEnd && e >= monthStart);
          }).map(r => {
            const client = clients.find(c => c.id === r.clientId);
            return (
              <div key={r.id} className="px-8 py-4 flex items-center justify-between hover:bg-stone-50">
                <div className="flex-1">
                  <div className="font-medium text-stone-900">{client?.name || r.client}</div>
                  <div className="text-xs text-stone-500 mt-1">
                    Renta #{r.id.toString().padStart(3, '0')} · {formatDate(r.startDate)} → {formatDate(r.endDate)} · {daysBetween(r.startDate, r.endDate)} días
                  </div>
                </div>
                <div className="display-bold text-lg">${r.total.toLocaleString()}</div>
              </div>
            );
          })}
          {rentals.filter(r => {
            if (!r.startDate || !r.endDate) return false;
            const s = new Date(r.startDate);
            const e = new Date(r.endDate);
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);
            return (s <= monthEnd && e >= monthStart);
          }).length === 0 && (
            <div className="px-8 py-12 text-center text-stone-400 text-sm">
              Sin rentas en este mes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ MODAL INVENTARIO ============
function InventoryModal({ item, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: item?.name || '', category: item?.category || 'maquinaria',
    quantity: item?.quantity || 1, available: item?.available !== undefined ? item.available : (item?.quantity || 1),
    rented: item?.rented || 0, location: item?.location || '',
    status: item?.status || 'disponible', photo: item?.photo || null,
    price: item?.price || 0, description: item?.description || '',
  });
  const fileInputRef = useRef(null);
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onload = (ev) => setFormData({ ...formData, photo: ev.target.result }); reader.readAsDataURL(file); }
  };
  const handleSubmit = () => {
    if (!formData.name || !formData.location) { alert('Completa nombre y ubicación'); return; }
    onSave({ ...formData, quantity: parseInt(formData.quantity) || 0, available: parseInt(formData.available) || 0, rented: parseInt(formData.rented) || 0, price: parseFloat(formData.price) || 0 });
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="display-font text-3xl">{item?.id ? 'Editar' : 'Nuevo'} Artículo</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-3">Fotografía</label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden">
                {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : <Camera size={28} strokeWidth={1} className="text-stone-300" />}
              </div>
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 border border-stone-300 text-sm hover:bg-stone-50"><Upload size={14} />Subir foto</button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Nombre</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Categoría</label>
            <div className="grid grid-cols-3 gap-px bg-stone-200">
              {['maquinaria', 'equipo', 'herramienta'].map(cat => (
                <button key={cat} onClick={() => setFormData({ ...formData, category: cat })} className={`py-3 text-xs tracking-widest uppercase ${formData.category === cat ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}>{cat}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Descripción</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 resize-none" rows={2} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Total piezas</label>
              <input type="number" min="0" value={formData.quantity} onChange={(e) => { const q = parseInt(e.target.value) || 0; setFormData({ ...formData, quantity: q, available: Math.max(0, q - formData.rented) }); }} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Disponibles</label>
              <input type="number" min="0" value={formData.available} onChange={(e) => setFormData({ ...formData, available: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Rentadas</label>
              <input type="number" min="0" value={formData.rented} onChange={(e) => setFormData({ ...formData, rented: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Ubicación</label>
            <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Precio/día (MXN)</label>
            <input type="number" min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" />
          </div>
        </div>
        <div className="px-8 py-6 border-t border-stone-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-6 py-3 border border-stone-300 text-sm hover:bg-stone-50">Cancelar</button>
          <button onClick={handleSubmit} className="px-6 py-3 bg-stone-900 text-white text-sm hover:bg-stone-700">Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ============ MODAL CLIENTE ============
function ClientModal({ client, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: client?.name || '', contact: client?.contact || '', email: client?.email || '',
    phone: client?.phone || '', rfc: client?.rfc || '', address: client?.address || '',
    type: client?.type || 'empresa', notes: client?.notes || '',
  });
  const handleSubmit = () => {
    if (!formData.name) { alert('El nombre es obligatorio'); return; }
    onSave(formData);
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="display-font text-3xl">{client?.id ? 'Editar' : 'Nuevo'} Cliente</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Tipo</label>
            <div className="grid grid-cols-2 gap-px bg-stone-200">
              {[{ id: 'empresa', label: 'Empresa', icon: Building2 }, { id: 'persona', label: 'Persona Física', icon: User }].map(t => {
                const Icon = t.icon;
                return <button key={t.id} onClick={() => setFormData({ ...formData, type: t.id })} className={`py-3 flex items-center justify-center gap-2 text-xs tracking-widest uppercase ${formData.type === t.id ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-50'}`}><Icon size={14} />{t.label}</button>;
              })}
            </div>
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Nombre</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" />
          </div>
          {formData.type === 'empresa' && (
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Contacto</label>
              <input type="text" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Teléfono</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">RFC</label>
            <input type="text" value={formData.rfc} onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 uppercase" maxLength={13} />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Dirección</label>
            <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 resize-none" rows={2} />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Notas</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 resize-none" rows={3} />
          </div>
        </div>
        <div className="px-8 py-6 border-t border-stone-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-6 py-3 border border-stone-300 text-sm hover:bg-stone-50">Cancelar</button>
          <button onClick={handleSubmit} className="px-6 py-3 bg-stone-900 text-white text-sm hover:bg-stone-700">Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ============ MODAL PRESUPUESTO ============
function BudgetModal({ budget, inventory, clients, onSave, onClose }) {
  const [formData, setFormData] = useState({
    clientId: budget?.clientId || null,
    startDate: budget?.startDate || new Date().toISOString().split('T')[0],
    endDate: budget?.endDate || addDays(new Date().toISOString().split('T')[0], 7),
    items: budget?.items || [],
    total: budget?.total || 0,
    status: budget?.status || 'borrador',
    notes: budget?.notes || '',
  });
  const [showSelector, setShowSelector] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);

  const days = daysBetween(formData.startDate, formData.endDate);

  useEffect(() => {
    const newItems = formData.items.map(item => ({ ...item, days: days }));
    const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity * (item.days || 1)), 0);
    setFormData(f => ({ ...f, items: newItems, total }));
  }, [formData.startDate, formData.endDate]);

  useEffect(() => {
    const total = formData.items.reduce((sum, item) => sum + (item.price * item.quantity * (item.days || 1)), 0);
    setFormData(f => ({ ...f, total }));
  }, [formData.items.length]);

  const selectedClient = clients.find(c => c.id === formData.clientId);

  const addItemFromInventory = (invItem) => {
    setFormData({ ...formData, items: [...formData.items, { itemId: invItem.id, name: invItem.name, category: invItem.category, price: invItem.price, quantity: 1, days: days, maxAvailable: invItem.available }] });
    setShowSelector(false);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: parseFloat(value) || 0 };
    const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity * (item.days || 1)), 0);
    setFormData({ ...formData, items: newItems, total });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity * (item.days || 1)), 0);
    setFormData({ ...formData, items: newItems, total });
  };

  const handleSubmit = () => {
    if (!formData.clientId) { alert('Selecciona un cliente'); return; }
    if (!formData.startDate || !formData.endDate) { alert('Define las fechas'); return; }
    if (new Date(formData.endDate) < new Date(formData.startDate)) { alert('La fecha de devolución debe ser después del inicio'); return; }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="display-font text-3xl">{budget?.id ? 'Editar' : 'Nuevo'} Presupuesto</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Cliente</label>
            <button onClick={() => setShowClientPicker(true)} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm text-left hover:border-stone-900 flex items-center justify-between">
              {selectedClient ? <span className="font-medium">{selectedClient.name}</span> : <span className="text-stone-400">Seleccionar cliente...</span>}
              <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">📅 Fecha de inicio</label>
              <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">🏁 Fecha de devolución</label>
              <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} min={formData.startDate} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">⏱️ Duración</label>
              <div className="w-full px-4 py-3 bg-stone-900 text-white text-sm display-bold">
                {days} {days === 1 ? 'día' : 'días'}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-[10px] tracking-[0.2em] text-stone-400 uppercase">Artículos</label>
              <button onClick={() => setShowSelector(true)} className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-xs hover:bg-stone-700"><Plus size={14} />Agregar del inventario</button>
            </div>
            {formData.items.length === 0 ? (
              <div className="bg-stone-50 border border-dashed border-stone-300 py-12 text-center text-stone-400 text-sm">Sin artículos.</div>
            ) : (
              <div className="border border-stone-200">
                <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-stone-50 border-b border-stone-200 text-[10px] tracking-widest uppercase text-stone-400">
                  <div className="col-span-5">Artículo</div>
                  <div className="col-span-2">Cant.</div>
                  <div className="col-span-2">Precio/día</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                  <div className="col-span-1"></div>
                </div>
                {formData.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-stone-100 items-center">
                    <div className="col-span-5">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-[10px] text-stone-400 uppercase tracking-wider">{item.category} · {days} días</div>
                    </div>
                    <div className="col-span-2">
                      <input type="number" min="1" max={item.maxAvailable} value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} className="w-full px-2 py-1 bg-stone-50 border border-stone-200 text-sm" />
                      <div className="text-[10px] text-stone-400">Máx: {item.maxAvailable}</div>
                    </div>
                    <div className="col-span-2">
                      <input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateItem(idx, 'price', e.target.value)} className="w-full px-2 py-1 bg-stone-50 border border-stone-200 text-sm" />
                    </div>
                    <div className="col-span-2 display-bold text-sm text-right">${(item.price * item.quantity * (item.days || 1)).toLocaleString()}</div>
                    <div className="col-span-1 text-right"><button onClick={() => removeItem(idx)} className="p-1 hover:bg-stone-100"><Trash2 size={14} /></button></div>
                  </div>
                ))}
                <div className="px-4 py-4 bg-stone-50 flex justify-between items-center">
                  <div className="text-[10px] tracking-widest text-stone-400 uppercase">Total ({days} días)</div>
                  <div className="display-bold text-3xl">${formData.total.toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-2">Notas</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 resize-none" rows={3} />
          </div>
        </div>
        <div className="px-8 py-6 border-t border-stone-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-6 py-3 border border-stone-300 text-sm hover:bg-stone-50">Cancelar</button>
          <button onClick={handleSubmit} className="px-6 py-3 bg-stone-900 text-white text-sm hover:bg-stone-700">Guardar</button>
        </div>
        {showSelector && <ItemSelector inventory={inventory.filter(i => i.available > 0)} onSelect={addItemFromInventory} onClose={() => setShowSelector(false)} />}
        {showClientPicker && <ClientPicker clients={clients} onSelect={(c) => { setFormData({ ...formData, clientId: c.id }); setShowClientPicker(false); }} onClose={() => setShowClientPicker(false)} />}
      </div>
    </div>
  );
}

function ItemSelector({ inventory, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="display-font text-2xl">Seleccionar Artículo</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100"><X size={20} /></button>
        </div>
        <div className="p-8">
          <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm mb-4 focus:outline-none focus:border-stone-900" />
          <div className="space-y-2">
            {filtered.map(item => (
              <button key={item.id} onClick={() => onSelect(item)} className="w-full flex items-center gap-4 p-4 border border-stone-200 hover:border-stone-900 text-left">
                <div className="w-16 h-16 bg-stone-100 flex items-center justify-center">
                  {item.photo ? <img src={item.photo} className="w-full h-full object-cover" /> : <Camera size={20} className="text-stone-300" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-stone-500 mt-1">{item.category} · {item.available} disponibles · {item.location}</div>
                </div>
                <div className="text-right">
                  <div className="display-bold text-lg">${item.price.toLocaleString()}</div>
                  <div className="text-[10px] text-stone-400 uppercase">por día</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientPicker({ clients, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="display-font text-2xl">Seleccionar Cliente</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100"><X size={20} /></button>
        </div>
        <div className="p-8">
          <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus className="w-full px-4 py-3 bg-stone-50 border border-stone-200 text-sm mb-4 focus:outline-none focus:border-stone-900" />
          <div className="space-y-2">
            {filtered.map(client => (
              <button key={client.id} onClick={() => onSelect(client)} className="w-full flex items-center gap-4 p-4 border border-stone-200 hover:border-stone-900 text-left">
                <div className="w-10 h-10 bg-stone-900 text-white flex items-center justify-center">
                  {client.type === 'empresa' ? <Building2 size={16} /> : <User size={16} />}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{client.name}</div>
                  <div className="text-xs text-stone-500 mt-1">{client.contact} · {client.email}</div>
                </div>
                <ChevronRight size={16} className="text-stone-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
