import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { signOut } from '../../lib/auth'

const navItems = [
  { to: '/admin',           label: 'Dashboard',  exact: true },
  { to: '/admin/bookings',  label: 'Rezervimet' },
  { to: '/admin/rooms',     label: 'Dhomat',     roles: ['admin','superadmin'] },
  { to: '/admin/staff',     label: 'Stafi',      roles: ['admin','superadmin','hr'] },
  { to: '/admin/inventory', label: 'Inventory',  roles: ['admin','superadmin','staff'] },
  { to: '/admin/reports',   label: 'Raporte',    roles: ['admin','superadmin'] },
  { to: '/admin/channels',  label: 'Channels',   roles: ['admin','superadmin'] },
]

export default function AdminLayout() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => { await signOut(); navigate('/login') }

  const visible = navItems.filter(i => !i.roles || i.roles.includes(profile?.role ?? ''))

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-lg font-semibold tracking-tight">
            Hotel<span className="text-blue-600">OS</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{profile?.full_name}</p>
          <span className="inline-block mt-1.5 text-xs bg-blue-50 text-blue-600 rounded-full px-2.5 py-0.5 capitalize font-medium">
            {profile?.role}
          </span>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {visible.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition">
            Dil
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
