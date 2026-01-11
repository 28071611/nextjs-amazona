import { getDemandPrediction } from '@/lib/actions/order.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getTranslations } from 'next-intl/server'

export default async function PredictionsPage() {
    const t = await getTranslations()
    const predictionData = await getDemandPrediction()

    if (!predictionData) {
        return <div>Failed to load predictions.</div>
    }

    return (
        <div className='flex flex-col gap-6'>
            <h1 className='h1-bold'>AI Demand Prediction</h1>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>Forecasted Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className='space-y-4'>
                            {predictionData.predictions.map((p: any, i: number) => (
                                <li key={i} className='flex justify-between items-center border-b pb-2'>
                                    <span className='font-medium'>{p.month}</span>
                                    <span className='text-primary font-bold'>${p.predictedSales.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>AI Insight</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-muted-foreground leading-relaxed'>
                            {predictionData.explanation}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
