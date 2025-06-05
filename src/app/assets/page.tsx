'use client'

import { useState, useEffect, useCallback } from 'react'
import AssetList from '@/components/assets/AssetList'
import AssetForm from '@/components/assets/AssetForm'
import { IAsset } from '@/lib/db/models/Asset'
import { ISKU } from '@/lib/db/models/SKU'

export default function AssetsPage() {
	const [assets, setAssets] = useState<IAsset[]>([])
	const [skus, setSKUs] = useState<ISKU[]>([])
	const [loading, setLoading] = useState(true)
	const [showForm, setShowForm] = useState(false)
	const [editingAsset, setEditingAsset] = useState<IAsset | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedSKU, setSelectedSKU] = useState('')
	const [selectedStatus, setSelectedStatus] = useState('')
	const [selectedDatacenter, setSelectedDatacenter] = useState('')
	const [selectedEnvironment, setSelectedEnvironment] = useState('')
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	})

	const fetchSKUs = useCallback(async () => {
		try {
			const response = await fetch('/api/skus?limit=100')
			const data = await response.json()
			if (response.ok) {
				setSKUs(data.skus)
			}
		} catch (error) {
			console.error('Error fetching SKUs:', error)
		}
	}, [])

	const fetchAssets = useCallback(async () => {
		try {
			setLoading(true)
			const params = new URLSearchParams({
				page: pagination.page.toString(),
				limit: pagination.limit.toString(),
				...(searchQuery && { search: searchQuery }),
				...(selectedSKU && { skuId: selectedSKU }),
				...(selectedStatus && { status: selectedStatus }),
				...(selectedDatacenter && { datacenter: selectedDatacenter }),
				...(selectedEnvironment && { environment: selectedEnvironment }),
			})

			const response = await fetch(`/api/assets?${params}`)
			const data = await response.json()

			if (response.ok) {
				setAssets(data.assets)
				setPagination(data.pagination)
			} else {
				console.error('Error fetching assets:', data.error)
			}
		} catch (error) {
			console.error('Error fetching assets:', error)
		} finally {
			setLoading(false)
		}
	}, [pagination.page, pagination.limit, searchQuery, selectedSKU, selectedStatus, selectedDatacenter, selectedEnvironment])

	useEffect(() => {
		fetchSKUs()
	}, [fetchSKUs])

	useEffect(() => {
		fetchAssets()
	}, [pagination.page, searchQuery, selectedSKU, selectedStatus, selectedDatacenter, selectedEnvironment, fetchAssets])

	const handleSearch = (query: string) => {
		setSearchQuery(query)
		setPagination((prev) => ({ ...prev, page: 1 }))
	}

	const handleSKUFilter = (skuId: string) => {
		setSelectedSKU(skuId)
		setPagination((prev) => ({ ...prev, page: 1 }))
	}

	const handleStatusFilter = (status: string) => {
		setSelectedStatus(status)
		setPagination((prev) => ({ ...prev, page: 1 }))
	}

	const handleDatacenterFilter = (datacenter: string) => {
		setSelectedDatacenter(datacenter)
		setPagination((prev) => ({ ...prev, page: 1 }))
	}

	const handleEnvironmentFilter = (environment: string) => {
		setSelectedEnvironment(environment)
		setPagination((prev) => ({ ...prev, page: 1 }))
	}

	const handlePageChange = (page: number) => {
		setPagination((prev) => ({ ...prev, page }))
	}

	const handleCreate = () => {
		setEditingAsset(null)
		setShowForm(true)
	}

	const handleEdit = (asset: IAsset) => {
		setEditingAsset(asset)
		setShowForm(true)
	}

	const handleDelete = async (assetId: string) => {
		if (!confirm('Are you sure you want to delete this asset?')) return

		try {
			const response = await fetch(`/api/assets/${assetId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				fetchAssets()
			} else {
				const data = await response.json()
				alert(data.error || 'Error deleting asset')
			}
		} catch (error) {
			console.error('Error deleting asset:', error)
			alert('Error deleting asset')
		}
	}

	const handleFormSubmit = async (assetData: Partial<IAsset>) => {
		try {
			const url = editingAsset ? `/api/assets/${editingAsset._id}` : '/api/assets'
			const method = editingAsset ? 'PUT' : 'POST'

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(assetData),
			})

			if (response.ok) {
				setShowForm(false)
				setEditingAsset(null)
				fetchAssets()
			} else {
				const data = await response.json()
				alert(data.error || 'Error saving asset')
			}
		} catch (error) {
			console.error('Error saving asset:', error)
			alert('Error saving asset')
		}
	}

	const handleFormCancel = () => {
		setShowForm(false)
		setEditingAsset(null)
	}

	return (
		<div className="p-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Assets</h1>
				<p className="text-gray-600">Manage your physical IT assets and track their financial information</p>
			</div>

			{showForm ? (
				<AssetForm
					asset={editingAsset}
					skus={skus}
					onSubmit={handleFormSubmit}
					onCancel={handleFormCancel}
				/>
			) : (
				<AssetList
					assets={assets}
					skus={skus}
					loading={loading}
					pagination={pagination}
					searchQuery={searchQuery}
					selectedSKU={selectedSKU}
					selectedStatus={selectedStatus}
					selectedDatacenter={selectedDatacenter}
					selectedEnvironment={selectedEnvironment}
					onSearch={handleSearch}
					onSKUFilter={handleSKUFilter}
					onStatusFilter={handleStatusFilter}
					onDatacenterFilter={handleDatacenterFilter}
					onEnvironmentFilter={handleEnvironmentFilter}
					onPageChange={handlePageChange}
					onCreate={handleCreate}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			)}
		</div>
	)
}