'use client'
import { CheckCircle, Circle, Package, Truck, Home, XCircle } from 'lucide-react'
import { OrderStatus } from '@/lib/db/models/order.model'
import { formatDateTime } from '@/lib/utils'

const STAGES: { key: OrderStatus; label: string; icon: React.ElementType }[] = [
    { key: 'Placed', label: 'Order Placed', icon: CheckCircle },
    { key: 'Packed', label: 'Packed', icon: Package },
    { key: 'Shipped', label: 'Shipped', icon: Truck },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: Home },
]

interface StatusHistoryEntry {
    status: OrderStatus
    updatedAt: string | Date
    note?: string
}

interface OrderTrackingProps {
    orderStatus: OrderStatus
    statusHistory?: StatusHistoryEntry[]
    isCancelled?: boolean
    cancelledAt?: string | Date
    cancelReason?: string
}

export default function OrderTracking({
    orderStatus,
    statusHistory = [],
    isCancelled,
    cancelledAt,
    cancelReason,
}: OrderTrackingProps) {
    if (isCancelled) {
        return (
            <div className='rounded-xl border border-destructive/30 bg-destructive/5 p-6'>
                <div className='flex items-center gap-3'>
                    <XCircle className='h-7 w-7 text-destructive' />
                    <div>
                        <p className='font-semibold text-destructive'>Order Cancelled</p>
                        {cancelledAt && (
                            <p className='text-sm text-muted-foreground'>
                                {formatDateTime(new Date(cancelledAt)).dateTime}
                            </p>
                        )}
                        {cancelReason && (
                            <p className='text-sm text-muted-foreground'>Reason: {cancelReason}</p>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    const currentIndex = STAGES.findIndex((s) => s.key === orderStatus)

    const getHistoryEntry = (status: OrderStatus) =>
        statusHistory.find((h) => h.status === status)

    return (
        <div className='w-full'>
            {/* Desktop: horizontal stepper */}
            <div className='hidden md:flex items-center justify-between relative'>
                {/* Progress bar background */}
                <div className='absolute top-5 left-0 right-0 h-1 bg-muted mx-10 z-0' />
                {/* Progress bar filled */}
                <div
                    className='absolute top-5 left-0 h-1 bg-primary z-0 transition-all duration-700'
                    style={{
                        width: `${Math.min(100, (currentIndex / (STAGES.length - 1)) * 100)}%`,
                        marginLeft: '2.5rem',
                        maxWidth: 'calc(100% - 5rem)',
                    }}
                />
                {STAGES.map((stage, idx) => {
                    const isDone = idx <= currentIndex
                    const isActive = idx === currentIndex
                    const Icon = stage.icon
                    const entry = getHistoryEntry(stage.key)
                    return (
                        <div key={stage.key} className='flex flex-col items-center z-10 gap-2 min-w-[80px]'>
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${isDone
                                        ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                                        : 'border-muted bg-background text-muted-foreground'
                                    } ${isActive ? 'ring-4 ring-primary/20 scale-110' : ''}`}
                            >
                                {isDone ? (
                                    <Icon className='h-5 w-5' />
                                ) : (
                                    <Circle className='h-5 w-5' />
                                )}
                            </div>
                            <span
                                className={`text-xs font-medium text-center leading-tight ${isActive ? 'text-primary font-semibold' : isDone ? 'text-foreground' : 'text-muted-foreground'
                                    }`}
                            >
                                {stage.label}
                            </span>
                            {entry && (
                                <span className='text-[10px] text-muted-foreground text-center'>
                                    {formatDateTime(new Date(entry.updatedAt)).dateOnly}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Mobile: vertical timeline */}
            <div className='flex flex-col gap-0 md:hidden'>
                {STAGES.map((stage, idx) => {
                    const isDone = idx <= currentIndex
                    const isActive = idx === currentIndex
                    const isLast = idx === STAGES.length - 1
                    const Icon = stage.icon
                    const entry = getHistoryEntry(stage.key)
                    return (
                        <div key={stage.key} className='flex gap-4'>
                            <div className='flex flex-col items-center'>
                                <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all ${isDone
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-muted bg-background text-muted-foreground'
                                        } ${isActive ? 'ring-4 ring-primary/20 scale-110' : ''}`}
                                >
                                    {isDone ? <Icon className='h-4 w-4' /> : <Circle className='h-4 w-4' />}
                                </div>
                                {!isLast && (
                                    <div className={`w-0.5 flex-1 my-1 ${isDone ? 'bg-primary' : 'bg-muted'}`} style={{ minHeight: 24 }} />
                                )}
                            </div>
                            <div className='pb-5'>
                                <p className={`text-sm font-medium ${isActive ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {stage.label}
                                </p>
                                {entry && (
                                    <p className='text-xs text-muted-foreground'>
                                        {formatDateTime(new Date(entry.updatedAt)).dateTime}
                                    </p>
                                )}
                                {entry?.note && (
                                    <p className='text-xs text-muted-foreground italic'>{entry.note}</p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
