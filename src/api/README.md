# MonkeDeals API Documentation

## Overview
The MonkeDeals API provides RESTful endpoints for external applications to integrate with the MonkeDeals platform. This API enables third-party developers to access deal data, user information, and platform functionality.

## Base URL
```
http://localhost:3000/api
```

## Authentication
API requests require authentication using an API key:
```javascript
// Set API key
api.setApiKey('your-api-key-here');

// API key is automatically included in requests
```

## Endpoints

### Deals

#### Get All Deals
```javascript
GET /api/deals
```
**Parameters:**
- `category` - Filter by category
- `merchant` - Filter by merchant ID
- `location` - Filter by location
- `limit` - Number of results to return
- `offset` - Number of results to skip

#### Get Deal by ID
```javascript
GET /api/deals/{dealId}
```

#### Get Deals by Merchant
```javascript
GET /api/merchants/{merchantId}/deals
```

#### Get Deals by Category
```javascript
GET /api/deals/category/{category}
```

#### Get Deals by Location
```javascript
GET /api/deals/location?lat={lat}&lng={lng}&radius={radius}
```

### Users

#### Get User Portfolio
```javascript
GET /api/users/{userAddress}/portfolio
```

#### Get User Reputation
```javascript
GET /api/users/{userAddress}/reputation
```

### Auctions

#### Get Active Auctions
```javascript
GET /api/auctions/active
```

### Group Deals

#### Get Group Deals
```javascript
GET /api/group-deals
```

### Leaderboard

#### Get Leaderboard
```javascript
GET /api/leaderboard/{type}
```
**Types:** `reputation`, `volume`, `activity`

### Analytics

#### Get Analytics
```javascript
GET /api/analytics/{type}
```
**Types:** `overview`, `deals`, `users`, `revenue`

#### Get Market Statistics
```javascript
GET /api/market/stats
```

## Usage Examples

### JavaScript/Node.js
```javascript
import MonkeDealsAPI from './dexgroupAPI.js';

const api = new MonkeDealsAPI();
api.setApiKey('your-api-key');

// Get all deals
const deals = await api.getDeals();

// Get deals by category
const restaurantDeals = await api.getDealsByCategory('restaurant');

// Get user portfolio
const portfolio = await api.getUserPortfolio('user-address');

// Create a new deal
const newDeal = await api.createDeal({
  title: '50% Off Pizza',
  description: 'Great pizza deal',
  discount: 50,
  merchantId: 'merchant-123',
  expiryDate: '2024-12-31'
});
```

### Python
```python
import requests

api_key = 'your-api-key'
base_url = 'http://localhost:3000/api'

headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

# Get all deals
response = requests.get(f'{base_url}/deals', headers=headers)
deals = response.json()

# Get deals by category
response = requests.get(f'{base_url}/deals/category/restaurant', headers=headers)
restaurant_deals = response.json()
```

### cURL
```bash
# Get all deals
curl -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/deals

# Get deals by category
curl -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/deals/category/restaurant
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Error Handling

Error responses include detailed error information:

```json
{
  "success": false,
  "error": {
    "code": "DEAL_NOT_FOUND",
    "message": "Deal with ID 123 not found",
    "details": "The requested deal does not exist or has been removed"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Rate Limiting

API requests are rate limited to prevent abuse:
- **Free Tier**: 100 requests per hour
- **Pro Tier**: 1000 requests per hour
- **Enterprise**: Custom limits

## Webhooks

Register webhooks to receive real-time updates:

```javascript
await api.registerWebhook('https://your-app.com/webhook', [
  'deal.created',
  'deal.purchased',
  'deal.redeemed'
]);
```

## SDKs

Official SDKs are available for:
- JavaScript/Node.js
- Python
- PHP
- Java
- Go

## Support

For API support and questions:
- Email: api-support@monkedelas.com
- Documentation: https://docs.monkedelas.com/api
- GitHub: https://github.com/monkedelas/api-examples
