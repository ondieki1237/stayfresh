"use client"

import { useEffect, useState } from "react"

interface Farmer {
  firstName?: string
  lastName?: string
  location?: string
}

interface HeaderCarouselProps {
  farmer: Farmer | null
}

export default function HeaderCarousel({ farmer }: HeaderCarouselProps) {
  const slides = [

  {
    title: "Stop food from going bad. Keep it fresh for longer.",
    subtitle: `${farmer?.firstName ?? "Farmer"} ${farmer?.lastName ?? ""}`.trim() + 
               " — with Stay Fresh, your tomatoes and fruits can stay fresh for many days instead of spoiling.",
    location: farmer?.location ?? "Your local farm",
  },
  {
    title: "Watch your harvest stay fresh, even without worry.",
    subtitle: "Our smart cold room shows you the temperature and how your produce is doing — no more guessing.",
    location: "Stay Fresh Cold Room",
  },
  {
    title: "Earn more money. Throw away less food.",
    subtitle: "When your tomatoes stay fresh, you can sell them later when prices are better — and keep more profit in your pocket.",
    location: "Stay Fresh Farmers Market",
  },
  {
    title: "Together, we can stop food waste.",
    subtitle: "Stay Fresh helps farmers share storage, save food, and protect hard work from going to waste.",
    location: "Stay Fresh Farmers Hub",
  },
  {
    title: "From your shamba to the market — without losing a single tomato.",
    subtitle: "Cold rooms keep your food cool, safe, and ready for buyers even after many days.",
    location: "Stay Fresh Cooling Center",
  },
  {
    title: "Keep your harvest strong and valuable.",
    subtitle: "Use Stay Fresh to store your produce smartly, sell at the right time, and make your farming pay off.",
    location: "Stay Fresh Profit Center",
  },
  ]

  const [currentSlide, setCurrentSlide] = useState(0)
  const [animate, setAnimate] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(false)

      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
        setAnimate(true)
      }, 450) // small delay to reset animation
    }, 4500)

    return () => clearInterval(interval)
  }, [slides.length])

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-br from-primary to-chart-4 text-white p-6 shadow-xl overflow-hidden transition-all">
      <div className={`${animate ? "animate-in fade-in slide-in-from-bottom duration-700" : ""}`}>
        <h1 className="text-2xl font-extrabold mb-1">{slides[currentSlide].title}</h1>
        <p className="text-white/80 text-sm">{slides[currentSlide].subtitle}</p>

        <div className="flex items-center gap-2 mt-3 text-sm opacity-80">
          <span>📍</span>
          <span>{slides[currentSlide].location}</span>
        </div>
      </div>
    </div>
  )
}
