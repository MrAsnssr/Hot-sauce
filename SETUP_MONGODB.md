# MongoDB Connection String Setup

## Your Connection Details

**Username:** `Asnssr`  
**Cluster:** `hotsauce.kxdewwm.mongodb.net`  
**Database Name:** `arabic-trivia` (you can change this)

## Complete Connection String

Replace `YOUR_PASSWORD_HERE` with your actual MongoDB password:

```
mongodb+srv://Asnssr:YOUR_PASSWORD_HERE@hotsauce.kxdewwm.mongodb.net/arabic-trivia?retryWrites=true&w=majority
```

## Steps to Complete Setup

### 1. Get Your Password
- Go to MongoDB Atlas → Database Access
- Find user `Asnssr`
- If you forgot the password, click "Edit" → "Edit Password" → Create new password

### 2. Create .env File

Create `backend/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://Asnssr:YOUR_ACTUAL_PASSWORD@hotsauce.kxdewwm.mongodb.net/arabic-trivia?retryWrites=true&w=majority
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
FRONTEND_URL=http://localhost:3000
```

**Important:** Replace `YOUR_ACTUAL_PASSWORD` with your real password!

### 3. Special Characters in Password

If your password has special characters, you need to URL encode them:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| `#` | `%23` |
| `[` | `%5B` |
| `]` | `%5D` |
| `%` | `%25` |
| `&` | `%26` |
| `=` | `%3D` |

**Example:**
- Password: `MyP@ss#123`
- Encoded: `MyP%40ss%23123`
- Connection string: `mongodb+srv://Asnssr:MyP%40ss%23123@hotsauce.kxdewwm.mongodb.net/arabic-trivia`

### 4. Test Connection

```bash
cd backend
npm run dev
```

If you see "✅ Connected to MongoDB", you're good!

### 5. For Render Deployment

When deploying to Render, add this environment variable:

**Variable Name:** `MONGODB_URI`  
**Value:** `mongodb+srv://Asnssr:YOUR_PASSWORD@hotsauce.kxdewwm.mongodb.net/arabic-trivia?retryWrites=true&w=majority`

**⚠️ Security Note:** Never commit your `.env` file to GitHub! It's already in `.gitignore`.

## Troubleshooting

### "Authentication failed"
- Check your password is correct
- Make sure you URL-encoded special characters
- Verify username is `Asnssr` (case-sensitive)

### "IP not whitelisted"
- Go to MongoDB Atlas → Network Access
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)

### "Connection timeout"
- Check your internet connection
- Verify cluster is running (not paused)
- Make sure firewall isn't blocking MongoDB

## Quick Test

You can test your connection string with this Node.js script:

```javascript
import mongoose from 'mongoose';

const uri = 'mongodb+srv://Asnssr:YOUR_PASSWORD@hotsauce.kxdewwm.mongodb.net/arabic-trivia';

mongoose.connect(uri)
  .then(() => console.log('✅ Connected!'))
  .catch(err => console.error('❌ Error:', err.message));
```

