import React, { useState } from 'react';
import { QrCode, Download, Copy, Check, Share2, X, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';

export const StoreQrModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const storeUrl = 'https://greenbasket-store.pages.dev';

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = '/greenbasket_qr.png';
    link.download = 'greenbasket-store-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = `🥦 *Green Basket — Daily Farm-Fresh Vegetables & Fruits*\n\nCheck today's fresh market rates and order directly to your doorstep:\n👉 ${storeUrl}\n\n📲 *Tip:* Save our QR code to scan and order anytime!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Green Basket - Farm-Fresh Vegetables & Fruits',
          text: "🥦 Green Basket: Order farm-fresh vegetables & fruits daily at live market rates! Scan our QR or open link:",
          url: storeUrl,
        });
        return;
      } catch {
        // Fall back to WhatsApp
      }
    }
    handleShareWhatsApp();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
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
          borderRadius: '24px',
          width: '100%',
          maxWidth: '430px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px 20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
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
          <X size={18} />
        </button>

        {/* Header Icon & Title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '14px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              border: '2px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1)',
            }}
          >
            <QrCode size={30} color="#059669" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827', margin: 0 }}>
            Green Basket Store QR
          </h2>
          <p style={{ fontSize: '0.80rem', color: '#047857', fontWeight: '700', marginTop: '4px', marginBottom: 0 }}>
            సేవ్ చేసుకోండి — ఎప్పుడైనా స్కాన్ చేసి ఆర్డర్ చేయండి!
          </p>
        </div>

        {/* QR Code Container */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '2px dashed #10b981',
            borderRadius: '20px',
            padding: '16px',
            margin: '0 auto 16px',
            display: 'inline-block',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)',
          }}
        >
          <img
            src="/greenbasket_qr.png"
            alt="Green Basket Store QR Code"
            style={{
              width: '210px',
              height: '210px',
              borderRadius: '12px',
              display: 'block',
              objectFit: 'contain',
              margin: '0 auto',
            }}
          />
          <div
            style={{
              marginTop: '10px',
              fontSize: '0.74rem',
              fontWeight: '700',
              color: '#065f46',
              letterSpacing: '0.5px',
              backgroundColor: '#f0fdf4',
              padding: '4px 10px',
              borderRadius: '8px',
              display: 'inline-block',
            }}
          >
            greenbasket-store.pages.dev
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {/* Download QR Button */}
          <button
            type="button"
            onClick={handleDownloadQr}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: downloadSuccess ? '#059669' : '#16a34a',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: '700',
              padding: '12px',
              borderRadius: '14px',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              boxShadow: '0 4px 8px -1px rgba(22, 163, 74, 0.35)',
              transition: 'all 0.15s ease',
            }}
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 size={18} strokeWidth={2.4} />
                <span>Saved to Downloads! (సేవ్ అయ్యింది)</span>
              </>
            ) : (
              <>
                <Download size={18} strokeWidth={2.2} />
                <span>Download QR Code (సేవ్ చేసుకోండి)</span>
              </>
            )}
          </button>

          {/* Share on WhatsApp & Copy Link Row */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleNativeShare}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: '#25D366',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: '700',
                padding: '10px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(37, 211, 102, 0.2)',
              }}
            >
              <Share2 size={16} />
              <span>Share Store</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                fontSize: '0.82rem',
                fontWeight: '700',
                padding: '10px',
                borderRadius: '12px',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Benefits & Instructions Box */}
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '14px',
            padding: '12px 14px',
            fontSize: '0.76rem',
            color: '#166534',
            textAlign: 'left',
            lineHeight: 1.45,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: '#14532d' }}>
            <Sparkles size={15} color="#16a34a" />
            <span>Why save this QR Code?</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <span>•</span>
            <span><strong>Instant Access:</strong> Point your phone camera or Google Lens at this QR anytime to jump straight into the store without typing any URL.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <span>•</span>
            <span><strong>Fridge or Kitchen:</strong> Print or keep on your phone so family members can quickly check daily fresh vegetable rates and order!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreQrModal;
