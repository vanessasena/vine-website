# Scaling to Hundreds of Sermons - Migration Guide

## 🎯 **Current vs. Scalable Architecture**

### Current (Good for < 50 sermons):
```
/src/data/sermons.ts - Single file with all sermons
```

### Scalable (Good for 100+ sermons):
```
/src/data/
├── sermons-enhanced.ts          # API functions
├── sermons/
│   ├── metadata/
│   │   ├── 2025.json           # Year-based metadata files
│   │   ├── 2024.json
│   │   └── 2023.json
│   └── content/
│       ├── 2025/
│       │   ├── obedecer-e-melhor-2025-11-02.md
│       │   └── fe-e-crescimento-2025-10-26.md
│       └── 2024/
│           └── ...
└── series/
    └── series.json             # Sermon series data
```

## 📊 **Migration Steps**

### Step 1: Organize by Year (50-100 sermons)
Instead of one large array, split into yearly files:

```typescript
// /src/data/sermons/2025-metadata.json
[
  {
    "id": "obedecer-e-melhor-que-agradar-2025-11-02",
    "title": {
      "pt": "Obedecer é Melhor que Agradar",
      "en": "Obedience is Better than Pleasing"
    },
    "preacher": "Pr Boris Carvalho",
    "date": "2025-11-02",
    "scripture": "1 Samuel 15:22",
    "excerpt": {
      "pt": "...",
      "en": "..."
    },
    "contentFile": "2025/obedecer-e-melhor-2025-11-02.md"
  }
]
```

### Step 2: Separate Content Files (100+ sermons)
Store sermon content in separate Markdown files:

```markdown
<!-- /src/data/sermons/content/2025/obedecer-e-melhor-2025-11-02.md -->
---
id: "obedecer-e-melhor-que-agradar-2025-11-02"
title:
  pt: "Obedecer é Melhor que Agradar"
  en: "Obedience is Better than Pleasing"
locale: pt
---

# Obedecer é Melhor que Agradar

**Introdução**

No domingo passado ministramos...

[Rest of sermon content]
```

### Step 3: Implement Lazy Loading
Load sermon data on-demand instead of all at once:

```typescript
// Enhanced API with lazy loading
export const loadSermonsByYear = async (year: number): Promise<SermonMetadata[]> => {
  try {
    const response = await import(`./sermons/metadata/${year}.json`);
    return response.default;
  } catch {
    return [];
  }
};

export const loadSermonContent = async (contentFile: string): Promise<string> => {
  try {
    const response = await import(`./sermons/content/${contentFile}`);
    return response.default;
  } catch {
    return '';
  }
};
```

## 🚀 **Immediate Benefits with Enhanced System**

The enhanced system I've created provides these features immediately:

### 1. **Pagination**
```typescript
// Get page 2 with 12 sermons per page
const { sermons, totalPages, currentPage } = getPaginatedSermons(2);
```

### 2. **Search Functionality**
```typescript
// Search in titles, excerpts, preacher names, and scriptures
const results = searchSermons("fé", "pt");
```

### 3. **Filter by Series**
```typescript
// Group sermons by teaching series
const seriesSermons = getSermonsBySeries("fe-e-crescimento");
```

### 4. **Filter by Year**
```typescript
// Show only 2025 sermons
const yearSermons = getSermonsByYear(2025);
```

### 5. **Filter by Preacher**
```typescript
// Show sermons by specific preacher
const preacherSermons = getSermonsByPreacher("Pr Boris Carvalho");
```

## 💡 **Database Alternative (500+ sermons)**

For very large collections, consider a simple database solution:

### Option 1: SQLite (Local Database)
```sql
-- sermons.sql
CREATE TABLE sermons (
  id TEXT PRIMARY KEY,
  title_pt TEXT,
  title_en TEXT,
  preacher TEXT,
  date DATE,
  excerpt_pt TEXT,
  excerpt_en TEXT,
  content_pt TEXT,
  content_en TEXT,
  scripture TEXT,
  series_id TEXT,
  created_at TIMESTAMP
);

CREATE INDEX idx_sermons_date ON sermons(date DESC);
CREATE INDEX idx_sermons_preacher ON sermons(preacher);
CREATE INDEX idx_sermons_series ON sermons(series_id);
```

### Option 2: Headless CMS (Content Management)
- **Strapi**: Self-hosted, full control
- **Contentful**: Cloud-based, easy to use
- **Sanity**: Developer-friendly
- **Ghost**: Blog-focused with API

## 🛠 **Implementation Plan for Your Church**

### Phase 1 (Now - 20 sermons):
- ✅ Use current single-file system
- ✅ Enhanced API already implemented

### Phase 2 (20-100 sermons):
- Switch to enhanced API (already created)
- Add pagination to sermon listing page
- Implement search functionality

### Phase 3 (100+ sermons):
- Migrate to year-based files
- Implement content file separation
- Add lazy loading

### Phase 4 (500+ sermons):
- Consider database solution
- Implement admin interface for easy content management

## 📱 **Enhanced Sermon Pages to Implement**

### 1. Sermon Archive Page
```
/sermons/archive
- Filter by year
- Filter by preacher
- Filter by series
- Search functionality
```

### 2. Sermon Series Pages
```
/sermons/series/[seriesId]
- List all sermons in series
- Series description and artwork
- Progress tracking
```

### 3. Search Results Page
```
/sermons/search?q=faith
- Search results with highlighting
- Filters and sorting options
```

## 🔄 **Weekly Workflow with Enhanced System**

### Current Process:
1. Edit `/src/data/sermons.ts`
2. Add new sermon object
3. Deploy

### Enhanced Process (when needed):
1. Create sermon metadata in appropriate year file
2. Create content file in Markdown
3. Auto-deployment picks up changes

## 📈 **Performance Benefits**

- **Lazy Loading**: Only load sermons when needed
- **Pagination**: Faster page loads with 12 sermons per page
- **Search Indexing**: Quick search without loading all content
- **Caching**: Browser can cache individual sermon files
- **SEO**: Better URL structure and metadata

The enhanced system is ready to use immediately and will scale smoothly as your sermon library grows!