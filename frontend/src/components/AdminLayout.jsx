import AdminSidebar from './AdminSidebar.jsx'
import AnimatedBackground from './AnimatedBackground.jsx'

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#0F172A] overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <AdminSidebar />
      </div>
      <main className="flex-1 overflow-y-auto scroll-smooth relative z-10">
        {children}
      </main>
    </div>
  )
}
