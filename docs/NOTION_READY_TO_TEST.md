# ✅ Notion Integration - Ready to Test!

## What We've Done

1. ✅ Extracted the complete database schema (17 properties)
2. ✅ Updated `notion-integration.ts` with correct property mappings
3. ✅ Added all missing properties (Created At, Problems summary)
4. ✅ Created comprehensive test script

## Database Configuration

**Important:** Use the **VIEW ID**, not the source database ID!

### Your `.env` File Should Have:

```bash
# Notion Configuration
NOTION_API_KEY=your_actual_api_key_here
NOTION_DATABASE_ID=afb8a725775d430fa6b2fe72655f5c2d
```

**Note:** We use the view ID `afb8a725775d430fa6b2fe72655f5c2d` because that's what your integration has access to.

## Properties Being Saved

The integration will save these properties to your Notion database:

### Core Properties
- ✅ **Name** (Title) - Contact name
- ✅ **Company** (Rich Text) - Company name  
- ✅ **Contact Handle** (Rich Text) - Username/handle
- ✅ **Platform** (Select) - Platform (Telegram, WhatsApp, etc.)

### Metrics
- ✅ **Problems Count** (Number) - Number of problems identified
- ✅ **Research Count** (Number) - Number of research items found
- ✅ **Problems** (Rich Text) - Summary of first 3 problems

### Constraints & Context
- ✅ **Budget** (Rich Text) - Budget information
- ✅ **Deadline** (Rich Text) - Deadline information
- ✅ **Team Size** (Rich Text) - Team size
- ✅ **Tech Stack** (Rich Text) - Technology stack
- ✅ **Top Solution** (Rich Text) - Highest-impact research item

### Metadata
- ✅ **Source** (Select) - Voice or Text
- ✅ **Status** (Select) - Default: "New"
- ✅ **Created At** (Date) - Auto-generated timestamp
- ✅ **Local File** (Rich Text) - Path to local audio file (if voice)

### Page Content (Blocks)
The page will also include rich content blocks:
- 🚨 Problems section (bulleted list)
- 🎯 Priorities section (with impact/effort scores)
- 🔍 Research items section (with URLs and relevance)
- 📄 Full markdown report

## How to Test

### Step 1: Verify Your .env File

Make sure your `.env` file has:
- ✅ Valid `NOTION_API_KEY`
- ✅ `NOTION_DATABASE_ID=afb8a725775d430fa6b2fe72655f5c2d`

### Step 2: Run the Test

```bash
npm run test-notion-save
```

This will:
1. Test the Notion connection
2. Create a sample contact with all fields populated
3. Return a Notion page URL
4. Show detailed success/error messages

### Step 3: Verify in Notion

1. Click the Notion URL from the test output
2. Check that all properties are populated correctly
3. Review the page content (problems, priorities, research)
4. Delete the test contact if you don't need it

## Troubleshooting

### Error: "object_not_found"
**Solution:** Database not shared with integration
1. Go to your Notion database
2. Click "..." → "Connections"  
3. Add your integration

### Error: "validation_error"
**Solution:** Property name mismatch
- Property names in the code must exactly match your Notion database
- Check for typos or case differences

### Error: "unauthorized"
**Solution:** Invalid API key
- Generate new token at https://www.notion.so/my-integrations
- Update `NOTION_API_KEY` in `.env`

## Property Mapping Reference

| Agent Field | Notion Property | Type |
|------------|----------------|------|
| `contact_name` | Name | title |
| `company` | Company | rich_text |
| `contact_handle` | Contact Handle | rich_text |
| `contact_platform` | Platform | select |
| `problems.length` | Problems Count | number |
| `research_items.length` | Research Count | number |
| `problems[0-2]` | Problems | rich_text |
| `constraints.budget` | Budget | rich_text |
| `constraints.deadline` | Deadline | rich_text |
| `constraints.team_size` | Team Size | rich_text |
| `constraints.stack` | Tech Stack | rich_text |
| `research_items[0].title` | Top Solution | rich_text |
| - | Source | select |
| - | Status | select |
| - | Created At | date |
| - | Local File | rich_text |

## Next Steps

Once the test passes:
1. ✅ Delete the test contact
2. ✅ Run your actual agent workflow
3. ✅ Verify real data is being saved correctly
4. ✅ Enjoy automated Notion updates! 🎉

---

**Ready?** Run: `npm run test-notion-save`

