
'use client'

import * as React from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { useCurrencyStore, Currency } from '@/hooks/use-currency-store'

export default function CurrencySwitcher() {
    const { currency, setCurrency } = useCurrencyStore()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost'>
                    {currency} <ChevronDown className='ml-1 h-4 w-4' />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-content bg-black text-white' align='end'>
                <DropdownMenuRadioGroup
                    value={currency}
                    onValueChange={(value) => setCurrency(value as Currency)}
                >
                    <DropdownMenuRadioItem className='cursor-pointer' value='USD'>USD ($)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className='cursor-pointer' value='EUR'>EUR (€)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className='cursor-pointer' value='GBP'>GBP (£)</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem className='cursor-pointer' value='INR'>INR (₹)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
