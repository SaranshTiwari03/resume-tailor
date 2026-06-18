'use client'

import { useState } from 'react'
import { X, Zap, CheckCircle2 } from 'lucide-react'

interface Plan {
  id: string
  name: string
  credits: number
  price: number
  perTailor: string
  badge?: string
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 50,
    price: 5,
    perTailor: '25 basic tailors',
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 200,
    price: 15,
    perTailor: '100 basic tailors',
    badge: 'Best value',
  },
]

interface Props {
  creditsRemaining: number
  cost: number
  onClose: () => void
}

export default function InsufficientCreditsModal({ creditsRemaining, cost, onClose }: Props) {
  const [clicked, setClicked] = useState<string | null>(null)

  const handleBuy = (planId: string) => {
    setClicked(planId)
    // TODO: replace with Razorpay / Stripe checkout for the selected plan
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 relative">
        <button onClick={onClose} aria-label="Close" className="absolute top-3.5 right-3.5 text-gray-300 hover:text-gray-500">
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">Not enough credits</h2>
            <p className="text-xs text-gray-400">
              This tailor costs <span className="font-semibold text-gray-600">{cost} credits</span>
              {' '}· you have <span className={`font-semibold ${creditsRemaining <= 2 ? 'text-red-500' : 'text-gray-600'}`}>{creditsRemaining} left</span>
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative border rounded-xl p-3.5 transition-colors ${
                plan.badge ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2 right-3 text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-gray-900">{plan.name}</p>
                  <p className="text-xs text-gray-500">{plan.credits} credits · {plan.perTailor}</p>
                </div>
                <p className="text-xl font-bold text-gray-900">${plan.price}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-3">
                <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                Credits never expire
                <CheckCircle2 size={11} className="text-green-500 shrink-0 ml-1" />
                Works with prompt feature
              </div>
              {clicked === plan.id ? (
                <div className="w-full text-center text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg py-2 font-medium">
                  Payment gateway coming soon — we&apos;ll notify you!
                </div>
              ) : (
                <button
                  onClick={() => handleBuy(plan.id)}
                  className={`w-full text-sm font-semibold py-2 rounded-lg transition-colors ${
                    plan.badge
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-700 text-white'
                  }`}
                >
                  Buy {plan.credits} credits · ${plan.price}
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-[10px] text-gray-400 text-center">
          Secure payment via Razorpay · Credits added instantly after payment
        </p>
      </div>
    </div>
  )
}
