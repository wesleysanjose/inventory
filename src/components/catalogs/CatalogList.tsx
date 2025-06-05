import { ICatalog } from '@/lib/db/models/Catalog'

interface CatalogListProps {
	catalogs: ICatalog[]
	loading: boolean
	pagination: {
		page: number
		limit: number
		total: number
		pages: number
	}
	searchQuery: string
	selectedCategory: string
	selectedStatus: string
	onSearch: (query: string) => void
	onCategoryFilter: (category: string) => void
	onStatusFilter: (status: string) => void
	onPageChange: (page: number) => void
	onCreate: () => void
	onEdit: (catalog: ICatalog) => void
	onDelete: (catalogId: string) => void
}

const categories = [
	'server',
	'network-switch',
	'firewall',
	'storage',
	'laptop',
	'desktop',
	'monitor',
	'printer',
	'other',
]

const statuses = ['active', 'inactive', 'discontinued']

export default function CatalogList({
	catalogs,
	loading,
	pagination,
	searchQuery,
	selectedCategory,
	selectedStatus,
	onSearch,
	onCategoryFilter,
	onStatusFilter,
	onPageChange,
	onCreate,
	onEdit,
	onDelete,
}: CatalogListProps) {
	return (
		<div className="space-y-6">
			{/* Filters and Search */}
			<div className="bg-white p-6 rounded-lg shadow">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<div className="flex flex-col sm:flex-row gap-4">
						<input
							type="text"
							placeholder="Search catalogs..."
							value={searchQuery}
							onChange={(e) => onSearch(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
						<select
							value={selectedCategory}
							onChange={(e) => onCategoryFilter(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
						>
							<option value="" className="text-gray-900 font-medium">All Categories</option>
							{categories.map((category) => (
								<option key={category} value={category}>
									{category.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
								</option>
							))}
						</select>
						<select
							value={selectedStatus}
							onChange={(e) => onStatusFilter(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
						>
							<option value="" className="text-gray-900 font-medium">All Statuses</option>
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
						Add Catalog
					</button>
				</div>
			</div>

			{/* Catalogs Table */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				{loading ? (
					<div className="p-8 text-center">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<p className="mt-2 text-gray-600">Loading catalogs...</p>
					</div>
				) : catalogs.length === 0 ? (
					<div className="p-8 text-center">
						<p className="text-gray-600">No catalogs found</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Name
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Category
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Manufacturer
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										SKUs
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{catalogs.map((catalog) => (
									<tr key={String(catalog._id)} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap">
											<div>
												<div className="text-sm font-medium text-gray-900">{catalog.name}</div>
												<div className="text-sm text-gray-500">{catalog.description}</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
												{catalog.category.replace('-', ' ')}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{catalog.manufacturer}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													catalog.status === 'active'
														? 'bg-green-100 text-green-800'
														: catalog.status === 'inactive'
														? 'bg-yellow-100 text-yellow-800'
														: 'bg-red-100 text-red-800'
												}`}
											>
												{catalog.status}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{(catalog as ICatalog & { skuCount?: number }).skuCount || 0}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
											<button
												onClick={() => onEdit(catalog)}
												className="text-blue-600 hover:text-blue-900"
											>
												Edit
											</button>
											<button
												onClick={() => onDelete(String(catalog._id))}
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