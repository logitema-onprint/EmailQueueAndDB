import fs from 'fs';
import path from 'path';

const hotfolder = path.join(__dirname, '../../hotfolder');

// Hardcoded products with fixed IDs
const products = [
  { id: 1001, name: "Skrajutės A6", sku: "SKU-A6-001", status: "In Stock" },
  { id: 1002, name: "Skrajutės A5", sku: "SKU-A5-001", status: "In Stock" },
  { id: 1003, name: "Skrajutės A4", sku: "SKU-A4-001", status: "In Stock" },
  { id: 1004, name: "Skrajutės DL", sku: "SKU-DL-001", status: "In Stock" },
  { id: 1005, name: "Vizitinės kortelės vienpusės", sku: "SKU-VIZ-001", status: "In Stock" },
  { id: 1006, name: "Vizitinės kortelės dvipusės", sku: "SKU-VIZ-002", status: "In Stock" },
  { id: 1007, name: "Vizitinės kortelės su laku", sku: "SKU-VIZ-003", status: "In Stock" },
  { id: 1008, name: "Plakatai A3", sku: "SKU-PLK-A3", status: "Available" },
  { id: 1009, name: "Plakatai A2", sku: "SKU-PLK-A2", status: "Available" },
  { id: 1010, name: "Plakatai A1", sku: "SKU-PLK-A1", status: "Available" },
  { id: 1011, name: "Plakatai A0", sku: "SKU-PLK-A0", status: "Available" },
  { id: 1012, name: "Lankstinukai A4", sku: "SKU-LNK-A4", status: "In Stock" },
  { id: 1013, name: "Lankstinukai A5", sku: "SKU-LNK-A5", status: "In Stock" },
  { id: 1014, name: "Lankstinukai DL", sku: "SKU-LNK-DL", status: "In Stock" },
  { id: 1015, name: "Bukletai", sku: "SKU-BUK-001", status: "Ready" },
  { id: 1016, name: "Brošiūros", sku: "SKU-BRO-001", status: "Ready" },
  { id: 1017, name: "Katalogai", sku: "SKU-KAT-001", status: "Ready" },
  { id: 1018, name: "Magnetukai", sku: "SKU-MAG-001", status: "In Stock" },
  { id: 1019, name: "Lipdukai", sku: "SKU-LIP-001", status: "In Stock" },
  { id: 1020, name: "Lipdukai su kontūru", sku: "SKU-LIP-002", status: "In Stock" },
  { id: 1021, name: "Užrašų knygelės", sku: "SKU-KNY-001", status: "Available" },
  { id: 1022, name: "Bloknotai", sku: "SKU-BLK-001", status: "Available" },
  { id: 1023, name: "Kalendoriai sieniniai", sku: "SKU-KAL-001", status: "Pre-order" },
  { id: 1024, name: "Kalendoriai stalo", sku: "SKU-KAL-002", status: "Pre-order" },
  { id: 1025, name: "Vokai C5", sku: "SKU-VOK-C5", status: "In Stock" },
  { id: 1026, name: "Vokai C4", sku: "SKU-VOK-C4", status: "In Stock" },
  { id: 1027, name: "Vokai DL", sku: "SKU-VOK-DL", status: "In Stock" },
  { id: 1028, name: "Atvirukai", sku: "SKU-ATV-001", status: "In Stock" },
  { id: 1029, name: "Padėkos kortelės", sku: "SKU-PAD-001", status: "Available" },
  { id: 1030, name: "Kvietimai", sku: "SKU-KVI-001", status: "Available" },
  { id: 1031, name: "Lankstinukai 3 dalių", sku: "SKU-LNK-3D", status: "In Stock" },
  { id: 1032, name: "Brošiūros su spirale", sku: "SKU-BRO-002", status: "Ready" },
  { id: 1033, name: "Plakatai UV spausdinimas", sku: "SKU-PLK-UV", status: "Available" },
];

// Hardcoded sales agents
const salesAgents = [
  { name: "Jonas Kazlauskas", phone: "+37065123456", email: "jonas.k@company.lt" },
  { name: "Marija Petrauskienė", phone: "+37067234567", email: "marija.p@company.lt" },
  { name: "Andrius Jansons", phone: "+37068345678", email: "andrius.j@company.lt" },
  { name: "Rasa Balčiūnienė", phone: "+37069456789", email: "rasa.b@company.lt" },
];

// Generate 1000 unique customers
const customers = Array.from({ length: 1000 }, (_, i) => {
  const firstNames = [
    "Jonas", "Petras", "Antanas", "Vytautas", "Mindaugas", "Darius", "Tomas", "Andrius", "Mantas", "Gintaras",
    "Ona", "Janina", "Marija", "Rasa", "Daiva", "Audronė", "Vida", "Laima", "Irena", "Gražina",
    "Jānis", "Andris", "Mārtiņš", "Ilze", "Līga", "Inese"
  ];
  const lastNames = [
    "Kazlauskas", "Petrauskas", "Jankauskas", "Stankevičius", "Vasiliauskas", "Žukauskas", 
    "Butkus", "Paulauskas", "Urbonas", "Berzins", "Kalniņš", "Ozols"
  ];
  const cities = ["Vilnius", "Kaunas", "Klaipėda", "Riga", "Daugavpils", "Liepāja"];
  const countries = ["Lithuania", "Latvia"];
  
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
  const city = cities[i % cities.length];
  const country = countries[i % countries.length];
  
  return {
    id: 2000 + i,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@gmail.com`,
    phone: `+37065${String(i).padStart(6, '0')}`,
    city,
    country,
    company: i % 3 === 0 ? `${lastName} UAB` : "",
    registerDate: getRandomDate(new Date(2015, 0, 1), new Date(2024, 11, 31))
  };
});

const orderStatuses = ["Processing", "Shipped", "Delivered", "Completed", "Pending Payment", "On Hold"];
const paymentMethods = ["Credit Card", "PayPal", "Bank Transfer", "Cash on Delivery"];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function generateRandomProductItem(baseIndex: number, itemIndex: number) {
  const product = getRandomElement(products);
  const quantity = Math.floor(1 + Math.random() * 10);
  const price = (Math.random() * 200 + 5).toFixed(2);

  return {
    products_name: product.name,
    products_title: product.name,
    products_price: price,
    products_quantity: `${quantity}`,
    orders_products_id: `${90000 + baseIndex * 10 + itemIndex}`,
    products_sku: product.sku,
    product_status_id: `${product.id}`,
    product_status: product.status,
    product_id: `${product.id}`,
    reference_order_id: "0",
    product_production_due_date: getRandomDate(new Date(2025, 4, 26), new Date(2025, 5, 30)),
    reference_product_id: "0"
  };
}

function generateRandomJsonFile(index: number) {
  const salesAgent = getRandomElement(salesAgents);
  const customer = customers[index % 1000]; // Repeat customers
  
  const orderDateFinished = getRandomDate(new Date(2025, 0, 1), new Date());
  const dueDate = getRandomDate(new Date(), new Date(2025, 5, 30));

  const numItems = Math.floor(Math.random() * 3) + 1;
  const productItems = Array.from({ length: numItems }, (_, i) => generateRandomProductItem(index, i));
  const totalAmount = productItems.reduce((sum, item) => sum + parseFloat(item.products_price) * parseInt(item.products_quantity), 0);

  const baseData: any = {
    orders_id: `${70000 + index}`,
    order_number: `${70000 + index}`,
    user_id: `${customer.id}`,
    corporate_id: customer.company ? `${Math.floor(10 + Math.random() * 90)}` : "0",
    order_status: getRandomElement(orderStatuses),
    orders_status_id: `${Math.floor(1 + Math.random() * 30)}`,
    orders_date_finished: orderDateFinished,
    airway_bill_number: Math.random() > 0.8 ? `AWB${Math.floor(100000 + Math.random() * 900000)}` : "",
    printer_name: `${getRandomElement(salesAgents).name} Printer`,
    payment_method_name: getRandomElement(paymentMethods),
    total_amount: totalAmount.toFixed(2),
    order_amount: (totalAmount * 0.8).toFixed(2),
    shipping_amount: (totalAmount * 0.1).toFixed(2),
    tax_amount: (totalAmount * 0.1).toFixed(2),
    coupon_amount: Math.random() > 0.9 ? (totalAmount * 0.05).toFixed(2) : "0",
    orders_due_date: dueDate,
    orders_extrafield: Math.random() > 0.95 ? { custom_note: "Rush order" } : {},
    order_last_modified_date: getRandomDate(new Date(orderDateFinished), new Date()),
    po_number: Math.random() > 0.85 ? `PO-${Math.floor(1000 + Math.random() * 9000)}` : "",
    placed_by: `${customer.name} | ${customer.phone} | ${customer.email}`,
    payment_due_date: dueDate,
    transactionid: Math.random() > 0.7 ? `txn_${Math.random().toString(36).substring(2, 15)}` : "",
    production_due_date: dueDate,
    payment_date: Math.random() > 0.5 ? getRandomDate(new Date(orderDateFinished), new Date()) : orderDateFinished,
    invoice_number: Math.random() > 0.6 ? `INV-${60000 + index}` : "",
    invoice_date: Math.random() > 0.6 ? getRandomDate(new Date(orderDateFinished), new Date()) : orderDateFinished,
    sales_agent_name: `${salesAgent.name}, tel. ${salesAgent.phone}`,
    payment_status_title: "Apmokėta",
    process_status_set_as: Math.random() > 0.5 ? "Completed" : "Pending",

    product_details: {
      items: numItems === 1 ? productItems[0] : productItems
    },

    customer_details: {
      customers_name: customer.name,
      customers_first_name: customer.firstName,
      customers_last_name: customer.lastName,
      customers_company: customer.company,
      customers_telephone: customer.phone,
      extrafield: {},
      customers_email_address: customer.email,
      customers_register_date: customer.registerDate,
      reward_points: Math.random() > 0.8 ? `${Math.floor(Math.random() * 500)}` : "0",
    },

    shipping_details: {
      delivery_name: customer.name,
      delivery_company: customer.company || "",
      delivery_street_address: `${Math.floor(1 + Math.random() * 1000)} g. ${Math.floor(1 + Math.random() * 100)}`,
      delivery_suburb: "",
      delivery_city: customer.city,
      delivery_postcode: `LT-${Math.floor(10000 + Math.random() * 89999)}`,
      delivery_state: "",
      delivery_country: customer.country,
      shipping_extrafield: {},
      delivery_state_code: "",
    },

    billing_details: {
      billing_name: customer.name,
      billing_company: customer.company || "",
      billing_street_address: `${Math.floor(1 + Math.random() * 1000)} g. ${Math.floor(1 + Math.random() * 100)}`,
      billing_suburb: "",
      billing_city: customer.city,
      billing_postcode: `LT-${Math.floor(10000 + Math.random() * 89999)}`,
      billing_state: "",
      billing_country: customer.country,
      billing_extrafield: {},
      billing_state_code: "",
    }
  };

  return JSON.stringify(baseData, null, 2);
}

function createTestFiles() {
  if (!fs.existsSync(hotfolder)) {
    fs.mkdirSync(hotfolder, { recursive: true });
  }

  const totalFiles = 10223;
  console.log(`Generating ${totalFiles} files...`);

  for (let i = 1; i <= totalFiles; i++) {
    const fileName = `orders_${i}.json`;
    const filePath = path.join(hotfolder, fileName);
    try {
      const fileContent = generateRandomJsonFile(i);
      fs.writeFileSync(filePath, fileContent, 'utf8');
    } catch (e) {
      console.error(`Error generating file ${fileName}:`, e);
    }
    if (i % 500 === 0) console.log(`Generated ${i} files...`);
  }

  console.log(`${totalFiles} test JSON files generated successfully!`);
}

createTestFiles();