import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import prismadb from '@/lib/prismadb'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook Error:', error.message)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  try {
    if (event.type === 'checkout.session.completed') {
      // Kiểm tra xem session.subscription có tồn tại không
      if (!session.subscription) {
        console.error('No subscription in session data', session)
        return new NextResponse('No subscription in session data', { status: 400 })
      }

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      )

      if (!session?.metadata?.userId) {
        throw new Error('User ID is missing from session metadata')
      }

      if (!subscription.items.data[0].price) {
        throw new Error('Price information is missing from subscription item')
      }

      const periodEnd = new Date(subscription.items.data[0].current_period_end * 1000)
      if (isNaN(periodEnd.getTime())) {
        throw new Error('Invalid subscription period end date')
      }

      await prismadb.userSubscription.create({
        data: {
          userId: session.metadata.userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: periodEnd,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    if (event.type === 'invoice.payment_succeeded') {
      // Kiểm tra xem session.subscription có tồn tại không
      if (!session.subscription) {
        console.error('No subscription in session data', session)
        return new NextResponse('No subscription in session data', { status: 400 })
      }

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      )

      if (!subscription.items.data[0].price) {
        throw new Error('Price information is missing from subscription item')
      }

      const periodEnd = new Date(subscription.items.data[0].current_period_end * 1000)
      if (isNaN(periodEnd.getTime())) {
        throw new Error('Invalid subscription period end date')
      }

      await prismadb.userSubscription.update({
        where: {
          stripeSubscriptionId: subscription.id
        },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: periodEnd,
          updatedAt: new Date()
        }
      })
    }

    return new NextResponse(null, { status: 200 })
  } catch (error: any) {
    console.error('Webhook Processing Error:', error.message)
    return new NextResponse(`Webhook Processing Error: ${error.message}`, { status: 400 })
  }
}
