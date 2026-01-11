import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export const getGeminiResponse = async (prompt: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('Gemini API Error:', error)
        return null
    }
}

export const getProductRecommendations = async (
    currentProduct: any,
    allProducts: any[]
) => {
    const prompt = `
    Given the current product: ${JSON.stringify({
        name: currentProduct.name,
        category: currentProduct.category,
        brand: currentProduct.brand,
        tags: currentProduct.tags,
    })}
    
    And a list of other products: ${JSON.stringify(
        allProducts.map((p) => ({
            id: p._id,
            name: p.name,
            category: p.category,
            brand: p.brand,
            tags: p.tags,
        }))
    )}
    
    Please return a JSON array of the top 4 product IDs that are most similar or complementary to the current product. 
    Only return the JSON array, nothing else.
  `
    const response = await getGeminiResponse(prompt)
    if (!response) return []
    try {
        // Basic cleanup in case Gemini adds markdown formatting
        const jsonString = response.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(jsonString)
    } catch (error) {
        console.error('Failed to parse recommendations:', error)
        return []
    }
}

export const detectFakeReview = async (reviewText: string) => {
    const prompt = `
    Analyze the following product review and determine if it is likely to be fake or spam.
    Review: "${reviewText}"
    
    Return a JSON object with:
    - isFake: boolean
    - confidence: number (0 to 1)
    - reason: string
    
    Only return the JSON object.
  `
    const response = await getGeminiResponse(prompt)
    if (!response) return { isFake: false, confidence: 0, reason: 'Error' }
    try {
        const jsonString = response.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(jsonString)
    } catch (error) {
        return { isFake: false, confidence: 0, reason: 'Parse Error' }
    }
}

export const refineSearchQuery = async (query: string) => {
    const prompt = `
    Analyze the following user search query for an e-commerce store: "${query}"
    
    Extract:
    1. Key product terms
    2. Category (if any)
    3. Brand (if any)
    4. Refined query (more descriptive)
    
    Return a JSON object with these fields. 
    Only return the JSON object.
  `
    const response = await getGeminiResponse(prompt)
    if (!response) return { query, category: null, brand: null }
    try {
        const jsonString = response.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(jsonString)
    } catch (error) {
        return { query, category: null, brand: null }
    }
}

export const predictDemand = async (salesData: any[]) => {
    const prompt = `
    Analyze the following historical monthly sales data for an e-commerce store:
    ${JSON.stringify(salesData)}
    
    Predict the sales for the next 3 months. 
    Provide a brief explanation for the prediction (e.g., seasonal trends, growth patterns).
    
    Return a JSON object with:
    - predictions: array of { month: string, predictedSales: number }
    - explanation: string
    
    Only return the JSON object.
  `
    const response = await getGeminiResponse(prompt)
    if (!response) return null
    try {
        const jsonString = response.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(jsonString)
    } catch (error) {
        return null
    }
}

export const suggestDiscounts = async (products: any[]) => {
    const prompt = `
    Analyze the following product data:
    ${JSON.stringify(products.map(p => ({ id: p._id, name: p.name, price: p.price, stock: p.countInStock })))}
    
    Suggest discounts (0-50%) for products that have high stock but low sales (or just based on stock for now).
    
    Return a JSON array of objects:
    - productId: string
    - discountPercentage: number
    - reason: string
    
    Only return the JSON array.
  `
    const response = await getGeminiResponse(prompt)
    if (!response) return []
    try {
        const jsonString = response.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(jsonString)
    } catch (error) {
        return []
    }
}

export const getCartRecommendations = async (cartItems: any[], allProducts: any[]) => {
    const prompt = `
    Given the items currently in the cart: ${JSON.stringify(cartItems.map(item => ({ name: item.name, category: item.category })))}
    
    And a list of other products: ${JSON.stringify(allProducts.map(p => ({ id: p._id, name: p.name, category: p.category, brand: p.brand, tags: p.tags })))}
    
    Please return a JSON array of 3 product IDs that are most likely to be bought together with the items in the cart. 
    Only return the JSON array, nothing else.
  `
    const response = await getGeminiResponse(prompt)
    if (!response) return []
    try {
        const jsonString = response.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(jsonString)
    } catch (error) {
        return []
    }
}

export const detectFraud = async (orderData: any) => {
    const prompt = `
    Analyze the following order for potential fraud:
    ${JSON.stringify(orderData)}
    
    Consider:
    - High order value
    - Multiple expensive items
    - Shipping vs Billing address mismatch (if provided)
    
    Return a JSON object with:
    - isFraudulent: boolean
    - riskScore: number (0 to 1)
    - reason: string
    
    Only return the JSON object.
  `
    const response = await getGeminiResponse(prompt)
    if (!response) return { isFraudulent: false, riskScore: 0, reason: 'Error' }
    try {
        const jsonString = response.replace(/```json/g, '').replace(/```/g, '').trim()
        return JSON.parse(jsonString)
    } catch (error) {
        return { isFraudulent: false, riskScore: 0, reason: 'Parse Error' }
    }
}
