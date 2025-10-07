# Notion Database Setup

## Database ID Extracted from Your Link

From the URL: `https://www.notion.so/spencergrantkyle/afb8a725775d430fa6b2fe72655f5c2d?v=41d91827b05f4689a7fd323fabd4a4dd&source=copy_link`

**Database ID:** `afb8a725775d430fa6b2fe72655f5c2d`
**View ID:** `41d91827b05f4689a7fd323fabd4a4dd`

## Quick Setup

1. Create a `.env` file in the root directory (if it doesn't exist):
   ```bash
   touch .env
   ```

2. Add these environment variables to your `.env` file:
   ```
   NOTION_API_KEY=your_actual_notion_api_key_here
   NOTION_DATABASE_ID=afb8a725775d430fa6b2fe72655f5c2d
   ```

3. Replace `your_actual_notion_api_key_here` with your actual Notion API key

4. Run the schema extraction script:
   ```bash
   npm run get-notion-schema
   ```

## What the Script Does

The `get-notion-schema.ts` script will:
- ✅ Connect to your Notion database
- ✅ Extract the complete schema (all properties and their types)
- ✅ Handle database views (if your link points to a view, it will fetch the source database)
- ✅ Show recommended mappings for agent data
- ✅ Save the schema to `notion-database-schema.json`

## After Running

Once you run the script, it will:
1. Display all database properties in the console
2. Show which properties are writable vs read-only
3. Provide recommended mappings for your agent data
4. Save everything to `notion-database-schema.json`

Then you can share the output with me to update the `notion-integration.ts` file!

