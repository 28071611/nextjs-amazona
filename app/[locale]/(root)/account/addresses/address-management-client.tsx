'use client'

import { useState, useEffect } from 'react'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, MapPin, Check } from 'lucide-react'
import { getUserAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/lib/actions/address.actions'
import { z } from 'zod'

const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(1, 'Phone number is required'),
  isDefault: z.boolean().default(false),
})

type Address = {
  _id: string
  fullName: string
  street: string
  city: string
  province: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}

export default function AddressManagementClient() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/addresses')
      const data = await response.json()
      
      if (response.ok) {
        setAddresses(data.addresses || [])
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to load addresses',
        })
      }
    } catch (error) {
      console.error('Fetch addresses error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to load addresses',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = async (addressData: typeof addressSchema._type) => {
    setIsAddingAddress(true)
    
    try {
      const response = await fetch('/api/addresses/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          description: data.message,
        })
        fetchAddresses() // Refresh the addresses list
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to add address',
        })
      }
    } catch (error) {
      console.error('Add address error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to add address',
      })
    } finally {
      setIsAddingAddress(false)
    }
  }

  const handleUpdateAddress = async (addressId: string, addressData: typeof addressSchema._type) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          description: data.message,
        })
        fetchAddresses() // Refresh the addresses list
        setEditingAddress(null)
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to update address',
        })
      }
    } catch (error) {
      console.error('Update address error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to update address',
      })
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          description: data.message,
        })
        fetchAddresses() // Refresh the addresses list
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to delete address',
        })
      }
    } catch (error) {
      console.error('Delete address error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to delete address',
      })
    }
  }

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'POST',
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          description: data.message,
        })
        fetchAddresses() // Refresh the addresses list
      } else {
        toast({
          variant: 'destructive',
          description: data.error || 'Failed to set default address',
        })
      }
    } catch (error) {
      console.error('Set default address error:', error)
      toast({
        variant: 'destructive',
        description: 'Failed to set default address',
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Addresses</h1>
        <Button
          onClick={() => setEditingAddress('new')}
          disabled={isAddingAddress}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Address
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
          <p>Loading addresses...</p>
        </div>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Addresses Yet</h3>
            <p className="text-gray-600 mb-4">
              Add your first address to get started with faster checkout.
            </p>
            <Button onClick={() => setEditingAddress('new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {addresses.map((address) => (
            <Card key={address._id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {address.isDefault && (
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Default</span>
                        </div>
                      )}
                      {address.fullName}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {address.street}, {address.city}, {address.province}, {address.postalCode}, {address.country}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingAddress(address._id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteAddress(address._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {!address.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefaultAddress(address._id)}
                        title="Set as default address"
                        className="text-green-600 hover:text-green-700"
                        disabled={isAddingAddress}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-gray-600">
                  Phone: {address.phone}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Address Modal */}
      {editingAddress && (
        <AddressForm
          addressId={editingAddress}
          address={addresses.find(addr => addr._id === editingAddress)}
          onSave={handleAddAddress}
          onCancel={() => setEditingAddress(null)}
        />
      )}
    </div>
  )
}

// Address Form Component
interface AddressFormProps {
  addressId?: string
  address?: Address
  onSave: (addressData: typeof addressSchema._type) => void
  onCancel: () => void
}

function AddressForm({ addressId, address, onSave, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState({
    fullName: address?.fullName || '',
    street: address?.street || '',
    city: address?.city || '',
    province: address?.province || '',
    postalCode: address?.postalCode || '',
    country: address?.country || '',
    phone: address?.phone || '',
    isDefault: address?.isDefault || false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSave(formData)
      onCancel()
    } catch (error) {
      console.error('Address form error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {addressId ? 'Edit Address' : 'Add New Address'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            ×
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street *
              </label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province *
              </label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code *
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Set as default address
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : (addressId ? 'Update Address' : 'Add Address')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
