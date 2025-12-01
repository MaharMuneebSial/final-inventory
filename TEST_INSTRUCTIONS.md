# Testing Instructions for Add Product Page

## How to Test the Add Brand Feature

### Step-by-Step Testing:

1. **Open the Add Product Page**
   - Navigate to: http://localhost:3000/dashboard/new-product

2. **Open Browser Developer Console**
   - Press F12 (Windows/Linux) or Cmd+Option+I (Mac)
   - Go to the "Console" tab
   - Keep this open to see any errors

3. **Test Adding a Brand**
   - Click the "+" button next to the Brand dropdown
   - The "Add New Brand" modal should appear
   - Type a brand name (e.g., "Nike")
   - Click "Add Brand" button
   - Watch the console for messages

4. **What Should Happen:**
   - Console should show: "Creating brand: Nike"
   - Console should show: "Response status: 200"
   - Console should show: "Response data: {success: true, brand: {...}}"
   - You should see an alert: "Brand added successfully!"
   - The modal should close
   - The brand should appear in the dropdown
   - The brand should be auto-selected

5. **If It's Not Working:**

   **Check Console for Errors:**
   - Look for red error messages
   - Common issues:
     - Network errors (API not responding)
     - JavaScript errors (function not defined)
     - CORS errors (cross-origin issues)

   **Check Network Tab:**
   - Go to "Network" tab in developer tools
   - Click "+" to open the modal
   - Type a brand name and click "Add Brand"
   - Look for a POST request to `/api/brands`
   - Click on it to see the request/response

   **Manual API Test:**
   - Open a new terminal
   - Run: `curl -X POST http://localhost:3000/api/brands -H "Content-Type: application/json" -d "{\"name\":\"TestBrand2\"}"`
   - Should return: `{"success":true,"brand":{...}}`

## Common Issues and Solutions

### Issue 1: Alert Not Showing
**Symptom:** Modal closes but no alert appears
**Solution:** Check if browser is blocking alerts
- Click the "!" icon in address bar
- Allow alerts for this site

### Issue 2: Modal Not Closing
**Symptom:** Button clicks but modal stays open
**Solution:** Check console for JavaScript errors
- Fix any errors shown in red

### Issue 3: Dropdown Not Updating
**Symptom:** Brand created but not showing in dropdown
**Solution:** Refresh the page and check if brand appears
- If it appears after refresh, the issue is with state management
- The brand IS being saved to database

### Issue 4: Duplicate Brand Error
**Symptom:** Error message about duplicate
**Solution:** Brand names must be unique
- Try a different brand name
- Check existing brands in dropdown

## Testing All Features

### 1. Test Category Creation
- Click "+" next to Category dropdown
- Enter: "Electronics"
- Click "Add Category"
- Verify it appears in dropdown

### 2. Test Subcategory Creation
- Select a category first (e.g., "Electronics")
- Click "+" next to Sub-Category dropdown
- Enter: "Mobile Phones"
- Click "Add Subcategory"
- Verify it appears in subcategory dropdown

### 3. Test Brand Creation
- Click "+" next to Brand dropdown
- Enter: "Samsung"
- Click "Add Brand"
- Verify it appears in dropdown

### 4. Test Barcode Scanner
- Click the scan icon next to Barcode field
- Modal should open with a large scan icon
- Type a barcode (e.g., "1234567890")
- Click "Done"
- Barcode should appear in the field

### 5. Test Image Upload
- Click the upload area or "Browse Files" button
- Select an image (PNG or JPG, max 5MB)
- Image preview should appear

### 6. Test Product Creation
- Fill all fields:
  - Product Name (English): "Test Product"
  - Category: Select one
  - Brand: Select one
  - Unit: Select "Pc"
  - Status: Select "Active"
- Click "Save Product"
- Should redirect to products list
- Product should appear in list

## Database Verification

To verify data is actually being saved:

### Check SQLite Database Directly:

1. **Install SQLite CLI** (if not already installed):
   ```
   npm install -g sqlite3
   ```

2. **Open the database**:
   ```
   sqlite3 inventory.db
   ```

3. **Check brands**:
   ```sql
   SELECT * FROM brands;
   ```

4. **Check categories**:
   ```sql
   SELECT * FROM categories;
   ```

5. **Check subcategories**:
   ```sql
   SELECT * FROM subcategories;
   ```

6. **Check products**:
   ```sql
   SELECT * FROM products;
   ```

7. **Exit SQLite**:
   ```
   .quit
   ```

## Quick Debug Script

Create a test file to verify the API is working:

```javascript
// test-api.js
const testBrandCreation = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'DebugBrand' + Date.now() })
    });

    const data = await response.json();
    console.log('Success:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

testBrandCreation();
```

Run it in browser console or with Node.js.

## Expected Console Output

When everything is working correctly, you should see:

```
Creating brand: Nike
Response status: 200
Response data: {success: true, brand: {id: 3, name: "Nike", created_at: "2025-12-01 11:00:00"}}
Brand created successfully: {id: 3, name: "Nike", created_at: "2025-12-01 11:00:00"}
Updated brands: [{...}, {...}, {id: 3, name: "Nike", ...}]
```

Then an alert: "Brand added successfully!"

---

## Still Not Working?

If you've tried all the above and it's still not working:

1. **Clear browser cache**:
   - Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Clear cache and reload

2. **Restart the development server**:
   ```
   # Kill the server (Ctrl+C)
   npm run dev
   ```

3. **Check if database file exists**:
   ```
   ls inventory.db
   ```

4. **Check file permissions**:
   - Make sure inventory.db is writable

5. **Try in incognito/private mode**:
   - Rules out extension conflicts

---

**Report Back**: Please copy and paste any error messages you see in the console!
