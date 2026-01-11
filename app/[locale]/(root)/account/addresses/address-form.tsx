'use client'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { updateUserAddress } from '@/lib/actions/user.actions'
import { ShippingAddressSchema } from '@/lib/validator'
import { ShippingAddress } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

export default function AddressForm({
    user,
}: {
    user: {
        address?: ShippingAddress
    }
}) {
    const { toast } = useToast()
    const router = useRouter()
    const { update } = useSession()

    const form = useForm<ShippingAddress>({
        resolver: zodResolver(ShippingAddressSchema),
        defaultValues: user.address || {
            fullName: '',
            street: '',
            city: '',
            province: '',
            phone: '',
            postalCode: '',
            country: '',
        },
    })

    useEffect(() => {
        if (user.address) {
            form.setValue('fullName', user.address.fullName)
            form.setValue('street', user.address.street)
            form.setValue('city', user.address.city)
            form.setValue('country', user.address.country)
            form.setValue('postalCode', user.address.postalCode)
            form.setValue('province', user.address.province)
            form.setValue('phone', user.address.phone)
        }
    }, [user, form])

    const onSubmit: SubmitHandler<ShippingAddress> = async (values) => {
        const res = await updateUserAddress(values)
        if (!res.success) {
            toast({
                variant: 'destructive',
                description: res.message,
            })
            return
        }
        toast({
            description: res.message,
        })
        // Update session
        await update()
    }

    return (
        <div className='max-w-md mx-auto space-y-4'>
            <div className='text-lg font-bold'>Your Shipping Address</div>
            <Form {...form}>
                <form method='post' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                    <FormField
                        control={form.control}
                        name='fullName'
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter full name' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='street'
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter address' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className='flex flex-col gap-5 md:flex-row'>
                        <FormField
                            control={form.control}
                            name='city'
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter city' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='province'
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel>Province</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter province' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className='flex flex-col gap-5 md:flex-row'>
                        <FormField
                            control={form.control}
                            name='postalCode'
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel>Postal Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter postal code' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='country'
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter country' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name='phone'
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormLabel>Phone number</FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter phone number' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type='submit' className='rounded-full font-bold w-full'>
                        Update Address
                    </Button>
                </form>
            </Form>
        </div>
    )
}
