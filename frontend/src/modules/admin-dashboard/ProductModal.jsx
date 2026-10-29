import React, { useState, useEffect } from 'react';
import { Pencil, ShoppingBasket, XCircle, CheckCircle } from 'lucide-react';
import { productApi, uploadImageToCloudinary, hasCloudinaryConfig, getErrorMessage } from '../../services/api';

const DEFAULT_CATEGORIES = ['Vegetables', 'Fruits', 'Leafy Greens', 'Exotic', 'Herbs & Spices'];
const DEFAULT_UNITS = ['1 kg', '500g', '250g', '1 piece', '1 dozen', '1 bunch', 'packet'];

// Simple helper: transliterate English phonetic word to Telugu (e.g. aratipandu -> అరటిపండు)
const transliterateToTelugu = async (word) => {
  if (!word || !word.trim()) return word;
  try {
    const res = await fetch(
      `https://inputtools.google.com/request?text=${encodeURIComponent(word.trim())}&itc=te-t-i0-und&num=1`
    );
    const data = await res.json();
    if (data?.[0] === 'SUCCESS' && data?.[1]?.[0]?.[1]?.[0]) {
      return data[1][0][1][0];
    }
  } catch {
    // fallback if network issue
  }
  return word;
};

export const ProductModal = ({ isOpen, onClose, onSave, editingProduct = null }) => {
  const isEditing = Boolean(editingProduct && editingProduct.id);

  const [formData, setFormData] = useState({
    name: '',
    nameLocal: '',
    category: 'Vegetables',
    customCategory: '',
    price: '',
    unit: '1 kg',
    customUnit: '',
    imageUrl: '',
    available: true,
    sortOrder: 0,
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [useUploadMode, setUseUploadMode] = useState(hasCloudinaryConfig);

  useEffect(() => {
    if (editingProduct) {
      const isKnownCategory = DEFAULT_CATEGORIES.includes(editingProduct.category);
      const isKnownUnit = DEFAULT_UNITS.includes(editingProduct.unit);

      setFormData({
        name: editingProduct.name || '',
        nameLocal: editingProduct.nameLocal || '',
        category: isKnownCategory ? editingProduct.category : 'Other',
        customCategory: isKnownCategory ? '' : editingProduct.category || '',
        price: editingProduct.price !== undefined ? editingProduct.price : '',
        unit: isKnownUnit ? editingProduct.unit : 'Other',
        customUnit: isKnownUnit ? '' : editingProduct.unit || '',
        imageUrl: editingProduct.imageUrl || '',
        available: editingProduct.available !== undefined ? editingProduct.available : true,
        sortOrder: editingProduct.sortOrder !== undefined ? editingProduct.sortOrder : 0,
      });
    } else {
      setFormData({
        name: '',
        nameLocal: '',
        category: 'Vegetables',
        customCategory: '',
        price: '',
        unit: '1 kg',
        customUnit: '',
        imageUrl: '',
        available: true,
        sortOrder: 0,
      });
    }
    setError('');
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLocalNameKeyDown = async (e) => {
    if (e.key === ' ' || e.code === 'Space') {
      const input = e.target;
      const val = input.value;
      const cursorPos = input.selectionStart;

      const textBefore = val.slice(0, cursorPos);
      const match = textBefore.match(/([a-zA-Z]+)$/);
      if (match) {
        e.preventDefault();
        const englishWord = match[1];
        const teluguWord = await transliterateToTelugu(englishWord);
        const prefix = textBefore.slice(0, textBefore.length - englishWord.length);
        const suffix = val.slice(cursorPos);
        const newText = prefix + teluguWord + ' ' + suffix;
        const newCursor = (prefix + teluguWord + ' ').length;

        setFormData((prev) => ({ ...prev, nameLocal: newText }));
        requestAnimationFrame(() => {
          if (input) {
            input.setSelectionRange(newCursor, newCursor);
          }
        });
      }
    }
  };

  const handleLocalNameBlur = async () => {
    const val = formData.nameLocal;
    if (!val) return;
    const words = val.match(/[a-zA-Z]+/g);
    if (words && words.length > 0) {
      let updated = val;
      for (const w of words) {
        const telugu = await transliterateToTelugu(w);
        updated = updated.replace(new RegExp('\\b' + w + '\\b', 'g'), telugu);
      }
      setFormData((prev) => ({ ...prev, nameLocal: updated }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    try {
      setUploadingImage(true);
      setError('');
      const uploadedUrl = await uploadImageToCloudinary(file);
      setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
    } catch (err) {
      setError('Cloudinary upload failed: ' + (err.message || 'Check your cloud name and preset'));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Product name in English is required.');
      return;
    }

    const finalCategory = formData.category === 'Other'
      ? formData.customCategory.trim()
      : formData.category;

    if (!finalCategory) {
      setError('Category is required.');
      return;
    }

    const parsedPrice = parseFloat(formData.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Price must be a valid positive number.');
      return;
    }

    const finalUnit = formData.unit === 'Other'
      ? formData.customUnit.trim()
      : formData.unit;

    if (!finalUnit) {
      setError('Unit is required (e.g. 1 kg, piece).');
      return;
    }

    let finalLocalName = formData.nameLocal.trim() || null;
    if (finalLocalName && /[a-zA-Z]/.test(finalLocalName)) {
      const words = finalLocalName.match(/[a-zA-Z]+/g);
      if (words && words.length > 0) {
        for (const w of words) {
          const telugu = await transliterateToTelugu(w);
          finalLocalName = finalLocalName.replace(new RegExp('\\b' + w + '\\b', 'g'), telugu);
        }
      }
    }

    const payload = {
      name: formData.name.trim(),
      nameLocal: finalLocalName,
      category: finalCategory,
      price: parsedPrice,
      unit: finalUnit,
      imageUrl: formData.imageUrl.trim() || null,
      available: formData.available,
      sortOrder: parseInt(formData.sortOrder, 10) || 0,
    };

    try {
      setSubmitting(true);
      let savedProduct;
      if (isEditing) {
        savedProduct = await productApi.update(editingProduct.id, payload);
      } else {
        savedProduct = await productApi.create(payload);
      }
      onSave(savedProduct, isEditing);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save product. Please verify fields.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            backgroundColor: '#ffffff',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEditing ? (
              <Pencil size={20} strokeWidth={1.75} color="var(--color-primary, #16A34A)" />
            ) : (
              <ShoppingBasket size={20} strokeWidth={1.75} color="var(--color-primary, #16A34A)" />
            )}
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-text-main, #1F2937)', margin: 0 }}>
              {isEditing ? 'Edit Product Details' : 'Add New Product'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted, #6B7280)',
            }}
          >
            <XCircle size={22} strokeWidth={1.75} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: 'var(--radius-btn, 12px)',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <XCircle size={16} strokeWidth={1.75} color="#dc2626" />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Local Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>
                Name (English) *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Tomato"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>
                Local Name (Telugu / Tamil)
              </label>
              <input
                type="text"
                name="nameLocal"
                value={formData.nameLocal}
                onChange={handleChange}
                onKeyDown={handleLocalNameKeyDown}
                onBlur={handleLocalNameBlur}
                placeholder="e.g. టమాటా"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          {/* Category & Custom Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  backgroundColor: '#ffffff',
                }}
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Other">Other (Custom)</option>
              </select>
            </div>

            {formData.category === 'Other' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>
                  Specify Category *
                </label>
                <input
                  type="text"
                  name="customCategory"
                  value={formData.customCategory}
                  onChange={handleChange}
                  placeholder="e.g. Dry Fruits"
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            )}
          </div>

          {/* Price & Unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>
                Price (₹) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="40.00"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>
                Unit *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  backgroundColor: '#ffffff',
                }}
              >
                {DEFAULT_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
                <option value="Other">Custom Unit</option>
              </select>
            </div>
          </div>

          {formData.unit === 'Other' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>
                Specify Custom Unit *
              </label>
              <input
                type="text"
                name="customUnit"
                value={formData.customUnit}
                onChange={handleChange}
                placeholder="e.g. 250ml or crate"
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          )}

          {/* Image Upload or URL */}
          <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>
                Product Image
              </label>
              {hasCloudinaryConfig && (
                <button
                  type="button"
                  onClick={() => setUseUploadMode(!useUploadMode)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#16a34a',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {useUploadMode ? 'Switch to URL input' : 'Switch to Cloudinary upload'}
                </button>
              )}
            </div>

            {hasCloudinaryConfig && useUploadMode ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  style={{ fontSize: '0.85rem' }}
                />
                {uploadingImage && (
                  <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px', fontWeight: '600' }}>
                    Uploading to Cloudinary...
                  </p>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                  }}
                />
                {!hasCloudinaryConfig && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #6B7280)', marginTop: '4px' }}>
                    Note: Cloudinary env not set; using direct image URLs.
                  </p>
                )}
              </div>
            )}

            {/* Image Preview */}
            {formData.imageUrl && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-btn, 12px)', border: '1px solid var(--color-border, #E5E7EB)' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary, #16A34A)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={16} strokeWidth={1.75} />
                  <span>Image ready</span>
                </span>
              </div>
            )}
          </div>

          {/* Available Checkbox & Sort Order */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
              <input
                type="checkbox"
                name="available"
                checked={formData.available}
                onChange={handleChange}
                style={{ width: '20px', height: '20px', accentColor: 'var(--color-primary, #16A34A)' }}
              />
              Available in Catalog (In Stock)
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #6B7280)', fontWeight: '600' }}>
                Order:
              </label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleChange}
                style={{
                  width: '60px',
                  padding: '8px',
                  borderRadius: 'var(--radius-btn, 12px)',
                  border: '1px solid var(--color-border, #cbd5e1)',
                  fontSize: '0.85rem',
                }}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              paddingTop: '12px',
              borderTop: '1px solid var(--color-border, #E5E7EB)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-secondary"
              style={{ padding: '10px 18px', minHeight: '44px', fontWeight: '700' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingImage}
              className="btn btn-primary"
              style={{ padding: '10px 22px', minHeight: '44px', fontWeight: '700' }}
            >
              {submitting ? (
                <>
                  <span className="spinner" /> Saving...
                </>
              ) : isEditing ? (
                'Update Product'
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
