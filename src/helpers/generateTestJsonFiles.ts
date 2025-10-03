import fs from 'fs';
import path from 'path';

const hotfolder = path.join(__dirname, '../../hotfolder');

const firstNames = [
  "Jonas", "Petras", "Antanas", "Vytautas", "Mindaugas", "Darius", "Tomas", "Andrius", "Mantas", "Gintaras",
  "Arvydas", "Saulius", "Valdas", "Algirdas", "Raimondas", "Robertas", "Kęstutis", "Rolandas", "Rimvydas", "Donatas",
  "Jānis", "Andris", "Mārtiņš", "Guntis", "Juris", "Artūrs", "Roberts", "Edgars", "Kristaps", "Rihards",
  "Ona", "Janina", "Marija", "Rasa", "Daiva", "Audronė", "Vida", "Laima", "Irena", "Gražina",
  "Eglė", "Rūta", "Jolanta", "Živilė", "Ingrida", "Inga", "Vilma", "Laura", "Kristina", "Vaida",
  "Ilze", "Līga", "Inese", "Sanita", "Kristīne", "Agnese", "Dace", "Baiba", "Maija", "Ieva",
  "Ligita", "Aija", "Inta", "Gunta", "Daina", "Zane", "Laura", "Evita", "Elīna", "Liene"
];

const lastNames = [
  "Kazlauskas", "Petrauskas", "Jankauskas", "Stankevičius", "Vasiliauskas", "Žukauskas", "Butkus", "Paulauskas", "Urbonas", "Kavaliauskas",
  "Ramanauskas", "Balčiūnas", "Šimkus", "Arlauskas", "Navickas", "Lukošius", "Juškevičius", "Masilionis", "Sabaliauskas", "Grigas",
  "Berzins", "Kalniņš", "Ozols", "Liepa", "Jansons", "Krūmiņš", "Putniņš", "Zariņš", "Vilks", "Leitis",
  "Blūms", "Circenis", "Siliņš", "Balodis", "Eglītis", "Meiers", "Pētersons", "Āboliņš", "Freibergs", "Dambis",
  "Kazlauskienė", "Petrauskienė", "Jankauskienė", "Stankevičienė", "Vasiliauskienė", "Žukauskienė", "Butkienė", "Paulauskienė", "Urbonienė", "Kavaliauskienė",
  "Ramanuskienė", "Balčiūnienė", "Šimkienė", "Arlauskienė", "Navickienė", "Lukošienė", "Juškevičienė", "Masilionienė", "Sabaliauskienė", "Grigienė",
  "Berzina", "Kalniņa", "Ozola", "Liepa", "Jansone", "Krūmiņa", "Putniņa", "Zariņa", "Vilka", "Leitisa"
];

const emailDomains = ["gmail.com", "inbox.lv", "mail.lt", "yahoo.com", "hotmail.com"];

const productNames = [
  "Skrajutės A6", "Skrajutės A5", "Skrajutės A4", "Skrajutės DL",
  "Vizitinės kortelės vienpusės", "Vizitinės kortelės dvipusės", "Vizitinės kortelės su laku",
  "Plakatai A3", "Plakatai A2", "Plakatai A1", "Plakatai A0",
  "Lankstinukai A4", "Lankstinukai A5", "Lankstinukai DL",
  "Bukletai", "Brošiūros", "Katalogai",
  "Magnetukai", "Lipdukai", "Lipdukai su kontūru",
  "Užrašų knygelės", "Bloknotai", "Kalendoriai sieniniai", "Kalendoriai stalo",
  "Vokai C5", "Vokai C4", "Vokai DL",
  "Atvirukai", "Padėkos kortelės", "Kvietimai"
];

const countries = ["Lithuania", "Latvia"];

const cities = [
  "Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys", "Alytus", "Marijampolė", "Mažeikiai", "Jonava", "Utena",
  "Riga", "Daugavpils", "Liepāja", "Jelgava", "Jūrmala", "Ventspils", "Rēzekne", "Valmiera", "Ogre", "Jēkabpils"
];

const orderStatuses = ["Processing", "Shipped", "Delivered", "Completed", "Pending Payment", "On Hold"];
const paymentMethods = ["Credit Card", "PayPal", "Bank Transfer", "Cash on Delivery"];
const productStatuses = ["In Stock", "Out of Stock", "Pre-order", "Available", "Ready"];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function generateRandomProductItem(baseIndex: number, itemIndex: number) {
  const randomProductName = getRandomElement(productNames);
  const quantity = Math.floor(1 + Math.random() * 10);
  const price = (Math.random() * 200 + 5).toFixed(2);

  return {
    products_name: randomProductName,
    products_title: randomProductName,
    products_price: price,
    products_quantity: `${quantity}`,
    orders_products_id: `${90000 + baseIndex * 10 + itemIndex}`,
    products_sku: `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    product_status_id: `${Math.floor(1 + Math.random() * 20)}`,
    product_status: getRandomElement(productStatuses),
    product_id: `${1000 + baseIndex + itemIndex}`,
    reference_order_id: "0",
    product_production_due_date: getRandomDate(new Date(2025, 4, 26), new Date(2025, 5, 30)),
    reference_product_id: "0"
  };
}

function generateRandomJsonFile(index: number) {
  const salesAgentFirstName = getRandomElement(firstNames);
  const salesAgentLastName = getRandomElement(lastNames);
  
  const salesAgents = [
    `${salesAgentFirstName} ${salesAgentLastName}, tel. ${Math.floor(100000000 + Math.random() * 900000000)}`,
  ];

  const randomFirstName = getRandomElement(firstNames);
  const randomLastName = getRandomElement(lastNames);
  const randomCountry = getRandomElement(countries);
  const randomCity = getRandomElement(cities);
  const customerName = `${randomFirstName} ${randomLastName}`;
  const customerEmail = `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}${index}@${getRandomElement(emailDomains)}`;
  const customerPhone = `+370${Math.floor(60000000 + Math.random() * 9999999)}`;
  const registerDate = getRandomDate(new Date(2015, 0, 1), new Date(2024, 11, 31));
  const orderDateFinished = getRandomDate(new Date(2025, 0, 1), new Date());
  const dueDate = getRandomDate(new Date(), new Date(2025, 5, 30));

  const numItems = Math.floor(Math.random() * 3) + 1;
  const productItems = Array.from({ length: numItems }, (_, i) => generateRandomProductItem(index, i));
  const totalAmount = productItems.reduce((sum, item) => sum + parseFloat(item.products_price) * parseInt(item.products_quantity), 0);

  const baseData: any = {
    orders_id: `${70000 + index}`,
    order_number: `${70000 + index}`,
    user_id: `${1000 + index}`,
    corporate_id: Math.random() > 0.9 ? `${Math.floor(10 + Math.random() * 90)}` : "0",
    order_status: getRandomElement(orderStatuses),
    orders_status_id: `${Math.floor(1 + Math.random() * 30)}`,
    orders_date_finished: orderDateFinished,
    airway_bill_number: Math.random() > 0.8 ? `AWB${Math.floor(100000 + Math.random() * 900000)}` : "",
    printer_name: `${getRandomElement(firstNames)} Printer`,
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
    placed_by: `${randomFirstName} ${randomLastName} | ${customerPhone} | ${customerEmail}`,
    payment_due_date: dueDate,
    transactionid: Math.random() > 0.7 ? `txn_${Math.random().toString(36).substring(2, 15)}` : "",
    production_due_date: dueDate,
    payment_date: Math.random() > 0.5 ? getRandomDate(new Date(orderDateFinished), new Date()) : orderDateFinished,
    invoice_number: Math.random() > 0.6 ? `INV-${60000 + index}` : "",
    invoice_date: Math.random() > 0.6 ? getRandomDate(new Date(orderDateFinished), new Date()) : orderDateFinished,
    sales_agent_name: getRandomElement(salesAgents),
    payment_status_title: "Apmokėta",
    process_status_set_as: Math.random() > 0.5 ? "Completed" : "Pending",

    product_details: {
      items: numItems === 1 ? productItems[0] : productItems
    },

    customer_details: {
      customers_name: customerName,
      customers_first_name: randomFirstName,
      customers_last_name: randomLastName,
      customers_company: Math.random() > 0.7 ? `${randomLastName} UAB` : "",
      customers_telephone: customerPhone,
      extrafield: {},
      customers_email_address: customerEmail,
      customers_register_date: registerDate,
      reward_points: Math.random() > 0.8 ? `${Math.floor(Math.random() * 500)}` : "0",
    },

    shipping_details: {
      delivery_name: customerName,
      delivery_company: Math.random() > 0.8 ? `${randomLastName} Logistics` : "",
      delivery_street_address: `${Math.floor(1 + Math.random() * 1000)} g. ${Math.floor(1 + Math.random() * 100)}`,
      delivery_suburb: Math.random() > 0.9 ? `Suburb ${index}` : "",
      delivery_city: randomCity,
      delivery_postcode: `LT-${Math.floor(10000 + Math.random() * 89999)}`,
      delivery_state: "",
      delivery_country: randomCountry,
      shipping_extrafield: {},
      delivery_state_code: "",
    },

    billing_details: {
      billing_name: customerName,
      billing_company: Math.random() > 0.75 ? `${randomLastName} UAB` : "",
      billing_street_address: `${Math.floor(1 + Math.random() * 1000)} g. ${Math.floor(1 + Math.random() * 100)}`,
      billing_suburb: "",
      billing_city: randomCity,
      billing_postcode: `LT-${Math.floor(10000 + Math.random() * 89999)}`,
      billing_state: "",
      billing_country: randomCountry,
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
    const fileName = `orders_${1 + i}.json`;
    const filePath = path.join(hotfolder, fileName);
    try {
      const userId = Math.floor(i / 1000) * 1000 + (i % 1000);
      const fileContent = generateRandomJsonFile(userId);
      fs.writeFileSync(filePath, fileContent, 'utf8');
    } catch (e) {
      console.error(`Error generating file ${fileName}:`, e);
    }
    if (i % 500 === 0) console.log(`Generated ${i} files...`);
  }

  console.log(`${totalFiles} test JSON files generated successfully!`);
}

createTestFiles();