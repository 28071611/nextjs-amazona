'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  MessageCircle,
  Send,
  Users,
  TrendingUp,
  Star,
  ShoppingCart,
  Bot,
  Brain,
  Zap,
  Award,
  Target,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  Gift,
  BarChart3,
  Volume2,
  DollarSign,
  Settings,
  Mic,
  Headphones,
  Camera,
  Image,
  Sparkles,
  Search,
  Package,
  HelpCircle
} from 'lucide-react'

interface ChatbotAnalytics {
  totalConversations: number
  activeUsers: number
  averageResponseTime: number
  satisfactionScore: number
  popularQueries: Array<{ query: string; count: number }>
  resolutionRate: number
  featuresUsage: {
    productSearch: number
    orderTracking: number
    cartAssistance: number
    generalHelp: number
    voiceSearch: number
    visualSearch: number
  }
}

interface ChatbotConfig {
  isActive: boolean
  welcomeMessage: string
  personality: string
  language: string
  features: {
    voiceEnabled: boolean
    visualSearchEnabled: boolean
    personalizedRecommendations: boolean
    proactiveAssistance: boolean
    multiLanguage: boolean
    sentimentAnalysis: boolean
  }
}

export default function ChatbotDashboard() {
  const [analytics, setAnalytics] = useState<ChatbotAnalytics | null>(null)
  const [config, setConfig] = useState<ChatbotConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch analytics
      const analyticsResponse = await fetch('/api/chatbot/analytics')
      const analyticsData = await analyticsResponse.json()
      setAnalytics(analyticsData.analytics)

      // Fetch configuration
      const configResponse = await fetch('/api/chatbot/config')
      const configData = await configResponse.json()
      setConfig(configData.config)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (updates: Partial<ChatbotConfig>) => {
    try {
      const response = await fetch('/api/chatbot/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()
      if (data.success) {
        setConfig(data.config)
      }
    } catch (error) {
      console.error('Failed to update config:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6" />
              Chatbot Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Total Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {analytics?.totalConversations || 0}
              </div>
              <p className="text-sm text-gray-600">Last 30 days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {analytics?.activeUsers || 0}
              </div>
              <p className="text-sm text-gray-600">Today</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {analytics?.averageResponseTime || 0}s
              </div>
              <p className="text-sm text-gray-600">Per query</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Satisfaction Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {analytics?.satisfactionScore || 0}%
              </div>
              <div className="flex items-center gap-2">
                <Progress value={analytics?.satisfactionScore || 0} className="flex-1" />
                <span className="text-sm text-gray-600">User satisfaction</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Feature Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analytics?.featuresUsage && Object.entries(analytics.featuresUsage).map(([feature, count], index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">{getFeatureIcon(feature)}</div>
                    <div>
                      <div className="font-semibold">{getFeatureName(feature)}</div>
                      <div className="text-xs text-gray-600">{getFeatureDescription(feature)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{count}</div>
                    <div className="text-sm text-gray-600">uses</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Popular Queries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics?.popularQueries?.map((query, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{query.query}</div>
                  <div className="text-sm text-gray-600">{query.count} times asked</div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{query.count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Chatbot Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={config?.isActive ? 'default' : 'secondary'}>
                {config?.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Welcome Message</label>
                <textarea
                  value={config?.welcomeMessage || ''}
                  onChange={(e) => updateConfig({ welcomeMessage: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Personality</label>
                <select
                  value={config?.personality || 'friendly'}
                  onChange={(e) => updateConfig({ personality: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="enthusiastic">Enthusiastic</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Language</label>
                <select
                  value={config?.language || 'en'}
                  onChange={(e) => updateConfig({ language: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold mb-2">Advanced Features</h4>
              <div className="space-y-3">
                {[
                  { key: 'voiceEnabled', label: 'Voice Search', icon: <Mic className="h-4 w-4" /> },
                  { key: 'visualSearchEnabled', label: 'Visual Search', icon: <Camera className="h-4 w-4" /> },
                  { key: 'personalizedRecommendations', label: 'Personalized Recommendations', icon: <Brain className="h-4 w-4" /> },
                  { key: 'proactiveAssistance', label: 'Proactive Assistance', icon: <Zap className="h-4 w-4" /> },
                  { key: 'multiLanguage', label: 'Multi-Language Support', icon: <Headphones className="h-4 w-4" /> },
                  { key: 'sentimentAnalysis', label: 'Sentiment Analysis', icon: <Eye className="h-4 w-4" /> },
                ].map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {feature.icon}
                      <div>
                        <div className="font-medium">{feature.label}</div>
                        <div className="text-xs text-gray-600">{getFeatureDescription(feature.key)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateConfig({ features: { ...config?.features, [feature.key]: !config?.features[feature.key as keyof NonNullable<typeof config>['features']] } } as any)}
                        className={`px-3 py-1 rounded text-sm ${config?.features[feature.key as keyof NonNullable<typeof config>['features']]
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {config?.features[feature.key as keyof NonNullable<typeof config>['features']] ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function getFeatureIcon(feature: string) {
  const icons: Record<string, React.ReactNode> = {
    productSearch: <Search className="h-4 w-4" />,
    orderTracking: <Package className="h-4 w-4" />,
    cartAssistance: <ShoppingCart className="h-4 w-4" />,
    generalHelp: <HelpCircle className="h-4 w-4" />,
    voiceSearch: <Mic className="h-4 w-4" />,
    visualSearch: <Camera className="h-4 w-4" />,
    personalizedRecommendations: <Brain className="h-4 w-4" />,
    proactiveAssistance: <Zap className="h-4 w-4" />,
    multiLanguage: <Headphones className="h-4 w-4" />,
    sentimentAnalysis: <Eye className="h-4 w-4" />,
  }
  return icons[feature] || <Bot className="h-4 w-4" />
}

function getFeatureName(feature: string) {
  const names: Record<string, string> = {
    productSearch: 'Product Search',
    orderTracking: 'Order Tracking',
    cartAssistance: 'Cart Assistance',
    generalHelp: 'General Help',
    voiceSearch: 'Voice Search',
    visualSearch: 'Visual Search',
    personalizedRecommendations: 'Personalized Recommendations',
    proactiveAssistance: 'Proactive Assistance',
    multiLanguage: 'Multi-Language Support',
    sentimentAnalysis: 'Sentiment Analysis',
  }
  return names[feature] || feature
}

function getFeatureDescription(feature: string) {
  const descriptions: Record<string, string> = {
    productSearch: 'Help users find products quickly',
    orderTracking: 'Track order status and delivery',
    cartAssistance: 'Assist with cart management',
    generalHelp: 'General customer support queries',
    voiceSearch: 'Search products using voice commands',
    visualSearch: 'Find products using image recognition',
    personalizedRecommendations: 'AI-powered product suggestions',
    proactiveAssistance: 'Initiate conversations based on user behavior',
    multiLanguage: 'Support multiple languages',
    sentimentAnalysis: 'Analyze user emotions and responses',
  }
  return descriptions[feature] || 'Advanced AI feature'
}
