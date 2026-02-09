export interface ParsedEmailData {
    campName: string;
    guardianEmail: string;
    guardianName: string;
    amount: number;
    rawText: string;
}

export class EmailParserService {
    static parse(subject: string, body: string, sender: string): ParsedEmailData | null {
        // Basic Pattern Matching based on expected "Forwarded" format
        // We look for "Product:", "Buyer Email:", "Buyer Name:", "Amount:"

        const campNameMatch = body.match(/Product:\s*(.+)/i);
        const buyerEmailMatch = body.match(/Buyer Email:\s*(.+)/i);
        const buyerNameMatch = body.match(/Buyer Name:\s*(.+)/i);
        const amountMatch = body.match(/Amount:\s*(\d+)/i);

        if (!campNameMatch || !buyerEmailMatch) {
            console.error("Failed to parse critical fields from email body");
            return null;
        }

        return {
            campName: campNameMatch[1].trim(),
            guardianEmail: buyerEmailMatch[1].trim(),
            guardianName: buyerNameMatch ? buyerNameMatch[1].trim() : "Unknown",
            amount: amountMatch ? parseInt(amountMatch[1], 10) : 0,
            rawText: body
        };
    }
}
