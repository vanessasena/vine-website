'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faBirthdayCake,
  faChurch,
  faUsers,
  faCheckCircle,
  faTimes,
  faArrowLeft,
  faCross,
} from '@fortawesome/free-solid-svg-icons';
import { VOLUNTEER_AREA_OPTIONS, GENDER_OPTIONS, SPIRITUAL_COURSE_OPTIONS, CHURCH_ROLE_OPTIONS } from '@/lib/constants';
import ProfileSection from '@/components/ProfileSection';

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  parent1_id: string;
  parent2_id: string | null;
  allergies: string | null;
  medical_notes: string | null;
  special_needs: string | null;
  photo_permission: boolean;
  has_allergies: boolean | null;
  has_special_needs: boolean | null;
}

interface MemberProfile {
  id: string;
  user_id: string;
  name: string;
  date_of_birth: string | null;
  gender: string | null;
  phone: string;
  email: string;
  is_baptized: boolean;
  pays_tithe: boolean;
  spiritual_courses: string[];
  encounter_with_god: boolean;
  church_role: string | null;
  volunteer_areas: string[];
  volunteer_outros_details: string | null;
  life_group: string | null;
  is_married: boolean;
  spouse_id: string | null;
  spouse_name: string | null;
  created_at: string;
  updated_at: string;
}

interface MemberProfileClientProps {
  locale: string;
}

export default function MemberProfileClient({ locale }: MemberProfileClientProps) {
  const t = useTranslations('member');
  const tCells = useTranslations('cells');
  const router = useRouter();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [dateError, setDateError] = useState(false);
  const [userRole, setUserRole] = useState<'member' | 'admin' | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [spouseChildren, setSpouseChildren] = useState<Child[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [availableSpouses, setAvailableSpouses] = useState<Array<{ id: string; name: string; phone: string }>>([]);
  const [loadingSpouses, setLoadingSpouses] = useState(false);
  const [spouseSearchInput, setSpouseSearchInput] = useState('');
  const [showSpouseDropdown, setShowSpouseDropdown] = useState(false);
  const [spouseWarning, setSpouseWarning] = useState<string | null>(null);
  const [childValidationErrors, setChildValidationErrors] = useState<{ [key: string]: string }>({});
  const spouseDropdownRef = useRef<HTMLDivElement | null>(null);

  // Section states for collapsible UI
  const [expandedSections, setExpandedSections] = useState<{
    personalInfo: boolean;
    spiritualLife: boolean;
    volunteer: boolean;
    family: boolean;
  }>({
    personalInfo: true,
    spiritualLife: false,
    volunteer: false,
    family: false,
  });

  const [editingSections, setEditingSections] = useState<{
    personalInfo: boolean;
    spiritualLife: boolean;
    volunteer: boolean;
    family: boolean;
  }>({
    personalInfo: false,
    spiritualLife: false,
    volunteer: false,
    family: false,
  });

  const [savingSections, setSavingSections] = useState<{
    personalInfo: boolean;
    spiritualLife: boolean;
    volunteer: boolean;
    family: boolean;
  }>({
    personalInfo: false,
    spiritualLife: false,
    volunteer: false,
    family: false,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    is_baptized: false,
    pays_tithe: false,
    spiritual_courses: [] as string[],
    encounter_with_god: false,
    church_role: '',
    volunteer_areas: [] as string[],
    volunteer_outros_details: '',
    life_group: '',
    is_married: false,
    spouse_id: '',
    spouse_name: '',
  });

  const checkAuthAndLoadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      // Refresh the session to ensure we have the latest user data
      const { data: { session } } = await supabase.auth.refreshSession();

      if (!session) {
        router.push(`/${locale}/login?redirect=/${locale}/member`);
        return;
      }

      // Store the current user ID to detect user changes
      setCurrentUserId(session.user.id);

      // Check if user is admin trying to access member area
      const response = await fetch('/api/member-profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      // Handle response - even errors should be parsed as JSON
      const result = await response.json();

      // Store user role
      setUserRole(result.role || 'member');

      if (result.data) {
        setProfile(result.data);
        setFormData({
          name: result.data.name || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          date_of_birth: result.data.date_of_birth || '',
          gender: result.data.gender || '',
          is_baptized: result.data.is_baptized === true,
          pays_tithe: result.data.pays_tithe === true,
          spiritual_courses: Array.isArray(result.data.spiritual_courses) ? result.data.spiritual_courses : [],
          encounter_with_god: result.data.encounter_with_god === true,
          church_role: result.data.church_role || '',
          volunteer_areas: Array.isArray(result.data.volunteer_areas) ? result.data.volunteer_areas : [],
          volunteer_outros_details: result.data.volunteer_outros_details || '',
          life_group: result.data.life_group || '',
          is_married: result.data.is_married === true,
          spouse_id: result.data.spouse_id || '',
          spouse_name: result.data.spouse_name || '',
        });

        // Fetch children separately
        const childrenResponse = await fetch(`/api/children?parent_id=${result.data.id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        if (childrenResponse.ok) {
          const childrenData = await childrenResponse.json();
          setChildren(childrenData.data || []);
        }
      } else {
        // No profile yet, expand personal info section for creation
        setExpandedSections(prev => ({ ...prev, personalInfo: true }));
        setFormData({
          name: '',
          email: session.user.email || '',
          phone: '',
          date_of_birth: '',
          gender: '',
          is_baptized: false,
          pays_tithe: false,
          spiritual_courses: [],
          encounter_with_god: false,
          church_role: 'membro',
          volunteer_areas: [],
          volunteer_outros_details: '',
          life_group: '',
          is_married: false,
          spouse_id: '',
          spouse_name: ''
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [locale, router]);

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, [checkAuthAndLoadProfile]);

  // Reset form when user changes (new login)
  useEffect(() => {
    if (currentUserId) {
      // Form will be populated by checkAuthAndLoadProfile
      // This ensures fresh data when user ID changes
    }
  }, [currentUserId]);

    // Fetch available spouses when family section is opened for editing
  useEffect(() => {
    if (editingSections.family && expandedSections.family) {
      fetchAvailableSpouses();
    }
  }, [editingSections.family, expandedSections.family]);

  const formatPhoneInput = (value: string): string => {
    // Remove all characters except digits, spaces, hyphens, parentheses, and plus
    let cleaned = value.replace(/[^\d\s\-()+ ]/g, '');

    // Remove multiple consecutive spaces
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Remove invalid parentheses patterns (empty parentheses, mismatched, etc.)
    // Only allow ( before digits and ) after digits
    cleaned = cleaned.replace(/\(\s*\)/g, ''); // Remove empty parentheses
    cleaned = cleaned.replace(/\){2,}/g, ')'); // Remove multiple closing parentheses
    cleaned = cleaned.replace(/\({2,}/g, '('); // Remove multiple opening parentheses

    // Ensure plus sign is only at the beginning
    if (cleaned.includes('+')) {
      cleaned = '+' + cleaned.replace(/\+/g, '');
    }

    return cleaned;
  };

  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');

    // Must have exactly 10 or 11 digits
    if (digitsOnly.length !== 10 && digitsOnly.length !== 11) {
      return false;
    }

    // Check for valid format patterns
    // Patterns: (519) 123-4567, 519-123-4567, 5191234567, +1-519-123-4567, +1 519 123 4567, etc.
    const validPatterns = [
      /^\d{10}$/, // 5191234567
      /^\d{11}$/, // 15191234567
      /^\d{3}[-\s]\d{3}[-\s]\d{4}$/, // 519-123-4567 or 519 123 4567
      /^\(\d{3}\)\s?\d{3}[-\s]?\d{4}$/, // (519) 123-4567 or (519)123-4567
      /^\+1[-\s]?\d{3}[-\s]?\d{3}[-\s]?\d{4}$/, // +1-519-123-4567
      /^\+1[-\s]?\(\d{3}\)\s?\d{3}[-\s]?\d{4}$/, // +1-(519) 123-4567
    ];

    return validPatterns.some(pattern => pattern.test(phone.trim()));
  };

  const validateDateOfBirth = (dateString: string): boolean => {
    if (!dateString || dateString.trim() === '') {
      return true; // Allow empty dates
    }

    const selectedDate = new Date(dateString);
    const today = new Date();

    // Check if date is valid
    if (isNaN(selectedDate.getTime())) {
      return false;
    }

    // Date cannot be in the future
    if (selectedDate > today) {
      return false;
    }

    // Calculate age
    const age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    const dayDiff = today.getDate() - selectedDate.getDate();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    // Age must be between 0 and 120 years
    if (actualAge < 0 || actualAge > 120) {
      return false;
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      let processedValue = value;

      // For phone input, format and validate
      if (name === 'phone') {
        processedValue = formatPhoneInput(value);

        if (processedValue && !validatePhone(processedValue)) {
          setPhoneError(t('phoneError'));
        } else {
          setPhoneError(null);
        }
      }

      // Validate date of birth on change
      if (name === 'date_of_birth') {
        if (value && !validateDateOfBirth(value)) {
          setDateError(true);
        } else {
          setDateError(false);
        }
      }

      setFormData(prev => ({ ...prev, [name]: processedValue }));
    }
  };

  const handleVolunteerAreaChange = (area: string) => {
    setFormData(prev => ({
      ...prev,
      volunteer_areas: prev.volunteer_areas.includes(area)
        ? prev.volunteer_areas.filter(a => a !== area)
        : [...prev.volunteer_areas, area]
    }));
  };

  const handleAddChild = async () => {
    if (!profile?.id) return;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Add a placeholder child with today's date
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch('/api/children', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "",
          date_of_birth: today,
          parent1_id: profile.id,
          photo_permission: true
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setChildren(prev => [...prev, result.data]);
      }
    } catch (error) {
      console.error('Error adding child:', error);
    }
  };

  const handleRemoveChild = async (childId: string) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/children?id=${childId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        setChildren(prev => prev.filter(c => c.id !== childId));
      }
    } catch (error) {
      console.error('Error removing child:', error);
    }
  };

  const handleUpdateChild = async (childId: string, field: keyof Child, value: any) => {
    try {
      // Validate that allergies and special needs selections are made
      const child = children.find(c => c.id === childId);
      if (!child) return;

      // Check if we're updating has_allergies or has_special_needs
      if (field === 'has_allergies' || field === 'has_special_needs') {
        // Create a temporary child object with the update
        const updatedChild = { ...child, [field]: value };

        // Check if both selections are now made
        if (updatedChild.has_allergies === null || updatedChild.has_special_needs === null) {
          // At least one is still not selected, show error
          const missing: string[] = [];
          if (updatedChild.has_allergies === null) missing.push('allergies');
          if (updatedChild.has_special_needs === null) missing.push('special needs');

          setChildValidationErrors(prev => ({
            ...prev,
            [childId]: `Please select Yes or No for: ${missing.join(' and ')}`
          }));
          return;
        } else {
          // Both are selected, clear error
          setChildValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[childId];
            return newErrors;
          });
        }
      }

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Update local state optimistically
      setChildren(prev => prev.map(c =>
        c.id === childId ? { ...c, [field]: value } : c
      ));

      // Update in database
      const response = await fetch('/api/children', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...child,
          [field]: value
        }),
      });

      if (!response.ok) {
        // Revert on error
        checkAuthAndLoadProfile();
      }
    } catch (error) {
      console.error('Error updating child:', error);
      // Revert on error
      checkAuthAndLoadProfile();
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    // Parse date as UTC to avoid timezone shifts (YYYY-MM-DD)
    const [year, month, day] = dateOfBirth.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Section management functions
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleEditSection = (section: keyof typeof editingSections) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: true
    }));
    setExpandedSections(prev => ({
      ...prev,
      [section]: true
    }));

    // Fetch available spouses when editing family section
    if (section === 'family') {
      setSpouseSearchInput('');
      setShowSpouseDropdown(false);
      fetchAvailableSpouses();
    }
  };

  // Close spouse dropdown when clicking outside
  useEffect(() => {
    if (!showSpouseDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (spouseDropdownRef.current && !spouseDropdownRef.current.contains(event.target as Node)) {
        setShowSpouseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSpouseDropdown]);

  // Merge user's children and spouse's children into one list for display
  // Deduplicate by child ID to avoid showing the same child twice
  const allChildren = (() => {
    const childrenMap = new Map();

    // Add user's children first
    children.forEach(c => {
      childrenMap.set(c.id, { ...c, isFromCurrentUser: true });
    });

    // Add spouse's children, but skip if already in map (same child)
    spouseChildren.forEach(c => {
      if (!childrenMap.has(c.id)) {
        childrenMap.set(c.id, { ...c, isFromCurrentUser: false });
      }
    });

    return Array.from(childrenMap.values());
  })();

  const childAgeLimit = 13;

  // Filter spouse list based on search input
  const filteredSpouses = availableSpouses.filter(spouse =>
    spouse.name.toLowerCase().includes(spouseSearchInput.toLowerCase()) ||
    spouse.phone.includes(spouseSearchInput)
  );

  const handleSelectSpouse = async (spouse: { id: string; name: string; phone: string }) => {
    setFormData(prev => ({ ...prev, spouse_id: spouse.id, spouse_name: spouse.name }));
    setSpouseSearchInput('');
    setShowSpouseDropdown(false);

    // Fetch spouse's children
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/children?parent_id=${spouse.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSpouseChildren(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching spouse children:', error);
    }
  };

  const handleRemoveSpouse = () => {
    setFormData(prev => ({ ...prev, spouse_id: '', spouse_name: '' }));
    setSpouseChildren([]);
    setSpouseSearchInput('');
    setShowSpouseDropdown(false);
  };

  const fetchAvailableSpouses = useCallback(async () => {
    try {
      setLoadingSpouses(true);

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No session found');
        return;
      }

      const response = await fetch('/api/available-spouses', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableSpouses(data.data || []);
        if (data.warning === 'missing_gender') {
          setSpouseWarning(t('spouseGenderMissing'));
        } else {
          setSpouseWarning(null);
        }
      } else {
        console.error('Error fetching spouses:', response.statusText);
      }
    } catch (err) {
      console.error('Error fetching available spouses:', err);
    } finally {
      setLoadingSpouses(false);
    }
  }, [t]);

  const handleCancelSection = (section: keyof typeof editingSections) => {
    if (profile) {
      const resetData: Partial<typeof formData> = {};

      if (section === 'personalInfo') {
        resetData.name = profile.name || '';
        resetData.email = profile.email || '';
        resetData.phone = profile.phone || '';
        resetData.date_of_birth = profile.date_of_birth || '';
        resetData.gender = profile.gender || '';
      } else if (section === 'spiritualLife') {
        resetData.is_baptized = profile.is_baptized === true;
        resetData.pays_tithe = profile.pays_tithe === true;
        resetData.spiritual_courses = Array.isArray(profile.spiritual_courses) ? profile.spiritual_courses : [];
        resetData.encounter_with_god = profile.encounter_with_god === true;
        resetData.church_role = profile.church_role || '';
        resetData.life_group = profile.life_group || '';
      } else if (section === 'volunteer') {
        resetData.volunteer_areas = Array.isArray(profile.volunteer_areas) ? profile.volunteer_areas : [];
        resetData.volunteer_outros_details = profile.volunteer_outros_details || '';
      } else if (section === 'family') {
        resetData.is_married = profile.is_married === true;
        resetData.spouse_id = profile.spouse_id || '';
        resetData.spouse_name = profile.spouse_name || '';
      }

      setFormData(prev => ({ ...prev, ...resetData }));
    }
    setEditingSections(prev => ({
      ...prev,
      [section]: false
    }));
    setPhoneError(null);
    setDateError(false);
  };

  const saveSectionData = async (section: keyof typeof savingSections, data: Partial<typeof formData>) => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        is_baptized: formData.is_baptized,
        pays_tithe: formData.pays_tithe,
        spiritual_courses: formData.spiritual_courses,
        encounter_with_god: formData.encounter_with_god,
        church_role: formData.church_role || 'membro',
        volunteer_areas: formData.volunteer_areas,
        volunteer_outros_details: formData.volunteer_outros_details,
        life_group: formData.life_group,
        is_married: formData.is_married,
        spouse_name: formData.spouse_name,
        ...data,
      };

      if (section === 'personalInfo') {
        if (!validatePhone(payload.phone || '')) {
          setPhoneError(t('phoneError'));
          setError(t('fixErrors'));
          return false;
        }
        if (payload.date_of_birth && !validateDateOfBirth(payload.date_of_birth)) {
          setDateError(true);
          setError(t('fixErrors'));
          return false;
        }
        if (!payload.date_of_birth) {
          setDateError(true);
          setError(t('dateOfBirthRequired'));
          return false;
        }
        if (!payload.gender) {
          setError(t('genderRequired'));
          return false;
        }
      }

      if (section === 'spiritualLife') {
        if (!payload.church_role) {
          setError(t('churchRoleRequired'));
          return false;
        }
      }

      // All API calls require these fields; prevent accidental nulling when saving other sections
      if (!payload.name || !payload.phone || !payload.email) {
        setError(t('fixErrors'));
        return false;
      }

      setSavingSections(prev => ({ ...prev, [section]: true }));
      setError(null);
      setPhoneError(null);
      setDateError(false);

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push(`/${locale}/login?redirect=/${locale}/member`);
        return false;
      }

      const method = profile ? 'PUT' : 'POST';
      const response = await fetch('/api/member-profile', {
        method,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save');
      }

      await checkAuthAndLoadProfile();

      setSuccessMessage(t(`sections.${section}.saved`));
      setTimeout(() => setSuccessMessage(null), 3000);

      setEditingSections(prev => ({ ...prev, [section]: false }));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setSavingSections(prev => ({ ...prev, [section]: false }));
    }
  };

  const handleSavePersonalInfo = async () => {
    const success = await saveSectionData('personalInfo', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      date_of_birth: formData.date_of_birth,
      gender: formData.gender,
    });
    if (success) {
      // Open next section (spiritualLife) in edit mode
      setExpandedSections(prev => ({ ...prev, spiritualLife: true }));
      setEditingSections(prev => ({ ...prev, spiritualLife: true }));
    }
  };

  const handleSaveSpiritualLife = async () => {
    const success = await saveSectionData('spiritualLife', {
      is_baptized: formData.is_baptized,
      pays_tithe: formData.pays_tithe,
      spiritual_courses: formData.spiritual_courses,
      encounter_with_god: formData.encounter_with_god,
      church_role: formData.church_role,
      life_group: formData.life_group,
    });
    if (success) {
      // Open next section (volunteer) in edit mode
      setExpandedSections(prev => ({ ...prev, volunteer: true }));
      setEditingSections(prev => ({ ...prev, volunteer: true }));
    }
  };

  const handleSaveVolunteer = async () => {
    const success = await saveSectionData('volunteer', {
      volunteer_areas: formData.volunteer_areas,
      volunteer_outros_details: formData.volunteer_outros_details,
    });
    if (success) {
      // Open next section (family) in edit mode
      setExpandedSections(prev => ({ ...prev, family: true }));
      setEditingSections(prev => ({ ...prev, family: true }));
    }
  };

  const handleSaveFamily = async () => {
    // Validate that all children have allergies and special needs selections made
    const validationErrors: { [key: string]: string } = {};

    allChildren.forEach(child => {
      const missing: string[] = [];
      if (child.has_allergies === null) missing.push('allergies');
      if (child.has_special_needs === null) missing.push('special needs');

      if (missing.length > 0) {
        validationErrors[child.id] = `Please select Yes or No for: ${missing.join(' and ')}`;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setChildValidationErrors(validationErrors);
      setError(t('pleaseCompleteChildInfo'));
      return;
    }

    // Clear errors if all children are valid
    setChildValidationErrors({});

    // Spouse is now optional even when married
    await saveSectionData('family', {
      is_married: formData.is_married,
      spouse_id: formData.spouse_id as string,
    });
    // Family is the last section, so don't open another section
  };

  const handleSave = async () => {
    // Legacy function - sections now save individually
    // This is kept for backwards compatibility if needed
    console.warn('Using legacy handleSave - use section-specific saves instead');
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        is_baptized: profile.is_baptized === true,
        pays_tithe: profile.pays_tithe === true,
        spiritual_courses: Array.isArray(profile.spiritual_courses) ? profile.spiritual_courses : [],
        encounter_with_god: profile.encounter_with_god === true,
        church_role: profile.church_role || '',
        volunteer_areas: Array.isArray(profile.volunteer_areas) ? profile.volunteer_areas : [],
        volunteer_outros_details: profile.volunteer_outros_details || '',
        life_group: profile.life_group || '',
        is_married: profile.is_married === true,
        spouse_id: profile.spouse_id || '',
        spouse_name: profile.spouse_name || '',
      });
    }
    setEditingSections({
      personalInfo: false,
      spiritualLife: false,
      volunteer: false,
      family: false,
    });
  };

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-xl text-gray-600">{t('loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Admin Navigation */}
        {userRole === 'admin' && (
          <div className="mb-6">
            <Link
              href={`/${locale}/admin`}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              {locale === 'pt' ? 'Voltar para Administração' : 'Back to Admin'}
            </Link>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong className="font-bold">{t('error')}: </strong>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <strong className="font-bold">✓ </strong>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-3xl font-bold text-primary-700">
            {profile ? t('profileTitle') : t('createProfileTitle')}
          </h2>
          <p className="text-gray-600 mt-2">
            {profile ? t('infoText') : (locale === 'pt' ? 'Preencha suas informações para criar seu perfil' : 'Fill in your information to create your profile')}
          </p>
        </div>

        {/* SECTION 1: Personal Information */}
        <ProfileSection
          title={t('sections.personalInfo.title')}
          description={t('sections.personalInfo.description')}
          isExpanded={expandedSections.personalInfo}
          isEditing={editingSections.personalInfo}
          isSaving={savingSections.personalInfo}
          onToggle={() => toggleSection('personalInfo')}
          onEdit={() => handleEditSection('personalInfo')}
          onSave={handleSavePersonalInfo}
          onCancel={() => handleCancelSection('personalInfo')}
          hasProfile={!!profile}
          saveButtonText={t('saveSection')}
          cancelButtonText={t('cancel')}
          editButtonText={t('editSection')}
          savingText={t('saving')}
          editContent={
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-primary-600" />
                  {t('name')} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-primary-600" />
                  {t('email')} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {locale === 'pt' ? 'Email vinculado à sua conta' : 'Email linked to your account'}
                </p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faPhone} className="mr-2 text-primary-600" />
                  {t('phone')} *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t('phonePlaceholder')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    phoneError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {phoneError && <p className="mt-1 text-sm text-red-600">{phoneError}</p>}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('gender')} *
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t('genderPlaceholder')}</option>
                  {GENDER_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {t(`genderOptions.${option}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faBirthdayCake} className="mr-2 text-primary-600" />
                  {t('dateOfBirth')} *
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  required
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    dateError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  max={new Date().toISOString().split('T')[0]}
                />
                {dateError && <p className="mt-1 text-sm text-red-600">{t('dateOfBirthError')}</p>}
              </div>
            </>
          }
          displayContent={
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-primary-600" />
                  {t('name')}
                </div>
                <div className="text-lg text-gray-900">{profile?.name}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-primary-600" />
                  {t('email')}
                </div>
                <div className="text-lg text-gray-900">{profile?.email}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  <FontAwesomeIcon icon={faPhone} className="mr-2 text-primary-600" />
                  {t('phone')}
                </div>
                <div className="text-lg text-gray-900">{profile?.phone}</div>
              </div>

              {profile?.gender && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    {t('gender')}
                  </div>
                  <div className="text-lg text-gray-900">{t(`genderOptions.${profile.gender}`)}</div>
                </div>
              )}

              {profile?.date_of_birth && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    <FontAwesomeIcon icon={faBirthdayCake} className="mr-2 text-primary-600" />
                    {t('dateOfBirth')}
                  </div>
                  <div className="text-lg text-gray-900">
                    {(() => {
                      // Parse date as local to avoid timezone shifts (YYYY-MM-DD)
                      const [year, month, day] = profile.date_of_birth.split('-').map(Number);
                      const date = new Date(year, month - 1, day);
                      const formatted = date.toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US');
                      return formatted;
                    })()}
                  </div>
                </div>
              )}
            </div>
          }
        />

        {/* SECTION 2: Spiritual Life */}
        {profile && (
          <ProfileSection
            title={t('sections.spiritualLife.title')}
            description={t('sections.spiritualLife.description')}
            isExpanded={expandedSections.spiritualLife}
            isEditing={editingSections.spiritualLife}
            isSaving={savingSections.spiritualLife}
            onToggle={() => toggleSection('spiritualLife')}
            onEdit={() => handleEditSection('spiritualLife')}
            onSave={handleSaveSpiritualLife}
            onCancel={() => handleCancelSection('spiritualLife')}
            hasProfile={!!profile}
            saveButtonText={t('saveSection')}
            cancelButtonText={t('cancel')}
            editButtonText={t('editSection')}
            savingText={t('saving')}
            editContent={
              <>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_baptized"
                    name="is_baptized"
                    checked={formData.is_baptized}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_baptized" className="ml-3 text-sm font-medium text-gray-700">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-primary-600" />
                    {t('isBaptized')}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="pays_tithe"
                    name="pays_tithe"
                    checked={formData.pays_tithe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pays_tithe" className="ml-3 text-sm font-medium text-gray-700">
                    <FontAwesomeIcon icon={faChurch} className="mr-2 text-primary-600" />
                    {t('paysTithe')}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="encounter_with_god"
                    name="encounter_with_god"
                    checked={formData.encounter_with_god}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="encounter_with_god" className="ml-3 text-sm font-medium text-gray-700">
                    <FontAwesomeIcon icon={faCross} className="mr-2 text-primary-600" />
                    {t('encounterWithGod')}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('spiritualCourses')}
                  </label>
                  <div className="space-y-2">
                    {SPIRITUAL_COURSE_OPTIONS.map((course) => (
                      <label key={course} className="flex items-start gap-3 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.spiritual_courses.includes(course)}
                          onChange={() => {
                            setFormData(prev => ({
                              ...prev,
                              spiritual_courses: prev.spiritual_courses.includes(course)
                                ? prev.spiritual_courses.filter(c => c !== course)
                                : [...prev.spiritual_courses, course]
                            }));
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5"
                        />
                        <span>{t(`spiritualCourseOptions.${course}`)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="church_role" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('churchRole')} *
                  </label>
                  <select
                    id="church_role"
                    name="church_role"
                    required
                    value={formData.church_role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">{t('churchRolePlaceholder')}</option>
                    {CHURCH_ROLE_OPTIONS.map(role => (
                      <option key={role} value={role}>
                        {t(`churchRoleOptions.${role}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="life_group" className="block text-sm font-medium text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faUsers} className="mr-2 text-primary-600" />
                    {t('lifeGroup')}
                  </label>
                  <select
                    id="life_group"
                    name="life_group"
                    value={formData.life_group}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">{t('lifeGroupPlaceholder')}</option>
                    {['roots', 'kitchener', 'cambridge', 'waterloo', 'youth'].map((groupKey) => {
                      const groupName = tCells(`groups.${groupKey}.name`);
                      return (
                        <option key={groupKey} value={groupName}>
                          {groupName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </>
            }
            displayContent={
              <div className="space-y-4">
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className={`mr-2 ${profile.is_baptized ? 'text-green-600' : 'text-gray-400'}`}
                  />
                  <span className={profile.is_baptized ? 'text-gray-900' : 'text-gray-500'}>
                    {t('isBaptized')}: {profile.is_baptized ? t('yes') : t('no')}
                  </span>
                </div>

                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faChurch}
                    className={`mr-2 ${profile.pays_tithe ? 'text-green-600' : 'text-gray-400'}`}
                  />
                  <span className={profile.pays_tithe ? 'text-gray-900' : 'text-gray-500'}>
                    {t('paysTithe')}: {profile.pays_tithe ? t('yes') : t('no')}
                  </span>
                </div>

                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faCross}
                    className={`mr-2 ${profile.encounter_with_god ? 'text-green-600' : 'text-gray-400'}`}
                  />
                  <span className="text-sm font-medium text-gray-500 mr-2">{t('encounterWithGod')}:</span>
                  <span className="text-gray-900">{profile.encounter_with_god ? t('yes') : t('no')}</span>
                </div>

                {profile.spiritual_courses && profile.spiritual_courses.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      {t('spiritualCourses')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.spiritual_courses.map(course => (
                        <span key={course} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                          {t(`spiritualCourseOptions.${course}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    {t('churchRole')}
                  </div>
                  <div className="text-lg text-gray-900">
                    {profile.church_role ? t(`churchRoleOptions.${profile.church_role}`) : '-'}</div>
                </div>

                {profile.life_group && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      <FontAwesomeIcon icon={faUsers} className="mr-2 text-primary-600" />
                      {t('lifeGroup')}
                    </div>
                    <div className="text-lg text-gray-900">{profile.life_group}</div>
                  </div>
                )}
              </div>
            }
          />
        )}

        {/* SECTION 3: Volunteer */}
        {profile && (
          <ProfileSection
            title={t('sections.volunteer.title')}
            description={t('sections.volunteer.description')}
            isExpanded={expandedSections.volunteer}
            isEditing={editingSections.volunteer}
            isSaving={savingSections.volunteer}
            onToggle={() => toggleSection('volunteer')}
            onEdit={() => handleEditSection('volunteer')}
            onSave={handleSaveVolunteer}
            onCancel={() => handleCancelSection('volunteer')}
            hasProfile={!!profile}
            saveButtonText={t('saveSection')}
            cancelButtonText={t('cancel')}
            editButtonText={t('editSection')}
            savingText={t('saving')}
            editContent={
              <>
                <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  {t('volunteerIntro')}
                </p>
                <div className="space-y-3">
                  {VOLUNTEER_AREA_OPTIONS.map((area) => (
                    <div key={area} className="flex items-start">
                      <input
                        type="checkbox"
                        id={`area-${area}`}
                        checked={formData.volunteer_areas.includes(area)}
                        onChange={() => handleVolunteerAreaChange(area)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                      />
                      <label htmlFor={`area-${area}`} className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {t(`volunteerOptions.${area}`)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {t(`volunteerDescriptions.${area}`)}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <label htmlFor="volunteer_outros_details" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('outrosDetailsLabel')}
                  </label>
                  <textarea
                    id="volunteer_outros_details"
                    name="volunteer_outros_details"
                    value={formData.volunteer_outros_details}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder={t('outrosDetailsPlaceholder')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </>
            }
            displayContent={
              <div>
                {profile.volunteer_areas && profile.volunteer_areas.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {profile.volunteer_areas.map((area) => (
                        <span
                          key={area}
                          className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                        >
                          {t(`volunteerOptions.${area}`)}
                        </span>
                      ))}
                    </div>
                    {profile.volunteer_outros_details && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          {t('outrosDetailsLabel')}:
                        </div>
                        <div className="text-sm text-gray-600 whitespace-pre-wrap">{profile.volunteer_outros_details}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    {locale === 'pt' ? 'Nenhuma área de voluntariado selecionada' : 'No volunteer areas selected'}
                  </p>
                )}
              </div>
            }
          />
        )}

        {/* SECTION 4: Family Information */}
        {profile && (
          <ProfileSection
            title={t('sections.family.title')}
            description={t('sections.family.description')}
            isExpanded={expandedSections.family}
            isEditing={editingSections.family}
            isSaving={savingSections.family}
            onToggle={() => toggleSection('family')}
            onEdit={() => handleEditSection('family')}
            onSave={handleSaveFamily}
            onCancel={() => handleCancelSection('family')}
            hasProfile={!!profile}
            saveButtonText={t('saveSection')}
            cancelButtonText={t('cancel')}
            editButtonText={t('editSection')}
            savingText={t('saving')}
            editContent={
              <>
                <div className="space-y-4">
                  {/* Is Married Toggle */}
                  <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="is_married"
                      name="is_married"
                      checked={formData.is_married}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, is_married: e.target.checked }));
                        // Clear spouse if unmarrying
                        if (!e.target.checked) {
                          setFormData(prev => ({ ...prev, spouse_id: '', spouse_name: '' }));
                          setSpouseSearchInput('');
                        }
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_married" className="ml-3 text-sm font-medium text-gray-700">
                      <FontAwesomeIcon icon={faUser} className="mr-2 text-primary-600" />
                      {t('married')}
                    </label>
                  </div>

                  {/* Spouse Selection */}
                  {formData.is_married && (
                    <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700">
                        <FontAwesomeIcon icon={faUser} className="mr-2 text-primary-600" />
                        {t('spouseName')}
                      </label>

                      {spouseWarning && (
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                          {spouseWarning}
                        </div>
                      )}

                      {/* Current Spouse Display */}
                      {formData.spouse_name && formData.spouse_id && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <FontAwesomeIcon icon={faUser} className="text-primary-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{formData.spouse_name}</p>
                              <p className="text-xs text-gray-500">{t('spouseLinked')}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveSpouse}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                          >
                            {t('change')}
                          </button>
                        </div>
                      )}

                      {/* Spouse Autocomplete Search */}
                      <div className="relative" ref={spouseDropdownRef}>
                        <div className="relative">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="absolute left-3 top-3 text-gray-400 text-sm"
                          />
                          <input
                            type="text"
                            placeholder={t('searchSpouseByNameOrPhone')}
                            value={spouseSearchInput}
                            onChange={(e) => {
                              setSpouseSearchInput(e.target.value);
                              setShowSpouseDropdown(true);
                            }}
                            onFocus={() => setShowSpouseDropdown(true)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>

                        {/* Dropdown Menu */}
                        {showSpouseDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                            {loadingSpouses ? (
                              <div className="p-4 text-center text-gray-500 text-sm">
                                {t('loading')}...
                              </div>
                            ) : filteredSpouses.length > 0 ? (
                              filteredSpouses.map((spouse) => (
                                <button
                                  key={spouse.id}
                                  type="button"
                                  onClick={() => handleSelectSpouse(spouse)}
                                  className="w-full text-left px-4 py-3 hover:bg-primary-50 border-b border-gray-100 last:border-b-0 transition-colors flex items-center gap-3"
                                >
                                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                    <FontAwesomeIcon icon={faUser} className="text-primary-600 text-xs" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{spouse.name}</p>
                                    <p className="text-xs text-gray-500">{spouse.phone}</p>
                                  </div>
                                </button>
                              ))
                            ) : spouseSearchInput ? (
                              <div className="p-4 text-center space-y-3">
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">{t('spouseNotFound')}</p>
                                  <p className="text-xs text-gray-400">{t('tryDifferentSearch')}</p>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                                    {t('spouseNotRegisteredMessage')}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 space-y-3">
                                <div>
                                  <p className="text-sm text-gray-600 mb-2 font-medium">{t('availableSpouses')}</p>
                                  {availableSpouses.length === 0 ? (
                                    <div className="space-y-2">
                                      <p className="text-sm text-gray-500">{t('noSpousesAvailable')}</p>
                                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                        {t('spouseNotRegisteredMessage')}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      {availableSpouses.slice(0, 5).map((spouse) => (
                                        <button
                                          key={spouse.id}
                                          type="button"
                                          onClick={() => handleSelectSpouse(spouse)}
                                          className="w-full text-left text-sm text-gray-700 hover:text-primary-600 px-2 py-1"
                                        >
                                          {spouse.name}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {availableSpouses.length === 0 && !formData.spouse_id && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                          <p className="font-medium mb-1">{t('spouseNotFound')}</p>
                          <p className="text-xs">{t('spouseAccountMessage')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      <FontAwesomeIcon icon={faUsers} className="mr-2 text-primary-600" />
                      {t('children')}
                    </label>
                    <button
                      type="button"
                      onClick={handleAddChild}
                      disabled={!profile?.id}
                      className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faUser} />
                      {t('addChild')}
                    </button>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                    {t('childrenAgeLimitNotice', { age: childAgeLimit, agePlus: childAgeLimit + 1 })}
                  </div>

                  {/* Family Children List */}
                  {allChildren.length > 0 && (
                    <div className="space-y-2">
                      {allChildren.map((child) => (
                        <div key={child.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                          {childValidationErrors[child.id] && (
                            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                              {childValidationErrors[child.id]}
                            </div>
                          )}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                value={child.name}
                                onChange={(e) => handleUpdateChild(child.id, 'name', e.target.value)}
                                placeholder={t('childName')}
                                className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveChild(child.id)}
                                className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                title={t('removeChild')}
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">{locale === 'pt' ? 'Data de Nasc.' : 'Birth Date'}</label>
                                <input
                                  type="date"
                                  value={child.date_of_birth}
                                  onChange={(e) => {
                                    setChildren(prev => prev.map(c =>
                                      c.id === child.id ? { ...c, date_of_birth: e.target.value } : c
                                    ));
                                  }}
                                  onBlur={(e) => {
                                    if (e.target.value) {
                                      handleUpdateChild(child.id, 'date_of_birth', e.target.value);
                                    }
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600 mb-1 block">{t('childAge')}</label>
                                <div className="px-2 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium text-center">
                                  {calculateAge(child.date_of_birth)} {locale === 'pt' ? 'anos' : 'yrs'}
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-2 block">{t('childHasAllergies')}</label>
                              <div className="space-y-2">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`allergies-${child.id}`}
                                    value="no"
                                    checked={child.has_allergies === false}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setChildren(prev => prev.map(c =>
                                          c.id === child.id ? { ...c, has_allergies: false, allergies: null } : c
                                        ));
                                        handleUpdateChild(child.id, 'has_allergies', false);
                                      }
                                    }}
                                    className="mr-2"
                                  />
                                  <span className="text-sm text-gray-700">{t('childNoAllergies')}</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`allergies-${child.id}`}
                                    value="yes"
                                    checked={child.has_allergies === true}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setChildren(prev => prev.map(c =>
                                          c.id === child.id ? { ...c, has_allergies: true, allergies: '' } : c
                                        ));
                                        handleUpdateChild(child.id, 'has_allergies', true);
                                      }
                                    }}
                                    className="mr-2"
                                  />
                                  <span className="text-sm text-gray-700">{t('childHasAllergiesYes')}</span>
                                </label>
                              </div>
                              {child.has_allergies === true && (
                                <input
                                  type="text"
                                  value={child.allergies || ''}
                                  onChange={(e) => {
                                    setChildren(prev => prev.map(c =>
                                      c.id === child.id ? { ...c, allergies: e.target.value } : c
                                    ));
                                  }}
                                  onBlur={(e) => handleUpdateChild(child.id, 'allergies', e.target.value)}
                                  placeholder={t('childAllergiesPlaceholder')}
                                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm mt-2"
                                />
                              )}
                            </div>

                            {child.date_of_birth && calculateAge(child.date_of_birth) > childAgeLimit && (
                              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                                {t('childAgeTooHigh', { age: childAgeLimit })}
                              </div>
                            )}

                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-2 block">{t('childHasSpecialNeeds')}</label>
                              <div className="space-y-2">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`special_needs-${child.id}`}
                                    value="no"
                                    checked={child.has_special_needs === false}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setChildren(prev => prev.map(c =>
                                          c.id === child.id ? { ...c, has_special_needs: false, special_needs: null } : c
                                        ));
                                        handleUpdateChild(child.id, 'has_special_needs', false);
                                      }
                                    }}
                                    className="mr-2"
                                  />
                                  <span className="text-sm text-gray-700">{t('childNoSpecialNeeds')}</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`special_needs-${child.id}`}
                                    value="yes"
                                    checked={child.has_special_needs === true}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setChildren(prev => prev.map(c =>
                                          c.id === child.id ? { ...c, has_special_needs: true, special_needs: '' } : c
                                        ));
                                        handleUpdateChild(child.id, 'has_special_needs', true);
                                      }
                                    }}
                                    className="mr-2"
                                  />
                                  <span className="text-sm text-gray-700">{t('childHasSpecialNeedsYes')}</span>
                                </label>
                              </div>
                              {child.has_special_needs === true && (
                                <input
                                  type="text"
                                  value={child.special_needs || ''}
                                  onChange={(e) => {
                                    setChildren(prev => prev.map(c =>
                                      c.id === child.id ? { ...c, special_needs: e.target.value } : c
                                    ));
                                  }}
                                  onBlur={(e) => handleUpdateChild(child.id, 'special_needs', e.target.value)}
                                  placeholder={locale === 'pt' ? 'ex.: autismo, TDAH, cadeira de rodas' : 'e.g., autism, ADHD, wheelchair'}
                                  className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm mt-2"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {allChildren.length === 0 && (
                    <div className="p-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center">
                      <FontAwesomeIcon icon={faUsers} className="text-gray-400 text-2xl mb-2" />
                      <p className="text-sm text-gray-500 mb-3">{t('noChildren')}</p>
                      <button
                        type="button"
                        onClick={handleAddChild}
                        disabled={!profile?.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        <FontAwesomeIcon icon={faUser} />
                        {t('addChild')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            }
            displayContent={
              <div className="space-y-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-primary-600" />
                  <span className="text-gray-900">
                    {profile.is_married ? t('married') : t('single')}
                  </span>
                </div>

                {profile.is_married && profile.spouse_name && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      {t('spouseName')}:
                    </div>
                    <div className="text-lg text-gray-900">{profile.spouse_name}</div>
                  </div>
                )}

                {children && children.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      <FontAwesomeIcon icon={faUsers} className="mr-2 text-primary-600" />
                      {t('children')}
                    </div>
                    <div className="space-y-2">
                      {children.map((child) => (
                        <div key={child.id} className="bg-gray-50 p-3 rounded-lg">
                          <span className="font-medium text-gray-900">{child.name}</span>
                          <span className="text-gray-600 ml-2">
                            ({calculateAge(child.date_of_birth)} {locale === 'pt' ? (calculateAge(child.date_of_birth) === 1 ? 'ano' : 'anos') : (calculateAge(child.date_of_birth) === 1 ? 'year' : 'years')})
                          </span>
                          {child.allergies && child.allergies.trim() !== '' && (
                            <div className="text-sm text-gray-700 mt-1">
                              <span className="font-medium">{t('childAllergies')}:</span> {child.allergies}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
