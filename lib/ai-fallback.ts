// Fallback AI functions for when external APIs are unavailable

export const getGeminiResponse = async (prompt: string) => {
    // Fallback responses when Gemini API is unavailable
    const fallbackResponses: { [key: string]: string } = {
        'product_recommendations': '["product1", "product2", "product3", "product4"]',
        'fake_review': '{"isFake": false, "confidence": 0.5, "reason": "Review appears genuine"}',
        'search_refinement': '{"query": "laptops", "category": "electronics", "brand": null}',
        'demand_prediction': '{"predictions": [{"month": "2024-02", "predictedSales": 1500}], "explanation": "Based on recent trends"}',
        'discount_suggestions': '[{"productId": "1", "discountPercentage": 15, "reason": "High stock, low sales"}]',
        'cart_recommendations': '["product1", "product2", "product3"]',
        'fraud_detection': '{"isFraudulent": false, "riskScore": 0.2, "reason": "Normal order pattern"}',
        'chatbot': 'I am here to help you with your shopping needs. How can I assist you today?'
    }

    // Simple keyword matching for fallback
    for (const [key, response] of Object.entries(fallbackResponses)) {
        if (prompt.toLowerCase().includes(key)) {
            return response
        }
    }

    // Default fallback
    return 'AI service temporarily unavailable. Please try again later.'
}

export const getProductRecommendations = async (currentProduct: any, allProducts: any[]) => {
    // Simple fallback: return top rated products
    return allProducts
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 4)
        .map(p => p._id)
}

export const detectFakeReview = async (reviewText: string) => {
    // Simple keyword-based fake review detection
    const spamKeywords = ['fake', 'scam', 'clickbait', 'buy now', 'limited time']
    const hasSpamKeywords = spamKeywords.some(keyword => 
        reviewText.toLowerCase().includes(keyword)
    )
    
    return {
        isFake: hasSpamKeywords,
        confidence: hasSpamKeywords ? 0.7 : 0.2,
        reason: hasSpamKeywords ? 'Contains spam-like keywords' : 'Review appears genuine'
    }
}

export const refineSearchQuery = async (query: string) => {
    // Simple search refinement
    const categoryMap: { [key: string]: string } = {
        'laptop': 'electronics',
        'phone': 'electronics',
        'shirt': 'clothing',
        'shoes': 'clothing',
        'book': 'books'
    }
    
    for (const [keyword, category] of Object.entries(categoryMap)) {
        if (query.toLowerCase().includes(keyword)) {
            return {
                query: query,
                category: category,
                brand: null
            }
        }
    }
    
    return {
        query: query,
        category: null,
        brand: null
    }
}

export const predictDemand = async (salesData: any[]) => {
    // Simple demand prediction based on trend
    if (salesData.length === 0) return null
    
    const lastMonth = salesData[salesData.length - 1]
    const predictedSales = lastMonth ? lastMonth.sales * 1.1 : 1000
    
    return {
        predictions: [
            { month: '2024-02', predictedSales },
            { month: '2024-03', predictedSales: predictedSales * 1.05 },
            { month: '2024-04', predictedSales: predictedSales * 1.1 }
        ],
        explanation: 'Based on recent sales trends with 10% growth projection'
    }
}

export const suggestDiscounts = async (products: any[]) => {
    // Simple discount suggestions based on stock
    return products
        .filter(p => p.countInStock > 50) // High stock items
        .map(p => ({
            productId: p._id,
            discountPercentage: Math.min(20, p.countInStock / 10), // Max 20% discount
            reason: `High stock (${p.countInStock} units) suggests discount needed`
        }))
}

export const getCartRecommendations = async (cartItems: any[], allProducts: any[]) => {
    // Simple cart recommendations based on categories
    const cartCategories = cartItems.map(item => item.category)
    const recommendations = allProducts
        .filter((p: any) => !cartItems.some((cart: any) => cart._id === p._id)) // Not in cart
        .filter((p: any) => cartCategories.includes(p.category)) // Same category
        .slice(0, 3)
        .map((p: any) => p._id)
    
    return recommendations
}

export const detectFraud = async (orderData: any) => {
    // Simple fraud detection based on order value
    const riskFactors = []
    let riskScore = 0.1 // Base risk
    
    if (orderData.totalPrice > 1000) {
        riskFactors.push('High order value')
        riskScore += 0.3
    }
    
    if (orderData.items && orderData.items.length > 5) {
        riskFactors.push('Many items in single order')
        riskScore += 0.2
    }
    
    return {
        isFraudulent: riskScore > 0.5,
        riskScore: Math.min(riskScore, 1),
        reason: riskFactors.join(', ') || 'Normal order pattern'
    }
}
