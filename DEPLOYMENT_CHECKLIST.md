# 🚀 MediNear - Deployment Checklist

Complete this checklist when you're ready to deploy to production.

---

## 📋 Pre-Deployment

### Backend Preparation
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Update `MONGO_URI` to production database
- [ ] Verify all dependencies: `npm list`
- [ ] Run backend tests: `npm test` (if available)
- [ ] Test all API endpoints with production data

### Frontend Preparation
- [ ] Update `VITE_API_URL` to production backend URL
- [ ] Run ESLint: `npm run lint`
- [ ] Check responsive design on multiple devices
- [ ] Test all user flows
- [ ] Verify authentication flow
- [ ] Test edge cases (empty results, errors, timeouts)

### Database Preparation
- [ ] Create production MongoDB cluster
- [ ] Enable authentication
- [ ] Set IP whitelist
- [ ] Configure backups
- [ ] Create database indexes
- [ ] Test data migration (if needed)

---

## 🏗️ Frontend Deployment

### Build for Production
```bash
cd medinear-frontend
npm run build
```

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Or use web dashboard:** https://vercel.com

### Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Or drag & drop dist/ folder** to netlify.com

### Deploy to GitHub Pages
```bash
# In package.json frontend scripts add:
"deploy": "npm run build && gh-pages -d dist"

# Then
npm run deploy
```

### Environment Variables on Hosting
Add to hosting platform:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## 🖥️ Backend Deployment

### Prepare Backend
```bash
# Remove dev dependencies
npm prune --production

# Create production .env
# Set NODE_ENV=production
```

### Deploy to Heroku
```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGO_URI=your_mongo_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Deploy to Railway
1. Go to https://railway.app
2. Create new project
3. Connect GitHub repository
4. Add variables
5. Deploy

### Deploy to Render
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub
4. Set environment variables
5. Deploy

### Deploy to AWS
1. Use Elastic Beanstalk or EC2
2. Set up RDS for MongoDB (use MongoDB Atlas instead)
3. Configure security groups
4. Deploy via EB CLI or Git

---

## 🗄️ Database Deployment

### MongoDB Atlas Setup
- [ ] Create production cluster
- [ ] Enable automatic backups
- [ ] Set up monitoring & alerts
- [ ] Configure IP whitelist with backend server
- [ ] Create backup schedule
- [ ] Enable encryption

### Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/medinear?retryWrites=true&w=majority
```

### Database Indexes
```javascript
db.medicines.createIndex({ name: "text" })
db.pharmacies.createIndex({ phone: 1 }, { unique: true })
```

---

## 🔒 Security Checklist

### Frontend
- [ ] Remove console.log statements
- [ ] Set Content Security Policy headers
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Sanitize user inputs
- [ ] Validate on client AND server

### Backend
- [ ] Use HTTPS/TLS
- [ ] Set secure headers
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Enable CORS only for allowed domains
- [ ] Hash passwords with bcrypt
- [ ] Use strong JWT secret
- [ ] Set token expiry

### Database
- [ ] Enable authentication
- [ ] Use strong password
- [ ] IP whitelist backend only
- [ ] Enable encryption at rest
- [ ] Enable encryption in transit
- [ ] Regular backups

### Server
- [ ] Keep Node.js updated
- [ ] Keep npm packages updated
- [ ] Use firewall rules
- [ ] Monitor for vulnerabilities
- [ ] Set up logging
- [ ] Configure alerts

---

## 📊 Performance Test

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://yourdomain.com/

# Using wrk
wrk -t12 -c400 -d30s http://yourdomain.com/
```

### Performance Targets
- [ ] Page load: < 3 seconds
- [ ] API response: < 200ms
- [ ] Search: < 500ms
- [ ] Database query: < 100ms

### Monitoring Setup
- [ ] Application monitoring (New Relic, DataDog)
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics, Mixpanel)
- [ ] Uptime monitoring (UptimeRobot)

---

## 🧪 Production Testing

### Smoke Tests
- [ ] Frontend loads without errors
- [ ] Can register new pharmacy
- [ ] Can login with credentials
- [ ] Can add medicine
- [ ] Can search medicines
- [ ] Can view pharmacy details
- [ ] API endpoints respond correctly

### Load Tests
- [ ] 100 concurrent users
- [ ] Search performs well under load
- [ ] Database handles concurrent queries

### Security Tests
- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked
- [ ] CSRF protected
- [ ] Unauthorized requests rejected
- [ ] Rate limiting works

---

## 📱 Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari
- [ ] Mobile Firefox

---

## 🔄 Continuous Deployment Setup

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod
```

---

## 📋 Final Checklist

### Before Going Live
- [ ] All tests pass
- [ ] Security review done
- [ ] Performance optimized
- [ ] Documentation updated
- [ ] Support plan ready
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Team trained
- [ ] Rollback plan ready

### Day 1 Monitoring
- [ ] Watch error logs
- [ ] Monitor performance
- [ ] Check user feedback
- [ ] Monitor database connections
- [ ] Verify backups working

### Post-Deployment
- [ ] Notify users
- [ ] Update status page
- [ ] Monitor metrics closely
- [ ] Be ready to rollback
- [ ] Collect feedback
- [ ] Plan next release

---

## 🆘 Emergency Rollback

If something goes wrong:

```bash
# Revert frontend
netlify deploy --prod --dir=previous-dist

# Revert backend
git revert <commit-hash>
git push

# Monitor for issues
# Notify users
```

---

## 📞 Deployment Support

**Questions or issues?**
- Check documentation
- Review logs
- Contact hosting support
- Ask in community forums

---

## ✅ Mark Completion

When fully deployed and tested:
- [ ] All checklist items completed
- [ ] Monitoring active
- [ ] Team notified
- [ ] Users notified
- [ ] Document deployment date
- [ ] Plan version 2.0

---

**Great job!** 🎉

Your MediNear platform is now live and serving users!

© 2026 MediNear Platform
