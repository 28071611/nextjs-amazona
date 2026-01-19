// Simple local AI functions without external dependencies

export const getGeminiResponse = async (prompt: string) => {
    return 'AI service running in offline mode with local intelligence.'
}

export const getProductRecommendations = async (currentProduct: any, allProducts: any[]) => {
    return allProducts
        .sort((a: any, b: any) => b.avgRating - a.avgRating)
        .slice(0, 4)
        .map((p: any) => p._id)
}

export const detectFakeReview = async (reviewText: string) => {
    const spamKeywords = ['fake', 'scam', 'clickbait']
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
    return {
        query: query,
        category: null,
        brand: null
    }
}

export const predictDemand = async (salesData: any[]) => {
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
    return products
        .filter((p: any) => p.countInStock > 50)
        .map((p: any) => ({
            productId: p._id,
            discountPercentage: Math.min(20, p.countInStock / 10),
            reason: `High stock (${p.countInStock} units) suggests discount needed`
        }))
}

export const getCartRecommendations = async (cartItems: any[], allProducts: any[]) => {
    const cartCategories = cartItems.map((item: any) => item.category)
    const recommendations = allProducts
        .filter((p: any) => !cartItems.some((cart: any) => cart._id === p._id))
        .filter((p: any) => cartCategories.includes(p.category))
        .slice(0, 3)
        .map((p: any) => p._id)
    
    return recommendations
}

export const detectFraud = async (orderData: any) => {
    const riskFactors = []
    let riskScore = 0.1
    
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
