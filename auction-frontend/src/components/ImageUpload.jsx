import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

const ImageUpload = ({ onImagesChange, maxImages = 5 }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadToCloudinary = async (files) => {
    setUploading(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('http://localhost:8080/api/images/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        } else {
          console.error('Failed to upload image');
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

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Uploading images...</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-700 font-medium mb-2">
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
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
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