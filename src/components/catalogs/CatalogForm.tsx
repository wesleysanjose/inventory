import { useState } from 'react'
import { ICatalog } from '@/lib/db/models/Catalog'

interface CatalogFormProps {
	catalog?: ICatalog | null
	onSubmit: (catalogData: Partial<ICatalog>) => void
	onCancel: () => void
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

export default function CatalogForm({ catalog, onSubmit, onCancel }: CatalogFormProps) {
	const [formData, setFormData] = useState({
		name: catalog?.name || '',
		description: catalog?.description || '',
		category: catalog?.category || 'server',
		manufacturer: catalog?.manufacturer || '',
		status: catalog?.status || 'active',
		attributes: {
			formFactor: catalog?.attributes?.formFactor || '',
			powerConsumption: catalog?.attributes?.powerConsumption || '',
			rackUnits: catalog?.attributes?.rackUnits || '',
			warranty: catalog?.attributes?.warranty || '',
			certifications: catalog?.attributes?.certifications?.join(', ') || '',
		},
	})

	const [errors, setErrors] = useState<Record<string, string>>({})

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target

		if (name.startsWith('attributes.')) {
			const attributeName = name.split('.')[1]
			setFormData((prev) => ({
				...prev,
				attributes: {
					...prev.attributes,
					[attributeName]: value,
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

		if (!formData.name.trim()) {
			newErrors.name = 'Name is required'
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

		const submitData = {
			...formData,
			attributes: {
				...formData.attributes,
				powerConsumption: formData.attributes.powerConsumption ? Number(formData.attributes.powerConsumption) : undefined,
				rackUnits: formData.attributes.rackUnits ? Number(formData.attributes.rackUnits) : undefined,
				certifications: formData.attributes.certifications
					? formData.attributes.certifications.split(',').map((cert) => cert.trim()).filter(Boolean)
					: [],
			},
		}

		onSubmit(submitData)
	}

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900">
					{catalog ? 'Edit Catalog' : 'Create New Catalog'}
				</h2>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Basic Information */}
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
						<label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
							Category *
						</label>
						<select
							id="category"
							name="category"
							value={formData.category}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						>
							{categories.map((category) => (
								<option key={category} value={category}>
									{category.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
								</option>
							))}
						</select>
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

				<div>
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

				{/* Attributes */}
				<div>
					<h3 className="text-lg font-medium text-gray-900 mb-4">Attributes</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label htmlFor="attributes.formFactor" className="block text-sm font-medium text-gray-700 mb-2">
								Form Factor
							</label>
							<input
								type="text"
								id="attributes.formFactor"
								name="attributes.formFactor"
								value={formData.attributes.formFactor}
								onChange={handleChange}
								placeholder="e.g., Rack Mount, Tower"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="attributes.powerConsumption" className="block text-sm font-medium text-gray-700 mb-2">
								Power Consumption (Watts)
							</label>
							<input
								type="number"
								id="attributes.powerConsumption"
								name="attributes.powerConsumption"
								value={formData.attributes.powerConsumption}
								onChange={handleChange}
								min="0"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="attributes.rackUnits" className="block text-sm font-medium text-gray-700 mb-2">
								Rack Units (U)
							</label>
							<input
								type="number"
								id="attributes.rackUnits"
								name="attributes.rackUnits"
								value={formData.attributes.rackUnits}
								onChange={handleChange}
								min="0"
								step="0.5"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label htmlFor="attributes.warranty" className="block text-sm font-medium text-gray-700 mb-2">
								Standard Warranty
							</label>
							<input
								type="text"
								id="attributes.warranty"
								name="attributes.warranty"
								value={formData.attributes.warranty}
								onChange={handleChange}
								placeholder="e.g., 3 years"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
					</div>

					<div className="mt-4">
						<label htmlFor="attributes.certifications" className="block text-sm font-medium text-gray-700 mb-2">
							Certifications (comma-separated)
						</label>
						<input
							type="text"
							id="attributes.certifications"
							name="attributes.certifications"
							value={formData.attributes.certifications}
							onChange={handleChange}
							placeholder="e.g., ENERGY STAR, EPEAT, ISO 9001"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
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
						{catalog ? 'Update Catalog' : 'Create Catalog'}
					</button>
				</div>
			</form>
		</div>
	)
}