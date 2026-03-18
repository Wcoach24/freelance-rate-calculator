import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '¿Cuánto deberías cobrar? | Calculadora de Tarifa Freelance',
  description: 'Descubre tu tarifa ideal como freelance en 60 segundos. Basado en tu especialidad, experiencia y mercado. Gratis.',
  openGraph: {
    title: '¿Cuánto deberías cobrar? Calcula tu tarifa freelance ideal',
    description: 'Descubre si estás dejando dinero sobre la mesa. Tarifa calculada en base a 10,000+ freelancers.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Cuánto deberías cobrar? | Tarifa Freelance',
    description: 'Descubre tu tarifa ideal como freelance en 60 segundos.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
