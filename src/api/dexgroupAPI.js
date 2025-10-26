/**
 * DEXGroup API - RESTful API for external integrations
 * This API allows third-party applications to interact with DEXGroup
 */

class DEXGroupAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.apiKey = null;
  }

  // Set API key for authentication
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  // Get all available deals
  async getDeals(params = {}) {
    const queryParams = new URLSearchParams(params);
    const response = await this.makeRequest(`/deals?${queryParams}`);
    return response;
  }

  // Get specific deal by ID
  async getDeal(dealId) {
    const response = await this.makeRequest(`/deals/${dealId}`);
    return response;
  }

  // Get deals by merchant
  async getDealsByMerchant(merchantId) {
    const response = await this.makeRequest(`/merchants/${merchantId}/deals`);
    return response;
  }

  // Get deals by category
  async getDealsByCategory(category) {
    const response = await this.makeRequest(`/deals/category/${category}`);
    return response;
  }

  // Get deals by location (geo-based)
  async getDealsByLocation(lat, lng, radius = 10) {
    const response = await this.makeRequest(`/deals/location?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response;
  }

  // Get user's portfolio
  async getUserPortfolio(userAddress) {
    const response = await this.makeRequest(`/users/${userAddress}/portfolio`);
    return response;
  }

  // Get user's reputation
  async getUserReputation(userAddress) {
    const response = await this.makeRequest(`/users/${userAddress}/reputation`);
    return response;
  }

  // Get active auctions
  async getActiveAuctions() {
    const response = await this.makeRequest('/auctions/active');
    return response;
  }

  // Get group deals
  async getGroupDeals() {
    const response = await this.makeRequest('/group-deals');
    return response;
  }

  // Get leaderboard
  async getLeaderboard(type = 'reputation') {
    const response = await this.makeRequest(`/leaderboard/${type}`);
    return response;
  }

  // Create a new deal (for merchants)
  async createDeal(dealData) {
    const response = await this.makeRequest('/deals', {
      method: 'POST',
      body: JSON.stringify(dealData)
    });
    return response;
  }

  // Purchase a deal
  async purchaseDeal(dealId, userAddress) {
    const response = await this.makeRequest(`/deals/${dealId}/purchase`, {
      method: 'POST',
      body: JSON.stringify({ userAddress })
    });
    return response;
  }

  // Redeem a deal
  async redeemDeal(dealId, userAddress, redemptionData) {
    const response = await this.makeRequest(`/deals/${dealId}/redeem`, {
      method: 'POST',
      body: JSON.stringify({ userAddress, ...redemptionData })
    });
    return response;
  }

  // List NFT for sale
  async listNFTForSale(nftId, price) {
    const response = await this.makeRequest(`/nfts/${nftId}/list`, {
      method: 'POST',
      body: JSON.stringify({ price })
    });
    return response;
  }

  // Get NFT ownership
  async getNFTOwnership(nftId) {
    const response = await this.makeRequest(`/nfts/${nftId}/ownership`);
    return response;
  }

  // Get analytics data
  async getAnalytics(type = 'overview') {
    const response = await this.makeRequest(`/analytics/${type}`);
    return response;
  }

  // Get market statistics
  async getMarketStats() {
    const response = await this.makeRequest('/market/stats');
    return response;
  }

  // Webhook registration for real-time updates
  async registerWebhook(webhookUrl, events = []) {
    const response = await this.makeRequest('/webhooks', {
      method: 'POST',
      body: JSON.stringify({ webhookUrl, events })
    });
    return response;
  }

  // Internal method to make HTTP requests
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

export default DEXGroupAPI;
