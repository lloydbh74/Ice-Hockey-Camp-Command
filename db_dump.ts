import { getDb } from './web/src/lib/db';

async function main() {
    const db = await getDb();
    
    console.log("--- FORMS TABLE ---");
    const forms = await db.prepare("SELECT id, name, version, schema_json FROM Forms").all();
    console.log(JSON.stringify(forms.results, null, 2));
    
    console.log("\n--- PRODUCTS TABLE ---");
    const products = await db.prepare("SELECT id, name, form_template_id FROM Products").all();
    console.log(JSON.stringify(products.results, null, 2));
    
    console.log("\n--- FORM TEMPLATES TABLE ---");
    const templates = await db.prepare("SELECT id, name, schema_json FROM FormTemplates").all();
    console.log(JSON.stringify(templates.results, null, 2));
}

main().catch(console.error);
