/**
 * Salla Product API Class
 * Complete implementation of all Salla Product APIs
 * Documentation: https://docs.salla.dev/849354f0
 */

class SallaProductAPI {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Ensure Salla SDK is initialized
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      if (typeof salla === 'undefined') {
        throw new Error('Salla SDK not loaded');
      }

      // Initialize Salla SDK if it has not been configured yet
      try {
        const hasConfig = !!(salla.config && typeof salla.config.get === 'function' && salla.config.get('store.id'));

        if (!hasConfig) {
          salla.init({
            debug: true,
            language_code: 'ar',
            store: {
              id: 229278595,
              url: 'https://api.salla.dev/store/v1/'
            }
          });
        }

        this.isInitialized = true;
      } catch (e) {
        console.error('Failed to initialize Salla SDK in SallaProductAPI.ensureInitialized:', e);
        throw e;
      }
    }

    return true;
  }

  /**
   * 1. Get Price
   * Returns the price of a product by ID
   * @param {number} productId - Product ID
   * @returns {Promise}
   */
  async getPrice(productId) {
    await this.ensureInitialized();
    
    if (!productId) {
      throw new Error('Product ID is required');
    }

    try {
      const response = await salla.product.getPrice(productId);
      return {
        success: true,
        data: response.data,
        productId: productId
      };
    } catch (error) {
      throw this.handleError(error, 'getPrice');
    }
  }

  /**
   * 2. Product Availability
   * Subscribe to product availability notifications
   * @param {number} productId - Product ID
   * @param {string} email - Email to notify when product is available
   * @returns {Promise}
   */
  async subscribeToAvailability(productId, email) {
    await this.ensureInitialized();
    
    if (!productId) {
      throw new Error('Product ID is required');
    }
    if (!email) {
      throw new Error('Email is required');
    }

    try {
      // Use the correct SDK method - might be subscribeAvailability or notifyAvailability
      if (typeof salla.product.subscribeAvailability === 'function') {
        const response = await salla.product.subscribeAvailability(productId, { email });
        return {
          success: true,
          message: 'Successfully subscribed to product availability',
          data: response.data
        };
      } else if (typeof salla.product.notifyAvailability === 'function') {
        const response = await salla.product.notifyAvailability(productId, { email });
        return {
          success: true,
          message: 'Successfully subscribed to product availability',
          data: response.data
        };
      } else {
        // Fallback: use direct API call
        throw new Error('Product availability subscription method not available in SDK. Please use REST API directly.');
      }
    } catch (error) {
      throw this.handleError(error, 'subscribeToAvailability');
    }
  }

  /**
   * 3. Get Category Products
   * Lists all products within a given category
   * @param {number} categoryId - Category ID
   * @param {Object} options - Query options (page, limit, etc.)
   * @returns {Promise}
   */
  async getCategoryProducts(categoryId, options = {}) {
    await this.ensureInitialized();
    
    if (!categoryId) {
      throw new Error('Category ID is required');
    }

    try {
      // Source is required when using fetch, so we use 'latest' as default
      const queryParams = {
        source: 'categories',
        source_value:[categoryId],
      };

      // Only add other valid options
      if (options.sort) {
        queryParams.sort = options.sort;
      }

      // Use fetch with category filter
      const response = await salla.product.fetch(queryParams);
      return {
        success: true,
        data: response.data,
        categoryId: categoryId,
        pagination: response.pagination || {}
      };
    } catch (error) {
      throw this.handleError(error, 'getCategoryProducts');
    }
  }

  /**
   * 4. Get Offer Details
   * Fetch offered items related to the product
   * @param {number} productId - Product ID
   * @returns {Promise}
   */
  async getOfferDetails(productId) {
    await this.ensureInitialized();
    
    if (!productId) {
      throw new Error('Product ID is required');
    }

    try {
      // Try different method names
      if (typeof salla.product.getOffer === 'function') {
        const response = await salla.product.getOffer(productId);
        return {
          success: true,
          data: response.data,
          productId: productId
        };
      } else if (typeof salla.product.offers === 'function') {
        const response = await salla.product.offers(productId);
        return {
          success: true,
          data: response.data,
          productId: productId
        };
      } else {
        // Get product details which may include offers
        const response = await salla.product.getDetails(productId, ['offers']);
        return {
          success: true,
          data: response.data?.offers || response.data,
          productId: productId,
          note: 'Offers retrieved from product details'
        };
      }
    } catch (error) {
      throw this.handleError(error, 'getOfferDetails');
    }
  }

  /**
   * 5. Search Products
   * Search products by keywords or phrases
   * @param {string} query - Search query/keywords
   * @param {Object} options - Search options (page, limit, sort, etc.)
   * @returns {Promise}
   */
  async searchProducts(query, options = {}) {
    await this.ensureInitialized();
    
    if (!query || query.trim() === '') {
      throw new Error('Search query is required');
    }

    // Base params
    const page = options.page || 1;
    const limit = options.limit || 20;
    const sort = options.sort || 'relevance';

    // Helper: normalize successful response
    const buildResult = (response) => ({
      success: true,
      data: response.data,
      query: query,
      total: response.data?.total || 0
    });

    try {
      // Preferred: dedicated search endpoint, if available
      if (typeof salla.product.search === 'function') {
        // Salla SDK expects the search term in a "query" field, not "q"
        const searchParams = {
          query: query,
          page,
          limit,
          sort
        };

        // Merge in any additional options without overwriting the core query field
        const finalParams = { ...options, ...searchParams };

        const response = await salla.product.search(finalParams);
        return buildResult(response);
      }
    } catch (primaryError) {
      // If the dedicated search endpoint fails with a search-related error,
      // we'll fall back to using fetch with source: 'search' below.
      const msg = primaryError?.message || '';
      const msgLower = msg.toLowerCase();
      const isSearchSpecific = msgLower.includes('no "query"') || msgLower.includes('no search') || msgLower.includes('search');

      if (!isSearchSpecific) {
        // Non-search-specific failure: surface it
        throw this.handleError(primaryError, 'searchProducts');
      }
      // Otherwise, continue to fallback below
    }

    // Fallback: use fetch with source: 'search'
    try {
      const fetchParams = {
        source: 'search',
        sourceValue: query,
        page,
        limit,
        sort
      };

      const response = await salla.product.fetch(fetchParams);
      return buildResult(response);
    } catch (fallbackError) {
      throw this.handleError(fallbackError, 'searchProducts');
    }
  }

  /**
   * 6. Get Gift Details
   * Get details of a gifted product
   * @param {number} giftId - Gift ID
   * @returns {Promise}
   */
  async getGiftDetails(giftId) {
    await this.ensureInitialized();
    
    if (!giftId) {
      throw new Error('Gift ID is required');
    }

    try {
      const response = await salla.product.gift(giftId);
      return {
        success: true,
        data: response.data,
        giftId: giftId
      };
    } catch (error) {
      throw this.handleError(error, 'getGiftDetails');
    }
  }

  /**
   * 7. Add Gift To Cart
   * Add a gifted product to the shopping cart
   * @param {number} giftId - Gift ID
   * @param {Object} options - Additional options
   * @returns {Promise}
   */
  async addGiftToCart(giftId, options = {}) {
    await this.ensureInitialized();
    
    if (!giftId) {
      throw new Error('Gift ID is required');
    }

    try {
      const response = await salla.product.giftAddToCart(giftId, options);
      return {
        success: true,
        message: 'Gift added to cart successfully',
        data: response.data
      };
    } catch (error) {
      throw this.handleError(error, 'addGiftToCart');
    }
  }

  /**
   * 8. Upload Gift Image
   * Upload a product image associated with the gifted product
   * @param {number} giftId - Gift ID
   * @param {File|Blob} imageFile - Image file to upload
   * @returns {Promise}
   */
  async uploadGiftImage(giftId, imageFile) {
    await this.ensureInitialized();
    
    if (!giftId) {
      throw new Error('Gift ID is required');
    }
    if (!imageFile) {
      throw new Error('Image file is required');
    }

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await salla.product.giftUploadImage(giftId, formData);
      return {
        success: true,
        message: 'Gift image uploaded successfully',
        data: response.data
      };
    } catch (error) {
      throw this.handleError(error, 'uploadGiftImage');
    }
  }

  /**
   * 9. Get Product Details
   * Get detailed information about a particular product
   * @param {number} productId - Product ID
   * @param {Object|Array} options - Additional options (include reviews, ratings, etc.) or array of advanced items
   * @returns {Promise}
   */
  async getProductDetails(productId, options = {}) {
    await this.ensureInitialized();
    
    if (!productId) {
      throw new Error('Product ID is required');
    }

    try {
      // Use getDetails method which accepts an array of advanced items
      const advancedItems = Array.isArray(options) 
        ? options 
        : (options.include ? (Array.isArray(options.include) ? options.include : options.include.split(',')) : ['images', 'sold_quantity', 'category', 'rating', 'brand']);

      const response = await salla.product.getDetails(productId, advancedItems);
      return {
        success: true,
        data: response.data,
        productId: productId
      };
    } catch (error) {
      throw this.handleError(error, 'getProductDetails');
    }
  }

  /**
   * 10. Fetch Products
   * Fetch product lists from a Merchant Store
   * According to Salla API: source is required, sourceValue depends on source type
   * Valid sources: categories, latest, related, brands, json, search, tags, selected, offers, landing-page
   * @param {Object} queryParams - Query parameters
   * @param {string} queryParams.source - Source type (latest, categories, related, brands, search, tags, selected, offers, landing-page)
   * @param {string|number|object|array} queryParams.sourceValue - Value for source (required for some sources like categories, brands, etc.)
   * @param {number} queryParams.page - Page number
   * @param {number} queryParams.limit - Items per page
   * @param {Array<string>} queryParams.includes - Related data to include (only ["options"] is supported)
   * @param {Object} queryParams.filters - Additional filters object
   * @returns {Promise}
   */
  async fetchProducts(queryParams = {}) {
    await this.ensureInitialized();

    try {
      // Valid source types according to Salla API documentation
      const validSources = [
        'categories', 'latest', 'related', 'brands', 'json', 
        'search', 'tags', 'selected', 'offers', 'landing-page'
      ];
      
      // Ensure source is always provided and valid
      let source = queryParams.source;
      if (!source || typeof source !== 'string' || source.trim() === '') {
        source = 'latest';
      }
      source = source.trim();
      
      // Validate source is in valid list, default to 'latest' if not
      if (!validSources.includes(source)) {
        source = 'latest';
      }
      
      // Build params object - source is REQUIRED
      const params = {
        source: source  // Always include source, never empty
      };

      // Add sourceValue if provided (required for some sources like categories, brands, etc.)
      if (queryParams.sourceValue !== undefined && queryParams.sourceValue !== null) {
        params.sourceValue = queryParams.sourceValue;
      }

      // Add pagination
      if (queryParams.page) {
        params.page = queryParams.page;
      }
      if (queryParams.limit) {
        params.limit = queryParams.limit;
      }

      // Add includes (only ["options"] is supported)
      if (queryParams.includes && Array.isArray(queryParams.includes)) {
        // Only allow "options" in includes
        const validIncludes = queryParams.includes.filter(inc => inc === 'options');
        if (validIncludes.length > 0) {
          params.includes = validIncludes;
        }
      }

      // Add filters if provided
      if (queryParams.filters && typeof queryParams.filters === 'object') {
        params.filters = queryParams.filters;
      }

      // Double-check source is still present before making the call
      if (!params.source || params.source.trim() === '') {
        params.source = 'latest';
      }

      const response = await salla.product.fetch(params);
      return {
        success: true,
        data: response.data,
        pagination: response.pagination || {},
        total: response.data?.length || 0,
        source: params.source,
        sourceValue: params.sourceValue || null
      };
    } catch (error) {
      throw this.handleError(error, 'fetchProducts');
    }
  }

  /**
   * 11. Fetch Options
   * Fetch related data useful to include in the product (options, reviews, ratings, etc.)
   * According to Salla API: Pass an array of Product IDs
   * @param {number|Array<number>} productIds - Product ID or array of product IDs
   * @returns {Promise}
   */
  async fetchOptions(productIds) {
    await this.ensureInitialized();
    
    if (!productIds) {
      throw new Error('Product ID(s) are required');
    }

    try {
      // Convert to array of numbers
      const selected = Array.isArray(productIds) 
        ? productIds.map(id => parseInt(id)).filter(id => !isNaN(id))
        : [parseInt(productIds)];
      
      if (selected.length === 0) {
        throw new Error('At least one valid product ID is required');
      }
      
      // According to docs: salla.product.api.fetchOptions takes array directly
      if (typeof salla.product?.api?.fetchOptions === 'function') {
        const response = await salla.product.api.fetchOptions(selected);
        return {
          success: true,
          data: response.data || response,
          productIds: selected
        };
      } else if (typeof salla.product.fetchOptions === 'function') {
        // Try alternative method name
        const response = await salla.product.fetchOptions(selected);
        return {
          success: true,
          data: response.data || response,
          productIds: selected
        };
      } else {
        // Fallback: use REST API directly
        const storeId = salla.config?.get('store.id') || 229278595;
        const selectedParam = selected.map(id => `selected[]=${id}`).join('&');
        const response = await fetch(`https://api.salla.dev/store/v1/products/options?${selectedParam}`, {
          headers: {
            'Store-Identifier': storeId.toString(),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || ''}`);
        }
        
        const data = await response.json();
        return {
          success: true,
          data: data.data || data,
          productIds: selected
        };
      }
    } catch (error) {
      throw this.handleError(error, 'fetchOptions');
    }
  }

  /**
   * 12. Get Size Guides
   * Fetch the size guide for a specific product
   * @param {number} productId - Product ID
   * @returns {Promise}
   */
  async getSizeGuide(productId) {
    await this.ensureInitialized();
    
    if (!productId) {
      throw new Error('Product ID is required');
    }

    try {
      // Try different method names
      if (typeof salla.product.getSizeGuide === 'function') {
        const response = await salla.product.getSizeGuide(productId);
        return {
          success: true,
          data: response.data,
          productId: productId
        };
      } else if (typeof salla.product.sizeGuides === 'function') {
        const response = await salla.product.sizeGuides(productId);
        return {
          success: true,
          data: response.data,
          productId: productId
        };
      } else {
        // Get product details with valid 'with' parameters
        // Valid values: images, brand, tags, notify_availability, skus_availability, rating, donation, options, skus, sold_quantity, category, included_products, bundle
        // Size guide might be in options or we need to check the product data structure
        const response = await salla.product.getDetails(productId, ['options', 'images']);
        
        // Check if size guide exists in the response
        const sizeGuide = response.data?.size_guide || 
                          response.data?.options?.find(opt => opt.type === 'size_guide') ||
                          response.data?.size_chart ||
                          null;
        
        return {
          success: true,
          data: sizeGuide || response.data,
          productId: productId,
          note: sizeGuide ? 'Size guide found' : 'Size guide not available for this product'
        };
      }
    } catch (error) {
      throw this.handleError(error, 'getSizeGuide');
    }
  }

  /**
   * 13. Get Categories
   * Get list of all categories
   * @param {Object} options - Query options (page, limit, etc.)
   * @returns {Promise}
   */
  async getCategories(options = {}) {
    await this.ensureInitialized();

    try {
      const queryParams = {
        page: options.page || 1,
        limit: options.limit || 50
      };

      // Try different method names
      if (typeof salla.category?.fetch === 'function') {
        const response = await salla.category.fetch(queryParams);
        return {
          success: true,
          data: response.data,
          pagination: response.pagination || {}
        };
      } else if (typeof salla.category?.list === 'function') {
        const response = await salla.category.list(queryParams);
        return {
          success: true,
          data: response.data,
          pagination: response.pagination || {}
        };
      } else if (typeof salla.product?.getCategories === 'function') {
        const response = await salla.product.getCategories(queryParams);
        return {
          success: true,
          data: response.data,
          pagination: response.pagination || {}
        };
      } else {
        // Use REST API directly via fetch
        const storeId = salla.config?.get('store.id') || 229278595;
        const response = await fetch(`https://api.salla.dev/store/v1/categories?page=${queryParams.page}&limit=${queryParams.limit}`, {
          headers: {
            'Store-Identifier': storeId.toString(),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return {
          success: true,
          data: data.data || data,
          pagination: data.pagination || {}
        };
      }
    } catch (error) {
      throw this.handleError(error, 'getCategories');
    }
  }

  /**
   * Helper Methods
   */

  /**
   * Get multiple products by IDs
   * @param {Array<number>} productIds - Array of product IDs
   * @returns {Promise}
   */
  async getMultipleProducts(productIds) {
    await this.ensureInitialized();
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new Error('Product IDs array is required');
    }

    try {
      const promises = productIds.map(id => this.getProductDetails(id));
      const results = await Promise.allSettled(promises);
      
      return {
        success: true,
        data: results.map((result, index) => ({
          productId: productIds[index],
          success: result.status === 'fulfilled',
          data: result.status === 'fulfilled' ? result.value.data : null,
          error: result.status === 'rejected' ? result.reason.message : null
        }))
      };
    } catch (error) {
      throw this.handleError(error, 'getMultipleProducts');
    }
  }

  /**
   * Get products by category with pagination
   * @param {number} categoryId - Category ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise}
   */
  async getProductsByCategory(categoryId, page = 1, limit = 20) {
    return this.getCategoryProducts(categoryId, { page, limit });
  }

  /**
   * Get latest products
   * @param {number} limit - Number of products to fetch
   * @returns {Promise}
   */
  async getLatestProducts(limit = 20) {
    return this.fetchProducts({ source: 'latest', limit });
  }

  /**
   * Get products by category
   * @param {number} categoryId - Category ID
   * @param {number} limit - Number of products to fetch
   * @returns {Promise}
   */
  async getProductsByCategoryId(categoryId, limit = 20) {
    return this.fetchProducts({ source: 'categories', sourceValue: categoryId, limit });
  }

  /**
   * Get related products
   * @param {number} productId - Product ID to get related products for
   * @param {number} limit - Number of products to fetch
   * @returns {Promise}
   */
  async getRelatedProducts(productId, limit = 20) {
    return this.fetchProducts({ source: 'related', sourceValue: productId, limit });
  }

  /**
   * Get products by brand
   * @param {number} brandId - Brand ID
   * @param {number} limit - Number of products to fetch
   * @returns {Promise}
   */
  async getProductsByBrand(brandId, limit = 20) {
    return this.fetchProducts({ source: 'brands', sourceValue: brandId, limit });
  }

  /**
   * Get products by tag
   * @param {string} tag - Tag name
   * @param {number} limit - Number of products to fetch
   * @returns {Promise}
   */
  async getProductsByTag(tag, limit = 20) {
    return this.fetchProducts({ source: 'tags', sourceValue: tag, limit });
  }

  /**
   * Get products on offer
   * @param {number} limit - Number of products to fetch
   * @returns {Promise}
   */
  async getOffersProducts(limit = 20) {
    return this.fetchProducts({ source: 'offers', limit });
  }

  /**
   * Get selected products
   * @param {Array<number>} productIds - Array of product IDs
   * @param {number} limit - Number of products to fetch
   * @returns {Promise}
   */
  async getSelectedProducts(productIds, limit = 20) {
    return this.fetchProducts({ source: 'selected', sourceValue: productIds, limit });
  }

  /**
   * Error handler
   */
  handleError(error, methodName) {
    const errorMessage = error.message || 'Unknown error occurred';
    const errorDetails = {
      method: methodName,
      message: errorMessage,
      originalError: error
    };

    if (error.response) {
      errorDetails.status = error.response.status;
      errorDetails.data = error.response.data;
    }

    console.error(`SallaProductAPI.${methodName} error:`, errorDetails);
    return errorDetails;
  }
}

// Create global instance
let sallaProductAPIInstance = null;

/**
 * Get or create SallaProductAPI instance
 */
function getSallaProductAPI() {
  if (!sallaProductAPIInstance) {
    sallaProductAPIInstance = new SallaProductAPI();
  }
  return sallaProductAPIInstance;
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SallaProductAPI, getSallaProductAPI };
}

