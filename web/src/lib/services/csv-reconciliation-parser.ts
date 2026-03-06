import Papa from 'papaparse';

export interface ShopSaleTransaction {
    orderId: string;
    orderStatus: string;
    orderNumber: string;
    orderDate: string;
    guardianName: string;
    guardianEmail: string;
    productName: string;
    productSku: string;
    quantity: number;
    price: number;
}

export class CsvReconciliationParser {
    static parseSalesCsv(csvString: string): ShopSaleTransaction[] {
        const parsed = Papa.parse(csvString, {
            header: true,
            skipEmptyLines: true,
        });

        if (parsed.errors.length > 0) {
            console.warn("[CSV Parser] Warnings during CSV parse:", parsed.errors);
        }

        const transactions: ShopSaleTransaction[] = [];

        for (const row of parsed.data as any[]) {
            // Filter only relevant products if necessary, or let the caller decide.
            // For now, we return records that look like valid sales lines.

            // Clean up the price by attempting to parse it as a float
            const rawPrice = row['Row Price'] || row['Unit Price'] || '0';
            const price = parseFloat(rawPrice.replace(/[^0-9.-]+/g, '')) || 0;
            const quantity = parseInt(row['Quantity'], 10) || 1;

            if (row['Billing Email'] || row['Delivery Name']) {
                transactions.push({
                    orderId: row['OrderID'] || '',
                    orderStatus: row['Order Status'] || '',
                    orderNumber: row['Order Number'] || '',
                    orderDate: row['Order Date'] || '',
                    guardianName: row['Billing Name'] || row['Delivery Name'] || '',
                    guardianEmail: row['Billing Email'] || '',
                    productName: row['Product Name'] || '',
                    productSku: row['Product SKU/Code'] || '',
                    quantity,
                    price
                });
            }
        }

        return transactions;
    }
}
