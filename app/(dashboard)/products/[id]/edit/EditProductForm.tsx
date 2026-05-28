"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { updateProduct } from '../../actions';
import { createProductSchema, type CreateProductInput } from '@/types';
import styles from '../../new/ProductForm.module.css';

type EditProductFormProps = {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string;
    imageUrls: unknown;
  };
};

export function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [files, setFiles] = React.useState<File[]>([]);
  const initialImages = React.useMemo(() => {
    if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      return product.imageUrls as string[];
    }
    return [product.imageUrl];
  }, [product.imageUrls, product.imageUrl]);
  const [previews, setPreviews] = React.useState<string[]>(initialImages);
  const [coverIndex, setCoverIndex] = React.useState(0);
  const [formData, setFormData] = React.useState({
    name: product.name,
    price: (product.price / 100).toFixed(2),
    description: product.description || '',
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setFiles(prev => [...prev, ...selectedFiles]);
    
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  }

  function handleInputChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function removeImage(index: number) {
    if (previews.length === 1) return;
    if (index >= initialImages.length) {
      URL.revokeObjectURL(previews[index]);
      const fileIndex = index - initialImages.length;
      setFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (coverIndex >= previews.length - 1) {
      setCoverIndex(Math.max(0, previews.length - 2));
    } else if (coverIndex === index) {
      setCoverIndex(0);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let imageUrl = product.imageUrl;
      let imageUrls: string[] = [...initialImages];
      
      if (files.length > 0) {
        const uploadedUrls: string[] = [];
        
        for (const file of files) {
          const filename = encodeURIComponent(file.name);
          const res = await fetch(`/api/upload?filename=${filename}`, {
            method: 'POST',
            body: file,
          });
          
          if (!res.ok) throw new Error('Image upload failed');
          const blob = await res.json();
          uploadedUrls.push(blob.url);
        }
        
        imageUrls = [...initialImages, ...uploadedUrls];
        imageUrl = imageUrls[coverIndex] || imageUrls[0];
      } else if (coverIndex !== 0) {
        imageUrl = initialImages[coverIndex] || initialImages[0];
      }
      
      const nairaPrice = parseFloat(formData.price);
      const priceKobo = Math.round(nairaPrice * 100);
      
      const data: CreateProductInput = {
        name: formData.name,
        description: formData.description,
        price: priceKobo,
        imageUrl,
        imageUrls,
      };
      
      const validated = createProductSchema.safeParse(data);
      if (!validated.success) {
        setError(validated.error.issues[0]?.message || 'Invalid input');
        setLoading(false);
        return;
      }
      
      const createRes = await updateProduct(product.id, data);
      if (!createRes.ok) {
        setError(createRes.error.message);
        setLoading(false);
        return;
      }
      
      router.push('/products');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  }

  const displayPrice = formData.price ? `₦${parseFloat(formData.price).toLocaleString()}` : '₦0';

  return (
    <form onSubmit={onSubmit} className={styles.root}>
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.topBarTitle}>Edit Product</h1>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className={styles.layout}>
        <div className={styles.formPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Product Details</h2>
            <p className={styles.panelSubtext}>Update your product information below.</p>
          </div>
          
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>Product Name</label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g. Custom Ankara Dress"
                required 
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="price" className={styles.label}>Price (₦)</label>
              <Input 
                id="price" 
                name="price" 
                type="number" 
                step="0.01" 
                min="0" 
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="e.g. 5000"
                required 
              />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label htmlFor="description" className={styles.label}>Description</label>
              <textarea 
                id="description" 
                name="description" 
                className={styles.textarea} 
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your product..."
                rows={4}
              />
            </div>

            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label}>Product Images</label>
              {previews.length > 0 && (
                <div className={styles.imageGrid}>
                  {previews.map((preview, index) => (
                    <div key={index} className={`${styles.imageBox} ${index === coverIndex ? styles.coverImage : ''}`}>
                      <img src={preview} alt={`Product ${index + 1}`} className={styles.previewImage} />
                      <button type="button" onClick={() => removeImage(index)} className={styles.removeBtn}>×</button>
                      {index === coverIndex && <span className={styles.coverBadge}>Cover</span>}
                      <button type="button" onClick={() => setCoverIndex(index)} className={styles.setCoverBtn}>
                        Set as Cover
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className={styles.uploadBox}>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleFileChange}
                  multiple
                  className={styles.fileInput}
                />
                <svg className={styles.uploadIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span className={styles.uploadText}>Upload images, or browse</span>
              </label>
            </div>
          </div>
        </div>

        <div className={styles.previewPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Preview</h2>
          </div>
          <div className={styles.previewContent}>
            <Card className={styles.previewCard}>
              <div className={styles.previewImageContainer}>
                {previews.length > 0 ? (
                  <img src={previews[coverIndex]} alt="Product preview" className={styles.previewImage} />
                ) : (
                  <div className={styles.previewImagePlaceholder}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>Product image</span>
                  </div>
                )}
              </div>
              <div className={styles.previewCardBody}>
                <h3 className={styles.previewCardName}>
                  {formData.name || 'Product Name'}
                </h3>
                <p className={styles.previewCardPrice}>
                  {displayPrice}
                </p>
                {formData.description && (
                  <p className={styles.previewCardDescription}>
                    {formData.description}
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
}
