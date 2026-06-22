import AdminSidebar from './AdminSidebar.jsx'

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-bgLight overflow-hidden">
      <div className="relative">
        <AdminSidebar />
      </div>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
