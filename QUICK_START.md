# Kids Check-In System - Quick Start Guide

## 🚀 Getting Started (3 Steps)

### Step 1: Run Setup Script (1 minute)
```bash
node setup-checkin-api.js
```
This creates the API route directories and moves files to the correct locations.

### Step 2: Deploy Database (2 minutes)
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Open `supabase-checkin-schema.sql`
4. Copy all content
5. Paste into SQL Editor
6. Click "Run"
7. Wait for "Success" message

### Step 3: Assign Teacher Role (30 seconds)
In Supabase SQL Editor, run:
```sql
UPDATE public.users SET role = 'teacher' 
WHERE email = 'teacher@vinechurch.ca';
```
Replace with actual teacher email address. Repeat for each teacher.

## ✅ What's Included

| Component | Status | Location |
|-----------|--------|----------|
| Database Schema | ✅ Ready | `supabase-checkin-schema.sql` |
| Check-ins API | ✅ Ready | After running setup script |
| Visitor Children API | ✅ Ready | After running setup script |
| Portuguese Translations | ✅ Ready | `messages/pt.json` |
| English Translations | ✅ Ready | `messages/en.json` |
| Setup Script | ✅ Ready | `setup-checkin-api.js` |
| UI Components | ⏳ Next Phase | To be created |

## 📚 Documentation

- **Quick Start**: This file (`QUICK_START.md`)
- **Complete Guide**: `KIDS_CHECKIN_IMPLEMENTATION.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`

## 🔧 Troubleshooting

**Problem:** Setup script errors
- **Solution**: Make sure you're in the project root directory

**Problem:** Database schema fails
- **Solution**: Check if tables already exist. If so, drop them first or modify the schema.

**Problem:** Teacher role assignment fails
- **Solution**: Verify the email address exists in the users table

**Problem:** API routes return 404
- **Solution**: Make sure you ran `setup-checkin-api.js` successfully

## 🎯 Next Steps

After completing the 3 steps above:

1. **Verify Setup**:
   - Check that `src/app/api/check-ins/route.ts` exists
   - Check that `src/app/api/visitor-children/route.ts` exists
   - Verify database tables are created in Supabase

2. **Test APIs** (optional):
   - Use an API client (Postman, Insomnia) to test the endpoints
   - GET `/api/check-ins` should return empty array
   - GET `/api/visitor-children` should return empty array

3. **Build UI**:
   - Follow the UI implementation guide in `KIDS_CHECKIN_IMPLEMENTATION.md`
   - Or wait for the UI components to be created

## 📖 Key Features

### For Teachers:
- ✅ Check in member children
- ✅ Check in visitor children
- ✅ View currently checked-in children
- ✅ Check out children
- ✅ Search visitor children

### Data Collected:
- Child information (name, age)
- Parent contact (name, phone, email)
- Medical information (allergies, special needs)
- Emergency contact
- Photo permission
- Check-in/out timestamps
- Teacher names

## 🔒 Security

- All data protected by Row Level Security (RLS)
- Only teachers and admins can check in/out children
- Parents can only see their own children's check-ins
- All API routes require authentication
- Role-based access control

## 💡 Tips

1. **Assign Multiple Teachers**: Run the UPDATE query multiple times with different email addresses
2. **Test with Sample Data**: Create a test visitor child to verify the system works
3. **Backup First**: Always backup your database before running new schema
4. **Check Permissions**: Make sure your Supabase service role key is set in environment variables

## 🆘 Need Help?

- Check `KIDS_CHECKIN_IMPLEMENTATION.md` for detailed documentation
- Review `IMPLEMENTATION_SUMMARY.md` for feature overview
- Examine database schema in `supabase-checkin-schema.sql`
- Look at API route files for endpoint details

## 📁 Project Structure After Setup

```
vine-website/
├── src/
│   └── app/
│       └── api/
│           ├── check-ins/
│           │   └── route.ts  ← Check-ins API
│           └── visitor-children/
│               └── route.ts  ← Visitor children API
├── messages/
│   ├── pt.json  ← Portuguese (updated)
│   └── en.json  ← English (updated)
├── supabase-checkin-schema.sql  ← Database schema
├── setup-checkin-api.js  ← Setup script
├── QUICK_START.md  ← This file
├── KIDS_CHECKIN_IMPLEMENTATION.md  ← Full guide
└── IMPLEMENTATION_SUMMARY.md  ← Summary
```

## ✨ You're Done!

After completing the 3 steps, your backend is ready. The check-in system can now:
- Accept check-ins via API
- Store data securely in Supabase
- Enforce role-based permissions
- Support both Portuguese and English

Next phase: Build the UI components to provide a user-friendly interface for teachers.

---
**Questions?** Check the implementation guide or review the code comments.
