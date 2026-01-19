import { Resend } from 'resend'

let resend: Resend | null = null

try {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  } else {
    console.log('⚠️ RESEND_API_KEY not found, email service disabled')
  }
} catch (error: any) {
  console.log('⚠️ Failed to initialize Resend:', error.message)
}

export { resend }
