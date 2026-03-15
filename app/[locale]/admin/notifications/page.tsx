'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Bell, Send, Users, Mail, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface NotificationFormData {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  actionUrl?: string
  actionText?: string
  isGlobal: boolean
  targetUserId?: string
}

export default function NotificationManagement() {
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [users, setUsers] = useState<Array<{ _id: string; name: string; email: string }>>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    type: 'info',
    actionUrl: '',
    actionText: '',
    isGlobal: false,
    targetUserId: '',
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      // In a real app, you'd fetch users from your API
      // For demo purposes, we'll use mock data
      const mockUsers = [
        { _id: '1', name: 'John Doe', email: 'john@example.com' },
        { _id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        { _id: '3', name: 'Admin User', email: 'admin@example.com' },
      ]
      setUsers(mockUsers)
    } catch (error) {
      toast({
        description: 'Failed to load users',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          description: result.message,
          variant: 'default',
        })

        // Reset form
        setFormData({
          title: '',
          message: '',
          type: 'info',
          actionUrl: '',
          actionText: '',
          isGlobal: false,
          targetUserId: '',
        })
      } else {
        toast({
          description: result.error || 'Failed to send notification',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        description: 'Failed to send notification',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Send Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSendNotification(); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Notification Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Special Offer Alert"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Notification Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Information
                      </div>
                    </SelectItem>
                    <SelectItem value="success">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Success
                      </div>
                    </SelectItem>
                    <SelectItem value="warning">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Warning
                      </div>
                    </SelectItem>
                    <SelectItem value="error">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Error
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Enter your notification message..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="actionUrl">Action URL (Optional)</Label>
              <Input
                id="actionUrl"
                type="url"
                placeholder="https://example.com/action"
                value={formData.actionUrl}
                onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionText">Action Button Text (Optional)</Label>
              <Input
                id="actionText"
                placeholder="View Details"
                value={formData.actionText}
                onChange={(e) => setFormData({ ...formData, actionText: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="global"
                    name="audience"
                    checked={!formData.isGlobal}
                    onChange={() => setFormData({ ...formData, isGlobal: false, targetUserId: '' })}
                    className="mr-2"
                  />
                  <Label htmlFor="global">Send to All Users</Label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="specific"
                    name="audience"
                    checked={formData.isGlobal}
                    onChange={() => setFormData({ ...formData, isGlobal: true })}
                    className="mr-2"
                  />
                  <Label htmlFor="specific">Send to Specific User</Label>
                </div>
              </div>

              {formData.isGlobal && (
                <div className="mt-2">
                  <Label htmlFor="targetUserId">Select User (Optional)</Label>
                  <Select value={formData.targetUserId} onValueChange={(value) => setFormData({ ...formData, targetUserId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={sending} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Notification'}
              </Button>
            </div>
          </form>

          {/* Notification Preview */}
          {formData.title && formData.message && (
            <div className="mt-6 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Preview</h4>
              <div className={`p-4 rounded-lg border-2 ${getTypeColor(formData.type)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(formData.type)}
                  <span className="font-medium">{formData.title}</span>
                </div>
                <p className="text-gray-700">{formData.message}</p>
                {formData.actionUrl && formData.actionText && (
                  <div className="mt-3 text-center">
                    <Badge variant="outline" className="bg-white">
                      {formData.actionText}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notification Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                title: 'Welcome to Amazona!',
                message: 'Thank you for signing up. Explore our amazing products and enjoy exclusive offers.',
                type: 'success',
                actionText: 'Start Shopping',
              },
              {
                title: 'Order Confirmation',
                message: 'Your order has been successfully placed and will be delivered soon.',
                type: 'info',
                actionText: 'Track Order',
              },
              {
                title: 'Special Offer - 20% Off',
                message: 'Use code SAVE20 at checkout to get 20% off on your next purchase. Limited time offer!',
                type: 'warning',
                actionText: 'Shop Now',
              },
              {
                title: 'Payment Successful',
                message: 'Your payment has been processed successfully. Your order is now being prepared for shipment.',
                type: 'success',
                actionText: 'View Order',
              },
            ].map((template, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(template.type)}
                      <span className="font-medium">{template.title}</span>
                      <Badge variant="outline" className="ml-2">
                        {template.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{template.message}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(new Date()).dateTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
