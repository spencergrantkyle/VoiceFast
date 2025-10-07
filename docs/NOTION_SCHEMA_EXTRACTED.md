# Notion Database Schema - OpenAI Agent Contacts

**Extracted from:** Screenshot of Notion database
**Database Name:** OpenAI Agent Contacts
**Database View URL:** https://www.notion.so/afb8a725775d430fa6b2fe72655f5c2d

## Properties Found (17 total)

### 1. **Name** (Title)
- Type: `title`
- Required: Yes
- Description: Contact name (title field)

### 2. **Company** (Rich Text)
- Type: `rich_text`
- Description: Company name

### 3. **Contact Handle** (Rich Text)
- Type: `rich_text`
- Description: Contact handle/username

### 4. **Platform** (Select)
- Type: `select`
- Description: Platform where contact was made

### 5. **Problems Count** (Number)
- Type: `number`
- Description: Number of problems identified

### 6. **Research Count** (Number)
- Type: `number`
- Description: Number of research items

### 7. **Status** (Select)
- Type: `select`
- Description: Contact status

### 8. **Source** (Select)
- Type: `select`
- Description: Source type (voice/text)

### 9. **Created At** (Date)
- Type: `date`
- Description: Creation date

### 10. **Budget** (Rich Text)
- Type: `rich_text`
- Description: Budget information

### 11. **Deadline** (Rich Text)
- Type: `rich_text`
- Description: Deadline information

### 12. **Team Size** (Rich Text)
- Type: `rich_text`
- Description: Team size information

### 13. **Tech Stack** (Rich Text)
- Type: `rich_text`
- Description: Technology stack

### 14. **Top Solution** (Rich Text)
- Type: `rich_text`
- Description: Top solution identified

### 15. **Notion URL** (URL)
- Type: `url`
- Description: Notion page URL

### 16. **Local File** (Files)
- Type: `files`
- Description: Local file attachments

### 17. **Problems** (Rich Text)
- Type: `rich_text`
- Description: Problems description

---

## Property Summary by Type

### Title (1)
- Name

### Rich Text (8)
- Company
- Contact Handle
- Budget
- Deadline
- Team Size
- Tech Stack
- Top Solution
- Problems

### Number (2)
- Problems Count
- Research Count

### Select (3)
- Platform
- Status
- Source

### Date (1)
- Created At

### URL (1)
- Notion URL

### Files (1)
- Local File

---

## Recommended Agent → Notion Mapping

| Agent Field | Notion Property |
|------------|----------------|
| `contact_name` | Name |
| `company` | Company |
| `contact_handle` | Contact Handle |
| `contact_platform` | Platform |
| `problems_count` | Problems Count |
| `research_count` | Research Count |
| `status` | Status |
| `source` | Source |
| `budget` | Budget |
| `deadline` | Deadline |
| `team_size` | Team Size |
| `tech_stack` | Tech Stack |
| `top_solution` | Top Solution |
| `problems_description` | Problems |

---

## Next Steps

1. ✅ Schema has been extracted and saved to `notion-database-schema.json`
2. 🔄 Update `notion-integration.ts` to use these property names
3. 📝 Ensure the property mappings match your agent's output structure
4. 🔑 Make sure to share the source database with your Notion integration

---

## Files Created

- `notion-database-schema.json` - Complete schema in JSON format
- `NOTION_SCHEMA_EXTRACTED.md` - This summary document

You can now use this schema to update your `notion-integration.ts` file!

