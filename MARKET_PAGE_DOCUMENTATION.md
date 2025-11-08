# Market Page Documentation

## Overview
The **Market Page** is a new e-commerce section that showcases all approved produce stored by farmers in the Stay Fresh cold storage system. It provides a public marketplace where buyers can browse available produce and contact sellers directly.

## Access Information

### Route
- **URL**: `http://localhost:3000/market`
- **Public Access**: Yes (no authentication required)

### Navigation
- Direct link from home page via "Browse Market" button
- Can be accessed directly via URL

## Features

### 1. Product Listings
- Displays all approved produce from the cold storage system
- Shows products in a responsive card grid layout
- Each product card includes:
  - **Product Image**: High-quality produce images from Unsplash
  - **Product Name**: Type of produce (e.g., Tomatoes, Potatoes)
  - **Condition Badge**: Visual indicator (Fresh, Good, Fair, Needs Attention)
  - **Price**: Current market price per kg
  - **Quantity**: Available stock in kg
  - **Total Value**: Estimated total value
  - **Room Number**: Storage room location
  - **Farmer Information**: Name and contact details
  - **Contact Button**: Direct phone link to seller

### 2. Statistics Dashboard
Real-time market statistics displayed at the top:
- **Total Available Products**: Number of produce listings
- **Total Stock Available**: Sum of all quantities (in kg)
- **Produce Categories**: Number of different produce types

### 3. Search & Filter
- **Search Bar**: Search by produce name or farmer name
- **Condition Filter**: Filter by condition (Fresh, Good, Fair, Needs Attention)
- Real-time filtering as you type

### 4. Design Elements
**Brand Colors**:
- Yellow: `#FFD700` (#FBBF24 in Tailwind)
- Green: `#228B22` (#10B981 in Tailwind)
- White: `#FFFFFF`

**Layout**:
- Clean, modern card-based design
- Responsive grid (1-4 columns based on screen size)
- Gradient backgrounds for visual appeal
- Hover effects for interactivity

## Backend API

### Endpoints

#### 1. Get All Produce
```http
GET /api/marketplace/produce
```

**Query Parameters**:
- `produceType` (optional): Filter by produce type
- `condition` (optional): Filter by condition
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

**Response**:
```json
[
  {
    "_id": "6501234...",
    "name": "Tomatoes",
    "image": "https://images.unsplash.com/...",
    "price": 120,
    "quantity": 500,
    "condition": "Fresh",
    "farmer": {
      "name": "John Doe",
      "phone": "+254712345678",
      "email": "john@example.com"
    },
    "room": "101",
    "stockedAt": "2025-11-01T10:00:00Z",
    "estimatedValue": 60000
  }
]
```

#### 2. Get Market Statistics
```http
GET /api/marketplace/produce/stats
```

**Response**:
```json
{
  "totalListings": 25,
  "totalQuantity": 5000,
  "produceTypes": 8,
  "categories": [
    {
      "_id": "Tomatoes",
      "count": 5,
      "totalQuantity": 1200
    }
  ]
}
```

### Data Source
- **Model**: `Stocking` (not `MarketplaceListing`)
- **Filter Criteria**:
  - `approvalStatus: "Approved"`
  - `status: ["Monitoring", "Target Reached", "Stocked"]`
- Only approved and available produce is shown

## Technical Implementation

### File Structure
```
app/
  market/
    page.tsx              # Main market page component

server/
  routes/
    marketplace.js        # Updated with new endpoints
  models/
    Stocking.js          # Source of produce data
```

### Key Components

#### Market Page (`app/market/page.tsx`)
- Client-side React component
- Uses Next.js App Router
- shadcn/ui components for UI
- Real-time data fetching from backend

#### API Routes (`server/routes/marketplace.js`)
- Added `/produce` endpoint
- Added `/produce/stats` endpoint
- Image mapping for produce types
- Aggregation for statistics

### Produce Images
Images are sourced from Unsplash CDN with mapping for each produce type:
- Tomatoes, Potatoes, Onions, Carrots, etc.
- Fallback image for "Other" category
- 400px width for optimal loading

## User Experience

### Loading State
- Spinner animation with loading message
- Prevents layout shift during data fetch

### Empty State
- Friendly message when no produce available
- Different message for no search results

### Error Handling
- Image fallback if load fails
- Console logging for debugging
- Graceful degradation

### Mobile Responsive
- Single column on mobile
- 2-4 columns on larger screens
- Touch-friendly buttons
- Optimized font sizes

## Contact Functionality

When user clicks "Contact Seller":
- Opens phone dialer with farmer's number
- Format: `tel:+254712345678`
- Works on both mobile and desktop

## Color-Coded Conditions

| Condition | Colors | Badge Style |
|-----------|--------|-------------|
| Fresh | Green (`bg-green-100 text-green-800`) | Fresh produce |
| Good | Blue (`bg-blue-100 text-blue-800`) | Good quality |
| Fair | Yellow (`bg-yellow-100 text-yellow-800`) | Fair condition |
| Needs Attention | Red (`bg-red-100 text-red-800`) | Urgent |

## Testing

### Manual Testing Checklist
1. ✅ Navigate to `/market` from home page
2. ✅ Verify statistics display correctly
3. ✅ Check product cards show all information
4. ✅ Test search functionality
5. ✅ Test condition filter
6. ✅ Click "Contact Seller" button
7. ✅ Test on mobile device
8. ✅ Verify images load correctly
9. ✅ Check empty state
10. ✅ Test with no internet (offline behavior)

### API Testing
```bash
# Test produce endpoint
curl http://localhost:5000/api/marketplace/produce

# Test with filters
curl "http://localhost:5000/api/marketplace/produce?produceType=Tomatoes"

# Test statistics
curl http://localhost:5000/api/marketplace/produce/stats
```

## Future Enhancements

### Phase 2 (Potential)
- [ ] Shopping cart functionality
- [ ] Order placement system
- [ ] Payment integration
- [ ] Bulk order discounts
- [ ] Delivery scheduling
- [ ] Reviews and ratings
- [ ] Wishlist feature
- [ ] Price alerts
- [ ] Farmer profiles
- [ ] Advanced filters (price range, location)

### Phase 3 (Advanced)
- [ ] Real-time stock updates via WebSocket
- [ ] Email notifications for new listings
- [ ] SMS integration for orders
- [ ] Analytics dashboard for farmers
- [ ] Seasonal recommendations
- [ ] Price trend charts
- [ ] Export data functionality

## Security Considerations

### Current Implementation
- Public read-only access
- No authentication required for browsing
- Farmer contact info is public (by design)
- No payment handling (contact-based sales)

### Best Practices
- API rate limiting (to be implemented)
- Input sanitization on search
- No sensitive data exposure
- CORS configuration for production

## Deployment Notes

### Environment Variables
No additional environment variables needed for basic functionality.

### Production Checklist
1. Update API URL from `localhost:5000` to production URL
2. Implement API rate limiting
3. Add analytics tracking
4. Optimize images with CDN
5. Enable caching for faster loads
6. Set up monitoring/logging
7. Configure CORS properly

### Performance Optimization
- Lazy loading for images
- Pagination (future)
- Caching strategy
- Minimize bundle size
- Code splitting

## Support

### Common Issues

**Issue**: "No produce available"
- **Solution**: Ensure backend is running on port 5000
- Check database has approved stockings

**Issue**: Images not loading
- **Solution**: Check internet connection
- Verify Unsplash URLs are accessible

**Issue**: Contact button not working
- **Solution**: Ensure device supports `tel:` links
- Check farmer phone number format

### Debugging
```bash
# Check backend logs
cd server && npm run dev

# Check frontend console
# Open browser DevTools > Console

# Test API directly
curl -v http://localhost:5000/api/marketplace/produce
```

## Changelog

### Version 1.0.0 (November 8, 2025)
- ✅ Initial market page implementation
- ✅ Product listing with cards
- ✅ Search and filter functionality
- ✅ Statistics dashboard
- ✅ Contact seller feature
- ✅ Mobile responsive design
- ✅ Brand color implementation
- ✅ Image mapping for all produce types
- ✅ API endpoints for produce and stats

---

**Created**: November 8, 2025  
**Author**: Development Team  
**Last Updated**: November 8, 2025  
**Version**: 1.0.0
