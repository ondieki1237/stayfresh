# Legacy Produce Migration Guide

## What is Legacy Produce?

**Legacy Produce** refers to records stored in the old `Produce` model **before** the Booking Approval Workflow was implemented. This system had several limitations:

- ❌ No admin approval required
- ❌ Immediate room occupancy changes
- ❌ No approval tracking
- ❌ Different status values
- ❌ No rejection reasons

## New Stocking System

The **new Stocking model** implements a proper approval workflow:

- ✅ Admin must approve bookings
- ✅ Room occupancy only updated after approval
- ✅ Full audit trail (approvedBy, approvedAt)
- ✅ Rejection with reasons
- ✅ Better status management

## Why Two Systems Exist

Your application now has **TWO views** in the dashboard:

### 1. Stockings View (New System) 📦
- Shows approved bookings from `Stocking` model
- Color-coded status badges
- Approval/rejection tracking
- Used going forward

### 2. Legacy View (Old System) 📜
- Shows old data from `Produce` model
- Backward compatibility
- For historical records
- Will be phased out

## Migration Options

### Option 1: Automatic Migration (Recommended)

Use the provided migration script to automatically convert all legacy produce:

```bash
# Preview changes (dry run)
cd server
node scripts/migrate-legacy-produce.js --dry-run

# Perform actual migration (replace <admin-id> with actual admin farmer ID)
node scripts/migrate-legacy-produce.js --admin-id=<admin-id>

# Example with real admin ID
node scripts/migrate-legacy-produce.js --admin-id=6501234567890abcdef12345
```

**What it does:**
- ✅ Finds all active legacy produce
- ✅ Creates corresponding Stocking records
- ✅ Auto-approves them (marks as "Approved")
- ✅ Updates room occupancy
- ✅ Marks legacy records as "Removed" (or deletes them)
- ✅ Adds migration notes

### Option 2: Manual Migration

Manually create stockings for important legacy produce:

1. Go to Admin Dashboard → Produce Management
2. Click "Legacy Produce" tab
3. For each important item:
   - Note the details
   - Go to farmer's dashboard
   - Create a new booking with same details
   - Approve it in admin panel

### Option 3: Keep Both Systems

Continue using both systems:
- Legacy data stays in Produce model
- New bookings use Stocking model
- Toggle between views in dashboard

## How to Find Admin ID

You need an admin's Farmer ID to mark who approved the migration:

```bash
# Option 1: MongoDB query
mongo
use coldchain
db.farmers.findOne({ role: "admin" })

# Option 2: API call (if logged in as admin)
curl http://localhost:5000/api/farmers/me \
  -H "Authorization: Bearer <your-token>"

# Option 3: Check database directly
```

## Migration Script Details

### What Gets Migrated

The script converts these fields:

| Legacy Produce | → | New Stocking |
|----------------|---|--------------|
| produceType | → | produceType (mapped to enum) |
| quantity | → | quantity |
| currentMarketPrice | → | currentMarketPrice |
| expectedPeakPrice | → | targetPrice |
| condition | → | condition (mapped) |
| storageDate | → | stockedAt |
| farmer | → | farmer |
| room | → | room |

### Field Mappings

**Produce Type:**
- Maps to Stocking enum values
- Falls back to "Other" if not recognized

**Condition:**
```javascript
Excellent → Fresh
Fresh → Fresh
Good → Good
Fair → Fair
Poor → Needs Attention
Spoiled → Needs Attention
```

**Status:**
- All migrated items get `status: "Approved"`
- All migrated items get `approvalStatus: "Approved"`

### What Happens to Legacy Data

**By default:** Legacy records are marked as "Removed" and kept for reference

**Optional:** You can uncomment line 117 to delete them instead:
```javascript
// await Produce.findByIdAndDelete(produce._id)
```

## After Migration

### Verify Migration

1. **Check Stocking Count:**
```bash
mongo
use coldchain
db.stockings.countDocuments({ approvalStatus: "Approved" })
```

2. **Check Legacy Count:**
```bash
db.produces.countDocuments({ status: "Removed" })
```

3. **View in Dashboard:**
- Go to Admin → Produce Management
- Toggle to "Approved Stockings"
- Verify all items appear

### Update Room Occupancy

If room occupancy looks wrong:

```bash
node scripts/recalculate-room-occupancy.js
```

(Create this script if needed)

## Rollback (If Needed)

If migration has issues:

```bash
# Delete migrated stockings
mongo
use coldchain
db.stockings.deleteMany({ 
  notes: /Migrated from legacy Produce model/
})

# Restore legacy produce status
db.produces.updateMany(
  { status: "Removed" },
  { $set: { status: "Active" } }
)
```

## Best Practices

### Before Migration
1. ✅ **Backup your database**
   ```bash
   mongodump --db coldchain --out backup-$(date +%Y%m%d)
   ```

2. ✅ **Run dry-run first**
   ```bash
   node scripts/migrate-legacy-produce.js --dry-run
   ```

3. ✅ **Get admin ID ready**
   - Find a farmer with admin role
   - Use their ID for approvals

4. ✅ **Inform users**
   - Let farmers know about maintenance
   - Schedule during low-traffic time

### During Migration
- ⏸️ Put system in maintenance mode
- 📊 Monitor script output
- ✍️ Take notes of any errors

### After Migration
- ✅ Verify all data migrated
- ✅ Check room occupancy
- ✅ Test dashboard views
- ✅ Remove backup after confirming

## Common Issues

### Issue: "No admin ID provided"
**Solution:** 
```bash
# Find admin farmer ID
mongo
use coldchain
db.farmers.findOne({ role: "admin" }, { _id: 1 })

# Use that ID
node scripts/migrate-legacy-produce.js --admin-id=<id>
```

### Issue: "Produce type not recognized"
**Solution:** Script automatically maps to "Other". Check output and manually update if needed.

### Issue: "Room capacity exceeded"
**Solution:** The script doesn't check capacity. Manually verify room capacities after migration.

### Issue: "Duplicate records"
**Solution:** Script only migrates Active/Listed produce. Check your filters if you see duplicates.

## Alternative: API Endpoint

You can also create an API endpoint for migration:

```javascript
// Add to server/routes/admin.js
router.post("/migrate-legacy-produce", authMiddleware, async (req, res) => {
  // Same logic as script
  // Return migration summary
})
```

Then call via:
```bash
curl -X POST http://localhost:5000/api/admin/migrate-legacy-produce \
  -H "Authorization: Bearer <admin-token>"
```

## Testing

### Test with Sample Data

1. Create test legacy produce:
```javascript
// In mongo shell
db.produces.insertOne({
  farmer: ObjectId("..."),
  room: ObjectId("..."),
  produceType: "Tomatoes",
  quantity: 100,
  currentMarketPrice: 120,
  condition: "Fresh",
  status: "Active"
})
```

2. Run migration on test data
3. Verify in Stocking collection
4. Check dashboard display

## Future: Phase Out Legacy System

Once all data is migrated:

1. **Remove Legacy Views:**
   - Edit `produce-overview.tsx`
   - Remove "Legacy" toggle
   - Show only Stockings

2. **Archive Legacy Code:**
   - Keep Produce model for reference
   - Remove from active routes

3. **Clean Database:**
   - Delete old Produce records
   - Keep backup archive

## FAQ

**Q: Will this affect my current approved stockings?**  
A: No, the script only migrates from the Produce model to Stocking.

**Q: Can I run the migration multiple times?**  
A: Yes, but it will create duplicates. Use `--dry-run` to check first.

**Q: What if I want to manually approve legacy items?**  
A: Modify the script to set `approvalStatus: "Pending"` instead of "Approved".

**Q: Will farmers see their legacy produce?**  
A: Yes, in the "Legacy" view of their dashboard until migration.

**Q: Can I migrate only specific items?**  
A: Yes, modify the script's query filter to select specific records.

## Support

If you encounter issues:

1. Check script output logs
2. Verify MongoDB connection
3. Check admin ID is valid
4. Review backup before rolling back

---

**Created:** November 8, 2025  
**Last Updated:** November 8, 2025  
**Version:** 1.0.0
