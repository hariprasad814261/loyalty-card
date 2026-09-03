import React, { useState, useEffect } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { generateQrDataUrl } from '../../utils/qrHelper';
import { exportElementAsPdf, exportElementAsPng, exportQrCodePng } from '../../utils/exportPdf';
import { 
  Printer, 
  Download, 
  Sparkles, 
  Check, 
  Smartphone, 
  Copy,
  Layers,
  Globe,
  Wifi,
  Info,
  ExternalLink,
  AlertCircle,
  QrCode,
  CheckCircle2
} from 'lucide-react';

export default function StandeeGenerator() {
  const { activeRestaurant, setActiveTab, serverIp } = useLoyalty();
  const [format, setFormat] = useState('a5'); // 'a5' | 'a6'
  
  const getInitialHeadline = () => {
    if (activeRestaurant?.program?.rewardTitle) {
      return `Scan & Earn ${activeRestaurant.program.rewardTitle}!`;
    }
    return `Scan & Earn ₹100 Off on Your ${activeRestaurant?.program?.totalStamps || 5}th Visit!`;
  };

  const [headline, setHeadline] = useState(getInitialHeadline);
  const [subtext, setSubtext] = useState('No App Download Needed • Point Phone Camera to Join');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState(null);

  // Sync default headline when switching restaurant
  useEffect(() => {
    setHeadline(getInitialHeadline());
  }, [activeRestaurant?.id, activeRestaurant?.program?.rewardTitle, activeRestaurant?.program?.totalStamps]);

  const detectedHost = (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? window.location.hostname
    : (serverIp || '192.168.0.5');
  const currentPort = (typeof window !== 'undefined' && window.location.port) ? window.location.port : '5173';

  const [wifiIp, setWifiIp] = useState(detectedHost);
  const [urlMode, setUrlMode] = useState('wifi'); // 'wifi' | 'custom' | 'current'
  const [customHost, setCustomHost] = useState(`https://loyalty.${activeRestaurant?.id || 'restaurant'}.com`);

  // Auto-sync wifiIp when serverIp is detected
  useEffect(() => {
    if (serverIp && serverIp !== '127.0.0.1') {
      setWifiIp(prev => (prev === '192.168.31.36' || prev === 'localhost' || prev === '127.0.0.1' || !prev) ? serverIp : prev);
    }
  }, [serverIp]);

  // Calculate final QR target URL based on mode
  const getTargetBaseUrl = () => {
    if (urlMode === 'wifi') {
      const cleanIp = wifiIp.replace(/^https?:\/\//, '').replace(/\/.*$/, '').split(':')[0] || serverIp || '192.168.0.5';
      return `http://${cleanIp}:${currentPort}`;
    }
    if (urlMode === 'custom') {
      return customHost.replace(/\/+$/, '');
    }
    return typeof window !== 'undefined' ? window.location.origin : `http://${serverIp || '192.168.0.5'}:${currentPort}`;
  };

  const passUrl = `${getTargetBaseUrl()}/pass/${activeRestaurant.id}`;

  useEffect(() => {
    async function loadQr() {
      const url = await generateQrDataUrl(passUrl, {
        colorDark: activeRestaurant.theme?.cardBgColor || '#221A15',
        colorLight: '#FFFFFF',
        width: 500
      });
      setQrDataUrl(url);
    }
    loadQr();
  }, [activeRestaurant, passUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(passUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setExportMessage('Generating 300 DPI PDF...');
    const success = await exportElementAsPdf('standee-render-target', `${(activeRestaurant.name || 'Restaurant').replace(/\s+/g, '_')}_Standee.pdf`, format);
    setIsExporting(false);
    if (success) {
      setExportMessage('PDF Downloaded successfully!');
      setTimeout(() => setExportMessage(null), 3000);
    } else {
      setExportMessage('Failed to download PDF. Please try PNG.');
      setTimeout(() => setExportMessage(null), 3000);
    }
  };

  const handleDownloadPng = async () => {
    setIsExporting(true);
    setExportMessage('Generating Standee PNG...');
    const success = await exportElementAsPng('standee-render-target', `${(activeRestaurant.name || 'Restaurant').replace(/\s+/g, '_')}_Standee.png`);
    setIsExporting(false);
    if (success) {
      setExportMessage('PNG Standee Downloaded!');
      setTimeout(() => setExportMessage(null), 3000);
    } else {
      setExportMessage('Failed to download PNG.');
      setTimeout(() => setExportMessage(null), 3000);
    }
  };

  const handleDownloadQrOnly = () => {
    if (!qrDataUrl) return;
    const success = exportQrCodePng(qrDataUrl, `${(activeRestaurant.name || 'Restaurant').replace(/\s+/g, '_')}_QR_Code.png`);
    if (success) {
      setExportMessage('QR Code PNG Downloaded!');
      setTimeout(() => setExportMessage(null), 3000);
    }
  };

  const brandAccent = activeRestaurant.theme?.accentColor || '#D4AF37';
  const brandBg = activeRestaurant.theme?.cardBgColor || '#221A15';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      
      {/* Top Header Card */}
      <div className="lf-card">
        <div className="lf-card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="lf-badge lf-badge-gold">Table & Counter Kit</span>
              <span className="lf-badge lf-badge-copper">300 DPI Vector PDF</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FDFBF7' }}>
              Restaurant Scannable Standee & Table Tent Generator
            </h1>
            <p style={{ fontSize: '12px', color: '#8E8478', marginTop: '2px' }}>
              Generate ready-to-print acrylic standees for dining tables and billing counters.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="lf-btn lf-btn-gold"
            >
              <Printer size={15} />
              <span>{isExporting ? 'Generating PDF...' : 'Download Print PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="lf-btn lf-btn-secondary"
            >
              <Download size={15} />
              <span>Download Standee PNG</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadQrOnly}
              className="lf-btn lf-btn-emerald"
              title="Download only the standalone QR image"
            >
              <QrCode size={15} />
              <span>Download QR Only</span>
            </button>
          </div>
        </div>

        {exportMessage && (
          <div style={{ padding: '10px 18px', background: 'rgba(16, 185, 129, 0.15)', borderTop: '1px solid rgba(16, 185, 129, 0.3)', color: '#34D399', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{exportMessage}</span>
          </div>
        )}
      </div>

      {/* Phone Scan Notice & Network Helper Alert */}
      <div style={{ padding: '16px 20px', borderRadius: '14px', background: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.3)', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', flexShrink: 0, marginTop: '2px' }}>
          <Wifi size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#F3E5AB', marginBottom: '3px' }}>
            📱 Why Phones Cannot Scan "localhost" & How It Works
          </h4>
          <p style={{ fontSize: '11.5px', color: '#D4CDC3', lineHeight: 1.5 }}>
            When scanning a QR code with a physical mobile camera, the phone cannot connect to <code>localhost</code> (because on the phone, <code>localhost</code> means the phone itself).<br />
            • <strong>For Local Phone Testing:</strong> Select <strong>"Local Wi-Fi Mode"</strong> below so the QR encodes your computer's local Wi-Fi IP (<code>http://{wifiIp}:{currentPort}</code>). Both phone and PC must be on the same Wi-Fi.<br />
            • <strong>For Client Deployment:</strong> Select <strong>"Production Domain"</strong> and enter your public website link (e.g. <code>https://loyalty.burmix.com</code> or Vercel/Cloud URL).
          </p>
        </div>
      </div>

      <div className="lf-studio-grid">
        
        {/* Left Form Controls */}
        <div className="lf-card">
          <div className="lf-card-header">
            <div className="lf-card-title">
              <Layers size={18} className="lf-card-title-icon" />
              <span>Standee Customization</span>
            </div>
          </div>

          <div className="lf-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* QR Target URL & Hosting Mode */}
            <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212, 175, 55, 0.25)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="lf-label" style={{ fontWeight: 800, color: '#F3E5AB', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={13} style={{ color: '#D4AF37' }} />
                  <span>QR Code Target Host & Domain</span>
                </span>
                <span className="lf-badge lf-badge-emerald" style={{ fontSize: '9px' }}>Active</span>
              </div>

              {/* Mode Toggle Pills */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setUrlMode('wifi')}
                  className={`lf-icon-pill ${urlMode === 'wifi' ? 'active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center', fontSize: '11px', padding: '6px' }}
                >
                  <Wifi size={13} />
                  <span>Local Wi-Fi IP (Phone Test)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUrlMode('custom')}
                  className={`lf-icon-pill ${urlMode === 'custom' ? 'active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center', fontSize: '11px', padding: '6px' }}
                >
                  <Globe size={13} />
                  <span>Live Production Domain</span>
                </button>
              </div>

              {/* Wi-Fi IP Input */}
              {urlMode === 'wifi' && (
                <div className="lf-form-group" style={{ marginTop: '4px' }}>
                  <label className="lf-label" style={{ fontSize: '10.5px' }}>
                    Laptop Wi-Fi IPv4 Address (Port {currentPort})
                  </label>
                  <input
                    type="text"
                    className="lf-input lf-input-mono"
                    value={wifiIp}
                    onChange={(e) => setWifiIp(e.target.value)}
                    placeholder="e.g. 192.168.31.36"
                  />
                  <span style={{ fontSize: '10px', color: '#8E8478', marginTop: '2px' }}>
                    Connect phone to same Wi-Fi network to scan and open.
                  </span>
                </div>
              )}

              {/* Custom Domain Input */}
              {urlMode === 'custom' && (
                <div className="lf-form-group" style={{ marginTop: '4px' }}>
                  <label className="lf-label" style={{ fontSize: '10.5px' }}>Enter Production Base Domain / Cloud URL</label>
                  <input
                    type="text"
                    className="lf-input lf-input-mono"
                    value={customHost}
                    onChange={(e) => setCustomHost(e.target.value)}
                    placeholder="https://loyalty.burmix.com or https://burmix.vercel.app"
                  />
                </div>
              )}

              {/* Generated Full Pass URL */}
              <div>
                <span style={{ fontSize: '10px', color: '#8E8478', display: 'block', marginBottom: '4px' }}>Encoded QR Destination:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={passUrl}
                    className="lf-input lf-input-mono"
                    style={{ fontSize: '11px', background: 'rgba(0,0,0,0.6)', color: '#F3E5AB' }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="lf-btn lf-btn-secondary"
                    style={{ padding: '8px 12px' }}
                    title="Copy URL"
                  >
                    {copiedLink ? <Check size={14} style={{ color: '#10B981' }} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="lf-label" style={{ marginBottom: '8px', display: 'block' }}>Standee Physical Size</label>
              <div className="lf-grid-2">
                <div
                  onClick={() => setFormat('a5')}
                  className={`lf-preset-card ${format === 'a5' ? 'active' : ''}`}
                >
                  <div>
                    <div className="lf-preset-title">A5 Acrylic Stand</div>
                    <div className="lf-preset-desc">148 × 210 mm (Billing Counter)</div>
                  </div>
                </div>

                <div
                  onClick={() => setFormat('a6')}
                  className={`lf-preset-card ${format === 'a6' ? 'active' : ''}`}
                >
                  <div>
                    <div className="lf-preset-title">A6 Table Tent</div>
                    <div className="lf-preset-desc">105 × 148 mm (Dining Table)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="lf-form-group">
              <label className="lf-label">Call-to-Action Headline</label>
              <input
                type="text"
                className="lf-input"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Scan & Earn ₹100 Off on 5th Visit!"
              />
            </div>

            {/* Subtext */}
            <div className="lf-form-group">
              <label className="lf-label">Sub-Instructions</label>
              <input
                type="text"
                className="lf-input"
                value={subtext}
                onChange={(e) => setSubtext(e.target.value)}
                placeholder="No App Download Needed..."
              />
            </div>

            <div style={{ paddingTop: '6px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('customer-pass')}
                className="lf-btn lf-btn-secondary"
                style={{ width: '100%', borderColor: 'rgba(212, 175, 55, 0.3)' }}
              >
                <Smartphone size={14} style={{ color: '#D4AF37' }} />
                <span>Test Live Guest Mobile Pass View</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Acrylic Display Standee Mockup */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          
          <div
            id="standee-render-target"
            className="lf-standee-board"
            style={{
              width: format === 'a5' ? '340px' : '290px',
              minHeight: format === 'a5' ? '490px' : '420px'
            }}
          >
            {/* Top Brand Banner */}
            <div
              style={{
                width: '100%',
                padding: '20px 16px',
                backgroundColor: brandBg,
                color: '#FDFBF7',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              {activeRestaurant.logoUrl && (
                <img
                  src={activeRestaurant.logoUrl}
                  alt="logo"
                  crossOrigin="anonymous"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)', boxShadow: '0 4px 12px rgba(0,0,0,0.6)', marginBottom: '8px' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <h3 style={{ fontSize: '17px', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase', color: '#FDFBF7', fontFamily: 'var(--font-display)' }}>
                {activeRestaurant.name}
              </h3>
              <p style={{ fontSize: '11px', opacity: 0.8, color: '#D4CDC3' }}>{activeRestaurant.tagline}</p>
            </div>

            {/* Headline Body */}
            <div style={{ padding: '16px 20px 8px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', background: 'rgba(212, 175, 55, 0.15)', color: '#A47D1C', border: '1px solid rgba(212, 175, 55, 0.3)', marginBottom: '8px' }}>
                <Sparkles size={11} />
                <span>Digital Loyalty Pass</span>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 900, lineHeight: 1.25, color: '#1E293B', fontFamily: 'var(--font-display)' }}>
                {headline}
              </h2>
            </div>

            {/* High-Resolution QR Box */}
            <div style={{ padding: '12px', margin: '4px 0', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="pass qr"
                  style={{ width: '160px', height: '160px', objectFit: 'contain', borderRadius: '8px' }}
                />
              ) : (
                <div style={{ width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#94A3B8' }}>
                  Generating QR...
                </div>
              )}
              <span style={{ fontSize: '9px', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', color: '#64748B', textTransform: 'uppercase', marginTop: '6px' }}>
                POINT PHONE CAMERA TO JOIN
              </span>
            </div>

            {/* Footer */}
            <div style={{ width: '100%', padding: '12px 16px', background: '#F1F5F9', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                {subtext}
              </p>
              <div style={{ display: 'flex', gap: '8px', fontSize: '8.5px', fontFamily: 'var(--font-mono)', color: '#94A3B8', marginTop: '3px' }}>
                <span>✓ APPLE WALLET</span>
                <span>•</span>
                <span>✓ GOOGLE WALLET</span>
                <span>•</span>
                <span>✓ NO APP NEEDED</span>
              </div>
            </div>

          </div>

          {/* Acrylic Base Stand */}
          <div className="lf-standee-base" />

        </div>

      </div>
    </div>
  );
}
