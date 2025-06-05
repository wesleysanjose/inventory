'use client'

import { useState, useEffect, useCallback } from 'react'
import CatalogList from '@/components/catalogs/CatalogList'
import CatalogForm from '@/components/catalogs/CatalogForm'
import { ICatalog } from '@/lib/db/models/Catalog'

export default function CatalogsPage() {
	const [catalogs, setCatalogs] = useState<ICatalog[]>([])
	const [loading, setLoading] = useState(true)
	const [showForm, setShowForm] = useState(false)
	const [editingCatalog, setEditingCatalog] = useState<ICatalog | null>(null)
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedCategory, setSelectedCategory] = useState('')
	const [selectedStatus, setSelectedStatus] = useState('')
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
	})

	const fetchCatalogs = useCallback(async () => {
		try {
			setLoading(true)
			const params = new URLSearchParams({
				page: pagination.page.toString(),
				limit: pagination.limit.toString(),
				...(searchQuery && { search: searchQuery }),
				...(selectedCategory && { category: selectedCategory }),
				...(selectedStatus && { status: selectedStatus }),
			})

			const response = await fetch(`/api/catalogs?${params}`)
			const data = await response.json()

			if (response.ok) {
				setCatalogs(data.catalogs)
				setPagination(data.pagination)
			} else {
				console.error('Error fetching catalogs:', data.error)
			}
		} catch (error) {
			console.error('Error fetching catalogs:', error)
		} finally {
			setLoading(false)
		}
	}, [pagination.page, pagination.limit, searchQuery, selectedCategory, selectedStatus])

	useEffect(() => {
		fetchCatalogs()
	}, [pagination.page, searchQuery, selectedCategory, selectedStatus, fetchCatalogs])

	const handleSearch = (query: string) => {
		setSearchQuery(query)
		setPagination((prev) => ({ ...prev, page: 1 }))
	}

	const handleCategoryFilter = (category: string) => {
		setSelectedCategory(category)
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
		setEditingCatalog(null)
		setShowForm(true)
	}

	const handleEdit = (catalog: ICatalog) => {
		setEditingCatalog(catalog)
		setShowForm(true)
	}

	const handleDelete = async (catalogId: string) => {
		if (!confirm('Are you sure you want to delete this catalog?')) return

		try {
			const response = await fetch(`/api/catalogs/${catalogId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				fetchCatalogs()
			} else {
				const data = await response.json()
				alert(data.error || 'Error deleting catalog')
			}
		} catch (error) {
			console.error('Error deleting catalog:', error)
			alert('Error deleting catalog')
		}
	}

	const handleFormSubmit = async (catalogData: Partial<ICatalog>) => {
		try {
			const url = editingCatalog ? `/api/catalogs/${editingCatalog._id}` : '/api/catalogs'
			const method = editingCatalog ? 'PUT' : 'POST'

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(catalogData),
			})

			if (response.ok) {
				setShowForm(false)
				setEditingCatalog(null)
				fetchCatalogs()
			} else {
				const data = await response.json()
				alert(data.error || 'Error saving catalog')
			}
		} catch (error) {
			console.error('Error saving catalog:', error)
			alert('Error saving catalog')
		}
	}

	const handleFormCancel = () => {
		setShowForm(false)
		setEditingCatalog(null)
	}

	return (
		<div className="p-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Catalogs</h1>
				<p className="text-gray-600">Manage your asset catalog categories</p>
			</div>

			{showForm ? (
				<CatalogForm
					catalog={editingCatalog}
					onSubmit={handleFormSubmit}
					onCancel={handleFormCancel}
				/>
			) : (
				<CatalogList
					catalogs={catalogs}
					loading={loading}
					pagination={pagination}
					searchQuery={searchQuery}
					selectedCategory={selectedCategory}
					selectedStatus={selectedStatus}
					onSearch={handleSearch}
					onCategoryFilter={handleCategoryFilter}
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