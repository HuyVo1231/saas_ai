import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'

import { stripe } from '@/lib/stripe'
import prismadb from '@/lib/prismadb'

export async function POST(req: Request) {
  console.log('✅ Webhook HIT at', new Date().toISOString())

  const body = await req.text()
  const signature = (await headers()).get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('❌ Invalid Stripe signature:', error.message)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  try {
    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session?.metadata?.userId
      const subscriptionId = session?.subscription

      console.log('🔔 checkout.session.completed received', {
        userId,
        subscriptionId
      })

      if (!userId || typeof userId !== 'string') {
        throw new Error('Missing or invalid userId in session metadata')
      }

      if (!subscriptionId || typeof subscriptionId !== 'string') {
        throw new Error('Missing or invalid subscriptionId in session')
      }

      // Retrieve the subscription
      const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(
        subscriptionId
      )

      // Explicitly cast and check current_period_end
      const currentPeriodEnd = (subscription as any).current_period_end as
        | number
        | undefined
      if (!currentPeriodEnd) {
        throw new Error('Missing current_period_end in subscription')
      }

      await prismadb.userSubscription.upsert({
        where: { userId },
        update: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId:
            typeof subscription.customer === 'string'
              ? subscription.customer
              : subscription.customer?.id || '',
          stripePriceId: subscription.items.data[0]?.price?.id || '',
          stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000)
        },
        create: {
          userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId:
            typeof subscription.customer === 'string'
              ? subscription.customer
              : subscription.customer?.id || '',
          stripePriceId: subscription.items.data[0]?.price?.id || '',
          stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000)
        }
      })

      console.log('✅ User subscription upserted successfully.')
    }

    // Handle invoice.payment_succeeded
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice
      // Safely access subscription property
      const subscriptionId = (invoice as any).subscription as string | null | undefined

      console.log('🔔 invoice.payment_succeeded received', { subscriptionId })

      if (!subscriptionId || typeof subscriptionId !== 'string') {
        throw new Error('Invalid or missing subscription ID on invoice')
      }

      // Retrieve the subscription
      const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(
        subscriptionId
      )

      // Explicitly cast and check current_period_end
      const currentPeriodEnd = (subscription as any).current_period_end as
        | number
        | undefined
      if (!currentPeriodEnd) {
        throw new Error('Missing current_period_end in subscription')
      }

      await prismadb.userSubscription.update({
        where: {
          stripeSubscriptionId: subscription.id
        },
        data: {
          stripePriceId: subscription.items.data[0]?.price?.id || '',
          stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000)
        }
      })

      console.log('✅ Subscription period updated successfully.')
    }

    return new NextResponse(null, { status: 200 })
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error.message || error)
    return new NextResponse('Webhook processing error', { status: 500 })
  }
}
