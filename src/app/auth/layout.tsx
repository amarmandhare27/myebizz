export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right: Branding */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 instagram-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center text-white">
          <div className="text-6xl mb-6">🛍️</div>
          <h1 className="text-5xl font-black mb-4">MyeBizz</h1>
          <p className="text-xl text-white/80 max-w-sm leading-relaxed">
            The ultimate commerce platform for Instagram creators & influencers
          </p>
          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            {[
              { value: "10K+", label: "Creators" },
              { value: "₹50Cr+", label: "Revenue" },
              { value: "4.9★", label: "Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-black">{stat.value}</p>
                <p className="text-white/70 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
