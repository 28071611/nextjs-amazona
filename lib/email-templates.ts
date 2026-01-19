export const emailTemplates = {
  orderPlaced: {
    subject: 'Order Confirmation',
    html: (data: { customerName: string; orderNumber: string; orderTotal: string; items: any[] }) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation - ${data.orderNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0; 
              padding: 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #f9f9f9; 
              padding: 20px; 
              border-radius: 8px; 
            }
            .header { 
              background-color: #4CAF50; 
              color: white; 
              padding: 20px; 
              border-radius: 8px 8px 0; 
              text-align: center; 
            }
            .logo { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            h1 { 
              font-size: 28px; 
              margin: 0; 
            }
            .order-details { 
              background-color: #ffffff; 
              padding: 20px; 
              border-radius: 8px; 
              margin-bottom: 20px; 
            }
            .order-number { 
              font-size: 18px; 
              color: #666; 
              font-weight: bold; 
              margin-bottom: 5px; 
            }
            .customer-info { 
              margin-bottom: 15px; 
            }
            .total { 
              font-size: 20px; 
              font-weight: bold; 
              color: #4CAF50; 
              text-align: right; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                🛒 Amazona
              </div>
              <h1>Order Confirmed!</h1>
            </div>
            <div class="order-details">
              <p>Hello <strong>${data.customerName}</strong>,</p>
              <p>Thank you for your order! We're excited to get it processed and shipped to you.</p>
              <div class="order-number">
                <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              </div>
              <div class="customer-info">
                <p><strong>Shipping Address:</strong></p>
                <p>We'll ship this to the address you provided during checkout.</p>
              </div>
            </div>
            <div class="items">
              <h3>Order Items:</h3>
              ${data.items.map(item => `
                <div style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                  <p><strong>${item.name}</strong> - ${item.quantity}x $${item.price}</p>
                  <p><strong>Size:</strong> ${item.size || 'N/A'}</p>
                  <p><strong>Color:</strong> ${item.color || 'N/A'}</p>
                </div>
              `).join('')}
            </div>
            <div class="total">
              <p><strong>Order Total:</strong> ${data.orderTotal}</p>
            </div>
            </div>
            <div class="footer">
              <p>You can track your order status in your account dashboard.</p>
              <p>Thank you for shopping with us!</p>
              <p>Best regards,<br>The Amazona Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  orderShipped: {
    subject: 'Your Order Has Shipped!',
    html: (data: { customerName: string; orderNumber: string; trackingNumber: string }) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Shipped - ${data.orderNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0; 
              padding: 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #f9f9f9; 
              padding: 20px; 
              border-radius: 8px; 
            }
            .header { 
              background-color: #4CAF50; 
              color: white; 
              padding: 20px; 
              border-radius: 8px 8px 0; 
              text-align: center; 
            }
            .logo { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            h1 { 
              font-size: 28px; 
              margin: 0; 
              color: #4CAF50; 
            }
            .shipping-info { 
              background-color: #e8f5e8; 
              padding: 20px; 
              border-radius: 8px; 
              margin-bottom: 20px; 
              text-align: center; 
            }
            .tracking-number { 
              font-size: 18px; 
              color: #666; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                🚚 Amazona
              </div>
              <h1>Good News, ${data.customerName}!</h1>
              <h2>Your Order is on its Way!</h2>
            </div>
            <div class="shipping-info">
              <p>Your order <strong>${data.orderNumber}</strong> has been shipped and is on its way to you.</p>
              <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
              <p>You can track your package using the tracking number above.</p>
            </div>
            <div class="footer">
              <p>We hope you enjoy your purchase!</p>
              <p>Best regards,<br>The Amazona Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  orderDelivered: {
    subject: 'Your Order Has Been Delivered!',
    html: (data: { customerName: string; orderNumber: string }) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Delivered - ${data.orderNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0; 
              padding: 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #f9f9f9; 
              padding: 20px; 
              border-radius: 8px; 
            }
            .header { 
              background-color: #4CAF50; 
              color: white; 
              padding: 20px; 
              border-radius: 8px 8px 0; 
              text-align: center; 
            }
            .logo { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            h1 { 
              font-size: 28px; 
              margin: 0; 
              color: #4CAF50; 
            }
            .success-message { 
              background-color: #d4edda; 
              color: #155724; 
              padding: 20px; 
              border-radius: 8px; 
              text-align: center; 
              margin-bottom: 20px; 
            }
            .checkmark { 
              font-size: 48px; 
              color: #4CAF50; 
              margin-bottom: 20px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                🎉 Amazona
              </div>
              <h1>Delivered! ${data.customerName}</h1>
              <h2>Your Order Has Arrived!</h2>
            </div>
            <div class="success-message">
              <div class="checkmark">✓</div>
              <p>Order <strong>${data.orderNumber}</strong> has been successfully delivered to your address.</p>
            </div>
            <div class="footer">
              <p>Thank you for shopping with us!</p>
              <p>We hope you enjoy your purchase!</p>
              <p>Feel free to leave a review for the products you bought.</p>
              <p>Best regards,<br>The Amazona Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  passwordReset: {
    subject: 'Password Reset Request',
    html: (data: { resetToken: string; userName: string }) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Amazona</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0; 
              padding: 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #f9f9f9; 
              padding: 40px; 
              border-radius: 8px; 
            }
            .header { 
              background-color: #4CAF50; 
              color: white; 
              padding: 20px; 
              border-radius: 8px 8px 0; 
              text-align: center; 
            }
            .logo { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            h1 { 
              font-size: 28px; 
              margin: 0; 
              color: #4CAF50; 
            }
            .reset-info { 
              background-color: #e8f5e8; 
              padding: 20px; 
              border-radius: 8px; 
              margin-bottom: 20px; 
            }
            .token { 
              font-family: monospace; 
              font-size: 14px; 
              background-color: #f0f0f0; 
              padding: 10px; 
              border-radius: 4px; 
              word-break: break-all; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                🔐 Amazona
              </div>
              <h1>Password Reset Request</h1>
            </div>
            <div class="reset-info">
              <p>Hello <strong>${data.userName}</strong>,</p>
              <p>You requested to reset your password. Click the button below to set a new password:</p>
              <p><strong>Reset Token:</strong></p>
              <div class="token">${data.resetToken}</div>
              <p>This token will expire in 10 minutes for security reasons.</p>
            </div>
            <div class="footer">
              <p>If you didn't request this password reset, please ignore this email.</p>
              <p>Best regards,<br>The Amazona Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  welcomeEmail: {
    subject: 'Welcome to Amazona!',
    html: (data: { customerName: string }) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Amazona!</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0; 
              padding: 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: #f9f9f9; 
              padding: 40px; 
              border-radius: 8px; 
            }
            .header { 
              background-color: #4CAF50; 
              color: white; 
              padding: 20px; 
              border-radius: 8px 8px 0; 
              text-align: center; 
            }
            .logo { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px; 
            }
            h1 { 
              font-size: 28px; 
              margin: 0; 
              color: #4CAF50; 
            }
            .welcome-message { 
              background-color: #e8f5e8; 
              padding: 20px; 
              border-radius: 8px; 
              margin-bottom: 20px; 
              text-align: center; 
            }
            .checkmark { 
              font-size: 48px; 
              color: #4CAF50; 
              margin-bottom: 20px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                🛒 Amazona
              </div>
              <h1>Welcome to Amazona!</h1>
            </div>
            <div class="welcome-message">
              <div class="checkmark">✓</div>
              <h2>Welcome, <strong>${data.customerName}</strong>!</h2>
              <p>Thank you for creating an account with us. We're excited to have you as part of our community!</p>
              <p>Start shopping for amazing products and enjoy exclusive deals just for you.</p>
              <p>Happy shopping!</p>
              <p>Best regards,<br>The Amazona Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },
}
