interface ValidationResult {
    isValid: boolean;
    message?: string;
}

export function validateOrderData(jsonData: any): ValidationResult {
    const requiredFields = {
        root: ['user_id', 'orders_id', 'order_number', 'total_amount', 'orders_date_finished', 'payment_status_title', 'payment_method_name'],
        customer_details: ['customers_name', 'customers_first_name', 'customers_last_name', 'customers_telephone', 'customers_email_address', 'customers_register_date'],
        product_details: ['items'],
        billing_details: ['billing_country', 'billing_city']
    };

    for (const field of requiredFields.root) {
        if (jsonData[field] === undefined) {
            return { isValid: false, message: `Missing required field: ${field}` };
        }
    }

    if (jsonData.payment_status_title !== 'Apmokėta') {
        return { isValid: false, message: 'Order is not paid skiping it' }
    }

    // Validate sales_agent_name to ensure it includes both a name and a phone number
    if (typeof jsonData.sales_agent_name !== 'string' || !jsonData.sales_agent_name.includes('tel.')) {
        return { isValid: false, message: 'Invalid sales_agent_name: must include both a name and a phone number' };
    }

    if (!jsonData.customer_details) {
        return { isValid: false, message: 'Missing customer_details object' };
    }
    for (const field of requiredFields.customer_details) {
        if (jsonData.customer_details[field] === undefined) {
            return { isValid: false, message: `Missing required field: customer_details.${field}` };
        }
    }

    if (!jsonData.product_details) {
        return { isValid: false, message: 'Missing product_details object' };
    }
    if (jsonData.product_details.items === undefined) {
        return { isValid: false, message: 'Missing required field: product_details.items' };
    }
    const items = Array.isArray(jsonData.product_details.items)
        ? jsonData.product_details.items
        : [jsonData.product_details.items];

    if (items.length === 0) {
        return { isValid: false, message: 'No product items found' };
    }

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.product_id) {
            return { isValid: false, message: `Missing product_id for item at index ${i}` };
        }
        if (!item.products_title) {
            return { isValid: false, message: `Missing products_title for item at index ${i}` };
        }
        if (!item.products_price) {
            return { isValid: false, message: `Missing products_price for item at index ${i}` };
        }
        if (!item.products_quantity) {
            return { isValid: false, message: `Missing products_quantity for item at index ${i}` };
        }
    }
    if (!jsonData.billing_details) {
        return { isValid: false, message: 'Missing billing_details object' };
    }
    for (const field of requiredFields.billing_details) {
        if (jsonData.billing_details[field] === undefined) {
            return { isValid: false, message: `Missing required field: billing_details.${field}` };
        }
    }

    return { isValid: true };
}