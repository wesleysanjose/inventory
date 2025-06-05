'use client'

import { useState, useEffect, useCallback } from 'react'
import SKUList from '@/components/skus/SKUList'
import SKUForm from '@/components/skus/SKUForm'
import { ISKU } from '@/lib/db/models/SKU'
import { ICatalog } from '@/lib/db/models/Catalog'

export default function SKUsPage() {
	const [skus, setSKUs] = useState<ISKU[]>([])
	const [catalogs, setCatalogs] = useState<ICatalog[]>([])
	const [loading, setLoading] = useState(true)
	const [showForm, setShowForm] = useState(false)
	const [editingSKU, setEditingSKU] = useState<ISKU | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCatalog, setSelectedCatalog] = useState('')
	const [selectedManufacturer, setSelectedManufacturer] = useState('')
	const [selectedStatus, setSelectedStatus] = useState('')
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	})

	const fetchCatalogs = useCallback(async () => {
		try {
			const response = await fetch('/api/catalogs?limit=100')
			const data = await response.json()
			if (response.ok) {
				setCatalogs(data.catalogs)
			}
		} catch (error) {
			console.error('Error fetching catalogs:', error)
		}
	}, [])

	const fetchSKUs = useCallback(async () => {
		try {
			setLoading(true)
			const params = new URLSearchParams({
				page: pagination.page.toString(),
				limit: pagination.limit.toString(),
				...(searchQuery && { search: searchQuery }),
				...(selectedCatalog && { catalogId: selectedCatalog }),
				...(selectedManufacturer && { manufacturer: selectedManufacturer }),
				...(selectedStatus && { status: selectedStatus }),
			})

			const response = await fetch(`/api/skus?${params}`)
			const data = await response.json()

			if (response.ok) {
				setSKUs(data.skus)
				setPagination(data.pagination)
			} else {
				console.error('Error fetching SKUs:', data.error)
			}
		} catch (error) {
			console.error('Error fetching SKUs:', error)
		} finally {
			setLoading(false)
		}
	}, [pagination.page, pagination.limit, searchQuery, selectedCatalog, selectedManufacturer, selectedStatus])

	useEffect(() => {
		fetchCatalogs()
	}, [fetchCatalogs])

	useEffect(() => {
		fetchSKUs()
	}, [pagination.page, searchQuery, selectedCatalog, selectedManufacturer, selectedStatus, fetchSKUs])

	const handleSearch = (query: string) => {
		setSearchQuery(query)
		setPagination((prev) => ({ ...prev, page: 1 }))
	}

	const handleCatalogFilter = (catalogId: string) => {
		setSelectedCatalog(catalogId)
		setPagination((prev) => ({ ...prev, page: 1 }))
	}

	const handleManufacturerFilter = (manufacturer: string) => {
		setSelectedManufacturer(manufacturer)
		setPagination((prev) => ({ ...prev, page: 1 }))
	}

	const handleStatusFilter = (status: string) => {
		setSelectedStatus(status)
		setPagination((prev) => ({ ...prev, page: 1 }))
	}

	const handlePageChange = (page: number) => {
		setPagination((prev) => ({ ...prev, page }))
	}

	const handleCreate = () => {
		setEditingSKU(null)
		setShowForm(true)
	}

	const handleEdit = (sku: ISKU) => {
		setEditingSKU(sku)
		setShowForm(true)
	}

	const handleDelete = async (skuId: string) => {
		if (!confirm('Are you sure you want to delete this SKU?')) return

		try {
			const response = await fetch(`/api/skus/${skuId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				fetchSKUs()
			} else {
				const data = await response.json()
				alert(data.error || 'Error deleting SKU')
			}
		} catch (error) {
			console.error('Error deleting SKU:', error)
			alert('Error deleting SKU')
		}
	}

	const handleFormSubmit = async (skuData: Partial<ISKU>) => {
		try {
			const url = editingSKU ? `/api/skus/${editingSKU._id}` : '/api/skus'
			const method = editingSKU ? 'PUT' : 'POST'

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(skuData),
			})

			if (response.ok) {
				setShowForm(false)
				setEditingSKU(null)
				fetchSKUs()
			} else {
				const data = await response.json()
				alert(data.error || 'Error saving SKU')
			}
		} catch (error) {
			console.error('Error saving SKU:', error)
			alert('Error saving SKU')
		}
	}

	const handleFormCancel = () => {
		setShowForm(false)
		setEditingSKU(null)
	}

	return (
		<div className="p-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">SKUs</h1>
				<p className="text-gray-600">Manage your product stock keeping units</p>
			</div>

			{showForm ? (
				<SKUForm
					sku={editingSKU}
					catalogs={catalogs}
					onSubmit={handleFormSubmit}
					onCancel={handleFormCancel}
				/>
			) : (
				<SKUList
					skus={skus}
					catalogs={catalogs}
					loading={loading}
					pagination={pagination}
					searchQuery={searchQuery}
					selectedCatalog={selectedCatalog}
					selectedManufacturer={selectedManufacturer}
					selectedStatus={selectedStatus}
					onSearch={handleSearch}
					onCatalogFilter={handleCatalogFilter}
					onManufacturerFilter={handleManufacturerFilter}
					onStatusFilter={handleStatusFilter}
					onPageChange={handlePageChange}
					onCreate={handleCreate}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			)}
		</div>
	)
}