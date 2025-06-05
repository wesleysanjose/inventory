'use client'

import { useState, useEffect } from 'react'

interface DashboardStats {
	totalCatalogs: number
	totalSKUs: number
	totalAssets: number
	totalValue: number
}

export default function Dashboard() {
	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchStats = async () => {
			try {
				setLoading(true)
				
				// Fetch all data in parallel
				const [catalogsRes, skusRes, assetsRes] = await Promise.all([
					fetch('/api/catalogs?limit=1000'),
					fetch('/api/skus?limit=1000'),
					fetch('/api/assets?limit=1000')
				])

				const [catalogsData, skusData, assetsData] = await Promise.all([
					catalogsRes.json(),
					skusRes.json(),
					assetsRes.json()
				])

				// Calculate total value from assets
				const totalValue = assetsData.assets?.reduce((sum: number, asset: Record<string, unknown>) => {
					const financial = asset.financial as Record<string, unknown>
					const capex = financial?.capex as Record<string, unknown>
					return sum + (Number(capex?.purchasePrice) || 0)
				}, 0) || 0

				setStats({
					totalCatalogs: catalogsData.pagination?.total || 0,
					totalSKUs: skusData.pagination?.total || 0,
					totalAssets: assetsData.pagination?.total || 0,
					totalValue: totalValue
				})
			} catch (error) {
				console.error('Error fetching dashboard stats:', error)
				setStats({
					totalCatalogs: 0,
					totalSKUs: 0,
					totalAssets: 0,
					totalValue: 0
				})
			} finally {
				setLoading(false)
			}
		}

		fetchStats()
	}, [])

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount)
	}

	return (
		<div className="p-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">IT Assets Dashboard</h1>
				<p className="text-gray-600">Overview of your inventory management system</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<div className="bg-white p-6 rounded-lg shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total Catalogs</p>
							<p className="text-2xl font-bold text-gray-900">
								{loading ? (
									<div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
								) : (
									stats?.totalCatalogs || 0
								)}
							</p>
						</div>
						<div className="p-3 bg-blue-50 rounded-full">
							<span className="text-2xl">📁</span>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total SKUs</p>
							<p className="text-2xl font-bold text-gray-900">
								{loading ? (
									<div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
								) : (
									stats?.totalSKUs || 0
								)}
							</p>
						</div>
						<div className="p-3 bg-green-50 rounded-full">
							<span className="text-2xl">🏷️</span>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total Assets</p>
							<p className="text-2xl font-bold text-gray-900">
								{loading ? (
									<div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
								) : (
									stats?.totalAssets || 0
								)}
							</p>
						</div>
						<div className="p-3 bg-purple-50 rounded-full">
							<span className="text-2xl">💻</span>
						</div>
					</div>
				</div>

				<div className="bg-white p-6 rounded-lg shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600">Total Value</p>
							<p className="text-2xl font-bold text-gray-900">
								{loading ? (
									<div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
								) : (
									formatCurrency(stats?.totalValue || 0)
								)}
							</p>
						</div>
						<div className="p-3 bg-yellow-50 rounded-full">
							<span className="text-2xl">💰</span>
						</div>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow p-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<a
						href="/catalogs"
						className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
					>
						<div className="flex items-center space-x-3">
							<span className="text-2xl">📁</span>
							<div>
								<h3 className="font-medium text-gray-900">Manage Catalogs</h3>
								<p className="text-sm text-gray-600">Create and manage asset categories</p>
							</div>
						</div>
					</a>

					<a
						href="/skus"
						className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
					>
						<div className="flex items-center space-x-3">
							<span className="text-2xl">🏷️</span>
							<div>
								<h3 className="font-medium text-gray-900">Manage SKUs</h3>
								<p className="text-sm text-gray-600">Add and manage product SKUs</p>
							</div>
						</div>
					</a>

					<a
						href="/assets"
						className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
					>
						<div className="flex items-center space-x-3">
							<span className="text-2xl">💻</span>
							<div>
								<h3 className="font-medium text-gray-900">Manage Assets</h3>
								<p className="text-sm text-gray-600">Track individual asset instances</p>
							</div>
						</div>
					</a>
				</div>
			</div>
		</div>
	)
}
