import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import prismadb from '@/lib/prismadb'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  console.log('✅ Webhook route HIT at', new Date().toISOString())

  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('❌ Webhook signature verification failed:', error)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (!session?.metadata?.userId) {
      console.error('❌ Missing userId in session metadata')
      return new NextResponse('User id is required', { status: 400 })
    }

    if (!session.subscription) {
      console.error('❌ Missing subscription in session')
      return new NextResponse('Subscription ID is missing', { status: 400 })
    }

    let subscription: Stripe.Subscription
    try {
      subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    } catch (error: any) {
      console.error('❌ Failed to retrieve subscription:', error)
      return new NextResponse('Failed to retrieve subscription', { status: 500 })
    }

    const periodEnd = (subscription as any).current_period_end
    if (!periodEnd) {
      console.error('❌ current_period_end missing in subscription')
      return new NextResponse('Subscription period end missing', { status: 500 })
    }

    try {
      await prismadb.userSubscription.create({
        data: {
          userId: session.metadata.userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(periodEnd * 1000)
        }
      })
    } catch (error) {
      console.error('❌ Failed to create userSubscription in DB:', error)
      return new NextResponse('DB create error', { status: 500 })
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice

    const subId = (invoice as any).subscription
    if (!subId || typeof subId !== 'string') {
      console.error('❌ Invalid subscription ID on invoice')
      return new NextResponse('Subscription ID missing on invoice', { status: 400 })
    }

    let subscription: Stripe.Subscription
    try {
      subscription = await stripe.subscriptions.retrieve(subId)
    } catch (error) {
      console.error('❌ Failed to retrieve subscription for invoice:', error)
      return new NextResponse('Failed to retrieve subscription', { status: 500 })
    }

    const periodEnd = (subscription as any).current_period_end
    if (!periodEnd) {
      console.error('❌ current_period_end missing in invoice.subscription')
      return new NextResponse('Period end missing', { status: 500 })
    }

    try {
      await prismadb.userSubscription.update({
        where: {
          stripeSubscriptionId: subscription.id
        },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(periodEnd * 1000)
        }
      })
    } catch (error) {
      console.error('❌ Failed to update userSubscription:', error)
      return new NextResponse('DB update error', { status: 500 })
    }
  }

  return new NextResponse(null, { status: 200 })
}
