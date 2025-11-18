# Quick Start: Adding Your First Sermon to Supabase

This guide will help you quickly add your first sermon to the Supabase database.

## Prerequisites

- Supabase project created
- Database table created (using `supabase-schema.sql`)
- Environment variables configured in production

## Option 1: Using Supabase Dashboard (Recommended for Now)

1. **Log in to Supabase**
   - Go to https://supabase.com
   - Navigate to your project

2. **Open Table Editor**
   - Click on "Table Editor" in the left sidebar
   - Select the "sermons" table

3. **Insert a New Row**
   - Click the "Insert row" button
   - Fill in the fields:

   ```
   id: your-sermon-slug-2025-11-02
   title_pt: Título em Português
   title_en: Title in English
   preacher: Pr Boris Carvalho
   date: 2025-11-02
   excerpt_pt: Breve descrição em português
   excerpt_en: Brief description in English
   content_pt: # Conteúdo em Markdown
   
   Seu conteúdo aqui...
   
   content_en: # Content in Markdown
   
   Your content here...
   
   scripture: Salmo 23:1
   ```

4. **Save**
   - Click "Save" button
   - The sermon will appear on the website immediately!

## Option 2: Using SQL Editor

1. **Open SQL Editor** in Supabase
2. **Paste this template** (modify with your sermon data):

```sql
INSERT INTO public.sermons (
    id,
    title_pt,
    title_en,
    preacher,
    date,
    excerpt_pt,
    excerpt_en,
    content_pt,
    content_en,
    scripture
) VALUES (
    'your-sermon-slug-2025-11-02',
    'Título em Português',
    'Title in English',
    'Pr Boris Carvalho',
    '2025-11-02',
    'Breve descrição em português',
    'Brief description in English',
    '# Título em Português

Conteúdo completo da mensagem em Markdown...

## Seção 1

Texto...

> Citação bíblica

**Conclusão**',
    '# Title in English

Full message content in Markdown...

## Section 1

Text...

> Bible quote

**Conclusion**',
    'Salmo 23:1'
);
```

3. **Run** the query
4. The sermon is now live!

## ID Format Convention

Use this format for sermon IDs:
```
sermon-topic-YYYY-MM-DD
```

Examples:
- `amor-de-deus-2025-11-02`
- `fe-que-vence-2025-11-09`
- `obedience-is-better-2025-11-02`

## Markdown Tips

The content fields support Markdown:

- **Headers**: Use `#`, `##`, `###`
- **Bold**: Use `**text**`
- **Italic**: Use `*text*`
- **Quotes**: Use `> quote text`
- **Lists**: Use `-` or `1.`
- **Line breaks**: Use blank lines

Example:
```markdown
# Title

**Introduction**

This is regular text.

> This is a Bible verse quote

### Main Points

1. First point
2. Second point

**Conclusion**

Final thoughts...
```

## Verify Your Sermon

After adding a sermon:

1. Go to your website: `https://yoursite.com/pt/sermons` or `/en/sermons`
2. Check that the sermon appears in the list
3. Click on the sermon to view the full content
4. Verify both Portuguese and English versions

## Common Issues

### Sermon not appearing?
- Check that the date is in `YYYY-MM-DD` format
- Verify both language fields are filled
- Check browser console for errors

### Content not formatting correctly?
- Make sure you're using proper Markdown syntax
- Check for special characters that need escaping
- Test with simple content first, then add formatting

### Can't edit/delete?
- You need to be authenticated in Supabase dashboard
- Or wait for the admin page to be built

## Next Steps

Once the admin page is built, you'll be able to:
- Add sermons through a user-friendly interface
- Edit existing sermons
- Delete old sermons
- Upload images
- Preview content before publishing

For now, use the Supabase dashboard for CRUD operations.

## Need Help?

See the full documentation in `SUPABASE_SETUP.md` for:
- Detailed schema information
- Troubleshooting guide
- Security best practices
- Migration from static data
