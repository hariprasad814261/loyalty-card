import React, { useState, useEffect } from 'react';
import { generateQrDataUrl, downloadDataUrl } from '../../utils/qrHelper';
import { QrCode, Download, Check, Sparkles, ZoomIn, X } from 'lucide-react';

export function DynamicQrCode({
  value,
  size = 180,
  colorDark = '#000000',
  colorLight = '#FFFFFF',
  margin = 2,
  title = '',
  subtitle = '',
  downloadable = false,
  downloadFilename = 'loyalty_qr_code.png',
  expandable = false,
  className = '',
  style = {}
}) {
  const [dataUrl, setDataUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!value) {
      setDataUrl('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    generateQrDataUrl(value, {
      colorDark,
      colorLight,
      width: Math.max(size * 2, 400),
      margin
    }).then(url => {
      if (isMounted) {
        setDataUrl(url);
        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [value, colorDark, colorLight, size, margin]);

  const handleDownload = (e) => {
    e?.stopPropagation();
    if (dataUrl) {
      downloadDataUrl(dataUrl, downloadFilename);
    }
  };

  const handleCopyLink = (e) => {
    e?.stopPropagation();
    if (value) {
      navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <>
      <div 
        className={`lf-dynamic-qr-container ${className}`}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
      >
        <div 
          style={{
            position: 'relative',
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: colorLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            cursor: expandable ? 'pointer' : 'default',
            border: '1px solid rgba(0,0,0,0.06)'
          }}
          onClick={() => expandable && setIsExpanded(true)}
          title={expandable ? 'Click to enlarge QR' : title}
        >
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#8E8478' }}>
              <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#D4AF37', borderRadius: '50%' }} />
              <span style={{ fontSize: '9px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>GENERATING QR</span>
            </div>
          ) : dataUrl ? (
            <img 
              src={dataUrl} 
              alt={title || 'Loyalty QR Code'} 
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <QrCode size={size * 0.5} color={colorDark} />
          )}

          {expandable && !isLoading && dataUrl && (
            <div 
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                background: 'rgba(0,0,0,0.65)',
                color: '#FFFFFF',
                borderRadius: '6px',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '9px',
                gap: '2px'
              }}
            >
              <ZoomIn size={10} />
            </div>
          )}
        </div>

        {title && (
          <span style={{ fontSize: '11.5px', fontWeight: 700, marginTop: '6px', color: '#FDFBF7' }}>
            {title}
          </span>
        )}

        {subtitle && (
          <span style={{ fontSize: '10px', color: '#8E8478', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            {subtitle}
          </span>
        )}

        {downloadable && dataUrl && (
          <button
            type="button"
            onClick={handleDownload}
            className="lf-btn lf-btn-secondary"
            style={{ marginTop: '8px', padding: '4px 10px', fontSize: '11px', gap: '4px' }}
          >
            <Download size={12} />
            <span>Download PNG</span>
          </button>
        )}
      </div>

      {/* Expanded Lightbox Modal */}
      {isExpanded && (
        <div 
          className="lf-modal-backdrop" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 9999 }}
          onClick={() => setIsExpanded(false)}
        >
          <div 
            className="lf-card animate-fade-in" 
            style={{ maxWidth: '380px', width: '100%', padding: '24px', textAlign: 'center', background: '#16120F', border: '1.5px solid rgba(212, 175, 55, 0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: '#D4AF37' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#FDFBF7', margin: 0 }}>
                  {title || 'Unique Loyalty QR Pass'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsExpanded(false)}
                className="lf-btn-ghost"
                style={{ cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', margin: '0 auto 16px auto', display: 'inline-block' }}>
              <img src={dataUrl} alt="Expanded QR Code" style={{ width: '240px', height: '240px', display: 'block' }} />
            </div>

            {subtitle && (
              <p style={{ fontSize: '12px', color: '#D4CDC3', marginBottom: '14px', lineHeight: '1.4' }}>
                {subtitle}
              </p>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                className="lf-btn lf-btn-secondary"
                style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}
              >
                {isCopied ? <Check size={14} style={{ color: '#10B981' }} /> : null}
                <span>{isCopied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="lf-btn lf-btn-gold"
                style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}
              >
                <Download size={14} />
                <span>Save Image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DynamicQrCode;
