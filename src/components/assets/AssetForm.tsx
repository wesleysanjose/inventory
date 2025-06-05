import { useState } from 'react'
import { IAsset } from '@/lib/db/models/Asset'
import { ISKU } from '@/lib/db/models/SKU'

interface AssetFormProps {
	asset?: IAsset | null
	skus: ISKU[]
	onSubmit: (assetData: Partial<IAsset>) => void
	onCancel: () => void
}

const statuses = ['active', 'inactive', 'maintenance', 'retired', 'disposed']
const environments = ['production', 'staging', 'development', 'testing', 'backup']
const warrantyTypes = ['basic', 'premium', 'onsite', 'next-business-day']

export default function AssetForm({ asset, skus, onSubmit, onCancel }: AssetFormProps) {
	const [formData, setFormData] = useState({
		skuId: asset?.skuId ? String(asset.skuId) : '',
		assetTag: asset?.assetTag || '',
		serialNumber: asset?.serialNumber || '',
		name: asset?.name || '',
		status: asset?.status || 'active',
		location: {
			datacenter: asset?.location?.datacenter || '',
			rack: asset?.location?.rack || '',
			rackUnit: asset?.location?.rackUnit || '',
			floor: asset?.location?.floor || '',
			building: asset?.location?.building || '',
			city: asset?.location?.city || '',
			country: asset?.location?.country || '',
		},
		financial: {
			capex: {
				purchasePrice: asset?.financial?.capex?.purchasePrice || '',
				currency: asset?.financial?.capex?.currency || 'USD',
				purchaseDate: asset?.financial?.capex?.purchaseDate
					? new Date(asset.financial.capex.purchaseDate).toISOString().split('T')[0]
					: '',
				vendor: asset?.financial?.capex?.vendor || '',
				poNumber: asset?.financial?.capex?.poNumber || '',
				depreciationPeriodYears: asset?.financial?.capex?.depreciationPeriodYears || 4,
			},
			warranty: {
				cost: asset?.financial?.opex?.warranty?.[0]?.cost || '',
				currency: asset?.financial?.opex?.warranty?.[0]?.currency || 'USD',
				startDate: asset?.financial?.opex?.warranty?.[0]?.startDate
					? new Date(asset.financial.opex.warranty[0].startDate).toISOString().split('T')[0]
					: '',
				endDate: asset?.financial?.opex?.warranty?.[0]?.endDate
					? new Date(asset.financial.opex.warranty[0].endDate).toISOString().split('T')[0]
					: '',
				vendor: asset?.financial?.opex?.warranty?.[0]?.vendor || '',
				type: asset?.financial?.opex?.warranty?.[0]?.type || 'premium',
			},
		},
		deployment: {
			goLiveDate: asset?.deployment?.goLiveDate
				? new Date(asset.deployment.goLiveDate).toISOString().split('T')[0]
				: '',
			installationDate: asset?.deployment?.installationDate
				? new Date(asset.deployment.installationDate).toISOString().split('T')[0]
				: '',
			commissioningDate: asset?.deployment?.commissioningDate
				? new Date(asset.deployment.commissioningDate).toISOString().split('T')[0]
				: '',
			assignedTo: asset?.deployment?.assignedTo || '',
			purpose: asset?.deployment?.purpose || '',
			environment: asset?.deployment?.environment || 'production',
		},
		specifications: {
			hostname: asset?.specifications?.hostname || '',
			ipAddresses: asset?.specifications?.ipAddresses?.join(', ') || '',
			macAddresses: asset?.specifications?.macAddresses?.join(', ') || '',
			configuredMemory: asset?.specifications?.configuredMemory || '',
			configuredStorage: asset?.specifications?.configuredStorage || '',
			installedOS: asset?.specifications?.installedOS || '',
		},
	})

	const [errors, setErrors] = useState<Record<string, string>>({})

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target

		if (name.startsWith('location.')) {
			const locationField = name.split('.')[1]
			setFormData((prev) => ({
				...prev,
				location: {
					...prev.location,
					[locationField]: value,
				},
			}))
		} else if (name.startsWith('financial.capex.')) {
			const capexField = name.split('.')[2]
			setFormData((prev) => ({
				...prev,
				financial: {
					...prev.financial,
					capex: {
						...prev.financial.capex,
						[capexField]: value,
					},
				},
			}))
		} else if (name.startsWith('financial.warranty.')) {
			const warrantyField = name.split('.')[2]
			setFormData((prev) => ({
				...prev,
				financial: {
					...prev.financial,
					warranty: {
						...prev.financial.warranty,
						[warrantyField]: value,
					},
				},
			}))
		} else if (name.startsWith('deployment.')) {
			const deploymentField = name.split('.')[1]
			setFormData((prev) => ({
				...prev,
				deployment: {
					...prev.deployment,
					[deploymentField]: value,
				},
			}))
		} else if (name.startsWith('specifications.')) {
			const specField = name.split('.')[1]
			setFormData((prev) => ({
				...prev,
				specifications: {
					...prev.specifications,
					[specField]: value,
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

		if (!formData.skuId) {
			newErrors.skuId = 'SKU is required'
		}
		if (!formData.assetTag.trim()) {
			newErrors.assetTag = 'Asset tag is required'
		}
		if (!formData.serialNumber.trim()) {
			newErrors.serialNumber = 'Serial number is required'
		}
		if (!formData.name.trim()) {
			newErrors.name = 'Asset name is required'
		}
		if (!formData.location.datacenter.trim()) {
			newErrors['location.datacenter'] = 'Datacenter is required'
		}
		if (!formData.location.city.trim()) {
			newErrors['location.city'] = 'City is required'
		}
		if (!formData.location.country.trim()) {
			newErrors['location.country'] = 'Country is required'
		}
		if (!formData.financial.capex.purchasePrice) {
			newErrors['financial.capex.purchasePrice'] = 'Purchase price is required'
		}
		if (!formData.financial.capex.purchaseDate) {
			newErrors['financial.capex.purchaseDate'] = 'Purchase date is required'
		}
		if (!formData.financial.capex.vendor.trim()) {
			newErrors['financial.capex.vendor'] = 'Vendor is required'
		}
		if (!formData.deployment.goLiveDate) {
			newErrors['deployment.goLiveDate'] = 'Go live date is required'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		const submitData: Partial<IAsset> = {
			...formData,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			skuId: formData.skuId as any,
			financial: {
				capex: {
					...formData.financial.capex,
					purchasePrice: Number(formData.financial.capex.purchasePrice),
					purchaseDate: new Date(formData.financial.capex.purchaseDate),
					depreciationPeriodYears: Number(formData.financial.capex.depreciationPeriodYears),
				},
				opex: {
					warranty: formData.financial.warranty.cost ? [{
						cost: Number(formData.financial.warranty.cost),
						currency: formData.financial.warranty.currency,
						startDate: new Date(formData.financial.warranty.startDate),
						endDate: new Date(formData.financial.warranty.endDate),
						vendor: formData.financial.warranty.vendor,
						type: formData.financial.warranty.type as 'basic' | 'premium' | 'onsite' | 'next-business-day',
					}] : [],
					maintenance: [],
				},
			},
			deployment: {
				...formData.deployment,
				goLiveDate: new Date(formData.deployment.goLiveDate),
				installationDate: formData.deployment.installationDate ? new Date(formData.deployment.installationDate) : undefined,
				commissioningDate: formData.deployment.commissioningDate ? new Date(formData.deployment.commissioningDate) : undefined,
			},
			specifications: {
				...formData.specifications,
				ipAddresses: formData.specifications.ipAddresses
					? formData.specifications.ipAddresses.split(',').map((ip) => ip.trim()).filter(Boolean)
					: [],
				macAddresses: formData.specifications.macAddresses
					? formData.specifications.macAddresses.split(',').map((mac) => mac.trim().toUpperCase()).filter(Boolean)
					: [],
			},
		}

		onSubmit(submitData)
	}

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900">
					{asset ? 'Edit Asset' : 'Create New Asset'}
				</h2>
			</div>

			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Basic Information */}
				<div>
					<h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label htmlFor="skuId" className="block text-sm font-medium text-gray-700 mb-2">
								SKU *
							</label>
							<select
								id="skuId"
								name="skuId"
								value={formData.skuId}
								onChange={handleChange}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors.skuId ? 'border-red-500' : 'border-gray-300'
								}`}
							>
								<option value="">Select a SKU</option>
								{skus.map((sku) => (
									<option key={String(sku._id)} value={String(sku._id)}>
										{sku.name} ({sku.skuCode})
									</option>
								))}
							</select>
							{errors.skuId && <p className="mt-1 text-sm text-red-600">{errors.skuId}</p>}
						</div>

						<div>
							<label htmlFor="assetTag" className="block text-sm font-medium text-gray-700 mb-2">
								Asset Tag *
							</label>
							<input
								type="text"
								id="assetTag"
								name="assetTag"
								value={formData.assetTag}
								onChange={handleChange}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors.assetTag ? 'border-red-500' : 'border-gray-300'
								}`}
							/>
							{errors.assetTag && <p className="mt-1 text-sm text-red-600">{errors.assetTag}</p>}
						</div>

						<div>
							<label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-2">
								Serial Number *
							</label>
							<input
								type="text"
								id="serialNumber"
								name="serialNumber"
								value={formData.serialNumber}
								onChange={handleChange}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors.serialNumber ? 'border-red-500' : 'border-gray-300'
								}`}
							/>
							{errors.serialNumber && <p className="mt-1 text-sm text-red-600">{errors.serialNumber}</p>}
						</div>

						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
								Asset Name *
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
				</div>

				{/* Location */}
				<div>
					<h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label htmlFor="location.datacenter" className="block text-sm font-medium text-gray-700 mb-2">
								Datacenter *
							</label>
							<input
								type="text"
								id="location.datacenter"
								name="location.datacenter"
								value={formData.location.datacenter}
								onChange={handleChange}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors['location.datacenter'] ? 'border-red-500' : 'border-gray-300'
								}`}
							/>
							{errors['location.datacenter'] && <p className="mt-1 text-sm text-red-600">{errors['location.datacenter']}</p>}
						</div>

						<div>
							<label htmlFor="location.rack" className="block text-sm font-medium text-gray-700 mb-2">
								Rack
							</label>
							<input
								type="text"
								id="location.rack"
								name="location.rack"
								value={formData.location.rack}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="location.rackUnit" className="block text-sm font-medium text-gray-700 mb-2">
								Rack Unit
							</label>
							<input
								type="text"
								id="location.rackUnit"
								name="location.rackUnit"
								value={formData.location.rackUnit}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="location.floor" className="block text-sm font-medium text-gray-700 mb-2">
								Floor
							</label>
							<input
								type="text"
								id="location.floor"
								name="location.floor"
								value={formData.location.floor}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="location.building" className="block text-sm font-medium text-gray-700 mb-2">
								Building
							</label>
							<input
								type="text"
								id="location.building"
								name="location.building"
								value={formData.location.building}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="location.city" className="block text-sm font-medium text-gray-700 mb-2">
								City *
							</label>
							<input
								type="text"
								id="location.city"
								name="location.city"
								value={formData.location.city}
								onChange={handleChange}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors['location.city'] ? 'border-red-500' : 'border-gray-300'
								}`}
							/>
							{errors['location.city'] && <p className="mt-1 text-sm text-red-600">{errors['location.city']}</p>}
						</div>

						<div>
							<label htmlFor="location.country" className="block text-sm font-medium text-gray-700 mb-2">
								Country *
							</label>
							<input
								type="text"
								id="location.country"
								name="location.country"
								value={formData.location.country}
								onChange={handleChange}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors['location.country'] ? 'border-red-500' : 'border-gray-300'
								}`}
							/>
							{errors['location.country'] && <p className="mt-1 text-sm text-red-600">{errors['location.country']}</p>}
						</div>
					</div>
				</div>

				{/* Financial Information */}
				<div>
					<h3 className="text-lg font-medium text-gray-900 mb-4">Financial Information</h3>
					
					{/* CAPEX */}
					<div className="mb-6">
						<h4 className="text-md font-medium text-gray-800 mb-3">Capital Expenditure (CAPEX)</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label htmlFor="financial.capex.purchasePrice" className="block text-sm font-medium text-gray-700 mb-2">
									Purchase Price *
								</label>
								<input
									type="number"
									id="financial.capex.purchasePrice"
									name="financial.capex.purchasePrice"
									value={formData.financial.capex.purchasePrice}
									onChange={handleChange}
									min="0"
									step="0.01"
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
										errors['financial.capex.purchasePrice'] ? 'border-red-500' : 'border-gray-300'
									}`}
								/>
								{errors['financial.capex.purchasePrice'] && <p className="mt-1 text-sm text-red-600">{errors['financial.capex.purchasePrice']}</p>}
							</div>

							<div>
								<label htmlFor="financial.capex.currency" className="block text-sm font-medium text-gray-700 mb-2">
									Currency
								</label>
								<input
									type="text"
									id="financial.capex.currency"
									name="financial.capex.currency"
									value={formData.financial.capex.currency}
									onChange={handleChange}
									maxLength={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>

							<div>
								<label htmlFor="financial.capex.purchaseDate" className="block text-sm font-medium text-gray-700 mb-2">
									Purchase Date *
								</label>
								<input
									type="date"
									id="financial.capex.purchaseDate"
									name="financial.capex.purchaseDate"
									value={formData.financial.capex.purchaseDate}
									onChange={handleChange}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
										errors['financial.capex.purchaseDate'] ? 'border-red-500' : 'border-gray-300'
									}`}
								/>
								{errors['financial.capex.purchaseDate'] && <p className="mt-1 text-sm text-red-600">{errors['financial.capex.purchaseDate']}</p>}
							</div>

							<div>
								<label htmlFor="financial.capex.vendor" className="block text-sm font-medium text-gray-700 mb-2">
									Vendor *
								</label>
								<input
									type="text"
									id="financial.capex.vendor"
									name="financial.capex.vendor"
									value={formData.financial.capex.vendor}
									onChange={handleChange}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
										errors['financial.capex.vendor'] ? 'border-red-500' : 'border-gray-300'
									}`}
								/>
								{errors['financial.capex.vendor'] && <p className="mt-1 text-sm text-red-600">{errors['financial.capex.vendor']}</p>}
							</div>

							<div>
								<label htmlFor="financial.capex.poNumber" className="block text-sm font-medium text-gray-700 mb-2">
									PO Number
								</label>
								<input
									type="text"
									id="financial.capex.poNumber"
									name="financial.capex.poNumber"
									value={formData.financial.capex.poNumber}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>

							<div>
								<label htmlFor="financial.capex.depreciationPeriodYears" className="block text-sm font-medium text-gray-700 mb-2">
									Depreciation Period (Years)
								</label>
								<input
									type="number"
									id="financial.capex.depreciationPeriodYears"
									name="financial.capex.depreciationPeriodYears"
									value={formData.financial.capex.depreciationPeriodYears}
									onChange={handleChange}
									min="1"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
						</div>
					</div>

					{/* Warranty */}
					<div>
						<h4 className="text-md font-medium text-gray-800 mb-3">Warranty (OPEX)</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label htmlFor="financial.warranty.cost" className="block text-sm font-medium text-gray-700 mb-2">
									Annual Warranty Cost
								</label>
								<input
									type="number"
									id="financial.warranty.cost"
									name="financial.warranty.cost"
									value={formData.financial.warranty.cost}
									onChange={handleChange}
									min="0"
									step="0.01"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>

							<div>
								<label htmlFor="financial.warranty.type" className="block text-sm font-medium text-gray-700 mb-2">
									Warranty Type
								</label>
								<select
									id="financial.warranty.type"
									name="financial.warranty.type"
									value={formData.financial.warranty.type}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								>
									{warrantyTypes.map((type) => (
										<option key={type} value={type}>
											{type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
										</option>
									))}
								</select>
							</div>

							<div>
								<label htmlFor="financial.warranty.startDate" className="block text-sm font-medium text-gray-700 mb-2">
									Warranty Start Date
								</label>
								<input
									type="date"
									id="financial.warranty.startDate"
									name="financial.warranty.startDate"
									value={formData.financial.warranty.startDate}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>

							<div>
								<label htmlFor="financial.warranty.endDate" className="block text-sm font-medium text-gray-700 mb-2">
									Warranty End Date
								</label>
								<input
									type="date"
									id="financial.warranty.endDate"
									name="financial.warranty.endDate"
									value={formData.financial.warranty.endDate}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>

							<div>
								<label htmlFor="financial.warranty.vendor" className="block text-sm font-medium text-gray-700 mb-2">
									Warranty Vendor
								</label>
								<input
									type="text"
									id="financial.warranty.vendor"
									name="financial.warranty.vendor"
									value={formData.financial.warranty.vendor}
									onChange={handleChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Deployment */}
				<div>
					<h3 className="text-lg font-medium text-gray-900 mb-4">Deployment Information</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label htmlFor="deployment.goLiveDate" className="block text-sm font-medium text-gray-700 mb-2">
								Go Live Date *
							</label>
							<input
								type="date"
								id="deployment.goLiveDate"
								name="deployment.goLiveDate"
								value={formData.deployment.goLiveDate}
								onChange={handleChange}
								className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
									errors['deployment.goLiveDate'] ? 'border-red-500' : 'border-gray-300'
								}`}
							/>
							{errors['deployment.goLiveDate'] && <p className="mt-1 text-sm text-red-600">{errors['deployment.goLiveDate']}</p>}
						</div>

						<div>
							<label htmlFor="deployment.environment" className="block text-sm font-medium text-gray-700 mb-2">
								Environment
							</label>
							<select
								id="deployment.environment"
								name="deployment.environment"
								value={formData.deployment.environment}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								{environments.map((env) => (
									<option key={env} value={env}>
										{env.charAt(0).toUpperCase() + env.slice(1)}
									</option>
								))}
							</select>
						</div>

						<div>
							<label htmlFor="deployment.installationDate" className="block text-sm font-medium text-gray-700 mb-2">
								Installation Date
							</label>
							<input
								type="date"
								id="deployment.installationDate"
								name="deployment.installationDate"
								value={formData.deployment.installationDate}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="deployment.commissioningDate" className="block text-sm font-medium text-gray-700 mb-2">
								Commissioning Date
							</label>
							<input
								type="date"
								id="deployment.commissioningDate"
								name="deployment.commissioningDate"
								value={formData.deployment.commissioningDate}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="deployment.assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
								Assigned To
							</label>
							<input
								type="text"
								id="deployment.assignedTo"
								name="deployment.assignedTo"
								value={formData.deployment.assignedTo}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="deployment.purpose" className="block text-sm font-medium text-gray-700 mb-2">
								Purpose
							</label>
							<input
								type="text"
								id="deployment.purpose"
								name="deployment.purpose"
								value={formData.deployment.purpose}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>
				</div>

				{/* Specifications */}
				<div>
					<h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label htmlFor="specifications.hostname" className="block text-sm font-medium text-gray-700 mb-2">
								Hostname
							</label>
							<input
								type="text"
								id="specifications.hostname"
								name="specifications.hostname"
								value={formData.specifications.hostname}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="specifications.installedOS" className="block text-sm font-medium text-gray-700 mb-2">
								Installed OS
							</label>
							<input
								type="text"
								id="specifications.installedOS"
								name="specifications.installedOS"
								value={formData.specifications.installedOS}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="specifications.configuredMemory" className="block text-sm font-medium text-gray-700 mb-2">
								Configured Memory
							</label>
							<input
								type="text"
								id="specifications.configuredMemory"
								name="specifications.configuredMemory"
								value={formData.specifications.configuredMemory}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="specifications.configuredStorage" className="block text-sm font-medium text-gray-700 mb-2">
								Configured Storage
							</label>
							<input
								type="text"
								id="specifications.configuredStorage"
								name="specifications.configuredStorage"
								value={formData.specifications.configuredStorage}
								onChange={handleChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="specifications.ipAddresses" className="block text-sm font-medium text-gray-700 mb-2">
								IP Addresses (comma-separated)
							</label>
							<input
								type="text"
								id="specifications.ipAddresses"
								name="specifications.ipAddresses"
								value={formData.specifications.ipAddresses}
								onChange={handleChange}
								placeholder="e.g., 10.0.1.100, 192.168.1.50"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="specifications.macAddresses" className="block text-sm font-medium text-gray-700 mb-2">
								MAC Addresses (comma-separated)
							</label>
							<input
								type="text"
								id="specifications.macAddresses"
								name="specifications.macAddresses"
								value={formData.specifications.macAddresses}
								onChange={handleChange}
								placeholder="e.g., 00:1B:44:11:3A:B7, 00:1B:44:11:3A:B8"
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
						{asset ? 'Update Asset' : 'Create Asset'}
					</button>
				</div>
			</form>
		</div>
	)
}