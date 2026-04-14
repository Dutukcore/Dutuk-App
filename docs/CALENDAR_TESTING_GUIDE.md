# Calendar Availability Testing Guide

## 🧪 Manual Testing Steps

### Test 1: View Calendar on Home Screen
**Steps:**
1. Launch the app
2. Navigate to the Home screen (if not already there)
3. Scroll to the calendar section

**Expected Result:**
- ✅ Calendar is visible and displays current month
- ✅ Calendar uses custom marking (not just dots)

---

### Test 2: Mark Available Date
**Steps:**
1. Tap the calendar icon (top-left of home screen)
2. Select a future date (tomorrow or any date after today)
3. In the alert, tap "Available"

**Expected Result:**
- ✅ Toast message: "Date marked as available"
- ✅ Date appears with black circle background and white text
- ✅ Navigate back to home screen
- ✅ Same date shows black circle with white text on home calendar

---

### Test 3: Mark Unavailable Date
**Steps:**
1. Open full calendar (calendar icon)
2. Select a different future date
3. In the alert, tap "Unavailable"

**Expected Result:**
- ✅ Toast message: "Date marked as unavailable"
- ✅ Date appears with red text (no background circle)
- ✅ Navigate back to home screen
- ✅ Same date shows red text on home calendar

---

### Test 4: Toggle Date Status
**Steps:**
1. Open full calendar
2. Tap on a previously marked date
3. In the alert, tap "Toggle Status"

**Expected Result:**
- ✅ Toast message: "Status Updated - Date marked as [new status]"
- ✅ Visual appearance changes:
  - Available → Unavailable (black circle → red text)
  - Unavailable → Available (red text → black circle)
- ✅ Changes reflect on home screen

---

### Test 5: Remove Date Marking
**Steps:**
1. Open full calendar
2. Tap on a marked date
3. In the alert, tap "Remove"

**Expected Result:**
- ✅ Toast message: "Date Removed"
- ✅ Date returns to default appearance (no marking)
- ✅ Changes reflect on home screen

---

### Test 6: Past Date Validation
**Steps:**
1. Open full calendar
2. Navigate to previous month (tap left arrow)
3. Try to tap on yesterday or any past date

**Expected Result:**
- ✅ Toast error: "Invalid Date - Cannot mark dates in the past"
- ✅ Date is NOT marked
- ✅ No alert dialog appears

---

### Test 7: Data Persistence
**Steps:**
1. Mark several dates (mix of available/unavailable)
2. Close the app completely (force quit)
3. Reopen the app
4. Check both home screen and full calendar

**Expected Result:**
- ✅ All marked dates are still visible
- ✅ Correct status maintained (available/unavailable)
- ✅ Data persists across app restarts

---

### Test 8: View-Only on Home Screen
**Steps:**
1. Go to home screen
2. Try tapping on dates in the calendar

**Expected Result:**
- ✅ Tapping dates does NOT open any editing dialog
- ✅ Dates remain read-only
- ✅ Must use calendar icon to edit

---

### Test 9: Visual Legend
**Steps:**
1. Open full calendar (calendar icon)
2. Look at the top of the screen

**Expected Result:**
- ✅ Header: "Manage Availability"
- ✅ Subtitle: "Tap a date to mark your availability"
- ✅ Legend shows:
  - Black box + "Available" text
  - Red bordered box + "Unavailable" text (in red)
- ✅ Instruction at bottom: "You cannot mark dates in the past"

---

### Test 10: Calendar Navigation
**Steps:**
1. From home screen, tap calendar icon (top-left)
2. Full calendar opens
3. Tap back/close to return to home

**Expected Result:**
- ✅ Calendar icon is clearly visible
- ✅ Tapping it opens full calendar screen
- ✅ Can navigate back to home easily
- ✅ Changes made in full calendar reflect on home screen

---

## 🎨 Visual Checklist

### Home Screen Calendar:
- [ ] Available dates: **Black circle** with **white text**
- [ ] Unavailable dates: **Red text** (no background)
- [ ] Event dots (if any) display below date numbers
- [ ] Calendar has white background with rounded corners
- [ ] Shadow effect around calendar

### Full Calendar Screen:
- [ ] Header "Manage Availability" visible
- [ ] Legend showing both statuses
- [ ] Available dates: **Black circle** with **white text**
- [ ] Unavailable dates: **Red text**
- [ ] Blue arrows for month navigation
- [ ] Today's date highlighted in blue
- [ ] Instruction text at bottom

---

## 🐛 Common Issues & Solutions

### Issue: Dates not showing color
**Solution:** Ensure AsyncStorage has data. Mark some dates first.

### Issue: Past dates can be marked
**Solution:** Check date validation logic in CalendarPage.tsx

### Issue: Changes don't persist
**Solution:** Verify AsyncStorage permissions and data saving

### Issue: Toast notifications not appearing
**Solution:** Check that Toast component is mounted in app root

### Issue: Calendar icon not visible
**Solution:** Check home.tsx line ~159 for calendar icon button

---

## 📊 Test Data Examples

### Sample Dates to Mark:
```
Available Dates:
- Tomorrow
- Next week Monday
- End of month

Unavailable Dates:
- Tomorrow + 1
- Next weekend
- Middle of month
```

### Expected AsyncStorage Data Structure:
```json
[
  {
    "date": "2025-01-20",
    "status": "available",
    "event": "",
    "description": ""
  },
  {
    "date": "2025-01-21",
    "status": "unavailable",
    "event": "",
    "description": ""
  }
]
```

---

## ✅ Success Criteria

All tests should pass with:
- ✅ Visual styling matches requirements
- ✅ Data persists across restarts
- ✅ Past date validation works
- ✅ Toast notifications appear
- ✅ Home screen is view-only
- ✅ Full calendar allows editing
- ✅ No console errors
- ✅ Smooth user experience

---

**Testing Version**: 1.0.0
**Last Updated**: January 2025
