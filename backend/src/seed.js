import bcrypt from 'bcryptjs';
import { all, get, run } from './db.js';

export async function seedDatabase() {
  const adminExists = await get('SELECT id FROM users WHERE email = ?', ['admin@logix.local']);

  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@logix.local', passwordHash, 'admin']
    );
  }

  const customerCount = await get('SELECT COUNT(*) AS count FROM customers');
  if (Number(customerCount?.count || 0) === 0) {
    const customers = [
      ['Müller Möbel', 'Ralf Müller', '+49 170 123456', 'sales@mueller.de'],
      ['Bauwerke AG', 'Karin Weiss', '+49 160 987654', 'logistik@bauwerke.de'],
      ['Sonnenkontakt', 'Erika Koch', '+49 152 445566', 'bestellung@sonnenkontakt.de'],
      ['Rhein Food', 'Tobias Hart', '+49 171 223344', 'orders@rheinfood.de']
    ];

    for (const customer of customers) {
      await run(
        'INSERT INTO customers (name, contact_person, phone, email) VALUES (?, ?, ?, ?)',
        customer
      );
    }
  }

  const driverCount = await get('SELECT COUNT(*) AS count FROM drivers');
  if (Number(driverCount?.count || 0) === 0) {
    const drivers = [
      ['Anna Keller', '+49 151 887766', 'C', 'available'],
      ['Martin Paul', '+49 152 556677', 'C', 'available'],
      ['Lea Sommer', '+49 170 664433', 'CE', 'available']
    ];

    for (const driver of drivers) {
      await run('INSERT INTO drivers (name, phone, license, status) VALUES (?, ?, ?, ?)', driver);
    }
  }

  const vehicleCount = await get('SELECT COUNT(*) AS count FROM vehicles');
  if (Number(vehicleCount?.count || 0) === 0) {
    const drivers = await all('SELECT id, name FROM drivers ORDER BY id ASC');

    const vehicles = [
      ['Transit 1', 'M-TR 2401', 'van', 1200, 14, drivers[0]?.id ?? null],
      ['City Van 2', 'W-RT 7812', 'van', 900, 11, drivers[1]?.id ?? null],
      ['Cargo Truck', 'D-LK 4400', 'truck', 2600, 28, drivers[2]?.id ?? null]
    ];

    for (const vehicle of vehicles) {
      await run(
        'INSERT INTO vehicles (name, plate, type, capacity_weight, capacity_volume, driver_id, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        vehicle
      );
    }
  }

  const orderCount = await get('SELECT COUNT(*) AS count FROM orders');
  if (Number(orderCount?.count || 0) === 0) {
    const customers = await all('SELECT id FROM customers ORDER BY id ASC');
    const today = new Date().toISOString().slice(0, 10);

    const sampleOrders = [
      {
        customer_id: customers[0]?.id || 1,
        title: 'Möbeltransport Wien',
        order_date: today,
        pickup_address: 'Wien 1, Hauptplatz 8',
        delivery_address: 'Wien 22, Musterweg 16',
        pickup_lat: 48.2082,
        pickup_lng: 16.3738,
        delivery_lat: 48.2644,
        delivery_lng: 16.4426,
        pickup_time: '08:30',
        delivery_time: '10:15',
        weight: 460,
        volume: 7,
        priority: 'high',
        status: 'new'
      },
      {
        customer_id: customers[1]?.id || 2,
        title: 'Baustoffe Lustenau',
        order_date: today,
        pickup_address: 'Linz 4, Techpark 22',
        delivery_address: 'Bregenz 3, Lagerstraße 7',
        pickup_lat: 48.3069,
        pickup_lng: 14.2858,
        delivery_lat: 47.503,
        delivery_lng: 9.747,
        pickup_time: '09:00',
        delivery_time: '12:00',
        weight: 1200,
        volume: 18,
        priority: 'normal',
        status: 'scheduled'
      },
      {
        customer_id: customers[2]?.id || 3,
        title: 'PV-Komponenten',
        order_date: today,
        pickup_address: 'Graz 5, Industriezeile 12',
        delivery_address: 'Salzburg 1, Gewerbepark 5',
        pickup_lat: 47.0707,
        pickup_lng: 15.4395,
        delivery_lat: 47.8095,
        delivery_lng: 13.055,
        pickup_time: '07:45',
        delivery_time: '11:10',
        weight: 730,
        volume: 12,
        priority: 'high',
        status: 'new'
      },
      {
        customer_id: customers[3]?.id || 4,
        title: 'Kühlpakete',
        order_date: today,
        pickup_address: 'Klagenfurt 2, Südstraße 33',
        delivery_address: 'Villach 4, Marktstraße 9',
        pickup_lat: 46.6247,
        pickup_lng: 14.305,
        delivery_lat: 46.6174,
        delivery_lng: 13.847,
        pickup_time: '10:00',
        delivery_time: '12:30',
        weight: 410,
        volume: 6,
        priority: 'normal',
        status: 'new'
      }
    ];

    for (const order of sampleOrders) {
      await run(
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
          order.customer_id,
          order.title,
          order.order_date,
          order.pickup_address,
          order.delivery_address,
          order.pickup_lat,
          order.pickup_lng,
          order.delivery_lat,
          order.delivery_lng,
          order.pickup_time,
          order.delivery_time,
          order.weight,
          order.volume,
          order.priority,
          order.status,
          'Demo order generated by seed script'
        ]
      );
    }
  }
}
