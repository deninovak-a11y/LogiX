import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const api = axios.create({
  baseURL: 'http://localhost:4000/api'
});

const defaultForm = {
  customer_id: '',
  title: '',
  order_date: new Date().toISOString().slice(0, 10),
  pickup_address: '',
  delivery_address: '',
  pickup_lat: 48.2082,
  pickup_lng: 16.3738,
  delivery_lat: 48.2082,
  delivery_lng: 16.3738,
  weight: 500,
  volume: 6,
  priority: 'normal'
};

const defaultCustomerForm = {
  name: '',
  contact_person: '',
  phone: '',
  email: ''
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('logixToken') || '');
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tours, setTours] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [orderForm, setOrderForm] = useState(defaultForm);
  const [customerForm, setCustomerForm] = useState(defaultCustomerForm);
  const [loginForm, setLoginForm] = useState({ email: 'admin@logix.local', password: 'admin123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      loadAllData();
    }
  }, [token]);

  const mapOrders = useMemo(
    () => orders.filter((order) => order.delivery_lat && order.delivery_lng),
    [orders]
  );

  async function loadAllData() {
    try {
      const [userRes, customersRes, ordersRes, driversRes, vehicleRes, toursRes, dashboardRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/customers'),
        api.get('/orders'),
        api.get('/drivers'),
        api.get('/vehicles'),
        api.get('/tours'),
        api.get('/dashboard')
      ]);

      setUser(userRes.data.user);
      setCustomers(customersRes.data);
      setOrders(ordersRes.data);
      setDrivers(driversRes.data);
      setVehicles(vehicleRes.data);
      setTours(toursRes.data);
      setDashboard(dashboardRes.data);
    } catch (loadError) {
      console.error(loadError);
      setError('Session expired or backend unavailable.');
      logout();
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', loginForm);
      const nextToken = response.data.token;
      localStorage.setItem('logixToken', nextToken);
      setToken(nextToken);
      api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
      setUser(response.data.user);
    } catch (loginError) {
      setError(loginError.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('logixToken');
    delete api.defaults.headers.common.Authorization;
    setToken('');
    setUser(null);
    setCustomers([]);
    setOrders([]);
    setDrivers([]);
    setVehicles([]);
    setTours([]);
    setDashboard(null);
  }

  async function handleCreateCustomer(event) {
    event.preventDefault();
    setError('');

    try {
      const response = await api.post('/customers', customerForm);
      setCustomers((current) => [response.data, ...current]);
      setOrderForm((current) => ({ ...current, customer_id: response.data.id }));
      setCustomerForm(defaultCustomerForm);
    } catch (createError) {
      setError(createError.response?.data?.message || 'Customer could not be created');
    }
  }

  async function handleCreateOrder(event) {
    event.preventDefault();
    setError('');

    try {
      await api.post('/orders', {
        ...orderForm,
        customer_id: orderForm.customer_id || null,
        weight: Number(orderForm.weight),
        volume: Number(orderForm.volume),
        pickup_lat: Number(orderForm.pickup_lat),
        pickup_lng: Number(orderForm.pickup_lng),
        delivery_lat: Number(orderForm.delivery_lat),
        delivery_lng: Number(orderForm.delivery_lng)
      });

      setOrderForm(defaultForm);
      loadAllData();
    } catch (createError) {
      setError(createError.response?.data?.message || 'Could not create order');
    }
  }

  async function planTours() {
    setError('');

    try {
      await api.post('/tours/plan', { date: selectedDate });
      loadAllData();
    } catch (planError) {
      setError(planError.response?.data?.message || 'Could not generate tours');
    }
  }

  async function updateOrderStatus(orderId, status) {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      loadAllData();
    } catch (updateError) {
      setError(updateError.response?.data?.message || 'Order status could not be updated');
    }
  }

  if (!token || !user) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="brand-line">LogiX</div>
          <h1>Transport & Dispo</h1>
          <p>Effiziente Auftrags- und Tourenverwaltung für kleine bis mittlere Flotten.</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <label>
              E-Mail
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
              />
            </label>

            <label>
              Passwort
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
              />
            </label>

            <button type="submit" disabled={loading}>
              {loading ? 'Anmeldung...' : 'Anmelden'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand-line">LogiX</div>
          <h2>Dispo & Transport</h2>
        </div>
        <div className="topbar-right">
          <span>{user.name}</span>
          <button onClick={logout} className="ghost-button">Abmelden</button>
        </div>
      </header>

      {error && <div className="error-box">{error}</div>}

      {dashboard && (
        <section className="stats-grid">
          <div className="stat-card">
            <span>Aufträge</span>
            <strong>{dashboard.summary.orders}</strong>
          </div>
          <div className="stat-card">
            <span>Fahrzeuge</span>
            <strong>{dashboard.summary.vehicles}</strong>
          </div>
          <div className="stat-card">
            <span>Fahrer</span>
            <strong>{dashboard.summary.drivers}</strong>
          </div>
          <div className="stat-card">
            <span>Touren</span>
            <strong>{dashboard.summary.tours}</strong>
          </div>
        </section>
      )}

      <main className="content-grid">
        <section className="panel">
          <h3>Auftrag erfassen</h3>
          <form onSubmit={handleCreateOrder} className="stacked-form">
            <div className="grid-two">
              <label>
                Kunde
                <select
                  value={orderForm.customer_id}
                  onChange={(event) => setOrderForm({ ...orderForm, customer_id: event.target.value })}
                >
                  <option value="">Kein Kunde</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Titel
                <input
                  type="text"
                  value={orderForm.title}
                  onChange={(event) => setOrderForm({ ...orderForm, title: event.target.value })}
                />
              </label>
            </div>

            <div className="grid-two">
              <label>
                Datum
                <input
                  type="date"
                  value={orderForm.order_date}
                  onChange={(event) => setOrderForm({ ...orderForm, order_date: event.target.value })}
                />
              </label>

              <label>
                Priorität
                <select
                  value={orderForm.priority}
                  onChange={(event) => setOrderForm({ ...orderForm, priority: event.target.value })}
                >
                  <option value="high">Hoch</option>
                  <option value="normal">Normal</option>
                  <option value="low">Niedrig</option>
                </select>
              </label>
            </div>

            <div className="grid-two">
              <label>
                Abholadresse
                <input
                  type="text"
                  value={orderForm.pickup_address}
                  onChange={(event) => setOrderForm({ ...orderForm, pickup_address: event.target.value })}
                />
              </label>

              <label>
                Lieferadresse
                <input
                  type="text"
                  value={orderForm.delivery_address}
                  onChange={(event) => setOrderForm({ ...orderForm, delivery_address: event.target.value })}
                />
              </label>
            </div>

            <div className="grid-four">
              <label>
                Pickup LAT
                <input
                  type="number"
                  step="0.0001"
                  value={orderForm.pickup_lat}
                  onChange={(event) => setOrderForm({ ...orderForm, pickup_lat: event.target.value })}
                />
              </label>
              <label>
                Pickup LNG
                <input
                  type="number"
                  step="0.0001"
                  value={orderForm.pickup_lng}
                  onChange={(event) => setOrderForm({ ...orderForm, pickup_lng: event.target.value })}
                />
              </label>
              <label>
                Delivery LAT
                <input
                  type="number"
                  step="0.0001"
                  value={orderForm.delivery_lat}
                  onChange={(event) => setOrderForm({ ...orderForm, delivery_lat: event.target.value })}
                />
              </label>
              <label>
                Delivery LNG
                <input
                  type="number"
                  step="0.0001"
                  value={orderForm.delivery_lng}
                  onChange={(event) => setOrderForm({ ...orderForm, delivery_lng: event.target.value })}
                />
              </label>
            </div>

            <div className="grid-four">
              <label>
                Gewicht (kg)
                <input
                  type="number"
                  value={orderForm.weight}
                  onChange={(event) => setOrderForm({ ...orderForm, weight: event.target.value })}
                />
              </label>
              <label>
                Volumen (m³)
                <input
                  type="number"
                  value={orderForm.volume}
                  onChange={(event) => setOrderForm({ ...orderForm, volume: event.target.value })}
                />
              </label>
              <div />
              <div />
            </div>

            <button type="submit" className="primary-button">Auftrag speichern</button>
          </form>
        </section>

        <section className="panel">
          <h3>Kunde anlegen</h3>
          <form onSubmit={handleCreateCustomer} className="stacked-form">
            <label>
              Firmenname
              <input
                type="text"
                value={customerForm.name}
                onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })}
              />
            </label>

            <label>
              Ansprechpartner
              <input
                type="text"
                value={customerForm.contact_person}
                onChange={(event) => setCustomerForm({ ...customerForm, contact_person: event.target.value })}
              />
            </label>

            <div className="grid-two">
              <label>
                Telefon
                <input
                  type="text"
                  value={customerForm.phone}
                  onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })}
                />
              </label>

              <label>
                E-Mail
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(event) => setCustomerForm({ ...customerForm, email: event.target.value })}
                />
              </label>
            </div>

            <button type="submit" className="primary-button">Kunde speichern</button>
          </form>

          <h3 style={{ marginTop: '1.5rem' }}>Fahrzeugbestand</h3>
          <div className="simple-list">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="list-row">
                <div>
                  <strong>{vehicle.name}</strong>
                  <div>{vehicle.plate} • {vehicle.type}</div>
                </div>
                <div>{vehicle.driver_name || 'Ohne Fahrer'}</div>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: '1.5rem' }}>Fahrer</h3>
          <div className="simple-list">
            {drivers.map((driver) => (
              <div key={driver.id} className="list-row">
                <div>
                  <strong>{driver.name}</strong>
                  <div>{driver.license}</div>
                </div>
                <div>{driver.status}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <section className="panel map-panel">
        <div className="plan-header">
          <h3>Dispo-Plan</h3>
          <div className="plan-actions">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
            <button onClick={planTours} className="primary-button">Touren planen</button>
          </div>
        </div>

        <div className="map-grid">
          <div className="map-wrapper">
            <MapContainer center={[47.8, 13.1]} zoom={6} scrollWheelZoom style={{ height: '380px', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />

              {mapOrders.map((order) => (
                <Marker key={order.id} position={[order.delivery_lat, order.delivery_lng]}>
                  <Popup>
                    <strong>{order.title}</strong><br />
                    {order.delivery_address}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="tour-list">
            {tours.length === 0 ? (
              <div className="empty-state">Noch keine Touren geplant.</div>
            ) : (
              tours.map((tour) => (
                <div key={tour.id} className="tour-card">
                  <h4>{tour.vehicle_name || 'Fahrzeug'} • {tour.driver_name || 'Fahrer'}</h4>
                  <div className="tiny-meta">{tour.tour_date}</div>
                  <ul>
                    {tour.stops?.map((stop) => (
                      <li key={`${tour.id}-${stop.id}`}>{stop.title || stop.order_title || 'Stop'} → {stop.address}</li>
                    )) || <li>Keine Stops</li>}
                  </ul>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <h3>Auftragsübersicht</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Auftrag</th>
                <th>Kunde</th>
                <th>Datum</th>
                <th>Priorität</th>
                <th>Gewicht</th>
                <th>Volumen</th>
                <th>Status</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.title}</td>
                  <td>{order.customer_name || '—'}</td>
                  <td>{order.order_date}</td>
                  <td>{order.priority}</td>
                  <td>{order.weight} kg</td>
                  <td>{order.volume} m³</td>
                  <td>{order.status}</td>
                  <td>
                    <div className="inline-actions">
                      <select
                        value={order.status}
                        onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                      >
                        <option value="new">Neu</option>
                        <option value="scheduled">Geplant</option>
                        <option value="in_transit">In Fahrt</option>
                        <option value="completed">Abgeschlossen</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;

