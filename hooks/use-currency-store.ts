
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR'

interface CurrencyState {
    currency: Currency
    setCurrency: (currency: Currency) => void
    rates: Record<Currency, number>
}

const rates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.3,
}

export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set) => ({
            currency: 'INR', // Defaulting to INR as per user request
            rates,
            setCurrency: (currency) => set({ currency }),
        }),
        {
            name: 'currency-store',
        }
    )
)
