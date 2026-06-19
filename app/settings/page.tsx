'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Lock, Zap, ShieldCheck, ArrowLeft, Sparkles,
  CheckCircle2, AlertCircle, Eye, EyeOff, Edit2,
} from 'lucide-react'

interface Profile {
  name: string | null
  email: string
  role: string
  credits: number
  tailorCount: number
  createdAt: string
}

export default function SettingsPage() {
  const { status } = useSession()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Name
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState('')
  const [nameStatus, setNameStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [nameSaving, setNameSaving] = useState(false)

  // Password
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [pwStatus, setPwStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status !== 'authenticated') return
    fetch('/api/user/profile')
      .then(r => r.json())
      .then((d: Profile) => { setProfile(d); setNameVal(d.name ?? ''); setLoading(false) })
      .catch(() => setLoading(false))
  }, [status, router])

  const saveName = async () => {
    if (!nameVal.trim()) return
    setNameSaving(true); setNameStatus(null)
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameVal }),
    })
    const data = await res.json()
    setNameSaving(false)
    if (res.ok) {
      setProfile(p => p ? { ...p, name: data.name } : p)
      setNameStatus({ ok: true, msg: 'Name updated' })
      setEditingName(false)
    } else {
      setNameStatus({ ok: false, msg: data.error ?? 'Failed to save' })
    }
  }

  const savePassword = async () => {
    if (newPw !== confirmPw) { setPwStatus({ ok: false, msg: 'Passwords do not match' }); return }
    if (newPw.length < 8) { setPwStatus({ ok: false, msg: 'Minimum 8 characters' }); return }
    setPwSaving(true); setPwStatus(null)
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    const data = await res.json()
    setPwSaving(false)
    if (res.ok) {
      setPwStatus({ ok: true, msg: 'Password updated successfully' })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } else {
      setPwStatus({ ok: false, msg: data.error ?? 'Failed to update' })
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }
  if (!profile) return null

  const isAdmin = profile.role === 'admin'
  const low = profile.credits !== -1 && profile.credits <= 2

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={15} />
        </Link>
        <div className="w-px h-5 bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
            <Sparkles size={11} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">Resume Tailor</span>
        </div>
        <div className="flex-1" />
        <h1 className="text-sm font-semibold text-gray-600">Account Settings</h1>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10 space-y-5">

        {/* ── Profile ──────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <User size={14} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-800">Profile</h2>
          </div>
          <div className="px-6 py-5 space-y-5">

            {/* Name */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Display name
              </label>
              {editingName ? (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameVal}
                    onChange={e => setNameVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                  <button
                    onClick={saveName}
                    disabled={nameSaving || !nameVal.trim()}
                    className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded-xl transition-colors"
                  >
                    {nameSaving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameVal(profile.name ?? '') }}
                    className="text-xs text-gray-400 hover:text-gray-600 px-2 py-2"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-sm text-gray-900">
                    {profile.name || <span className="text-gray-400 italic">Not set</span>}
                  </span>
                  <button
                    onClick={() => { setEditingName(true); setNameStatus(null) }}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Edit2 size={10} /> Edit
                  </button>
                </div>
              )}
              {nameStatus && (
                <p className={`mt-1.5 text-xs flex items-center gap-1 ${nameStatus.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                  {nameStatus.ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                  {nameStatus.msg}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Email</label>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-sm text-gray-900">{profile.email}</span>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Read-only</span>
              </div>
            </div>

            {/* Role + Member since */}
            <div className="flex items-start justify-between">
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Member since</label>
                <p className="mt-1.5 text-sm text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
              {isAdmin && (
                <span className="text-[11px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 mt-4">
                  <ShieldCheck size={11} /> Admin
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ── Credits & Usage ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Zap size={14} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-800">Credits &amp; Usage</h2>
          </div>
          <div className="px-6 py-5">
            {profile.credits === -1 ? (
              <div className="flex items-center gap-2 mb-4">
                <Zap size={15} className="text-violet-500" />
                <span className="text-sm font-semibold text-violet-600">Unlimited credits</span>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Admin</span>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Zap size={13} className={low ? 'text-red-500' : 'text-amber-500'} />
                    <span className="text-sm text-gray-700">Credits remaining</span>
                  </div>
                  <span className={`text-sm font-bold ${low ? 'text-red-500' : 'text-gray-900'}`}>
                    {profile.credits}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${low ? 'bg-red-400' : 'bg-amber-400'}`}
                    style={{ width: `${Math.min(100, (profile.credits / 50) * 100)}%` }}
                  />
                </div>
                {low && (
                  <p className="text-xs text-red-500 mt-1.5">Running low — buy more credits to keep tailoring.</p>
                )}
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">Total resumes tailored</span>
              <span className="text-sm font-semibold text-gray-900">{profile.tailorCount}</span>
            </div>
          </div>
        </section>

        {/* ── Change Password ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Lock size={14} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-800">Change Password</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Current password</label>
              <input
                type="password"
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">New password</label>
              <div className="relative mt-1.5">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Confirm new password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Repeat new password"
              />
            </div>
            {pwStatus && (
              <p className={`text-xs flex items-center gap-1 ${pwStatus.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                {pwStatus.ok ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                {pwStatus.msg}
              </p>
            )}
            <button
              onClick={savePassword}
              disabled={pwSaving || !currentPw || !newPw || !confirmPw}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              {pwSaving ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </section>

        {/* ── Admin Panel ──────────────────────────────────────────────────── */}
        {isAdmin && (
          <section className="bg-amber-50 rounded-2xl border border-amber-200 shadow-sm">
            <div className="px-6 py-4 border-b border-amber-100 flex items-center gap-2">
              <ShieldCheck size={14} className="text-amber-500" />
              <h2 className="text-sm font-semibold text-amber-800">Administration</h2>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-amber-700 mb-4">
                You have admin access — manage users, view stats, and adjust credits.
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition-colors"
              >
                <ShieldCheck size={13} /> Open Admin Panel
              </Link>
            </div>
          </section>
        )}

      </main>
    </div>
  )
}
