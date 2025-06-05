'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigationItems = [
	{
		href: '/',
		label: 'Dashboard',
		icon: '📊',
	},
	{
		href: '/catalogs',
		label: 'Catalogs',
		icon: '📁',
	},
	{
		href: '/skus',
		label: 'SKUs',
		icon: '🏷️',
	},
	{
		href: '/assets',
		label: 'Assets',
		icon: '💻',
	},
	{
		href: '/reports',
		label: 'Financial Reports',
		icon: '📈',
	},
]

export default function Navigation() {
	const pathname = usePathname()

	return (
		<nav className="w-64 bg-gray-900 text-white min-h-screen p-4">
			<div className="mb-8">
				<h1 className="text-xl font-bold">IT Assets</h1>
				<p className="text-gray-400 text-sm">Inventory Management</p>
			</div>

			<ul className="space-y-2">
				{navigationItems.map((item) => {
					const isActive = pathname === item.href
					return (
						<li key={item.href}>
							<Link
								href={item.href}
								className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
									isActive
										? 'bg-blue-600 text-white'
										: 'hover:bg-gray-800 text-gray-300 hover:text-white'
								}`}
							>
								<span className="text-lg">{item.icon}</span>
								<span>{item.label}</span>
							</Link>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}