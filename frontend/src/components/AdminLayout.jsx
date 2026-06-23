import AdminSidebar from './AdminSidebar.jsx'

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50/80 overflow-hidden">
      <div className="relative">
        <AdminSidebar />
      </div>
      <main className="flex-1 overflow-y-auto scroll-smooth">
        {children}
      </main>
    </div>
  )
}
