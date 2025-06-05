import { ISKU } from '@/lib/db/models/SKU'
import { ICatalog } from '@/lib/db/models/Catalog'

interface SKUListProps {
	skus: ISKU[]
	catalogs: ICatalog[]
	loading: boolean
	pagination: {
		page: number
		limit: number
		total: number
		pages: number
	}
	searchQuery: string
	selectedCatalog: string
	selectedManufacturer: string
	selectedStatus: string
	onSearch: (query: string) => void
	onCatalogFilter: (catalogId: string) => void
	onManufacturerFilter: (manufacturer: string) => void
	onStatusFilter: (status: string) => void
	onPageChange: (page: number) => void
	onCreate: () => void
	onEdit: (sku: ISKU) => void
	onDelete: (skuId: string) => void
}

const statuses = ['active', 'inactive', 'discontinued']

export default function SKUList({
	skus,
	catalogs,
	loading,
	pagination,
	searchQuery,
	selectedCatalog,
	selectedManufacturer,
	selectedStatus,
	onSearch,
	onCatalogFilter,
	onManufacturerFilter,
	onStatusFilter,
	onPageChange,
	onCreate,
	onEdit,
	onDelete,
}: SKUListProps) {
	const uniqueManufacturers = Array.from(new Set(skus.map((sku) => sku.manufacturer)))

	return (
		<div className="space-y-6">
			{/* Filters and Search */}
			<div className="bg-white p-6 rounded-lg shadow">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<div className="flex flex-col sm:flex-row gap-4">
						<input
							type="text"
							placeholder="Search SKUs..."
							value={searchQuery}
							onChange={(e) => onSearch(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
						<select
							value={selectedCatalog}
							onChange={(e) => onCatalogFilter(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="">All Catalogs</option>
							{catalogs.map((catalog) => (
								<option key={String(catalog._id)} value={String(catalog._id)}>
									{catalog.name}
								</option>
							))}
						</select>
						<select
							value={selectedManufacturer}
							onChange={(e) => onManufacturerFilter(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="">All Manufacturers</option>
							{uniqueManufacturers.map((manufacturer) => (
								<option key={manufacturer} value={manufacturer}>
									{manufacturer}
								</option>
							))}
						</select>
						<select
							value={selectedStatus}
							onChange={(e) => onStatusFilter(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="">All Statuses</option>
							{statuses.map((status) => (
								<option key={status} value={status}>
									{status.charAt(0).toUpperCase() + status.slice(1)}
								</option>
							))}
						</select>
					</div>
					<button
						onClick={onCreate}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Add SKU
					</button>
				</div>
			</div>

			{/* SKUs Table */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				{loading ? (
					<div className="p-8 text-center">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<p className="mt-2 text-gray-600">Loading SKUs...</p>
					</div>
				) : skus.length === 0 ? (
					<div className="p-8 text-center">
						<p className="text-gray-600">No SKUs found</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										SKU Details
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Catalog
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Manufacturer
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Pricing
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Assets
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{skus.map((sku) => (
									<tr key={String(sku._id)} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">{sku.name}</div>
												<div className="text-sm text-gray-500">
													{sku.skuCode} • {sku.modelName}
												</div>
												<div className="text-xs text-gray-400 mt-1">
													{sku.description.length > 60
														? `${sku.description.substring(0, 60)}...`
														: sku.description}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
												{(sku.catalogId as ICatalog)?.name || 'Unknown'}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{sku.manufacturer}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">
												{sku.pricing.msrp
													? `$${sku.pricing.msrp.toLocaleString()} ${sku.pricing.currency}`
													: 'Not set'}
											</div>
											<div className="text-xs text-gray-500">
												{sku.warranty.standard}yr warranty
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													sku.status === 'active'
														? 'bg-green-100 text-green-800'
														: sku.status === 'inactive'
														? 'bg-yellow-100 text-yellow-800'
														: 'bg-red-100 text-red-800'
												}`}
											>
												{sku.status}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{(sku as ISKU & { assetCount?: number }).assetCount || 0}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
											<button
												onClick={() => onEdit(sku)}
												className="text-blue-600 hover:text-blue-900"
											>
												Edit
											</button>
											<button
												onClick={() => onDelete(String(sku._id))}
												className="text-red-600 hover:text-red-900"
											>
												Delete
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Pagination */}
			{pagination.pages > 1 && (
				<div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
					<div className="flex-1 flex justify-between sm:hidden">
						<button
							onClick={() => onPageChange(pagination.page - 1)}
							disabled={pagination.page === 1}
							className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Previous
						</button>
						<button
							onClick={() => onPageChange(pagination.page + 1)}
							disabled={pagination.page === pagination.pages}
							className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Next
						</button>
					</div>
					<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
						<div>
							<p className="text-sm text-gray-700">
								Showing{' '}
								<span className="font-medium">
									{(pagination.page - 1) * pagination.limit + 1}
								</span>{' '}
								to{' '}
								<span className="font-medium">
									{Math.min(pagination.page * pagination.limit, pagination.total)}
								</span>{' '}
								of <span className="font-medium">{pagination.total}</span> results
							</p>
						</div>
						<div>
							<nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
								<button
									onClick={() => onPageChange(pagination.page - 1)}
									disabled={pagination.page === 1}
									className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Previous
								</button>
								{Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
									<button
										key={page}
										onClick={() => onPageChange(page)}
										className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
											page === pagination.page
												? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
												: 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
										}`}
									>
										{page}
									</button>
								))}
								<button
									onClick={() => onPageChange(pagination.page + 1)}
									disabled={pagination.page === pagination.pages}
									className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Next
								</button>
							</nav>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}