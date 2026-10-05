/**
 * Single entry point for all catalogue/content data (server-side).
 * Uses the Strapi GraphQL backend when STRAPI_URL is set, otherwise the bundled mock catalogue.
 */
import * as mock from "./mock"
import * as strapi from "./strapi"

const source: typeof mock = process.env.STRAPI_URL ? strapi : mock

export const {
  getProducts,
  getProductBySlug,
  getProductsByIds,
  getAllProductSlugs,
  getRelatedProducts,
  getProductsByTag,
  getCategories,
  getCategoryBySlug,
  getBrands,
  getHeroBanners,
  getPromoBanners,
  getReviews,
  getPriceBounds,
  getFaqs,
  getPolicy,
  getPolicySlugs,
} = source
