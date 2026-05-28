"use client";

import * as React from 'react';
import confetti from 'canvas-confetti';
import { createProduct, updateProduct } from '../(dashboard)/products/actions';
import { Input } from '@/components/ui/Input';
import styles from './page.module.css';

export default function OnboardingFlow({ userName }: { userName?: string }) {
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [generatedSlug, setGeneratedSlug] = React.useState('');

  // Step 2 Form State
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [files, setFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<string[]>([]);
  const [coverIndex, setCoverIndex] = React.useState(0);
  const [createdProductId, setCreatedProductId] = React.useState<string>('');
  const [fieldErrors, setFieldErrors] = React.useState<{ name?: string; price?: string; images?: string }>({});

  React.useEffect(() => {
    if (step === 3) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        zIndex: 100,
      });
    }
  }, [step]);

  function handleNameBlur() {
    if (!name.trim()) {
      setFieldErrors(prev => ({ ...prev, name: 'Product name is required' }));
    } else {
      setFieldErrors(prev => ({ ...prev, name: undefined }));
    }
  }

  function handlePriceBlur() {
    if (!price || parseFloat(price) <= 0) {
      setFieldErrors(prev => ({ ...prev, price: 'Valid price is required' }));
    } else {
      setFieldErrors(prev => ({ ...prev, price: undefined }));
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setFiles(prev => [...prev, ...selectedFiles]);
    
    const newPreviews = selectedFiles.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);

    // Clear the image error as soon as they pick a file
    setFieldErrors(prev => ({ ...prev, images: undefined }));
  }

  function removeImage(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    if (coverIndex >= previews.length - 1) {
      setCoverIndex(Math.max(0, previews.length - 2));
    } else if (coverIndex === index) {
      setCoverIndex(0);
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    
    handleNameBlur();
    handlePriceBlur();

    if (!name.trim() || !price || parseFloat(price) <= 0) {
      if (files.length === 0) {
        setFieldErrors(prev => ({ ...prev, images: 'Please add at least one product image.' }));
      }
      return;
    }

    if (files.length === 0) {
      setFieldErrors(prev => ({ ...prev, images: 'Please add at least one product image.' }));
      return;
    }

    setLoading(true);

    try {
      const uploadedUrls: string[] = [];
      
      for (const f of files) {
        const filename = encodeURIComponent(f.name);
        const res = await fetch(`/api/upload?filename=${filename}`, {
          method: 'POST',
          body: f,
        });
        
        if (!res.ok) {
          throw new Error('Image upload failed');
        }
        
        const blob = await res.json();
        uploadedUrls.push(blob.url);
      }
      
      const imageUrl = uploadedUrls[coverIndex] || uploadedUrls[0];
      const nairaPrice = parseFloat(price);
      const priceKobo = Math.round(nairaPrice * 100);

      const productDataParams = {
        name,
        price: priceKobo,
        description,
        imageUrl,
        imageUrls: uploadedUrls,
      };

      if (createdProductId) {
        const updateRes = await updateProduct(createdProductId, productDataParams);
        if (!updateRes.ok) {
          throw new Error(updateRes.error?.message || 'Failed to update product');
        }
        setStep(3);
        return;
      }

      const createRes = await createProduct(productDataParams);

      if (!createRes.ok) {
        throw new Error(createRes.error?.message || 'Failed to create product');
      }

      // We don't get the slug back from createProduct currently, but we can fetch it or just tell them it's created. 
      // Actually, since this is for onboarding and we just want them to see their link, let's fetch the user's latest product.
      // Or we can just use window.location.origin to build a generic link display, but we really want the exact link.
      // Let's call a quick api to get the latest product's slug, or just send them to dashboard.
      // Wait, let's make an API call to get the latest slug since createProduct only returns { id: string }
      
      const productRes = await fetch('/api/onboarding/latest-product');
      if (productRes.ok) {
        const productData = await productRes.json();
        setGeneratedSlug(productData.uniqueSlug);
        if (productData.id) {
          setCreatedProductId(productData.id);
        }
      } else {
        // Fallback
        setGeneratedSlug('your-new-product');
      }

      // Mark onboarding as complete in the background
      await fetch('/api/onboarding/complete', { method: 'POST' });

      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function completeOnboarding() {
    window.location.href = '/dashboard';
  }

  async function copyToClipboard() {
    const url = `${window.location.origin}/p/${generatedSlug}`;
    await navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  }

  async function handleSkip() {
    setLoading(true);
    await fetch('/api/onboarding/complete', { method: 'POST' });
    window.location.href = '/dashboard';
  }

  return (
    <div className={styles.flow}>
            
            <div className={styles.stepsIndicator}>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`${styles.stepDot} ${s === step ? styles.stepDotActive : ''} ${s < step ? styles.stepDotCompleted : ''}`}
                />
              ))}
            </div>

            {step === 1 && (
              <div className={styles.step}>
                <div className={styles.stepIcon}>✨</div>
                <h2 className={styles.stepTitle}>Welcome {userName ? userName : 'to SellSnap'}</h2>
                <p className={styles.stepDescription}>
                  Let's get your first product online. Upload a photo, set a price, and get your payment link instantly.
                </p>
                <div className={styles.buttonRow} style={{ justifyContent: 'center' }}>
                  <button onClick={() => setStep(2)} className={styles.nextButton}>
                    Let's create your first link →
                  </button>
                </div>
                <button onClick={handleSkip} className={styles.skipButton}>
                  Skip for now
                </button>
              </div>
            )}

            {step === 2 && (
              <div className={styles.step}>
                <h2 className={styles.stepTitle}>Add Your Product</h2>
                <p className={styles.stepDescription}>
                  What are you selling today?
                </p>
                
                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleCreateProduct} className={styles.form} noValidate>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label}>Product Name</label>
                      <Input 
                        id="name"
                        name="name"
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        onBlur={handleNameBlur}
                        placeholder="e.g. Denim Jacket"
                        error={!!fieldErrors.name}
                        required
                      />
                      {fieldErrors.name && <span className={styles.fieldError}>{fieldErrors.name}</span>}
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Price (₦)</label>
                      <Input 
                        id="price"
                        name="price"
                        type="number" 
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                        onBlur={handlePriceBlur}
                        placeholder="15000"
                        min="0"
                        step="0.01"
                        error={!!fieldErrors.price}
                        required
                      />
                      {fieldErrors.price && <span className={styles.fieldError}>{fieldErrors.price}</span>}
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Description (Optional)</label>
                    <textarea 
                      className={styles.textarea} 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      placeholder="Tell buyers a bit about it..."
                      rows={2}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Product Images</label>
                    {previews.length > 0 && (
                      <div className={styles.imageGrid}>
                        {previews.map((previewImg, index) => (
                          <div key={index} className={`${styles.imageBox} ${index === coverIndex ? styles.coverImage : ''}`}>
                            <img src={previewImg} alt={`Product ${index + 1}`} className={styles.previewImage} />
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
                      <span className={styles.uploadText}>Tap to upload images, or browse</span>
                    </label>
                    {fieldErrors?.images && (
                      <span className={styles.fieldError}>{fieldErrors.images}</span>
                    )}
                  </div>

                  <div className={styles.buttonRow}>
                    <button type="button" onClick={() => setStep(1)} className={styles.textButton}>
                      Back
                    </button>
                    <button type="submit" className={styles.nextButton} disabled={loading}>
                      {loading ? 'Creating...' : 'Generate My Link'}
                    </button>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <button type="button" onClick={handleSkip} className={styles.skipButton} disabled={loading}>
                      Skip for now
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className={styles.step}>
                <div className={styles.stepIcon}>🎉</div>
                <h2 className={styles.stepTitle}>Your link is live!</h2>
                <p className={styles.stepDescription}>
                  Share this link on WhatsApp or Instagram and start getting paid.
                </p>
                
                <div className={styles.linkBox}>
                  sellsnap.app/p/{generatedSlug}
                </div>

                <div className={styles.buttonRow}>
                  <button onClick={() => setStep(2)} className={styles.textButton}>
                    Back
                  </button>
                  <button onClick={copyToClipboard} className={styles.nextButton}>
                    Copy Link
                  </button>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button onClick={completeOnboarding} className={styles.skipButton}>
                    Go to Dashboard
                  </button>
                </div>
              </div>
            )}
            
    </div>
  );
}
