import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { all, get, initializeDatabase, run } from './db.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'logix-demo-secret';

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

function signToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'LogiX API', timestamp: new Date().toISOString() });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'dispatcher' } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }

  const existingUser = await get('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userResult = await run(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, role]
  );

  const user = await get('SELECT id, name, email, role FROM users WHERE id = ?', [userResult.lastID]);
  const token = signToken(user);

  return res.status(201).json({ token, user });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await get('SELECT id, name, email, password_hash, role FROM users WHERE email = ?', [email]);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = signToken(safeUser);

  return res.json({ token, user: safeUser });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  const user = await get('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.userId]);
  return res.json({ user });
});

app.get('/api/customers', requireAuth, async (_req, res) => {
  const customers = await all('SELECT * FROM customers ORDER BY id DESC');
  res.json(customers);
});

app.post('/api/customers', requireAuth, async (req, res) => {
  const { name, contact_person, phone, email } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: 'Customer name is required' });
  }

  const result = await run(
    'INSERT INTO customers (name, contact_person, phone, email) VALUES (?, ?, ?, ?)',
    [name, contact_person || '', phone || '', email || '']
  );

  const customer = await get('SELECT * FROM customers WHERE id = ?', [result.lastID]);
  res.status(201).json(customer);
});

app.get('/api/drivers', requireAuth, async (_req, res) => {
  const drivers = await all('SELECT * FROM drivers ORDER BY id ASC');
  res.json(drivers);
});

app.post('/api/drivers', requireAuth, async (req, res) => {
  const { name, phone, license, status = 'available' } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: 'Driver name is required' });
  }

  const result = await run(
    'INSERT INTO drivers (name, phone, license, status) VALUES (?, ?, ?, ?)',
    [name, phone || '', license || '', status]
  );

  const driver = await get('SELECT * FROM drivers WHERE id = ?', [result.lastID]);
  res.status(201).json(driver);
});

app.get('/api/vehicles', requireAuth, async (_req, res) => {
  const vehicles = await all(
    `SELECT v.*, d.name AS driver_name
     FROM vehicles v
     LEFT JOIN drivers d ON d.id = v.driver_id
     ORDER BY v.id ASC`
  );
  res.json(vehicles);
});

app.post('/api/vehicles', requireAuth, async (req, res) => {
  const { name, plate, type, capacity_weight, capacity_volume, driver_id, is_active = 1 } = req.body || {};

  if (!name || !plate || !type) {
    return res.status(400).json({ message: 'Vehicle name, plate and type are required' });
  }

  const result = await run(
    'INSERT INTO vehicles (name, plate, type, capacity_weight, capacity_volume, driver_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, plate, type, Number(capacity_weight || 0), Number(capacity_volume || 0), driver_id || null, is_active ? 1 : 0]
  );

  const vehicle = await get('SELECT * FROM vehicles WHERE id = ?', [result.lastID]);
  res.status(201).json(vehicle);
});

app.get('/api/orders', requireAuth, async (_req, res) => {
  const orders = await all(`
    SELECT o.*, c.name AS customer_name
    FROM orders o
    LEFT JOIN customers c ON c.id = o.customer_id
    ORDER BY o.order_date DESC, o.id DESC
  `);
  res.json(orders);
});

app.post('/api/orders', requireAuth, async (req, res) => {
  const {
    customer_id,
    title,
    order_date,
    pickup_address,
    delivery_address,
    pickup_lat,
    pickup_lng,
    delivery_lat,
    delivery_lng,
    pickup_time,
    delivery_time,
    weight,
    volume,
    priority = 'normal',
    status = 'new',
    notes = ''
  } = req.body || {};

  if (!title || !order_date) {
    return res.status(400).json({ message: 'Title and order date are required' });
  }

  const result = await run(
    `INSERT INTO orders (
      customer_id,
      title,
      order_date,
      pickup_address,
      delivery_address,
      pickup_lat,
      pickup_lng,
      delivery_lat,
      delivery_lng,
      pickup_time,
      delivery_time,
      weight,
      volume,
      priority,
      status,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      customer_id || null,
      title,
      order_date,
      pickup_address || '',
      delivery_address || '',
      pickup_lat ?? null,
      pickup_lng ?? null,
      delivery_lat ?? null,
      delivery_lng ?? null,
      pickup_time || '',
      delivery_time || '',
      Number(weight || 0),
      Number(volume || 0),
      priority,
      status,
      notes
    ]
  );

  const order = await get(`
    SELECT o.*, c.name AS customer_name
    FROM orders o
    LEFT JOIN customers c ON c.id = o.customer_id
    WHERE o.id = ?
  `, [result.lastID]);

  res.status(201).json(order);
});

app.get('/api/tours', requireAuth, async (_req, res) => {
  const tours = await all(`
    SELECT t.*, v.name AS vehicle_name, d.name AS driver_name
    FROM tours t
    LEFT JOIN vehicles v ON v.id = t.vehicle_id
    LEFT JOIN drivers d ON d.id = t.driver_id
    ORDER BY t.tour_date DESC, t.id DESC
  `);

  const detailedTours = [];

  for (const tour of tours) {
    const stops = await all(
      `SELECT ts.*, o.title AS order_title, o.delivery_address, o.pickup_address
       FROM tour_stops ts
       LEFT JOIN orders o ON o.id = ts.order_id
       WHERE ts.tour_id = ?
       ORDER BY ts.sequence ASC`,
      [tour.id]
    );

    detailedTours.push({ ...tour, stops });
  }

  res.json(detailedTours);
});

app.post('/api/tours/plan', requireAuth, async (req, res) => {
  const { date } = req.body || {};
  const planDate = date || new Date().toISOString().slice(0, 10);

  const vehicles = await all('SELECT * FROM vehicles WHERE is_active = 1 ORDER BY id ASC');
  const orders = await all(
    `SELECT * FROM orders
     WHERE order_date = ? AND status != 'completed'
     ORDER BY CASE priority WHEN 'high' THEN 0 WHEN 'normal' THEN 1 WHEN 'low' THEN 2 ELSE 3 END, pickup_time ASC`,
    [planDate]
  );

  await run('DELETE FROM tour_stops WHERE tour_id IN (SELECT id FROM tours WHERE tour_date = ?)', [planDate]);
  await run('DELETE FROM tours WHERE tour_date = ?', [planDate]);

  const tourAssignments = vehicles.map((vehicle) => ({
    vehicle_id: vehicle.id,
    driver_id: vehicle.driver_id,
    date: planDate,
    status: 'planned',
    notes: `Planned automatically for ${vehicle.name}`,
    stops: []
  }));

  for (const order of orders) {
    const matchingVehicle = vehicles.find(
      (vehicle) => Number(vehicle.capacity_weight) >= Number(order.weight) && Number(vehicle.capacity_volume) >= Number(order.volume)
    );

    if (!matchingVehicle) {
      continue;
    }

    const assignment = tourAssignments.find((item) => item.vehicle_id === matchingVehicle.id);
    if (assignment) {
      assignment.stops.push({
        order_id: order.id,
        stop_type: 'delivery',
        address: order.delivery_address || 'Unspecified stop',
        lat: order.delivery_lat,
        lng: order.delivery_lng,
        title: order.title
      });
    }
  }

  const createdTours = [];

  for (const assignment of tourAssignments) {
    if (assignment.stops.length === 0) {
      continue;
    }

    const tourResult = await run(
      'INSERT INTO tours (vehicle_id, driver_id, tour_date, status, notes) VALUES (?, ?, ?, ?, ?)',
      [assignment.vehicle_id, assignment.driver_id, assignment.date, assignment.status, assignment.notes]
    );

    for (let index = 0; index < assignment.stops.length; index += 1) {
      const stop = assignment.stops[index];
      await run(
        'INSERT INTO tour_stops (tour_id, order_id, sequence, stop_type, address, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [tourResult.lastID, stop.order_id, index + 1, stop.stop_type, stop.address, stop.lat, stop.lng]
      );
    }

    createdTours.push({
      id: tourResult.lastID,
      vehicle_id: assignment.vehicle_id,
      driver_id: assignment.driver_id,
      tour_date: assignment.date,
      status: assignment.status,
      stops: assignment.stops
    });
  }

  return res.json({ date: planDate, tours: createdTours });
});

app.get('/api/dashboard', requireAuth, async (_req, res) => {
  const [orders, vehicles, drivers, tours] = await Promise.all([
    all('SELECT COUNT(*) AS count FROM orders'),
    all('SELECT COUNT(*) AS count FROM vehicles WHERE is_active = 1'),
    all('SELECT COUNT(*) AS count FROM drivers'),
    all('SELECT COUNT(*) AS count FROM tours')
  ]);

  const readyOrders = await all(`
    SELECT o.*, c.name AS customer_name
    FROM orders o
    LEFT JOIN customers c ON c.id = o.customer_id
    WHERE o.status != 'completed'
    ORDER BY o.order_date DESC
    LIMIT 5
  `);

  res.json({
    summary: {
      orders: Number(orders[0]?.count || 0),
      vehicles: Number(vehicles[0]?.count || 0),
      drivers: Number(drivers[0]?.count || 0),
      tours: Number(tours[0]?.count || 0)
    },
    recent_orders: readyOrders
  });
});

async function startServer() {
  await initializeDatabase();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`LogiX API running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
