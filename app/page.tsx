'use client'

import { useState, useEffect } from 'react'

type Screen = 'home' | 1 | 2 | 3 | 4 | 5 | 'loading' | 'result'

interface Answers {
  specialty: string
  experience: string
  clients: string
  market: string
  currentRate: string
}

interface Result {
  ideal: number
  monthlyPotential: number
  moneyLeft: number | null
  grade: string | null
  gradeLabel: string | null
}

const BASE: Record<string, number> = {
  development: 72, design: 52, marketing: 46,
  consulting: 82, content: 40, other: 48,
}
const EXP: Record<string, number> = {
  '0-2': 0.55, '3-5': 0.85, '6-10': 1.28, '10+': 1.70,
}
const CLIENT: Record<string, number> = {
  startups: 0.85, pymes: 0.95, enterprise: 1.45, agencies: 0.88,
}
const MARKET: Record<string, number> = {
  spain: 0.82, latam: 0.50, us_uk: 1.58, europe: 1.00,
}

function calcResult(a: Answers): Result {
  const ideal = Math.round((BASE[a.specialty] || 50) * (EXP[a.experience] || 1) * (CLIENT[a.clients] || 1) * (MARKET[a.market] || 1))
  const monthlyPotential = Math.round(ideal * 20 * 4.3)
  let moneyLeft: number | null = null
  let grade: string | null = null
  let gradeLabel: string | null = null
  const curr = parseFloat(a.currentRate)
  if (!isNaN(curr) && curr > 0) {
    moneyLeft = Math.round((ideal - curr) * 20 * 4.3 * 12)
    const ratio = curr / ideal
    if (ratio >= 0.92) { grade = 'A'; gradeLabel = 'Excelente' }
    else if (ratio >= 0.72) { grade = 'B'; gradeLabel = 'Bien' }
    else if (ratio >= 0.50) { grade = 'C'; gradeLabel = 'Infravalorado' }
    else { grade = 'D'; gradeLabel = 'Crítico' }
  }
  return { ideal, monthlyPotential, moneyLeft, grade, gradeLabel }
}

function fmt(n: number) { return new Intl.NumberFormat('es-ES').format(n) }

const SPECIALTY_LABELS: Record<string, string> = {
  development: 'Desarrollo', design: 'Diseño', marketing: 'Marketing',
  consulting: 'Consultoría', content: 'Contenido', other: 'Otro',
}
const MARKET_LABELS: Record<string, string> = {
  spain: 'España', latam: 'Latinoamérica', us_uk: 'USA / UK', europe: 'Europa',
}
const EXP_LABELS: Record<string, string> = {
  '0-2': '0–2 años', '3-5': '3–5 años', '6-10': '6–10 años', '10+': '10+ años',
}

const LOADING_MSGS = [
  'Analizando tu perfil...',
  'Consultando benchmarks del mercado...',
  'Comparando con +12,000 freelancers...',
  'Calculando tu tarifa ideal...',
  'Estimando tu potencial mensual...',
  'Generando tu diagnóstico...',
]

const GRADE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  A: { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400' },
  B: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400' },
  C: { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400' },
  D: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400' },
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('home')
  const [answers, setAnswers] = useState<Answers>({ specialty: '', experience: '', clients: '', market: '', currentRate: '' })
  const [result, setResult] = useState<Result | null>(null)
  const [loadingIdx, setLoadingIdx] = useState(0)
  const [loadingPct, setLoadingPct] = useState(0)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [count, setCount] = useState(4271)

  useEffect(() => {
    const stored = parseInt(localStorage.getItem('frc_count') || '0')
    setCount(4271 + stored)
  }, [])

  useEffect(() => {
    if (screen !== 'loading') return
    const total = 12000
    const interval = 120
    let elapsed = 0
    const timer = setInterval(() => {
      elapsed += interval
      setLoadingPct(Math.min(100, Math.round((elapsed / total) * 100)))
      setLoadingIdx(Math.min(LOADING_MSGS.length - 1, Math.floor((elapsed / total) * LOADING_MSGS.length)))
      if (elapsed >= total) {
        clearInterval(timer)
        const r = calcResult(answers)
        setResult(r)
        const stored = parseInt(localStorage.getItem('frc_count') || '0')
        localStorage.setItem('frc_count', String(stored + 1))
        setCount(c => c + 1)
        setScreen('result')
      }
    }, interval)
    return () => clearInterval(timer)
  }, [screen, answers])

  const progress = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 }[screen as number] || 0

  function pick(field: keyof Answers, value: string) {
    setAnswers(a => ({ ...a, [field]: value }))
  }

  function next(current: number) {
    if (current < 5) setScreen((current + 1) as Screen)
    else { setScreen('loading'); setLoadingIdx(0); setLoadingPct(0) }
  }

  function goHome() {
    setScreen('home')
    setAnswers({ specialty: '', experience: '', clients: '', market: '', currentRate: '' })
    setResult(null); setEmail(''); setEmailSent(false)
  }

  function shareText() {
    const r = result!
    if (r.moneyLeft && r.moneyLeft > 0)
      return `Acabo de calcular mi tarifa freelance ideal: ${fmt(r.ideal)}€/h\n\nEstaba dejando ${fmt(r.moneyLeft)}€/año sobre la mesa 😱\n\nDescúbre la tuya → freelance-rate-calculator.vercel.app`
    return `Mi tarifa freelance ideal según el mercado: ${fmt(r.ideal)}€/h\nPotencial mensual: ${fmt(r.monthlyPotential)}€\n\nDescúbre la tuya → freelance-rate-calculator.vercel.app`
  }

  if (screen === 'home') return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#0a0a0f]">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
            {fmt(count)} freelancers calculados
          </span>
        </div>
        <h1 className="text-4xl font-black text-center mb-3 leading-tight">
          ¿Cuánto{' '}<span className="gradient-text">deberías cobrar</span>{' '}por hora?
        </h1>
        <p className="text-center text-gray-400 mb-8 text-base leading-relaxed">
          Descubre tu tarifa freelance ideal en 60 segundos.<br />
          Basado en tu mercado, experiencia y especialidad.
        </p>
        <button onClick={() => setScreen(1)}
          className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25">
          Calcular mi tarifa →
        </button>
        <p className="text-center text-gray-600 text-xs mt-4">Gratis · Sin registro · 5 preguntas</p>
      </div>
    </main>
  )

  if (typeof screen === 'number') return (
    <main className="min-h-screen flex flex-col px-4 py-8 bg-[#0a0a0f]">
      <div className="w-full max-w-md mx-auto flex flex-col gap-6">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Pregunta {screen} de 5</span><span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {screen === 1 && <StepCard q="¿Cuál es tu especialidad?" options={[
          { value: 'development', label: '💻 Desarrollo' }, { value: 'design', label: '🎨 Diseño' },
          { value: 'marketing', label: '📈 Marketing' }, { value: 'consulting', label: '🧠 Consultoría' },
          { value: 'content', label: '✍️ Contenido' }, { value: 'other', label: '🔧 Otro' },
        ]} selected={answers.specialty} onSelect={v => { pick('specialty', v); setTimeout(() => next(1), 200) }} />}

        {screen === 2 && <StepCard q="¿Cuántos años de experiencia tienes?" options={[
          { value: '0-2', label: '🌱 0–2 años' }, { value: '3-5', label: '🌿 3–5 años' },
          { value: '6-10', label: '🌳 6–10 años' }, { value: '10+', label: '🏆 10+ años' },
        ]} selected={answers.experience} onSelect={v => { pick('experience', v); setTimeout(() => next(2), 200) }} />}

        {screen === 3 && <StepCard q="¿Con qué tipo de clientes trabajas principalmente?" options={[
          { value: 'startups', label: '🚀 Startups' }, { value: 'pymes', label: '🏢 PYMEs' },
          { value: 'enterprise', label: '🏦 Grandes empresas' }, { value: 'agencies', label: '🎯 Agencias' },
        ]} selected={answers.clients} onSelect={v => { pick('clients', v); setTimeout(() => next(3), 200) }} />}

        {screen === 4 && <StepCard q="¿En qué mercado operas principalmente?" options={[
          { value: 'spain', label: '🇪🇸 España' }, { value: 'latam', label: '🌎 Latinoamérica' },
          { value: 'us_uk', label: '🇺🇸 USA / UK' }, { value: 'europe', label: '🇪🇺 Europa' },
        ]} selected={answers.market} onSelect={v => { pick('market', v); setTimeout(() => next(4), 200) }} />}

        {screen === 5 && (
          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold">¿Cuánto cobras actualmente por hora?</h2>
            <p className="text-gray-400 text-sm">Opcional — para calcular cuánto estás dejando sobre la mesa.</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">€</span>
              <input type="number" placeholder="0" value={answers.currentRate}
                onChange={e => pick('currentRate', e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-2xl text-white text-xl font-bold focus:outline-none focus:border-violet-500 transition-colors"
                min="0" max="999" />
            </div>
            <button onClick={() => next(5)}
              className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all">
              {answers.currentRate ? 'Calcular mi tarifa →' : 'Saltar y calcular →'}
            </button>
          </div>
        )}
      </div>
    </main>
  )

  if (screen === 'loading') return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0a0a0f]">
      <div className="w-full max-w-md text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 blur-xl opacity-50 animate-pulse" />
          <div className="absolute inset-2 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
          <div className="absolute inset-4 rounded-full bg-gray-900 flex items-center justify-center">
            <span className="text-2xl">💰</span>
          </div>
        </div>
        <p className="text-gray-300 font-medium mb-6 h-6">{LOADING_MSGS[loadingIdx]}</p>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full progress-bar" style={{ width: `${loadingPct}%` }} />
        </div>
        <p className="text-gray-600 text-sm">{loadingPct}% completado</p>
      </div>
    </main>
  )

  if (screen === 'result' && result) {
    const curr = parseFloat(answers.currentRate)
    const hasCurr = !isNaN(curr) && curr > 0
    const gs = result.grade ? GRADE_STYLES[result.grade] : null
    return (
      <main className="min-h-screen flex flex-col px-4 py-8 bg-[#0a0a0f]">
        <div className="w-full max-w-md mx-auto flex flex-col gap-4">
          <div className="text-center mb-2">
            <p className="text-gray-400 text-sm mb-1">Tu tarifa ideal como {SPECIALTY_LABELS[answers.specialty]} en {MARKET_LABELS[answers.market]}</p>
            <div className="flex items-end justify-center gap-2">
              <span className="text-6xl font-black gradient-text">{fmt(result.ideal)}€</span>
              <span className="text-gray-400 mb-2 text-lg">/hora</span>
            </div>
          </div>

          {hasCurr && result.grade && gs && (
            <div className={`rounded-2xl p-4 border ${gs.bg} ${gs.border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Tu situación actual</p>
                  <p className={`font-black text-2xl ${gs.text}`}>{result.gradeLabel}</p>
                </div>
                <div className={`w-16 h-16 rounded-xl border-2 ${gs.border} ${gs.bg} flex items-center justify-center`}>
                  <span className={`font-black text-3xl ${gs.text}`}>{result.grade}</span>
                </div>
              </div>
              {result.moneyLeft !== null && result.moneyLeft > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-gray-400 text-xs">Dinero dejado sobre la mesa</p>
                  <p className="font-black text-2xl text-white">{fmt(result.moneyLeft)}€/año</p>
                  <p className="text-gray-500 text-xs mt-1">Cobras {fmt(curr)}€/h vs. los {fmt(result.ideal)}€/h que podrías cobrar</p>
                </div>
              )}
              {result.moneyLeft !== null && result.moneyLeft <= 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-emerald-400 text-sm">🎉 Estás por encima del mercado. Cobras {fmt(curr)}€/h — excelente.</p>
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl p-4 bg-gray-900 border border-gray-800">
            <p className="text-gray-400 text-xs mb-1">Potencial mensual (20h/semana)</p>
            <p className="font-black text-3xl text-white">{fmt(result.monthlyPotential)}€</p>
            <p className="text-gray-500 text-xs mt-1">{EXP_LABELS[answers.experience]} · {MARKET_LABELS[answers.market]}</p>
          </div>

          <div className="rounded-2xl p-4 bg-gradient-to-br from-violet-900/40 to-indigo-900/30 border border-violet-700/40">
            <p className="font-bold text-white mb-1">📊 Desglose completo</p>
            <p className="text-gray-400 text-sm mb-3">Recibe por email: cómo llegar a tu tarifa ideal, qué clientes pagan más y cómo posicionarte.</p>
            {!emailSent ? (
              <form onSubmit={e => { e.preventDefault(); setEmailSent(true) }} className="flex gap-2">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                <button type="submit" className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-sm transition-colors whitespace-nowrap">Enviar →</button>
              </form>
            ) : (
              <p className="text-emerald-400 text-sm font-medium">✅ ¡Listo! Revisa tu bandeja de entrada.</p>
            )}
          </div>

          <div>
            <p className="text-gray-500 text-xs text-center mb-2">Comparte tu resultado</p>
            <div className="flex gap-2">
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText())}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-gray-900 border border-gray-800 text-center text-sm font-medium hover:border-gray-600 transition-colors">𝕏 Twitter</a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://freelance-rate-calculator.vercel.app')}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-gray-900 border border-gray-800 text-center text-sm font-medium hover:border-gray-600 transition-colors">LinkedIn</a>
              <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText())}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-gray-900 border border-gray-800 text-center text-sm font-medium hover:border-gray-600 transition-colors">WhatsApp</a>
            </div>
          </div>
          <button onClick={goHome} className="text-gray-500 text-sm text-center py-2 hover:text-gray-300 transition-colors">← Recalcular</button>
        </div>
      </main>
    )
  }

  return null
}

function StepCard({ q, options, selected, onSelect }: {
  q: string; options: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold leading-tight">{q}</h2>
      <div className="grid grid-cols-2 gap-3">
        {options.map(o => (
          <button key={o.value} onClick={() => onSelect(o.value)}
            className={`py-4 px-3 rounded-2xl border text-sm font-semibold text-left transition-all active:scale-95 ${
              selected === o.value ? 'border-violet-500 bg-violet-500/20 text-white' : 'border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-600'
            }`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
