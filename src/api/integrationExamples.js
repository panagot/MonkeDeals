/**
 * MonkeDeals API Integration Examples
 * These examples show how third-party applications can integrate with MonkeDeals
 */

import MonkeDealsAPI from './dexgroupAPI.js';

// Example 1: Travel Booking App Integration
class TravelBookingIntegration {
  constructor() {
    this.api = new MonkeDealsAPI();
    this.api.setApiKey('travel-app-api-key');
  }

  // Get travel deals for a specific destination
  async getTravelDeals(destination, checkIn, checkOut) {
    try {
      const deals = await this.api.getDeals({
        category: 'travel',
        location: destination,
        limit: 20
      });

      // Filter deals by date range
      const filteredDeals = deals.data.filter(deal => 
        deal.expiryDate >= checkIn && deal.expiryDate <= checkOut
      );

      return filteredDeals;
    } catch (error) {
      console.error('Failed to get travel deals:', error);
      return [];
    }
  }

  // Book a travel deal
  async bookTravelDeal(dealId, userAddress, bookingDetails) {
    try {
      const result = await this.api.purchaseDeal(dealId, userAddress);
      
      // Send booking confirmation
      await this.sendBookingConfirmation(result.data, bookingDetails);
      
      return result;
    } catch (error) {
      console.error('Failed to book travel deal:', error);
      throw error;
    }
  }

  async sendBookingConfirmation(deal, bookingDetails) {
    // Integration with travel booking system
    console.log('Sending booking confirmation:', { deal, bookingDetails });
  }
}

// Example 2: Restaurant Discovery App Integration
class RestaurantDiscoveryIntegration {
  constructor() {
    this.api = new MonkeDealsAPI();
    this.api.setApiKey('restaurant-app-api-key');
  }

  // Get restaurant deals near user location
  async getNearbyRestaurantDeals(lat, lng, radius = 5) {
    try {
      const deals = await this.api.getDealsByLocation(lat, lng, radius);
      
      // Filter for restaurant deals
      const restaurantDeals = deals.data.filter(deal => 
        deal.category === 'restaurant' || deal.category === 'food'
      );

      return restaurantDeals;
    } catch (error) {
      console.error('Failed to get restaurant deals:', error);
      return [];
    }
  }

  // Get restaurant deals by cuisine type
  async getRestaurantDealsByCuisine(cuisine) {
    try {
      const deals = await this.api.getDealsByCategory('restaurant');
      
      // Filter by cuisine type
      const cuisineDeals = deals.data.filter(deal => 
        deal.cuisine && deal.cuisine.toLowerCase().includes(cuisine.toLowerCase())
      );

      return cuisineDeals;
    } catch (error) {
      console.error('Failed to get cuisine deals:', error);
      return [];
    }
  }
}

// Example 3: E-commerce Platform Integration
class EcommerceIntegration {
  constructor() {
    this.api = new MonkeDealsAPI();
    this.api.setApiKey('ecommerce-api-key');
  }

  // Get shopping deals for a specific product category
  async getShoppingDeals(category, priceRange) {
    try {
      const deals = await this.api.getDealsByCategory(category);
      
      // Filter by price range
      const filteredDeals = deals.data.filter(deal => 
        deal.originalPrice >= priceRange.min && deal.originalPrice <= priceRange.max
      );

      return filteredDeals;
    } catch (error) {
      console.error('Failed to get shopping deals:', error);
      return [];
    }
  }

  // Apply deal to shopping cart
  async applyDealToCart(dealId, cartItems) {
    try {
      const deal = await this.api.getDeal(dealId);
      
      // Calculate discount
      const discount = this.calculateDiscount(deal.data, cartItems);
      
      return {
        deal: deal.data,
        discount: discount,
        finalPrice: cartItems.total - discount
      };
    } catch (error) {
      console.error('Failed to apply deal:', error);
      throw error;
    }
  }

  calculateDiscount(deal, cartItems) {
    // Calculate discount based on deal rules
    if (deal.discountType === 'percentage') {
      return cartItems.total * (deal.discount / 100);
    } else if (deal.discountType === 'fixed') {
      return Math.min(deal.discount, cartItems.total);
    }
    return 0;
  }
}

// Example 4: Social Media Integration
class SocialMediaIntegration {
  constructor() {
    this.api = new MonkeDealsAPI();
    this.api.setApiKey('social-media-api-key');
  }

  // Share deal on social media
  async shareDeal(dealId, platform, userAddress) {
    try {
      const deal = await this.api.getDeal(dealId);
      
      // Create shareable content
      const shareContent = this.createShareContent(deal.data);
      
      // Post to social media platform
      await this.postToSocialMedia(platform, shareContent);
      
      // Track sharing activity
      await this.trackSharingActivity(dealId, platform, userAddress);
      
      return { success: true, shareContent };
    } catch (error) {
      console.error('Failed to share deal:', error);
      throw error;
    }
  }

  createShareContent(deal) {
    return {
      title: `Check out this amazing deal: ${deal.title}`,
      description: `${deal.description} - Save ${deal.discount}%!`,
      image: deal.image,
      url: `https://monkedelas.com/deals/${deal.id}`,
      hashtags: ['#MonkeDeals', '#Deals', '#NFT', '#Solana']
    };
  }

  async postToSocialMedia(platform, content) {
    // Integration with social media APIs
    console.log(`Posting to ${platform}:`, content);
  }

  async trackSharingActivity(dealId, platform, userAddress) {
    // Track sharing for analytics
    console.log('Tracking sharing activity:', { dealId, platform, userAddress });
  }
}

// Example 5: Analytics Dashboard Integration
class AnalyticsIntegration {
  constructor() {
    this.api = new MonkeDealsAPI();
    this.api.setApiKey('analytics-api-key');
  }

  // Get comprehensive analytics data
  async getAnalyticsData(timeRange = '30d') {
    try {
      const [overview, deals, users, revenue] = await Promise.all([
        this.api.getAnalytics('overview'),
        this.api.getAnalytics('deals'),
        this.api.getAnalytics('users'),
        this.api.getAnalytics('revenue')
      ]);

      return {
        overview: overview.data,
        deals: deals.data,
        users: users.data,
        revenue: revenue.data,
        timeRange
      };
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      throw error;
    }
  }

  // Get market statistics
  async getMarketStatistics() {
    try {
      const stats = await this.api.getMarketStats();
      return stats.data;
    } catch (error) {
      console.error('Failed to get market statistics:', error);
      throw error;
    }
  }
}

// Example 6: Mobile App Integration
class MobileAppIntegration {
  constructor() {
    this.api = new MonkeDealsAPI();
    this.api.setApiKey('mobile-app-api-key');
  }

  // Get personalized deals for user
  async getPersonalizedDeals(userAddress, preferences) {
    try {
      const [portfolio, reputation] = await Promise.all([
        this.api.getUserPortfolio(userAddress),
        this.api.getUserReputation(userAddress)
      ]);

      // Get deals based on user preferences and history
      const deals = await this.api.getDeals({
        category: preferences.categories.join(','),
        location: preferences.location,
        limit: 50
      });

      // Personalize deals based on user data
      const personalizedDeals = this.personalizeDeals(deals.data, portfolio.data, reputation.data);

      return personalizedDeals;
    } catch (error) {
      console.error('Failed to get personalized deals:', error);
      return [];
    }
  }

  personalizeDeals(deals, portfolio, reputation) {
    // Personalize deals based on user data
    return deals.map(deal => ({
      ...deal,
      personalizedScore: this.calculatePersonalizedScore(deal, portfolio, reputation),
      recommended: this.isRecommended(deal, portfolio, reputation)
    }));
  }

  calculatePersonalizedScore(deal, portfolio, reputation) {
    // Calculate personalized score based on user history and preferences
    let score = 0;
    
    // Base score from deal popularity
    score += deal.popularity || 0;
    
    // Bonus for user's preferred categories
    if (portfolio.preferredCategories?.includes(deal.category)) {
      score += 20;
    }
    
    // Bonus for high reputation users
    if (reputation.level === 'high') {
      score += 10;
    }
    
    return score;
  }

  isRecommended(deal, portfolio, reputation) {
    return this.calculatePersonalizedScore(deal, portfolio, reputation) > 70;
  }
}

// Export all integration examples
export {
  TravelBookingIntegration,
  RestaurantDiscoveryIntegration,
  EcommerceIntegration,
  SocialMediaIntegration,
  AnalyticsIntegration,
  MobileAppIntegration
};
