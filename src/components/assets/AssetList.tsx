import { IAsset } from '@/lib/db/models/Asset'
import { ISKU } from '@/lib/db/models/SKU'
import { ICatalog } from '@/lib/db/models/Catalog'

interface AssetListProps {
	assets: IAsset[]
	skus: ISKU[]
	loading: boolean
	pagination: {
		page: number
		limit: number
		total: number
		pages: number
	}
	searchQuery: string
	selectedSKU: string
	selectedStatus: string
	selectedDatacenter: string
	selectedEnvironment: string
	onSearch: (query: string) => void
	onSKUFilter: (skuId: string) => void
	onStatusFilter: (status: string) => void
	onDatacenterFilter: (datacenter: string) => void
	onEnvironmentFilter: (environment: string) => void
	onPageChange: (page: number) => void
	onCreate: () => void
	onEdit: (asset: IAsset) => void
	onDelete: (assetId: string) => void
}

const statuses = ['active', 'inactive', 'maintenance', 'retired', 'disposed']
const environments = ['production', 'staging', 'development', 'testing', 'backup']

export default function AssetList({
	assets,
	skus,
	loading,
	pagination,
	searchQuery,
	selectedSKU,
	selectedStatus,
	selectedDatacenter,
	selectedEnvironment,
	onSearch,
	onSKUFilter,
	onStatusFilter,
	onDatacenterFilter,
	onEnvironmentFilter,
	onPageChange,
	onCreate,
	onEdit,
	onDelete,
}: AssetListProps) {
	const uniqueDatacenters = Array.from(new Set(assets.map((asset) => asset.location.datacenter)))

	const formatCurrency = (amount: number, currency: string = 'USD') => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency,
		}).format(amount)
	}

	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString()
	}

	return (
		<div className="space-y-6">
			{/* Filters and Search */}
			<div className="bg-white p-6 rounded-lg shadow">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<div className="flex flex-col sm:flex-row gap-4">
						<input
							type="text"
							placeholder="Search assets..."
							value={searchQuery}
							onChange={(e) => onSearch(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
						<select
							value={selectedSKU}
							onChange={(e) => onSKUFilter(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
						>
							<option value="" className="text-gray-900 font-medium">All SKUs</option>
							{skus.map((sku) => (
								<option key={String(sku._id)} value={String(sku._id)}>
									{sku.name} ({sku.skuCode})
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
						<select
							value={selectedDatacenter}
							onChange={(e) => onDatacenterFilter(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
						>
							<option value="" className="text-gray-900 font-medium">All Datacenters</option>
							{uniqueDatacenters.map((datacenter) => (
								<option key={datacenter} value={datacenter}>
									{datacenter}
								</option>
							))}
						</select>
						<select
							value={selectedEnvironment}
							onChange={(e) => onEnvironmentFilter(e.target.value)}
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
						>
							<option value="" className="text-gray-900 font-medium">All Environments</option>
							{environments.map((environment) => (
								<option key={environment} value={environment}>
									{environment.charAt(0).toUpperCase() + environment.slice(1)}
								</option>
							))}
						</select>
					</div>
					<button
						onClick={onCreate}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Add Asset
					</button>
				</div>
			</div>

			{/* Assets Table */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				{loading ? (
					<div className="p-8 text-center">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<p className="mt-2 text-gray-600">Loading assets...</p>
					</div>
				) : assets.length === 0 ? (
					<div className="p-8 text-center">
						<p className="text-gray-600">No assets found</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Asset Details
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										SKU & Catalog
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Location
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Financial
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{assets.map((asset) => {
									const sku = asset.skuId as ISKU & { catalogId: ICatalog }
									return (
										<tr key={String(asset._id)} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap">
												<div>
													<div className="text-sm font-medium text-gray-900">{asset.name}</div>
													<div className="text-sm text-gray-500">
														{asset.assetTag} • {asset.serialNumber}
													</div>
													{asset.specifications.hostname && (
														<div className="text-xs text-gray-400">
															{asset.specifications.hostname}
														</div>
													)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div>
													<div className="text-sm font-medium text-gray-900">{sku?.name}</div>
													<div className="text-sm text-gray-500">{sku?.skuCode}</div>
													<div className="text-xs text-gray-400">
														{sku?.catalogId?.name} • {sku?.catalogId?.category}
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div>
													<div className="text-sm font-medium text-gray-900">
														{asset.location.datacenter}
													</div>
													<div className="text-sm text-gray-500">
														{asset.location.rack && `${asset.location.rack} • `}
														{asset.location.city}, {asset.location.country}
													</div>
													<div className="text-xs text-gray-400">
														{asset.deployment.environment}
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div>
													<div className="text-sm font-medium text-gray-900">
														{formatCurrency(asset.financial.capex.purchasePrice, asset.financial.capex.currency)}
													</div>
													<div className="text-sm text-gray-500">
														{formatDate(asset.financial.capex.purchaseDate)}
													</div>
													<div className="text-xs text-gray-400">
														Go Live: {formatDate(asset.deployment.goLiveDate)}
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														asset.status === 'active'
															? 'bg-green-100 text-green-800'
															: asset.status === 'inactive'
															? 'bg-yellow-100 text-yellow-800'
															: asset.status === 'maintenance'
															? 'bg-blue-100 text-blue-800'
															: asset.status === 'retired'
															? 'bg-gray-100 text-gray-800'
															: 'bg-red-100 text-red-800'
													}`}
												>
													{asset.status}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
												<button
													onClick={() => onEdit(asset)}
													className="text-blue-600 hover:text-blue-900"
												>
													Edit
												</button>
												<button
													onClick={() => onDelete(String(asset._id))}
													className="text-red-600 hover:text-red-900"
												>
													Delete
												</button>
											</td>
										</tr>
									)
								})}
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