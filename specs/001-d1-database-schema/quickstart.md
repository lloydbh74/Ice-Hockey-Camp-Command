# Quickstart: D1 Database Schema

This guide provides a quick introduction to deploying and interacting with the D1 database schema for the Swedish Camp Command application.

## Prerequisites

-   Cloudflare account with Workers and D1 enabled.
-   `wrangler` CLI installed and configured.

## 1. Deploying the D1 Schema

The database schema is defined in `data-model.md` (specifically the SQL `CREATE TABLE` statements). To deploy this schema to a D1 database:

1.  **Create a D1 Database**: If you don't have one, create a D1 database using the `wrangler` CLI:
    ```bash
    wrangler d1 create "ciha-swedish-camp-db"
    ```
    Note the `database_id` and `database_name` from the output.

2.  **Extract Schema SQL**: Copy the `CREATE TABLE` statements from `specs/001-d1-database-schema/data-model.md` into a new SQL file, for example, `schema.sql`.

3.  **Execute Schema**: Use `wrangler d1 execute` to apply the schema to your D1 database:
    ```bash
    wrangler d1 execute <YOUR_DB_NAME> --file=./schema.sql
    ```
    Replace `<YOUR_DB_NAME>` with the `database_name` from step 1.

## 2. Seeding Initial Data

To populate your database with sample data, you would typically write a separate SQL seeding script (e.g., `seed.sql`). This script would contain `INSERT` statements for your tables.

1.  **Create a Seed Script**: Create a file named `seed.sql` with `INSERT` statements for `Camps`, `Products`, `Guardians`, etc.
    Example (simplified):
    ```sql
    INSERT INTO Camps (name, year) VALUES ('Hat-Trick Heroes', 2026);
    INSERT INTO Products (name, description) VALUES ('Hat-Trick Heroes 2026 Camp', 'Full week camp');
    -- ... more INSERT statements
    ```

2.  **Execute Seed Script**: Apply the seed data to your D1 database:
    ```bash
    wrangler d1 execute <YOUR_DB_NAME> --file=./seed.sql
    ```

## 3. Basic Database Interaction

You can interact with your D1 database using `wrangler d1` commands or through a Cloudflare Worker.

### Via `wrangler d1` CLI

To run a simple query directly from the CLI:
```bash
wrangler d1 execute <YOUR_DB_NAME> --command="SELECT * FROM Camps;"
```

### Via Cloudflare Worker

In your Cloudflare Worker, you would bind your D1 database as a `D1Database` object.
Example `worker.js`:

```javascript
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === "/camps") {
      const { results } = await env.DB.prepare("SELECT * FROM Camps").all();
      return Response.json(results);
    }

    return new Response("Not Found", { status: 404 });
  },
};
```
Make sure to configure your `wrangler.toml` to bind the D1 database:
```toml
# wrangler.toml
[[d1_databases]]
binding = "DB" # D1Database gets bound to `env.DB` in your Worker
database_name = "ciha-swedish-camp-db"
database_id = "<YOUR_DB_ID>"
```

Replace `<YOUR_DB_ID>` with the `database_id` obtained when creating the D1 database.
