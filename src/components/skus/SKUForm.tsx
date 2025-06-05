import { useState } from 'react'
import { ISKU } from '@/lib/db/models/SKU'
import { ICatalog } from '@/lib/db/models/Catalog'

interface SKUFormProps {
	sku?: ISKU | null
	catalogs: ICatalog[]
	onSubmit: (skuData: Partial<ISKU>) => void
	onCancel: () => void
}

const statuses = ['active', 'inactive', 'discontinued']

export default function SKUForm({ sku, catalogs, onSubmit, onCancel }: SKUFormProps) {
	const [formData, setFormData] = useState({
		catalogId: sku?.catalogId ? String(sku.catalogId) : '',
		skuCode: sku?.skuCode || '',
		name: sku?.name || '',
		modelName: sku?.modelName || '',
		description: sku?.description || '',
		manufacturer: sku?.manufacturer || '',
		status: sku?.status || 'active',
		specifications: {
			cpu: sku?.specifications?.cpu || '',
			memory: sku?.specifications?.memory || '',
			storage: sku?.specifications?.storage || '',
			networkPorts: sku?.specifications?.networkPorts || '',
			powerSupply: sku?.specifications?.powerSupply || '',
			dimensions: {
				height: sku?.specifications?.dimensions?.height || '',
				width: sku?.specifications?.dimensions?.width || '',
				depth: sku?.specifications?.dimensions?.depth || '',
				weight: sku?.specifications?.dimensions?.weight || '',
			},
			operatingSystem: sku?.specifications?.operatingSystem || '',
			supportedOS: sku?.specifications?.supportedOS?.join(', ') || '',
		},
		pricing: {
			msrp: sku?.pricing?.msrp || '',
			currency: sku?.pricing?.currency || 'USD',
			effectiveDate: sku?.pricing?.effectiveDate
				? new Date(sku.pricing.effectiveDate).toISOString().split('T')[0]
				: new Date().toISOString().split('T')[0],
			endDate: sku?.pricing?.endDate
				? new Date(sku.pricing.endDate).toISOString().split('T')[0]
				: '',
		},
		warranty: {
			standard: sku?.warranty?.standard || 1,
			extended: sku?.warranty?.extended || '',
			support: sku?.warranty?.support || '',
		},
	})

	const [errors, setErrors] = useState<Record<string, string>>({})

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target

		if (name.startsWith('specifications.dimensions.')) {
			const dimensionName = name.split('.')[2]
			setFormData((prev) => ({
				...prev,
				specifications: {
					...prev.specifications,
					dimensions: {
						...prev.specifications.dimensions,
						[dimensionName]: value,
					},
				},
			}))
		} else if (name.startsWith('specifications.')) {
			const specName = name.split('.')[1]
			setFormData((prev) => ({
				...prev,
				specifications: {
					...prev.specifications,
					[specName]: value,
				},
			}))
		} else if (name.startsWith('pricing.')) {
			const pricingName = name.split('.')[1]
			setFormData((prev) => ({
				...prev,
				pricing: {
					...prev.pricing,
					[pricingName]: value,
				},
			}))
		} else if (name.startsWith('warranty.')) {
			const warrantyName = name.split('.')[1]
			setFormData((prev) => ({
				...prev,
				warranty: {
					...prev.warranty,
					[warrantyName]: value,
				},
			}))
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}))
		}

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: '' }))
		}
	}

	const validateForm = () => {
		const newErrors: Record<string, string> = {}

		if (!formData.catalogId) {
			newErrors.catalogId = 'Catalog is required'
		}
		if (!formData.skuCode.trim()) {
			newErrors.skuCode = 'SKU code is required'
		}
		if (!formData.name.trim()) {
			newErrors.name = 'Name is required'
		}
		if (!formData.modelName.trim()) {
			newErrors.modelName = 'Model is required'
		}
		if (!formData.description.trim()) {
			newErrors.description = 'Description is required'
		}
		if (!formData.manufacturer.trim()) {
			newErrors.manufacturer = 'Manufacturer is required'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		const submitData: Partial<ISKU> = {
			...formData,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			catalogId: formData.catalogId as any,
			specifications: {
				...formData.specifications,
				networkPorts: formData.specifications.networkPorts ? Number(formData.specifications.networkPorts) : undefined,
				dimensions: {
					height: formData.specifications.dimensions.height ? Number(formData.specifications.dimensions.height) : undefined,
					width: formData.specifications.dimensions.width ? Number(formData.specifications.dimensions.width) : undefined,
					depth: formData.specifications.dimensions.depth ? Number(formData.specifications.dimensions.depth) : undefined,
					weight: formData.specifications.dimensions.weight ? Number(formData.specifications.dimensions.weight) : undefined,
				},
				supportedOS: formData.specifications.supportedOS
					? formData.specifications.supportedOS.split(',').map((os) => os.trim()).filter(Boolean)
					: [],
			},
			pricing: {
				...formData.pricing,
				msrp: formData.pricing.msrp ? Number(formData.pricing.msrp) : undefined,
				effectiveDate: new Date(formData.pricing.effectiveDate),
				endDate: formData.pricing.endDate ? new Date(formData.pricing.endDate) : undefined,
			},
			warranty: {
				...formData.warranty,
				standard: Number(formData.warranty.standard),
				extended: formData.warranty.extended ? Number(formData.warranty.extended) : undefined,
			},
		}

		onSubmit(submitData)
	}

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900">
					{sku ? 'Edit SKU' : 'Create New SKU'}
				</h2>
			</div>

			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Basic Information */}
				<div>
					<h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label htmlFor="catalogId" className="block text-sm font-medium text-gray-700 mb-2">
								Catalog *
							</label>
							<select
								id="catalogId"
								name="catalogId"
								value={formData.catalogId}
								onChange={handleChange}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors.catalogId ? 'border-red-500' : 'border-gray-300'
								}`}
							>
								<option value="">Select a catalog</option>
								{catalogs.map((catalog) => (
									<option key={String(catalog._id)} value={String(catalog._id)}>
										{catalog.name} ({catalog.category})
									</option>
								))}
							</select>
							{errors.catalogId && <p className="mt-1 text-sm text-red-600">{errors.catalogId}</p>}
						</div>

						<div>
							<label htmlFor="skuCode" className="block text-sm font-medium text-gray-700 mb-2">
								SKU Code *
							</label>
							<input
								type="text"
								id="skuCode"
								name="skuCode"
								value={formData.skuCode}
								onChange={handleChange}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors.skuCode ? 'border-red-500' : 'border-gray-300'
								}`}
							/>
							{errors.skuCode && <p className="mt-1 text-sm text-red-600">{errors.skuCode}</p>}
						</div>

						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
								Name *
							</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors.name ? 'border-red-500' : 'border-gray-300'
								}`}
							/>
							{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
						</div>

						<div>
							<label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-2">
								Model *
							</label>
							<input
								type="text"
								id="modelName"
								name="modelName"
								value={formData.modelName}
								onChange={handleChange}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors.modelName ? 'border-red-500' : 'border-gray-300'
								}`}
							/>
							{errors.modelName && <p className="mt-1 text-sm text-red-600">{errors.modelName}</p>}
						</div>

						<div>
							<label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-2">
								Manufacturer *
							</label>
							<input
								type="text"
								id="manufacturer"
								name="manufacturer"
								value={formData.manufacturer}
								onChange={handleChange}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors.manufacturer ? 'border-red-500' : 'border-gray-300'
								}`}
							/>
							{errors.manufacturer && <p className="mt-1 text-sm text-red-600">{errors.manufacturer}</p>}
						</div>

						<div>
							<label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
								Status
							</label>
							<select
								id="status"
								name="status"
								value={formData.status}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								{statuses.map((status) => (
									<option key={status} value={status}>
										{status.charAt(0).toUpperCase() + status.slice(1)}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="mt-4">
						<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
							Description *
						</label>
						<textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							rows={3}
							className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
								errors.description ? 'border-red-500' : 'border-gray-300'
							}`}
						/>
						{errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
					</div>
				</div>

				{/* Specifications */}
				<div>
					<h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label htmlFor="specifications.cpu" className="block text-sm font-medium text-gray-700 mb-2">
								CPU
							</label>
							<input
								type="text"
								id="specifications.cpu"
								name="specifications.cpu"
								value={formData.specifications.cpu}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="specifications.memory" className="block text-sm font-medium text-gray-700 mb-2">
								Memory
							</label>
							<input
								type="text"
								id="specifications.memory"
								name="specifications.memory"
								value={formData.specifications.memory}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="specifications.storage" className="block text-sm font-medium text-gray-700 mb-2">
								Storage
							</label>
							<input
								type="text"
								id="specifications.storage"
								name="specifications.storage"
								value={formData.specifications.storage}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="specifications.networkPorts" className="block text-sm font-medium text-gray-700 mb-2">
								Network Ports
							</label>
							<input
								type="number"
								id="specifications.networkPorts"
								name="specifications.networkPorts"
								value={formData.specifications.networkPorts}
								onChange={handleChange}
								min="0"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="specifications.powerSupply" className="block text-sm font-medium text-gray-700 mb-2">
								Power Supply
							</label>
							<input
								type="text"
								id="specifications.powerSupply"
								name="specifications.powerSupply"
								value={formData.specifications.powerSupply}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="specifications.operatingSystem" className="block text-sm font-medium text-gray-700 mb-2">
								Operating System
							</label>
							<input
								type="text"
								id="specifications.operatingSystem"
								name="specifications.operatingSystem"
								value={formData.specifications.operatingSystem}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>

					<div className="mt-4">
						<label htmlFor="specifications.supportedOS" className="block text-sm font-medium text-gray-700 mb-2">
							Supported OS (comma-separated)
						</label>
						<input
							type="text"
							id="specifications.supportedOS"
							name="specifications.supportedOS"
							value={formData.specifications.supportedOS}
							onChange={handleChange}
							placeholder="e.g., Windows Server, Linux, VMware vSphere"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>

					{/* Dimensions */}
					<div className="mt-6">
						<h4 className="text-md font-medium text-gray-900 mb-4">Dimensions</h4>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div>
								<label htmlFor="specifications.dimensions.height" className="block text-sm font-medium text-gray-700 mb-2">
									Height
								</label>
								<input
									type="number"
									id="specifications.dimensions.height"
									name="specifications.dimensions.height"
									value={formData.specifications.dimensions.height}
									onChange={handleChange}
									min="0"
									step="0.1"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
							<div>
								<label htmlFor="specifications.dimensions.width" className="block text-sm font-medium text-gray-700 mb-2">
									Width
								</label>
								<input
									type="number"
									id="specifications.dimensions.width"
									name="specifications.dimensions.width"
									value={formData.specifications.dimensions.width}
									onChange={handleChange}
									min="0"
									step="0.1"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
							<div>
								<label htmlFor="specifications.dimensions.depth" className="block text-sm font-medium text-gray-700 mb-2">
									Depth
								</label>
								<input
									type="number"
									id="specifications.dimensions.depth"
									name="specifications.dimensions.depth"
									value={formData.specifications.dimensions.depth}
									onChange={handleChange}
									min="0"
									step="0.1"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
							<div>
								<label htmlFor="specifications.dimensions.weight" className="block text-sm font-medium text-gray-700 mb-2">
									Weight
								</label>
								<input
									type="number"
									id="specifications.dimensions.weight"
									name="specifications.dimensions.weight"
									value={formData.specifications.dimensions.weight}
									onChange={handleChange}
									min="0"
									step="0.1"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Pricing */}
				<div>
					<h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label htmlFor="pricing.msrp" className="block text-sm font-medium text-gray-700 mb-2">
								MSRP
							</label>
							<input
								type="number"
								id="pricing.msrp"
								name="pricing.msrp"
								value={formData.pricing.msrp}
								onChange={handleChange}
								min="0"
								step="0.01"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="pricing.currency" className="block text-sm font-medium text-gray-700 mb-2">
								Currency
							</label>
							<input
								type="text"
								id="pricing.currency"
								name="pricing.currency"
								value={formData.pricing.currency}
								onChange={handleChange}
								maxLength={3}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="pricing.effectiveDate" className="block text-sm font-medium text-gray-700 mb-2">
								Effective Date
							</label>
							<input
								type="date"
								id="pricing.effectiveDate"
								name="pricing.effectiveDate"
								value={formData.pricing.effectiveDate}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="pricing.endDate" className="block text-sm font-medium text-gray-700 mb-2">
								End Date (Optional)
							</label>
							<input
								type="date"
								id="pricing.endDate"
								name="pricing.endDate"
								value={formData.pricing.endDate}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>
				</div>

				{/* Warranty */}
				<div>
					<h3 className="text-lg font-medium text-gray-900 mb-4">Warranty</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div>
							<label htmlFor="warranty.standard" className="block text-sm font-medium text-gray-700 mb-2">
								Standard Warranty (Years)
							</label>
							<input
								type="number"
								id="warranty.standard"
								name="warranty.standard"
								value={formData.warranty.standard}
								onChange={handleChange}
								min="0"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="warranty.extended" className="block text-sm font-medium text-gray-700 mb-2">
								Extended Warranty (Years)
							</label>
							<input
								type="number"
								id="warranty.extended"
								name="warranty.extended"
								value={formData.warranty.extended}
								onChange={handleChange}
								min="0"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="warranty.support" className="block text-sm font-medium text-gray-700 mb-2">
								Support Level
							</label>
							<input
								type="text"
								id="warranty.support"
								name="warranty.support"
								value={formData.warranty.support}
								onChange={handleChange}
								placeholder="e.g., Next Business Day"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>
				</div>

				{/* Form Actions */}
				<div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						{sku ? 'Update SKU' : 'Create SKU'}
					</button>
				</div>
			</form>
		</div>
	)
}