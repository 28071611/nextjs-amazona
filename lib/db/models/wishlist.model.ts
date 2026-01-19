import { Document, Model, model, models, Schema } from 'mongoose'

export interface IWishlistItem {
  product: {
    _id: string
    name: string
    slug: string
    image: string
    price: number
    category: string
    brand: string
  }
  addedAt: Date
}

export interface IWishlist extends Document {
  _id: string
  user: string
  items: IWishlistItem[]
  createdAt: Date
  updatedAt: Date
}

const wishlistItemSchema = new Schema<IWishlistItem>({
  product: {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
  },
  addedAt: { type: Date, default: Date.now },
})

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: String,
      required: true,
      unique: true,
    },
    items: [wishlistItemSchema],
  },
  {
    timestamps: true,
  }
)

const Wishlist =
  (models.Wishlist as Model<IWishlist>) ||
  model<IWishlist>('Wishlist', wishlistSchema)

export default Wishlist
