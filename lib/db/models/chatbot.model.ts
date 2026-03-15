import { Document, Model, model, models, Schema } from 'mongoose'

export interface IChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type: 'text' | 'product_recommendation' | 'order_status' | 'cart_assistance'
  metadata?: {
    products?: any[]
    orderInfo?: any
    cartItems?: any
  }
}

export interface IChatSession {
  id: string
  userId: string
  messages: IChatMessage[]
  createdAt: Date
  lastActivity: Date
  context: {
    userPreferences?: any
    browsingHistory?: any[]
    cartItems?: any[]
    currentOrder?: any
  }
}

const ChatMessageSchema = new Schema<IChatMessage>({
  role: { type: String, required: true, enum: ['user', 'assistant'] },
  content: { type: String, required: true },
  timestamp: { type: Date, required: true },
  type: { type: String, required: true, enum: ['text', 'product_recommendation', 'order_status', 'cart_assistance'] },
  metadata: { type: Schema.Types.Mixed },
})

const ChatSessionSchema = new Schema<IChatSession>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, ref: 'User' },
  messages: [ChatMessageSchema],
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  context: {
    userPreferences: { type: Schema.Types.Mixed },
    browsingHistory: { type: Schema.Types.Mixed },
    cartItems: { type: Schema.Types.Mixed },
    currentOrder: { type: Schema.Types.Mixed },
  },
})

// Create indexes for better performance
ChatSessionSchema.index({ userId: 1, createdAt: -1 })
ChatSessionSchema.index({ id: 1 }, { unique: true })

export const ChatMessage = models.ChatMessage || model('ChatMessage', ChatMessageSchema)
export const ChatSession = models.ChatSession || model('ChatSession', ChatSessionSchema)
