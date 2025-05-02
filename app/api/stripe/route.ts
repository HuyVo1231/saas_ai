import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

import { absoluteUrl } from '@/lib/utils'
import { stripe } from '@/lib/stripe'
import prismadb from '@/lib/prismadb'

export async function GET() {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId: userId as string
      }
    })

    const dashboardUrl = absoluteUrl('/dashboard')

    if (userSubscription?.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: dashboardUrl
      })
      return NextResponse.json({ url: stripeSession.url }, { status: 200 })
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: dashboardUrl,
      cancel_url: dashboardUrl,
      payment_method_types: ['card'],
      customer_email: user.emailAddresses[0].emailAddress,
      mode: 'subscription',
      billing_address_collection: 'auto',
      line_items: [
        {
          price_data: {
            currency: 'USD',
            product_data: {
              name: 'Brainfast Pro',
              description: 'Unlimited generations'
            },
            unit_amount: 10_000,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      metadata: {
        userId
      }
    })

    return NextResponse.json({ url: stripeSession.url }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
