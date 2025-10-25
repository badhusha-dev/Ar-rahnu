# 🚀 Master Data Management - Quick Reference Card

## 📱 Access URLs

| Page | URL | Role Required |
|------|-----|--------------|
| Branches | `http://localhost:5000/master/branches` | Admin, Manager |
| Gold Prices | `http://localhost:5000/master/gold-prices` | Admin, Manager |
| Suppliers | `http://localhost:5000/master/suppliers` | Admin, Manager |
| Users | `http://localhost:5000/master/users` | Admin Only |

---

## 🔑 Demo Credentials

```
Admin Account:
Email: admin@bse.my
Password: Admin@123

Manager Account:
Email: manager@bse.my
Password: Manager@123
```

---

## 🛠️ API Endpoints (Quick Reference)

### Branches
```
GET    /api/master/branches        → List all
POST   /api/master/branches        → Create
PUT    /api/master/branches/:id    → Update
DELETE /api/master/branches/:id    → Delete
```

### Gold Prices
```
GET    /api/master/gold-prices         → List all
GET    /api/master/gold-prices/latest  → Get latest
POST   /api/master/gold-prices         → Create
PUT    /api/master/gold-prices/:id     → Update
DELETE /api/master/gold-prices/:id     → Delete
```

### Suppliers
```
GET    /api/master/suppliers        → List all
POST   /api/master/suppliers        → Create
PUT    /api/master/suppliers/:id    → Update
DELETE /api/master/suppliers/:id    → Delete
```

### Users
```
GET    /api/master/users                  → List all
PUT    /api/master/users/:id/status       → Update status
PUT    /api/master/users/:id/role         → Update role
```

### Inventory
```
GET    /api/master/inventory        → List all
POST   /api/master/inventory        → Create
PUT    /api/master/inventory/:id    → Update
DELETE /api/master/inventory/:id    → Delete
```

---

## 🎨 UI Features

### Common Features (All Pages)

✅ **Data Table**
- Sortable columns
- Pagination (future)
- Search/filter (future)

✅ **Actions**
- ✏️ Edit button (opens modal)
- 🗑️ Delete button (with confirmation)
- 🔄 Status toggle (where applicable)

✅ **Forms**
- ➕ Add button (opens modal)
- ✅ Submit button
- ❌ Cancel button
- Form validation

✅ **Notifications**
- ✅ Success toasts
- ❌ Error toasts
- ℹ️ Info messages

---

## 📋 Page-Specific Actions

### Branches Page
| Action | Steps |
|--------|-------|
| Add Branch | Click "Add Branch" → Fill form → Click "Create Branch" |
| Edit Branch | Click ✏️ icon → Modify fields → Click "Update Branch" |
| Delete Branch | Click 🗑️ icon → Confirm deletion |
| Toggle Status | Click toggle switch in Edit dialog |

### Gold Prices Page
| Action | Steps |
|--------|-------|
| Add Price | Click "Add Price" → Fill karat, buy/sell prices → Click "Create Price" |
| Edit Price | Click ✏️ icon → Modify prices → Click "Update Price" |
| Delete Price | Click 🗑️ icon → Confirm deletion |
| View Latest | Displayed at top of table |

### Suppliers Page
| Action | Steps |
|--------|-------|
| Add Supplier | Click "Add Supplier" → Fill all details → Click "Create Supplier" |
| Edit Supplier | Click ✏️ icon → Modify fields → Click "Update Supplier" |
| Delete Supplier | Click 🗑️ icon → Confirm deletion |
| Toggle Status | Click toggle switch in Edit dialog |

### Users Page
| Action | Steps |
|--------|-------|
| Edit User Role | Click ✏️ icon → Select role & scope → Click "Update User" |
| Activate User | Click ✅ icon (green) |
| Deactivate User | Click ❌ icon (red) |
| View Details | All user info displayed in table |

---

## 🔐 Role-Based Access

| Feature | Admin | Manager | Teller | Customer |
|---------|-------|---------|--------|----------|
| View Master Data | ✅ | ✅ | ❌ | ❌ |
| Branches CRUD | ✅ | ✅ | ❌ | ❌ |
| Gold Prices CRUD | ✅ | ✅ | ❌ | ❌ |
| Suppliers CRUD | ✅ | ✅ | ❌ | ❌ |
| Users Management | ✅ | ❌ | ❌ | ❌ |
| Inventory CRUD | ✅ | ✅ | ❌ | ❌ |

---

## 🧪 Quick Test Checklist

### 1️⃣ Basic CRUD Test
- [ ] Login as Admin
- [ ] Navigate to Branches
- [ ] Add new branch
- [ ] Edit the branch
- [ ] Delete the branch
- [ ] Check success notifications

### 2️⃣ Gold Prices Test
- [ ] Navigate to Gold Prices
- [ ] Add price for karat 999
- [ ] Edit the price
- [ ] Verify latest price display
- [ ] Delete test price

### 3️⃣ Suppliers Test
- [ ] Navigate to Suppliers
- [ ] Add new supplier
- [ ] Edit supplier details
- [ ] Toggle active status
- [ ] Delete supplier

### 4️⃣ Users Test
- [ ] Navigate to Users
- [ ] Find a Teller user
- [ ] Change role to Manager
- [ ] Change scope to Both
- [ ] Deactivate user
- [ ] Reactivate user

### 5️⃣ Security Test
- [ ] Logout from Admin
- [ ] Login as Teller
- [ ] Verify Master Data is hidden
- [ ] Try direct URL access
- [ ] Verify 403 error or redirect

---

## 🐛 Troubleshooting

### Issue: Master Data not appearing in sidebar
**Solution:** 
- Ensure you're logged in as Admin or Manager
- Clear browser cache and reload
- Check browser console for errors

### Issue: 401 Unauthorized on API calls
**Solution:**
- Check if JWT token is valid
- Re-login if token expired
- Verify cookie settings (credentials: 'include')

### Issue: CORS errors
**Solution:**
- Verify backend CORS middleware is configured
- Check `CLIENT_URL` in backend matches frontend URL
- Ensure credentials are included in requests

### Issue: Data not refreshing after CRUD operation
**Solution:**
- Check React Query cache invalidation
- Manually refresh the page
- Check browser network tab for API responses

---

## 📞 Support

For detailed documentation, see: **`MASTER_DATA_MANAGEMENT.md`**

---

## 🎯 Quick Commands

### Start Application
```bash
.\run-app.cmd
```

### Reset Database
```bash
.\reset-database.ps1
```

### Seed Database
```bash
npm run db:seed
```

### Check Logs
- Frontend: Browser Console (F12)
- Backend: Terminal/Command Prompt where server is running

---

**Last Updated:** October 25, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

