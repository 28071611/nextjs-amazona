/* eslint-disable @typescript-eslint/no-explicit-any */
import data from '@/lib/data'
import { connectToDatabase } from '.'
import User from './models/user.model'
import Product from './models/product.model'
import Review from './models/review.model'
import { cwd } from 'process'
import { loadEnvConfig } from '@next/env'
import Order from './models/order.model'
import {
  calculateFutureDate,
  calculatePastDate,
  generateId,
  round2,
  toSlug,
} from '../utils'
import WebPage from './models/web-page.model'
import Setting from './models/setting.model'
import { OrderItem, IOrderInput, ShippingAddress } from '@/types'
import fs from 'fs'
import path from 'path'

loadEnvConfig(cwd())

const main = async () => {
  try {
    const { users, products: initialProducts, reviews, webPages, settings } = data
    await connectToDatabase(process.env.MONGODB_URI)

    await User.deleteMany()
    const createdUser = await User.insertMany(users)

    await Setting.deleteMany()
    const createdSetting = await Setting.insertMany(settings)

    await WebPage.deleteMany()
    await WebPage.insertMany(webPages)

    await Product.deleteMany()

    // Generate products from images
    const imagesDir = path.join(process.cwd(), 'public/images')
    const imageFiles = fs.readdirSync(imagesDir).filter(file => /\.(webp|jpg|jpeg|png)$/i.test(file))

    const generatedProducts = imageFiles.map((file, index) => {
      let name = file.replace(/\.(webp|jpg|jpeg|png)$/i, '').replace(/[-_]/g, ' ')
      if (/^\d+$/.test(name)) name = `New Arrival ${name}`
      else name = name.charAt(0).toUpperCase() + name.slice(1)

      let price = 1000
      let category = 'Accessories'
      const lowerFile = file.toLowerCase()

      // Category and Price Logic
      if (lowerFile.includes('tv') || lowerFile.includes('laptop') || lowerFile.includes('pc') || lowerFile.includes('iphone') || lowerFile.includes('samsung') || lowerFile.includes('vivo') || lowerFile.includes('oppo') || lowerFile.includes('redmi') || lowerFile.includes('mobile') || lowerFile.includes('phone')) {
        category = 'Electronics'
        if (lowerFile.includes('laptop')) price = 100000
        else if (lowerFile.includes('tv')) price = 20000
        else if (lowerFile.includes('mobile') || lowerFile.includes('phone') || lowerFile.includes('iphone') || lowerFile.includes('samsung') || lowerFile.includes('vivo') || lowerFile.includes('oppo') || lowerFile.includes('redmi')) price = 30000
        else price = 50000
      } else if (lowerFile.includes('men') || lowerFile.includes('shirt') || lowerFile.includes('pant') || lowerFile.includes('dress') || lowerFile.includes('kurtha') || lowerFile.includes('fashion') || lowerFile.includes('women')) {
        if (lowerFile.includes('women') || lowerFile.includes('dress') || lowerFile.includes('fashion') || lowerFile.includes('kurtha')) category = 'Women'
        else category = 'Men'

        if (lowerFile.includes('dress')) price = 5000
        else price = 2000
      } else if (lowerFile.includes('kids') || lowerFile.includes('boy') || lowerFile.includes('girl') || lowerFile.includes('cycle')) {
        category = 'Kids'
        price = 1500
      } else if (lowerFile.includes('neckband') || lowerFile.includes('watch') || lowerFile.includes('glass') || lowerFile.includes('airpod')) {
        category = 'Accessories'
        if (lowerFile.includes('watch')) price = 7000
        else if (lowerFile.includes('airpod')) price = 5000
        else if (lowerFile.includes('neckband')) price = 2500
        else price = 1000
      }

      const brands = ['Amaozona', 'Generic', 'Fashion', 'StyleCo']
      const allTags = ['new-arrival', 'featured', 'todays-deal', 'best-seller']
      const tags = [allTags[index % allTags.length]]
      if (index % 3 === 0) tags.push('featured')

      return {
        name: name,
        slug: toSlug(name) + '-' + (index + 1),
        category: category,
        images: [`/images/${file}`],
        brand: brands[Math.floor(Math.random() * brands.length)],
        description: `This is a high-quality product available in our store. Perfect for daily use.`,
        isPublished: true,
        price: price,
        listPrice: price + (price * 0.2),
        countInStock: 50,
        tags: tags,
        sizes: (category === 'Electronics') ? [] : ['S', 'M', 'L', 'XL'],
        colors: ['Red', 'Blue', 'Black', 'White', 'Green'],
        avgRating: 4.5,
        numReviews: 10,
        ratingDistribution: [{ rating: 5, count: 5 }, { rating: 4, count: 3 }, { rating: 3, count: 2 }, { rating: 2, count: 0 }, { rating: 1, count: 0 }],
        numSales: 0,
        reviews: []
      }
    })

    const allProducts = [...initialProducts.map((x) => ({ ...x, _id: undefined })), ...generatedProducts]
    const createdProducts = await Product.insertMany(allProducts)

    await Review.deleteMany()
    const rws = []
    for (let i = 0; i < createdProducts.length; i++) {
      let x = 0
      const { ratingDistribution } = createdProducts[i]
      for (let j = 0; j < ratingDistribution.length; j++) {
        for (let k = 0; k < ratingDistribution[j].count; k++) {
          x++
          if (reviews.length > 0) {
            rws.push({
              ...reviews.filter((x) => x.rating === j + 1)[
              x % reviews.filter((x) => x.rating === j + 1).length
              ],
              isVerifiedPurchase: true,
              product: createdProducts[i]._id,
              user: createdUser[x % createdUser.length]._id,
              updatedAt: Date.now(),
              createdAt: Date.now(),
            })
          }
        }
      }
    }
    await Review.insertMany(rws)

    await Order.deleteMany()
    const orders = []
    for (let i = 0; i < 200; i++) {
      orders.push(
        await generateOrder(
          i,
          createdUser.map((x: any) => x._id),
          createdProducts.map((x: any) => x._id)
        )
      )
    }
    await Order.insertMany(orders)
    console.log('Seeded database successfully')
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

const generateOrder = async (
  i: number,
  users: any,
  products: any
): Promise<IOrderInput> => {
  const product1 = await Product.findById(products[i % products.length])
  const product2 = await Product.findById(products[(i + 1) % products.length])
  const product3 = await Product.findById(products[(i + 2) % products.length])

  if (!product1 || !product2 || !product3) throw new Error('Product not found')

  const items = [
    {
      clientId: generateId(),
      product: product1._id,
      name: product1.name,
      slug: product1.slug,
      quantity: 1,
      image: product1.images[0],
      category: product1.category,
      price: product1.price,
      countInStock: product1.countInStock,
    },
    {
      clientId: generateId(),
      product: product2._id,
      name: product2.name,
      slug: product2.slug,
      quantity: 2,
      image: product2.images[0],
      category: product2.category,
      price: product2.price,
      countInStock: product2.countInStock,
    },
    {
      clientId: generateId(),
      product: product3._id,
      name: product3.name,
      slug: product3.slug,
      quantity: 3,
      image: product3.images[0],
      category: product3.category,
      price: product3.price,
      countInStock: product3.countInStock,
    },
  ]

  const order = {
    user: users[i % users.length],
    items: items.map((item) => ({ ...item, product: item.product })),
    shippingAddress: data.users[i % users.length].address as any,
    paymentMethod: data.users[i % users.length].paymentMethod,
    isPaid: true,
    isDelivered: true,
    paidAt: calculatePastDate(i),
    deliveredAt: calculatePastDate(i),
    createdAt: calculatePastDate(i),
    expectedDeliveryDate: calculateFutureDate(i % 2),
    ...calcDeliveryDateAndPriceForSeed({
      items: items,
      deliveryDateIndex: i % 2,
    }),
  }
  return order as any
}

export const calcDeliveryDateAndPriceForSeed = ({
  items,
  deliveryDateIndex,
}: {
  deliveryDateIndex?: number
  items: OrderItem[]
  shippingAddress?: ShippingAddress
}) => {
  const { availableDeliveryDates } = data.settings[0]
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  )

  const deliveryDate =
    availableDeliveryDates[
    deliveryDateIndex === undefined
      ? availableDeliveryDates.length - 1
      : deliveryDateIndex
    ]

  const shippingPrice = deliveryDate.shippingPrice
  const taxPrice = round2(itemsPrice * 0.15)
  const totalPrice = round2(
    itemsPrice +
    (shippingPrice ? round2(shippingPrice) : 0) +
    (taxPrice ? round2(taxPrice) : 0)
  )
  return {
    availableDeliveryDates,
    deliveryDateIndex:
      deliveryDateIndex === undefined
        ? availableDeliveryDates.length - 1
        : deliveryDateIndex,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  }
}

main()
