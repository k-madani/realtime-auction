import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

const ImageUpload = ({ onImagesChange, maxImages = 5, existingImages = [] }) => {
  const [images, setImages] = useState(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadToCloudinary = async (files) => {
    setUploading(true);
    const uploadedUrls = [];

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('You must be logged in to upload images');
        setUploading(false);
        return;
      }

      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:8080/api/images/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        } else {
          const errorData = await response.json();
          console.error('Failed to upload image:', errorData);
          alert(`Failed to upload image: ${errorData.error || 'Unknown error'}`);
        }
      }

      const newImages = [...images, ...uploadedUrls].slice(0, maxImages);
      setImages(newImages);
      onImagesChange(newImages);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, maxImages - images.length);
      uploadToCloudinary(files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files)
        .filter(file => file.type.startsWith('image/'))
        .slice(0, maxImages - images.length);
      uploadToCloudinary(files);
    }
  };

  const removeImage = async (index) => {
    const imageToDelete = images[index];
    
    try {
      const token = localStorage.getItem('token');
      
      // Delete from Cloudinary
      const response = await fetch(
        `http://localhost:8080/api/images/delete?url=${encodeURIComponent(imageToDelete)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.ok) {
        // Remove from local state
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onImagesChange(newImages);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete image: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`rounded-lg p-8 text-center transition-all shadow-md ${
            dragActive
              ? 'bg-blue-50 shadow-lg'
              : 'bg-gray-50 hover:bg-gray-100 hover:shadow-lg'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
                <p className="text-gray-600 font-semibold">Uploading images...</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-black mb-4" />
                <p className="text-gray-700 font-semibold mb-2">
                  Drop images here or click to upload
                </p>
                <p className="text-gray-500 text-sm">
                  PNG, JPG up to 5MB ({images.length}/{maxImages} uploaded)
                </p>
              </>
            )}
          </label>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group shadow-md hover:shadow-xl transition-shadow rounded-lg overflow-hidden">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-40 object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-accent-gold text-black text-xs px-2 py-1 rounded font-bold shadow-md">
                  Primary Image
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-sm text-gray-500 text-center">
          No images uploaded yet. Add at least one image to your auction.
        </p>
      )}
    </div>
  );
};

export default ImageUpload;