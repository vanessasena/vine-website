'use client';

import Image from 'next/image';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getLocalISODate } from '@/lib/utils';

type HowFoundOption = 'friend' | 'google' | 'social' | 'passing' | 'other' | '';

interface VisitorForm {
	visit_date: string;
	name: string;
	phone: string;
	how_found: HowFoundOption;
	how_found_details: string;
}

interface ChildForm {
	name: string;
	date_of_birth: string;
	allergies: string;
	special_needs: string;
	emergency_contact_name: string;
	emergency_contact_phone: string;
	photo_permission: boolean;
}

interface VisitorErrors {
	visit_date?: string;
	name?: string;
	phone?: string;
	how_found?: string;
	how_found_details?: string;
}

const phoneRegex = /^(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}$/;

// Helper mandated by requirements: calculate age from YYYY-MM-DD
function calculateAge(dateStr: string): number {
	if (!dateStr) return -1;
	const [year, month, day] = dateStr.split('-').map(Number);
	const dob = new Date(year, (month || 1) - 1, day || 1);
	const today = new Date();
	let age = today.getFullYear() - dob.getFullYear();
	const monthDiff = today.getMonth() - dob.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
		age -= 1;
	}
	return age;
}

export default function RegisterVisitorClient() {
	const t = useTranslations('visitorRegistration');

	const [step, setStep] = useState<1 | 2>(1);
	const [hasChildren, setHasChildren] = useState<boolean | null>(null);
	const [visitor, setVisitor] = useState<VisitorForm>({
		visit_date: getLocalISODate(),
		name: '',
		phone: '',
		how_found: '',
		how_found_details: '',
	});
	const [childForm, setChildForm] = useState<ChildForm>({
		name: '',
		date_of_birth: '',
		allergies: '',
		special_needs: '',
		emergency_contact_name: '',
		emergency_contact_phone: '',
		photo_permission: true,
	});
	const [children, setChildren] = useState<ChildForm[]>([]);
	const [visitorErrors, setVisitorErrors] = useState<VisitorErrors>({});
	const [childError, setChildError] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [formSuccess, setFormSuccess] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	// Refs for form fields to handle focus on error
	const nameInputRef = useRef<HTMLInputElement>(null);
	const phoneInputRef = useRef<HTMLInputElement>(null);
	const howFoundSelectRef = useRef<HTMLSelectElement>(null);
	const howFoundDetailsRef = useRef<HTMLInputElement>(null);
	const childNameRef = useRef<HTMLInputElement>(null);

	// Effect to handle focus on validation errors
	useEffect(() => {
		if (Object.keys(visitorErrors).length > 0) {
			if (visitorErrors.name && nameInputRef.current) {
				nameInputRef.current.focus();
				nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
			} else if (visitorErrors.phone && phoneInputRef.current) {
				phoneInputRef.current.focus();
				phoneInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
			} else if (visitorErrors.how_found && howFoundSelectRef.current) {
				howFoundSelectRef.current.focus();
				howFoundSelectRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
			} else if (visitorErrors.how_found_details && howFoundDetailsRef.current) {
				howFoundDetailsRef.current.focus();
				howFoundDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	}, [visitorErrors]);

	// Effect to handle focus on child validation errors
	useEffect(() => {
		if (childError && childNameRef.current) {
			childNameRef.current.focus();
			childNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}, [childError]);

	// Effect to clear success message after 3 seconds
	useEffect(() => {
		if (formSuccess) {
			const timer = setTimeout(() => {
				setFormSuccess(null);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [formSuccess]);

	const howFoundOptions = useMemo(
		() => [
			{ value: 'friend', label: t('howFoundOptions.friend') },
			{ value: 'google', label: t('howFoundOptions.google') },
			{ value: 'social', label: t('howFoundOptions.social') },
			{ value: 'passing', label: t('howFoundOptions.passing') },
			{ value: 'other', label: t('howFoundOptions.other') },
		],
		[t]
	);

	const handleVisitorChange = (
		field: keyof VisitorForm,
		value: string
	) => {
		setVisitor((prev) => ({ ...prev, [field]: value }));
		setVisitorErrors((prev) => ({ ...prev, [field]: undefined }));
	};

	const handleChildChange = (
		field: keyof ChildForm,
		value: string | boolean
	) => {
		setChildForm((prev) => ({ ...prev, [field]: value }));
		setChildError(null);
	};

	const validateVisitor = (data: VisitorForm): VisitorErrors => {
		const errors: VisitorErrors = {};

		if (!data.name.trim()) {
			errors.name = t('requiredField');
		}

		if (!data.phone.trim()) {
			errors.phone = t('requiredField');
		} else if (!phoneRegex.test(data.phone.trim())) {
			errors.phone = t('invalidPhone');
		}

		if (!data.how_found) {
			errors.how_found = t('requiredField');
		}

		if (data.how_found === 'other' && !data.how_found_details.trim()) {
			errors.how_found_details = t('otherDetailsRequired');
		}

		if (data.how_found === 'friend' && !data.how_found_details.trim()) {
			errors.how_found_details = t('friendDetailsRequired');
		}

		return errors;
	};

	const validateChild = (data: ChildForm): string | null => {
		if (!data.name.trim()) return t('childValidation.nameRequired');
		if (!data.date_of_birth) return t('childValidation.dobRequired');

		const age = calculateAge(data.date_of_birth);
		if (age < 0) return t('childValidation.futureDob');
		if (age > 12) return t('childValidation.maxAgeExceeded');

		if (
			data.emergency_contact_phone &&
			!phoneRegex.test(data.emergency_contact_phone.trim())
		) {
			return t('childValidation.invalidPhone');
		}

		return null;
	};

	const addChild = () => {
		const validationError = validateChild(childForm);
		if (validationError) {
			setChildError(validationError);
			return;
		}

		setChildren((prev) => [...prev, childForm]);
		setChildForm({
			name: '',
			date_of_birth: '',
			allergies: '',
			special_needs: '',
			emergency_contact_name: '',
			emergency_contact_phone: '',
			photo_permission: true,
		});
		setChildError(null);
	};

	const removeChild = (index: number) => {
		setChildren((prev) => prev.filter((_, i) => i !== index));
	};

	const handleConfirmHasChildren = (value: boolean) => {
		setHasChildren(value);
		setStep(2);
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setFormError(null);
		setFormSuccess(null);

		const visitorValidation = validateVisitor(visitor);
		setVisitorErrors(visitorValidation);

		if (Object.keys(visitorValidation).length > 0) {
			setFormError(t('errorMessage'));
			return;
		}

		if (hasChildren && children.length === 0) {
			setFormError(t('childValidation.nameRequired'));
			return;
		}

		try {
			setSubmitting(true);
			const payload = {
				...visitor,
				how_found_details: visitor.how_found_details.trim() || null,
				children: hasChildren ? children : [],
			};

			const response = await fetch('/api/visitors', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error(t('errorMessage'));
			}

			setFormSuccess(t('successMessage'));
			setFormError(null);
			setChildren([]);
			setVisitorErrors({});
			setVisitor({
				visit_date: getLocalISODate(),
				name: '',
				phone: '',
				how_found: '',
				how_found_details: '',
			});
			setChildForm({
				name: '',
				date_of_birth: '',
				allergies: '',
				special_needs: '',
				emergency_contact_name: '',
				emergency_contact_phone: '',
				photo_permission: true,
			});
			setHasChildren(null);
			setStep(1);
		} catch (error) {
			console.error('Error submitting visitor registration:', error);
			setFormError(t('errorMessage'));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="flex justify-center pt-10">
				<Image
					src="https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/Vine-CHURCH-logo-transparent-2.png"
					alt="Vine Church KWC Logo"
					width={64}
					height={64}
					className="h-20 w-auto"
				/>
			</div>
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
				{/* Success Message */}
				{formSuccess && (
					<div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-md">
						<div className="flex items-center">
							<svg className="w-5 h-5 mr-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
							</svg>
							<span>{formSuccess}</span>
						</div>
					</div>
				)}

				<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
						<div className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 px-6 py-8 text-white">
							<div className="flex items-center justify-center">
								<div className="text-center">
									<p className="text-sm uppercase tracking-wide opacity-80">{t('subtitle')}</p>
									<h1 className="text-3xl sm:text-4xl font-bold mt-2">{t('title')}</h1>
									<p className="mt-3 text-white text-opacity-90 max-w-2xl mx-auto">{t('description')}</p>
								</div>
							</div>
						</div>

						<div className="p-6 sm:p-8">
						{step === 1 && (
							<div className="space-y-6">
								<h2 className="text-xl font-semibold text-gray-900">
									{t('hasChildrenQuestion')}
								</h2>
								<p className="text-gray-600">{t('hasChildrenDescription')}</p>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<button
										type="button"
										onClick={() => handleConfirmHasChildren(true)}
										className="w-full rounded-xl border-2 border-primary-200 bg-primary-50 px-6 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500"
									>
										<div className="text-sm font-semibold text-primary-800">
											{t('yesHasChildren')}
										</div>
										<div className="text-sm text-primary-700 mt-1">{t('maxAge12')}</div>
									</button>

									<button
										type="button"
										onClick={() => handleConfirmHasChildren(false)}
										className="w-full rounded-xl border-2 border-gray-200 px-6 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500"
									>
										<div className="text-sm font-semibold text-gray-900">
											{t('noChildren')}
										</div>
										<div className="text-sm text-gray-600 mt-1">{t('visitorInformation')}</div>
									</button>
								</div>
							</div>
						)}

						{step === 2 && (
							<form onSubmit={handleSubmit} className="space-y-8">
								<div className="flex items-center justify-between">
									<button
										type="button"
										onClick={() => {
											setStep(1);
											setHasChildren(null);
										}}
										className="text-sm text-primary-700 hover:text-primary-900"
									>
										← {t('backButton')}
									</button>
									{hasChildren && (
										<span className="rounded-full bg-primary-50 px-4 py-1 text-xs font-semibold text-primary-700">
											{t('childrenInformation')}
										</span>
									)}
								</div>

								{formError && (
									<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
										{formError}
									</div>
								)}
								{formSuccess && (
									<div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
										{formSuccess}
									</div>
								)}

								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-900">{t('visitorInformation')}</h3>
									<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
										<div>
											<label className="block text-sm font-medium text-gray-700">
												{t('name')}
											</label>
											<input
												ref={nameInputRef}
												type="text"
												value={visitor.name}
												onChange={(e) => handleVisitorChange('name', e.target.value)}
												className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
												required
											/>
											{visitorErrors.name && (
												<p className="mt-1 text-sm text-red-600">{visitorErrors.name}</p>
											)}
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												{t('phone')}
											</label>
											<input
												ref={phoneInputRef}
												type="tel"
												value={visitor.phone}
												onChange={(e) => handleVisitorChange('phone', e.target.value)}
												className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
												required
											/>
											{visitorErrors.phone && (
												<p className="mt-1 text-sm text-red-600">{visitorErrors.phone}</p>
											)}
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												{t('howFound')}
											</label>
											<select
												ref={howFoundSelectRef}
												value={visitor.how_found}
												onChange={(e) => handleVisitorChange('how_found', e.target.value)}
												className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
												required
											>
												<option value="">{t('selectOption')}</option>
												{howFoundOptions.map((option) => (
													<option key={option.value} value={option.value}>
														{option.label}
													</option>
												))}
											</select>
											{visitorErrors.how_found && (
												<p className="mt-1 text-sm text-red-600">{visitorErrors.how_found}</p>
											)}
										</div>
									</div>

									{(visitor.how_found === 'other' || visitor.how_found === 'friend') && (
										<div>
											<label className="block text-sm font-medium text-gray-700">
												{visitor.how_found === 'other' ? t('otherDetails') : t('friendDetails')}
											</label>
											<input
												ref={howFoundDetailsRef}
												type="text"
												value={visitor.how_found_details}
												onChange={(e) => handleVisitorChange('how_found_details', e.target.value)}
												placeholder={
													visitor.how_found === 'other'
														? t('otherDetailsPlaceholder')
														: t('friendDetailsPlaceholder')
												}
												className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
												required
											/>
											{visitorErrors.how_found_details && (
												<p className="mt-1 text-sm text-red-600">{visitorErrors.how_found_details}</p>
											)}
										</div>
									)}
								</div>

								{hasChildren && (
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<h3 className="text-lg font-semibold text-gray-900">{t('childrenInformation')}</h3>
											<span className="text-sm text-gray-600">{t('maxAge12')}</span>
										</div>

										{childError && (
											<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
												{childError}
											</div>
										)}

										<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
											<div>
												<label className="block text-sm font-medium text-gray-700">
													{t('childName')}
												</label>
												<input												ref={childNameRef}													type="text"
													value={childForm.name}
													onChange={(e) => handleChildChange('name', e.target.value)}
													className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													{t('childDateOfBirth')}
												</label>
												<input
													type="date"
													value={childForm.date_of_birth}
													onChange={(e) => handleChildChange('date_of_birth', e.target.value)}
													className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													{t('allergies')}
												</label>
												<input
													type="text"
													value={childForm.allergies}
													onChange={(e) => handleChildChange('allergies', e.target.value)}
													placeholder={t('allergiesPlaceholder')}
													className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													{t('specialNeeds')}
												</label>
												<input
													type="text"
													value={childForm.special_needs}
													onChange={(e) => handleChildChange('special_needs', e.target.value)}
													placeholder={t('specialNeedsPlaceholder')}
													className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													{t('emergencyContactName')}
												</label>
												<input
													type="text"
													value={childForm.emergency_contact_name}
													onChange={(e) => handleChildChange('emergency_contact_name', e.target.value)}
													className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700">
													{t('emergencyContactPhone')}
												</label>
												<input
													type="tel"
													value={childForm.emergency_contact_phone}
													onChange={(e) => handleChildChange('emergency_contact_phone', e.target.value)}
													className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
												/>
											</div>
											<div className="sm:col-span-2 flex items-center space-x-2">
												<input
													id="photo-permission"
													type="checkbox"
													checked={childForm.photo_permission}
													onChange={(e) => handleChildChange('photo_permission', e.target.checked)}
													className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
												/>
												<label htmlFor="photo-permission" className="text-sm text-gray-700">
													{t('photoPermission')}
												</label>
											</div>
										</div>

										<button
											type="button"
											onClick={addChild}
											className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
										>
											{t('addChildButton')}
										</button>

										{children.length > 0 && (
											<div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
												<div className="px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-50">
													{t('childrenAdded')}
												</div>
												{children.map((child, index) => (
													<div key={`${child.name}-${child.date_of_birth}-${index}`} className="px-4 py-3 flex items-center justify-between">
														<div>
															<div className="font-medium text-gray-900">{child.name}</div>
															<div className="text-sm text-gray-600">
																{child.date_of_birth && (
																	<span>
																		{t('childDateOfBirth')}: {child.date_of_birth}{' '}
																		{t('age')}: {calculateAge(child.date_of_birth)}
																	</span>
																)}
															</div>
															{(child.allergies || child.special_needs) && (
																<div className="text-xs text-gray-500">
																	{child.allergies && <span>• {t('allergies')}: {child.allergies} </span>}
																	{child.special_needs && <span>• {t('specialNeeds')}: {child.special_needs}</span>}
																</div>
															)}
														</div>
														<button
															type="button"
															onClick={() => removeChild(index)}
															className="text-sm text-red-600 hover:text-red-700"
														>
															{t('removeButton')}
														</button>
													</div>
												))}
											</div>
										)}
									</div>
								)}

								<div className="pt-2 flex items-center justify-end">
									<button
										type="submit"
										disabled={submitting}
										className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
									>
										{submitting ? t('submitting') : t('submit')}
									</button>
								</div>
							</form>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
