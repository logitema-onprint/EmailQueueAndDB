import fs from 'fs';
import path from 'path';

const hotfolder = path.join(__dirname, '../../hotfolder');


// Expanded lists for more variety
const firstNames = [
  "Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Charlotte", "William", "Sophia",
  "James", "Amelia", "Benjamin", "Isabella", "Lucas", "Mia", "Henry", "Evelyn", "Alexander", "Harper",
  "Michael", "Camila", "Ethan", "Gianna", "Daniel", "Abigail", "Matthew", "Luna", "Aiden", "Ella",
  "Joseph", "Elizabeth", "Jackson", "Avery", "Samuel", "Mila", "Sebastian", "Scarlett", "David", "Eleanor",
  "Carter", "Madison", "Wyatt", "Layla", "Jayden", "Penelope", "John", "Aria", "Owen", "Chloe",
  "Dylan", "Grace", "Luke", "Ellie", "Gabriel", "Nora", "Anthony", "Hazel", "Isaac", "Zoey",
  "Grayson", "Riley", "Jack", "Victoria", "Julian", "Lily", "Levi", "Aurora", "Christopher", "Violet",
  "Joshua", "Nova", "Andrew", "Hannah", "Lincoln", "Emilia", "Mateo", "Zoe", "Ryan", "Stella",
  "Jaxon", "Everly", "Nathan", "Isla", "Aaron", "Leah", "Isaiah", "Lucy", "Thomas", "Paisley",
  "Charles", "Eliana", "Caleb", "Skylar", "Josiah", "Maya", "Christian", "Naomi", "Hunter", "Elena"
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Martin", "Jackson",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Green", "Baker", "Adams", "Nelson",
  "Hill", "Campbell", "Mitchell", "Roberts", "Carter", "Phillips", "Evans", "Turner", "Torres", "Parker",
  "Collins", "Edwards", "Stewart", "Flores", "Morris", "Nguyen", "Murphy", "Rivera", "Cook", "Rogers",
  "Morgan", "Peterson", "Cooper", "Reed", "Bailey", "Bell", "Gomez", "Kelly", "Howard", "Ward",
  "Cox", "Diaz", "Richardson", "Wood", "Watson", "Brooks", "Bennett", "Gray", "James", "Reyes",
  "Cruz", "Hughes", "Price", "Myers", "Long", "Foster", "Sanders", "Ross", "Morales", "Powell",
  "Sullivan", "Russell", "Ortiz", "Jenkins", "Gutierrez", "Perry", "Butler", "Barnes", "Fisher", "Henderson"
];

const productNames = [
  "Laptop", "Smartphone", "Tablet", "Smartwatch", "Headphones", "Keyboard", "Mouse", "Monitor", "Webcam", "Printer",
  "Router", "External Hard Drive", "USB Flash Drive", "SD Card", "Gaming Console", "VR Headset", "Drone", "Action Camera", "Digital Camera", "Speaker",
  "Microphone", "Projector", "Smart TV", "Streaming Device", "E-reader", "Fitness Tracker", "Bluetooth Speaker", "Noise-Cancelling Headphones", "Wireless Earbuds", "Mechanical Keyboard",
  "Gaming Mouse", "Ultrawide Monitor", "Curved Monitor", "Portable Monitor", "All-in-One Printer", "Mesh Wi-Fi System", "NAS Drive", "SSD", "Graphics Card", "RAM Module",
  "Motherboard", "CPU", "Power Supply Unit", "Computer Case", "Laptop Stand", "Cooling Pad", "Docking Station", "USB Hub", "Cable Organizer", "Surge Protector",
  "Portable Charger", "Power Bank", "Wireless Charger", "Car Charger", "Wall Charger", "Travel Adapter", "Smart Plug", "Smart Bulb", "Smart Thermostat", "Security Camera",
  "Video Doorbell", "Smart Lock", "Robot Vacuum", "Air Purifier", "Humidifier", "Dehumidifier", "Blender", "Coffee Maker", "Toaster", "Microwave Oven",
  "Electric Kettle", "Instant Pot", "Air Fryer", "Slow Cooker", "Food Processor", "Stand Mixer", "Juicer", "Water Filter Pitcher", "Vacuum Sealer", "Sous Vide Cooker",
  "Digital Scale", "Measuring Cups", "Mixing Bowls", "Cookware Set", "Bakeware Set", "Knife Set", "Cutting Board", "Utensil Set", "Dish Rack", "Trash Can",
  "Desk Chair", "Standing Desk", "Bookshelf", "Filing Cabinet", "Desk Lamp", "Monitor Arm", "Ergonomic Mousepad", "Foot Rest", "Office Plant", "Whiteboard"
];

const countries = [
  "USA", "Canada", "Mexico", "Brazil", "Argentina", "UK", "Germany", "France", "Spain", "Italy",
  "Russia", "China", "Japan", "India", "Australia", "South Korea", "South Africa", "Egypt", "Nigeria", "Kenya",
  "Saudi Arabia", "UAE", "Turkey", "Iran", "Pakistan", "Indonesia", "Vietnam", "Thailand", "Philippines", "Malaysia",
  "Singapore", "New Zealand", "Chile", "Colombia", "Peru", "Venezuela", "Poland", "Ukraine", "Romania", "Netherlands",
  "Belgium", "Sweden", "Norway", "Denmark", "Finland", "Switzerland", "Austria", "Greece", "Portugal", "Ireland",
  "Czech Republic", "Hungary", "Slovakia", "Bulgaria", "Croatia", "Serbia", "Bosnia and Herzegovina", "Slovenia", "Lithuania", "Latvia",
  "Estonia", "Belarus", "Moldova", "Georgia", "Armenia", "Azerbaijan", "Kazakhstan", "Uzbekistan", "Turkmenistan", "Kyrgyzstan",
  "Tajikistan", "Afghanistan", "Bangladesh", "Sri Lanka", "Nepal", "Bhutan", "Myanmar", "Cambodia", "Laos", "Mongolia",
  "North Korea", "Papua New Guinea", "Fiji", "Samoa", "Tonga", "Solomon Islands", "Vanuatu", "Micronesia", "Marshall Islands", "Palau",
  "Israel", "Jordan", "Lebanon", "Syria", "Iraq", "Kuwait", "Qatar", "Bahrain", "Oman", "Yemen"
];

const cities = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "London", "Berlin", "Madrid", "Rome", "Paris", "Moscow", "Tokyo", "Beijing", "Shanghai", "Mumbai",
  "Delhi", "Sao Paulo", "Mexico City", "Cairo", "Lagos", "Istanbul", "Jakarta", "Seoul", "Buenos Aires", "Rio de Janeiro",
  "Toronto", "Sydney", "Melbourne", "Johannesburg", "Dubai", "Singapore", "Hong Kong", "Bangkok", "Kuala Lumpur", "Manila",
  "Warsaw", "Kyiv", "Bucharest", "Amsterdam", "Brussels", "Stockholm", "Oslo", "Copenhagen", "Helsinki", "Zurich",
  "Vienna", "Athens", "Lisbon", "Dublin", "Prague", "Budapest", "Bratislava", "Sofia", "Zagreb", "Belgrade",
  "Sarajevo", "Ljubljana", "Vilnius", "Riga", "Tallinn", "Minsk", "Chisinau", "Tbilisi", "Yerevan", "Baku",
  "Nur-Sultan", "Tashkent", "Ashgabat", "Bishkek", "Dushanbe", "Kabul", "Dhaka", "Colombo", "Kathmandu", "Thimphu",
  "Naypyidaw", "Phnom Penh", "Vientiane", "Ulaanbaatar", "Pyongyang", "Port Moresby", "Suva", "Apia", "Nukualofa", "Honiara",
  "Port Vila", "Palikir", "Majuro", "Ngerulmud", "Jerusalem", "Amman", "Beirut", "Damascus", "Baghdad", "Kuwait City"
];

const orderStatuses = ["Processing", "Shipped", "Delivered", "Cancelled", "Pending Payment", "On Hold", "Completed", "Refunded"];
const paymentMethods = ["Credit Card", "PayPal", "Bank Transfer", "Cash on Delivery", "Grynais užsakant"];
const paymentStatuses = ["Paid", "Pending", "Failed", "Refunded", "Apmokėta"];
const productStatuses = ["In Stock", "Out of Stock", "Pre-order", "Discontinued", "Maketas patvirtintas"];

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
  const price = (Math.random() * 200 + 5).toFixed(2); // Price between 5 and 205

  return {
    products_name: randomProductName,
    products_title: `${randomProductName} - ${getRandomElement(["Standard", "Premium", "Basic", "Deluxe", "Limited Edition"])}`,
    products_price: price,
    products_quantity: `${quantity}`,
    orders_products_id: `${90000 + baseIndex * 10 + itemIndex}`, // Unique product order ID
    products_sku: Math.random() > 0.7 ? {} : `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    product_status_id: `${Math.floor(1 + Math.random() * 20)}`,
    product_status: getRandomElement(productStatuses),
    product_id: `${1000 + baseIndex + itemIndex}`, // Semi-unique product ID
    reference_order_id: "0",
    product_production_due_date: getRandomDate(new Date(2025, 4, 26), new Date(2025, 5, 30)),
    reference_product_id: "0"
  };
}

function generateRandomJsonFile(isError: boolean, index: number) {
  const salesAgents = [
    "John Doe, tel. 123456789",
    "Jane Smith, tel. 987654321",
    "Michael Brown, tel. 555666777",
    "Emily Davis, tel. 444333222",
    {}, // Potential error case
    null, // Potential error case
    "Just Name", // Potential error case
  ];

  const randomFirstName = getRandomElement(firstNames);
  const randomLastName = getRandomElement(lastNames);
  const randomCountry = getRandomElement(countries);
  const randomCity = getRandomElement(cities);
  const customerName = `${randomFirstName} ${randomLastName}`;
  const customerEmail = `${randomFirstName.toLowerCase()}.${randomLastName.toLowerCase()}${index}@example.com`; // Ensure unique emails
  const customerPhone = `+${Math.floor(100000000 + Math.random() * 900000000)}`;
  const registerDate = getRandomDate(new Date(2015, 0, 1), new Date(2024, 11, 31));
  const orderDateFinished = getRandomDate(new Date(2025, 0, 1), new Date());
  const dueDate = getRandomDate(new Date(), new Date(2025, 5, 30));

  // Generate 1 to 3 product items
  const numItems = Math.floor(Math.random() * 3) + 1;
  const productItems = Array.from({ length: numItems }, (_, i) => generateRandomProductItem(index, i));
  const totalAmount = productItems.reduce((sum, item) => sum + parseFloat(item.products_price) * parseInt(item.products_quantity), 0);

  const baseData: any = {
    orders_id: `${60000 + index}`,
    order_number: `${60000 + index}`,
    user_id: `${300 + index}`,
    corporate_id: Math.random() > 0.9 ? `${Math.floor(10 + Math.random() * 90)}` : "0",
    order_status: getRandomElement(orderStatuses),
    orders_status_id: `${Math.floor(1 + Math.random() * 30)}`,
    orders_date_finished: orderDateFinished,
    airway_bill_number: Math.random() > 0.8 ? `AWB${Math.floor(100000 + Math.random() * 900000)}` : {},
    printer_name: Math.random() > 0.7 ? `${getRandomElement(firstNames)} Printer` : `Printer ${index}`,
    payment_method_name: getRandomElement(paymentMethods),
    total_amount: totalAmount.toFixed(2),
    order_amount: (totalAmount * 0.8).toFixed(2), // Example calculation
    shipping_amount: (totalAmount * 0.1).toFixed(2), // Example calculation
    tax_amount: (totalAmount * 0.1).toFixed(2), // Example calculation
    coupon_amount: Math.random() > 0.9 ? (totalAmount * 0.05).toFixed(2) : "0",
    orders_due_date: dueDate,
    orders_extrafield: Math.random() > 0.95 ? { custom_note: "Rush order" } : {},
    order_last_modified_date: getRandomDate(new Date(orderDateFinished), new Date()),
    po_number: Math.random() > 0.85 ? `PO-${Math.floor(1000 + Math.random() * 9000)}` : {},
    placed_by: `${randomFirstName} ${randomLastName} | ${customerPhone} | ${customerEmail}`,
    payment_due_date: dueDate,
    transactionid: Math.random() > 0.7 ? `txn_${Math.random().toString(36).substring(2, 15)}` : {},
    production_due_date: dueDate,
    payment_date: Math.random() > 0.5 ? getRandomDate(new Date(orderDateFinished), new Date()) : orderDateFinished,
    invoice_number: Math.random() > 0.6 ? `INV-${60000 + index}` : {},
    invoice_date: Math.random() > 0.6 ? getRandomDate(new Date(orderDateFinished), new Date()) : {},
    sales_agent_name: getRandomElement(salesAgents),
    payment_status_title: getRandomElement(paymentStatuses),
    process_status_set_as: Math.random() > 0.5 ? "Completed" : "Pending",

    product_details: {
      items: numItems === 1 ? productItems[0] : productItems // Single item or array
    },

    customer_details: {
      customers_name: customerName,
      customers_first_name: randomFirstName,
      customers_last_name: randomLastName,
      customers_company: Math.random() > 0.7 ? `${randomLastName} Inc.` : {},
      customers_telephone: customerPhone,
      extrafield: {},
      customers_email_address: customerEmail,
      customers_register_date: registerDate,
      reward_points: Math.random() > 0.8 ? `${Math.floor(Math.random() * 500)}` : {},
    },

    shipping_details: { // Often similar to billing or customer
      delivery_name: customerName,
      delivery_company: Math.random() > 0.8 ? `${randomLastName} Logistics` : {},
      delivery_street_address: `${Math.floor(1 + Math.random() * 1000)} Main St`,
      delivery_suburb: Math.random() > 0.9 ? `Suburb ${index}` : {},
      delivery_city: randomCity,
      delivery_postcode: `${Math.floor(10000 + Math.random() * 89999)}`,
      delivery_state: Math.random() > 0.8 ? `State ${index % 50}` : {},
      delivery_country: randomCountry,
      shipping_extrafield: {},
      delivery_state_code: Math.random() > 0.9 ? `${randomCountry.substring(0, 2).toUpperCase()}${index % 50}` : {},
    },

    billing_details: { // Often similar to shipping or customer
      billing_name: customerName,
      billing_company: Math.random() > 0.75 ? `${randomLastName} Holdings` : {},
      billing_street_address: `${Math.floor(1 + Math.random() * 1000)} Main St`,
      billing_suburb: {},
      billing_city: randomCity,
      billing_postcode: `${Math.floor(10000 + Math.random() * 89999)}`,
      billing_state: {},
      billing_country: randomCountry,
      billing_extrafield: {},
      billing_state_code: {},
    }
  };

  // --- Introduce Errors for 30% of files ---
  if (isError) {
    const errorType = Math.floor(Math.random() * 10); // Introduce different types of errors

    switch (errorType) {
      case 0: // Missing required root field
        delete baseData.orders_date_finished;
        break;
      case 1: // Missing required nested field
        if (baseData.customer_details) delete baseData.customer_details.customers_name;
        break;
      case 2: // Incorrect data type
        baseData.sales_agent_name = {}; // Common error from logs
        break;
      case 3: // Incorrect data type (amount)
        baseData.total_amount = null;
        break;
      case 4: // Missing nested object
        delete baseData.billing_details;
        break;
      case 5: // Empty required string
        if (baseData.customer_details) baseData.customer_details.customers_email_address = "";
        break;
      case 6: // Invalid date format
        baseData.orders_date_finished = "25-04-2025";
        break;
      case 7: // Missing product items entirely
         if (baseData.product_details) delete baseData.product_details.items;
         break;
      case 8: // Missing product price in one item
        if (baseData.product_details && baseData.product_details.items) {
            if (Array.isArray(baseData.product_details.items)) {
                if (baseData.product_details.items.length > 0) delete baseData.product_details.items[0].products_price;
            } else {
                 delete baseData.product_details.items.products_price;
            }
        }
        break;
      case 9: // Sales agent name is just null
        baseData.sales_agent_name = null;
        break;
      default: // Make sales_agent_name an empty object as a fallback error
         baseData.sales_agent_name = {};
         break;
    }
  }

  // --- Final check for specific null/undefined values that might break JSON.stringify ---
  // (Optional, but can prevent crashes if complex logic introduces undefined)
  // Example: if (baseData.someOptionalField === undefined) delete baseData.someOptionalField;


  return JSON.stringify(baseData, null, 2);
}

function createTestFiles() {
  // Ensure directories exist
  if (!fs.existsSync(hotfolder)) {
    fs.mkdirSync(hotfolder, { recursive: true });
  }
  if (!fs.existsSync(hotfolder)) {
    fs.mkdirSync(hotfolder, { recursive: true });
  }

  const totalFiles = 10000;
  const errorFilesCount = Math.floor(totalFiles * 0.3); // 30% error files
  // const processedFilesCount = totalFiles - errorFilesCount; // 70% processed files

  console.log(`Generating ${totalFiles} files (${errorFilesCount} errors, ${totalFiles - errorFilesCount} processed)...`);

  const userCache = new Map(); // Cache to reuse users

  // Create error files
  for (let i = 1; i <= errorFilesCount; i++) {
    const fileName = `orders_${60000 + i}.json`;
    const filePath = path.join(hotfolder, fileName);
    try {
      const userId = Math.floor(i / 1000) * 1000 + (i % 1000); // Reuse users every 1k orders
      const fileContent = generateRandomJsonFile(true, userId);
      fs.writeFileSync(filePath, fileContent, 'utf8');
    } catch (e) {
      console.error(`Error generating error file ${fileName}:`, e);
    }
    if (i % 500 === 0) console.log(`Generated ${i} error files...`);
  }

  console.log(`Finished generating ${errorFilesCount} error files.`);

  // Create processed files
  for (let i = errorFilesCount + 1; i <= totalFiles; i++) {
    const fileName = `orders_${60000 + i}.json`;
    const filePath = path.join(hotfolder, fileName);
    try {
      const userId = Math.floor(i / 1000) * 1000 + (i % 1000); // Reuse users every 1k orders
      const fileContent = generateRandomJsonFile(false, userId);
      fs.writeFileSync(filePath, fileContent, 'utf8');
    } catch (e) {
      console.error(`Error generating processed file ${fileName}:`, e);
    }
    if (i % 500 === 0) console.log(`Generated ${i - errorFilesCount} processed files...`);
  }
  console.log(`Finished generating ${totalFiles - errorFilesCount} processed files.`);

  console.log(`${totalFiles} test JSON files generated successfully!`);
}

createTestFiles();