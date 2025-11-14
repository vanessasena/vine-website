# Sermon Management System

## Overview
The website includes a complete sermon management system that allows easy addition and display of weekly sermons. The system supports bilingual content (Portuguese/English) and provides both listing and detailed views.

## File Structure
- **Sermon Data**: `/src/data/sermons.ts` - Central storage for all sermons
- **Sermon List Page**: `/src/app/[locale]/sermons/page.tsx` - Shows all sermons in card format
- **Individual Sermon Page**: `/src/app/[locale]/sermons/[id]/page.tsx` - Shows full sermon content

## Adding a New Sermon

### Step 1: Add Sermon Data
Open `/src/data/sermons.ts` and add a new sermon object to the `sermons` array:

```typescript
{
  id: "unique-sermon-id", // Use kebab-case format (e.g., "fe-e-crescimento-2025-01-19")
  title: {
    pt: "Título em Português",
    en: "Title in English"
  },
  date: new Date('2025-01-19'), // Sermon date
  preacher: "Pr Boris Carvalho", // Preacher name
  scripture: "João 15:1-8", // Scripture reference (optional)
  excerpt: {
    pt: "Resumo da mensagem em português...",
    en: "Message summary in English..."
  },
  content: {
    pt: `# Título Principal

## Introdução
Conteúdo da mensagem em português...

### Pontos Principais
- Primeiro ponto
- Segundo ponto

> "Versículo importante" - Referência

## Conclusão
Conclusão da mensagem...`,
    en: `# Main Title

## Introduction
Message content in English...

### Main Points
- First point
- Second point

> "Important verse" - Reference

## Conclusion
Message conclusion...`
  }
}
```

### Step 2: Content Formatting
The sermon content supports simple markdown formatting:

- **Headers**: Use `#`, `##`, `###`
- **Bold Text**: Use `**bold text**`
- **Italic Text**: Use `*italic text*`
- **Quotes**: Use `> quote text`
- **Lists**: Use `- item` or `1. item`
- **Horizontal Rule**: Use `---`

### Step 3: URLs
Once added, the sermon will be automatically available at:
- Portuguese: `/pt/sermons/[sermon-id]`
- English: `/en/sermons/[sermon-id]`

## Best Practices

### ID Generation
- Use kebab-case format
- Include main topic and date: `fe-e-crescimento-2025-01-19`
- Keep it descriptive but concise

### Content Structure
1. Start with a main title (`#`)
2. Add introduction section
3. Include main points with subheadings
4. Use quotes for important Bible verses
5. End with conclusion

### Translation Tips
- Keep structure consistent between languages
- Translate all content including titles and excerpts
- Ensure scripture references are appropriate for each language

## Example Weekly Workflow

1. After Sunday service, prepare sermon content
2. Create unique ID based on sermon topic and date
3. Add bilingual title, excerpt, and full content
4. Test the sermon page locally
5. Deploy to production

## File Management
- All sermons are stored in one file for easy management
- The system automatically sorts by date (newest first)
- No database required - everything is file-based
- Easy to backup and version control

## Troubleshooting

### Common Issues
1. **Duplicate IDs**: Ensure each sermon has a unique ID
2. **Formatting Issues**: Check markdown syntax
3. **Missing Translations**: Ensure both PT and EN content is provided

### Testing
- Run `npm run dev` to test locally
- Navigate to `/pt/sermons` or `/en/sermons`
- Check individual sermon pages work correctly

## Navigation Integration
Sermons are automatically integrated into the main navigation:
- Portuguese: "Palavras" menu item
- English: "Sermons" menu item