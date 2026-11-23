import React, { useState } from 'react';
import { QrCode, Download, Share2, X, CheckCircle2 } from 'lucide-react';

export const StoreQrModal = ({ isOpen, onClose }) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const storeUrl = 'https://greenbasket-store.pages.dev';

  if (!isOpen) return null;

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = '/greenbasket_qr.png';
    link.download = 'greenbasket-store-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Green Basket - Farm-Fresh Vegetables & Fruits',
        text: 'Order farm-fresh vegetables & fruits daily at live market rates from Green Basket:\n👉 ' + storeUrl,
        url: storeUrl,
      }).catch(() => {
        // Fallback to WhatsApp
        const text = `🥦 *Green Basket — Daily Farm-Fresh Vegetables & Fruits*\n\nCheck today's fresh market rates and order directly to your doorstep:\n👉 ${storeUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      });
      return;
    }

    const text = `🥦 *Green Basket — Daily Farm-Fresh Vegetables & Fruits*\n\nCheck today's fresh market rates and order directly to your doorstep:\n👉 ${storeUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '340px',
          padding: '20px 16px 16px',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          textAlign: 'center',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#f3f4f6',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6b7280',
            transition: 'background-color 0.15s ease',
          }}
        >
          <X size={16} />
        </button>

        {/* Header Icon & Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
          <img
            src="/favicon.svg"
            alt="Green Basket"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)',
              marginBottom: '8px',
              display: 'block',
            }}
          />
          <h2 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#111827', margin: 0, lineHeight: 1.3 }}>
            Scan or download to order anytime
          </h2>
        </div>

        {/* QR Code Container */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px dashed #10b981',
            borderRadius: '16px',
            padding: '12px',
            margin: '0 auto 12px',
            display: 'inline-block',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
          }}
        >
          <img
            src="/greenbasket_qr.png"
            alt="Green Basket Store QR Code"
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '10px',
              display: 'block',
              objectFit: 'contain',
              margin: '0 auto',
            }}
          />
          <div
            style={{
              marginTop: '8px',
              fontSize: '0.70rem',
              fontWeight: '700',
              color: '#065f46',
              letterSpacing: '0.4px',
              backgroundColor: '#f0fdf4',
              padding: '3px 8px',
              borderRadius: '6px',
              display: 'inline-block',
            }}
          >
            greenbasket-store.pages.dev
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          {/* Download QR Button */}
          <button
            type="button"
            onClick={handleDownloadQr}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: downloadSuccess ? '#059669' : '#16a34a',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: '700',
              padding: '10px 14px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              boxShadow: '0 3px 6px -1px rgba(22, 163, 74, 0.3)',
              transition: 'all 0.15s ease',
              minHeight: '42px',
              boxSizing: 'border-box',
            }}
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 size={17} strokeWidth={2.4} />
                <span>Saved to Downloads!</span>
              </>
            ) : (
              <>
                <Download size={17} strokeWidth={2.2} />
                <span>Download QR Code</span>
              </>
            )}
          </button>

          {/* Share Button with Logo */}
          <button
            type="button"
            onClick={handleShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#047857',
              fontSize: '0.84rem',
              fontWeight: '700',
              padding: '8px 14px',
              borderRadius: '12px',
              cursor: 'pointer',
              width: '100%',
              minHeight: '38px',
              boxSizing: 'border-box',
              transition: 'all 0.15s ease',
            }}
          >
            <Share2 size={15} strokeWidth={2} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreQrModal;
