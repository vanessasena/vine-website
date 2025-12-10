'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faUpload, faSpinner, faArrowLeft, faImage } from '@fortawesome/free-solid-svg-icons';

interface GalleryImage {
  id: string;
  image_url: string;
  alt_text_pt: string;
  alt_text_en: string;
  orientation: 'portrait' | 'landscape';
  display_order: number;
  created_at: string;
}

export default function VineKidsGalleryAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'pt'; // Extract locale from pathname
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [altTextPt, setAltTextPt] = useState('');
  const [altTextEn, setAltTextEn] = useState('');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      await fetchImages();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      router.push('/login');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    }
  };

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/vine-kids-gallery');
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data);
    } catch (err) {
      setError('Failed to load images');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-detect orientation
    const img = new window.Image();
    img.onload = () => {
      if (img.width > img.height) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const uploadToSupabase = async (file: File): Promise<string> => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error('Supabase not available');

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `vine-kids/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('website')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('website')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    if (!altTextPt || !altTextEn) {
      setError('Please provide alt text in both languages');
      return;
    }

    setUploading(true);

    try {
        console.log('Uploading file:', selectedFile);
      // Upload image to Supabase storage
      const imageUrl = await uploadToSupabase(selectedFile);
        console.log('Image uploaded to URL:', imageUrl);

      // Get auth token
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase not available');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Save to database
      const response = await fetch('/api/vine-kids-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          image_url: imageUrl,
          alt_text_pt: altTextPt,
          alt_text_en: altTextEn,
          orientation,
          display_order: displayOrder,
        }),
      });

      if (!response.ok) throw new Error('Failed to save image');

      setSuccess('Image uploaded successfully!');

      // Reset form
      setAltTextPt('');
      setAltTextEn('');
      setDisplayOrder(0);
      setSelectedFile(null);
      setPreviewUrl(null);

      // Refresh images
      await fetchImages();
    } catch (err) {
      setError('Failed to upload image: ' + (err instanceof Error ? err.message : 'Unknown error'));
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase not available');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`/api/vine-kids-gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete image');

      setSuccess('Image deleted successfully!');
      await fetchImages();
    } catch (err) {
      setError('Failed to delete image: ' + (err instanceof Error ? err.message : 'Unknown error'));
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/${locale}/admin`)}
            className="mb-4 text-primary-600 hover:text-primary-700 flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Admin
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Vine Kids Gallery Management</h1>
          <p className="text-gray-600 mt-2">Upload and manage Vine Kids gallery images</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faUpload} />
            Upload New Image
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
              />
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {/* Alt Text PT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text (Portuguese)
              </label>
              <input
                type="text"
                value={altTextPt}
                onChange={(e) => setAltTextPt(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Descrição da imagem em português"
                required
              />
            </div>

            {/* Alt Text EN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alt Text (English)
              </label>
              <input
                type="text"
                value={altTextEn}
                onChange={(e) => setAltTextEn(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Image description in English"
                required
              />
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orientation
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="landscape"
                    checked={orientation === 'landscape'}
                    onChange={(e) => setOrientation(e.target.value as 'landscape')}
                    className="mr-2"
                  />
                  Landscape
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="portrait"
                    checked={orientation === 'portrait'}
                    onChange={(e) => setOrientation(e.target.value as 'portrait')}
                    className="mr-2"
                  />
                  Portrait
                </label>
              </div>
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Uploading...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} />
                  Upload Image
                </>
              )}
            </button>
          </form>
        </div>

        {/* Current Images */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faImage} />
            Current Gallery ({images.length})
          </h2>

          {images.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No images uploaded yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="relative w-full h-48 bg-gray-100">
                    <Image
                      src={image.image_url}
                      alt={image.alt_text_en}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>PT:</strong> {image.alt_text_pt}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>EN:</strong> {image.alt_text_en}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {image.orientation}
                      </span>
                      <span>Order: {image.display_order}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
