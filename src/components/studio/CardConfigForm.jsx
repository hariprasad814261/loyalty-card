import React, { useRef, useState } from 'react';
import { useLoyalty } from '../../context/LoyaltyContext';
import { PRESET_THEMES } from '../../utils/presetTemplates';
import { 
  Store, 
  Palette, 
  Award, 
  Link2, 
  Coffee, 
  Utensils, 
  Star, 
  Beer, 
  Gift, 
  Flame,
  Sparkles,
  Crown,
  Upload,
  Image as ImageIcon,
  X,
  Check,
  Globe,
  Plus,
  Smile,
  HeartPulse,
  Scissors,
  Dumbbell,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  Camera
} from 'lucide-react';

export default function CardConfigForm() {
  const { activeRestaurant, updateActiveRestaurant } = useLoyalty();
  const { theme = {}, program = {}, links = {} } = activeRestaurant || {};

  // Custom themes list state (seeded with PRESET_THEMES + allows user to add their own custom styles)
  const [customThemesList, setCustomThemesList] = useState(PRESET_THEMES);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Customizer modal state
  const [customName, setCustomName] = useState('Dental & Aesthetic Clinic');
  const [customCategory, setCustomCategory] = useState('Dental & Healthcare');
  const [customBgColor, setCustomBgColor] = useState('#091410');
  const [customCardBg, setCustomCardBg] = useState('#12241C');
  const [customAccent, setCustomAccent] = useState('#10B981');
  const [customStampGlow, setCustomStampGlow] = useState('#34D399');
  const [customTextColor, setCustomTextColor] = useState('#F0FAF5');
  const [customStampIcon, setCustomStampIcon] = useState('tooth');
  const [customRewardTitle, setCustomRewardTitle] = useState('Free Dental Scaling & Hygiene Session');
  const [customRewardDesc, setCustomRewardDesc] = useState('Visit 5 times for routine checkups to unlock a free dental scaling treatment.');
  const [customLogoUrl, setCustomLogoUrl] = useState('https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&auto=format&fit=crop&q=80');
  const [customBannerUrl, setCustomBannerUrl] = useState('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80');

  const [showModalLogoUrl, setShowModalLogoUrl] = useState(false);
  const [showModalBannerUrl, setShowModalBannerUrl] = useState(false);

  // Photo Uploader state (Main form)
  const [showLogoUrlInput, setShowLogoUrlInput] = useState(false);
  const [showBannerUrlInput, setShowBannerUrlInput] = useState(false);
  const [dragOverLogo, setDragOverLogo] = useState(false);
  const [dragOverBanner, setDragOverBanner] = useState(false);

  const logoFileInputRef = useRef(null);
  const bannerFileInputRef = useRef(null);
  const modalLogoFileRef = useRef(null);
  const modalBannerFileRef = useRef(null);

  const handleApplyPreset = (preset) => {
    updateActiveRestaurant({
      category: preset.category || activeRestaurant.category,
      theme: {
        preset: preset.id,
        bgColor: preset.bgColor,
        cardBgColor: preset.cardBgColor,
        textColor: preset.textColor,
        accentColor: preset.accentColor,
        stampActiveColor: preset.stampActiveColor,
        stampIcon: preset.stampIcon
      },
      program: {
        ...program,
        rewardTitle: preset.rewardTitle || program.rewardTitle,
        rewardDescription: preset.rewardDescription || program.rewardDescription
      },
      logoUrl: preset.logoUrl || activeRestaurant.logoUrl,
      bannerUrl: preset.bannerUrl || activeRestaurant.bannerUrl
    });
  };

  // Quick industry template starter inside the Customizer Modal
  const handleSelectIndustryStarter = (type) => {
    switch (type) {
      case 'dental':
        setCustomName('Dental Care & Orthodontics');
        setCustomCategory('Dental & Aesthetic Clinic');
        setCustomBgColor('#091410');
        setCustomCardBg('#12241C');
        setCustomAccent('#10B981');
        setCustomStampGlow('#34D399');
        setCustomTextColor('#F0FAF5');
        setCustomStampIcon('tooth');
        setCustomRewardTitle('Free Dental Scaling & Hygiene Session');
        setCustomRewardDesc('Visit 5 times for routine checkups to unlock a free dental scaling.');
        setCustomLogoUrl('https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&auto=format&fit=crop&q=80');
        setCustomBannerUrl('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80');
        break;
      case 'medical':
        setCustomName('Medical Care & Diagnostics Clinic');
        setCustomCategory('Healthcare & Diagnostics');
        setCustomBgColor('#0F1413');
        setCustomCardBg('#172320');
        setCustomAccent('#059669');
        setCustomStampGlow('#10B981');
        setCustomTextColor('#F4FAF8');
        setCustomStampIcon('stethoscope');
        setCustomRewardTitle('Free Doctor Consultation & Vit-D Test');
        setCustomRewardDesc('Complete 5 diagnostic check-ups to unlock a free follow-up doctor consultation.');
        setCustomLogoUrl('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=80');
        setCustomBannerUrl('https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80');
        break;
      case 'spa':
        setCustomName('Aesthetic Dermatology & Spa');
        setCustomCategory('Aesthetics, Spa & Beauty');
        setCustomBgColor('#170E0B');
        setCustomCardBg('#281711');
        setCustomAccent('#E07A5F');
        setCustomStampGlow('#F4A261');
        setCustomTextColor('#FFF8F5');
        setCustomStampIcon('spa');
        setCustomRewardTitle('Complimentary Hydro-Glow Facial');
        setCustomRewardDesc('Complete 5 aesthetic or spa sessions to unlock an exclusive Hydro-Glow booster.');
        setCustomLogoUrl('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=150&auto=format&fit=crop&q=80');
        setCustomBannerUrl('https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&auto=format&fit=crop&q=80');
        break;
      case 'salon':
        setCustomName('Luxury Salon & Barber Studio');
        setCustomCategory('Hair & Personal Styling');
        setCustomBgColor('#16100D');
        setCustomCardBg('#251913');
        setCustomAccent('#D4AF37');
        setCustomStampGlow('#E5C07B');
        setCustomTextColor('#FAF5F0');
        setCustomStampIcon('scissors');
        setCustomRewardTitle('Free Hair Spa & Beard Grooming');
        setCustomRewardDesc('Collect 5 styling stamps to receive a complimentary deep conditioning hair spa.');
        setCustomLogoUrl('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=150&auto=format&fit=crop&q=80');
        setCustomBannerUrl('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80');
        break;
      case 'fitness':
        setCustomName('Physiotherapy & Fitness Hub');
        setCustomCategory('Physiotherapy & Gym');
        setCustomBgColor('#100D0B');
        setCustomCardBg('#1E1612');
        setCustomAccent('#CA8A04');
        setCustomStampGlow('#EAB308');
        setCustomTextColor('#FAF6EE');
        setCustomStampIcon('fitness');
        setCustomRewardTitle('Free Ergonomic Posture Assessment');
        setCustomRewardDesc('Complete 5 fitness or physio sessions to unlock a free posture analysis.');
        setCustomLogoUrl('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=80');
        setCustomBannerUrl('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80');
        break;
      case 'cafe':
        setCustomName('Artisanal Coffee & Roasters');
        setCustomCategory('Cafe & Bakery');
        setCustomBgColor('#14100E');
        setCustomCardBg('#221A15');
        setCustomAccent('#D4AF37');
        setCustomStampGlow('#E5C07B');
        setCustomTextColor('#FDFBF7');
        setCustomStampIcon('cup');
        setCustomRewardTitle('₹100 Instant Discount on Bill');
        setCustomRewardDesc('Collect 5 stamps to receive ₹100 flat discount on your coffee & meal order.');
        setCustomLogoUrl('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=80');
        setCustomBannerUrl('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop&q=80');
        break;
      case 'dining':
        setCustomName('Heritage Dining & Tandoor');
        setCustomCategory('Fine Dining Restaurant');
        setCustomBgColor('#0F0D0C');
        setCustomCardBg('#1C1715');
        setCustomAccent('#D97706');
        setCustomStampGlow('#F59E0B');
        setCustomTextColor('#FAF8F5');
        setCustomStampIcon('utensils');
        setCustomRewardTitle('₹150 Discount on Family Dining');
        setCustomRewardDesc('Collect 5 stamps on dining orders to claim ₹150 off your meal feast.');
        setCustomLogoUrl('https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=150&auto=format&fit=crop&q=80');
        setCustomBannerUrl('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80');
        break;
      default:
        break;
    }
  };

  // Save custom theme from modal
  const handleSaveAndApplyCustomTheme = (e) => {
    e.preventDefault();
    const newPreset = {
      id: `custom_${Date.now()}`,
      name: customName || 'Custom Clinic / Style',
      category: customCategory || 'Custom Business',
      bgColor: customBgColor,
      cardBgColor: customCardBg,
      textColor: customTextColor,
      accentColor: customAccent,
      stampActiveColor: customStampGlow,
      stampIcon: customStampIcon,
      rewardTitle: customRewardTitle,
      rewardDescription: customRewardDesc,
      logoUrl: customLogoUrl,
      bannerUrl: customBannerUrl
    };

    setCustomThemesList(prev => [newPreset, ...prev]);
    handleApplyPreset(newPreset);
    setShowCustomModal(false);
  };

  // Handle Logo Upload from Local Device / Gallery (Main Form)
  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      updateActiveRestaurant({ logoUrl: uploadEvent.target?.result });
    };
    reader.readAsDataURL(file);
  };

  // Handle Banner Upload from Local Device / Gallery (Main Form)
  const handleBannerFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      updateActiveRestaurant({ bannerUrl: uploadEvent.target?.result });
    };
    reader.readAsDataURL(file);
  };

  // Handle Modal Banner Upload from Local Device / Gallery
  const handleModalBannerFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setCustomBannerUrl(uploadEvent.target?.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Modal Logo Upload from Local Device / Gallery
  const handleModalLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setCustomLogoUrl(uploadEvent.target?.result);
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop Handlers for Logo
  const handleLogoDrop = (e) => {
    e.preventDefault();
    setDragOverLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        updateActiveRestaurant({ logoUrl: uploadEvent.target?.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag & Drop Handlers for Banner
  const handleBannerDrop = (e) => {
    e.preventDefault();
    setDragOverBanner(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        updateActiveRestaurant({ bannerUrl: uploadEvent.target?.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const stampIcons = [
    { id: 'cup', label: 'Coffee Cup', icon: Coffee },
    { id: 'utensils', label: 'Fine Dining', icon: Utensils },
    { id: 'tooth', label: 'Dental / Smile', icon: Smile },
    { id: 'stethoscope', label: 'Medical / Clinic', icon: HeartPulse },
    { id: 'spa', label: 'Spa / Aesthetics', icon: Sparkles },
    { id: 'scissors', label: 'Salon / Barber', icon: Scissors },
    { id: 'fitness', label: 'Fitness / Physio', icon: Dumbbell },
    { id: 'star', label: 'Star Gold', icon: Star },
    { id: 'fire', label: 'Hearth / Grill', icon: Flame },
    { id: 'gift', label: 'Gift / Bakery', icon: Gift },
    { id: 'beer', label: 'Lounge / Bar', icon: Beer },
    { id: 'shield', label: 'Verified Shield', icon: ShieldCheck }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      
      {/* 1. Brand & Identity */}
      <div className="lf-card">
        <div className="lf-card-header">
          <div className="lf-card-title">
            <Store size={18} className="lf-card-title-icon" />
            <span>1. Brand & Restaurant Identity</span>
          </div>
          <span className="lf-badge lf-badge-gold">Studio Asset</span>
        </div>

        <div className="lf-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Basic Info */}
          <div className="lf-grid-2">
            <div className="lf-form-group">
              <label className="lf-label">Restaurant / Clinic Brand Name</label>
              <input
                type="text"
                className="lf-input"
                value={activeRestaurant.name || ''}
                onChange={(e) => updateActiveRestaurant({ name: e.target.value })}
                placeholder="e.g. Copper Chimney, Apex Dental Care, Serenity Spa"
              />
            </div>

            <div className="lf-form-group">
              <label className="lf-label">Tagline / Sub-Headline</label>
              <input
                type="text"
                className="lf-input"
                value={activeRestaurant.tagline || ''}
                onChange={(e) => updateActiveRestaurant({ tagline: e.target.value })}
                placeholder="e.g. Artisanal Coffee & Fresh Bakes, Gentle Dental Care"
              />
            </div>

            <div className="lf-form-group">
              <label className="lf-label">Business / Hospitality Category</label>
              <input
                type="text"
                className="lf-input"
                value={activeRestaurant.category || ''}
                onChange={(e) => updateActiveRestaurant({ category: e.target.value })}
                placeholder="e.g. Artisanal Cafe, Dental Clinic, Aesthetics Spa"
              />
            </div>

            <div className="lf-form-group">
              <label className="lf-label">Currency Symbol</label>
              <input
                type="text"
                className="lf-input lf-input-mono"
                value={activeRestaurant.currency || '₹'}
                onChange={(e) => updateActiveRestaurant({ currency: e.target.value })}
                placeholder="₹"
              />
            </div>
          </div>

          {/* Custom Photo Uploaders Section */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="lf-label" style={{ fontSize: '13px', fontWeight: 800, color: '#F3E5AB' }}>
                📸 Custom Brand Media & Gallery Photos
              </span>
              <span className="lf-badge lf-badge-emerald" style={{ fontSize: '9px' }}>Live Sync</span>
            </div>

            <div className="lf-grid-2">
              
              {/* BRAND LOGO PHOTO UPLOADER */}
              <div 
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: dragOverLogo ? 'rgba(212, 175, 55, 0.12)' : 'rgba(0,0,0,0.3)',
                  border: dragOverLogo ? '1.5px dashed #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOverLogo(true); }}
                onDragLeave={() => setDragOverLogo(false)}
                onDrop={handleLogoDrop}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="lf-label" style={{ fontWeight: 700 }}>Brand Logo Photo</span>
                  <button
                    type="button"
                    onClick={() => setShowLogoUrlInput(!showLogoUrlInput)}
                    style={{ background: 'none', border: 'none', color: '#D4AF37', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Globe size={12} />
                    <span>{showLogoUrlInput ? 'Upload Mode' : 'Paste URL'}</span>
                  </button>
                </div>

                {/* Upload Action Area */}
                {!showLogoUrlInput ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Thumbnail Preview */}
                    <div style={{ position: 'relative', width: '54px', height: '54px', flexShrink: 0 }}>
                      {activeRestaurant.logoUrl ? (
                        <img
                          src={activeRestaurant.logoUrl}
                          alt="logo"
                          style={{ width: '54px', height: '54px', borderRadius: '12px', objectFit: 'cover', border: '1.5px solid rgba(212, 175, 55, 0.4)', boxShadow: '0 4px 12px rgba(0,0,0,0.6)' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ width: '54px', height: '54px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8478' }}>
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>

                    {/* Buttons & Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <input
                        type="file"
                        ref={logoFileInputRef}
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="lf-btn lf-btn-gold"
                        style={{ padding: '8px 12px', fontSize: '11.5px', width: '100%' }}
                      >
                        <Upload size={13} />
                        <span>Upload from Device</span>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#8E8478' }}>
                        <span>PNG, JPG, SVG</span>
                        {activeRestaurant.logoUrl && (
                          <button
                            type="button"
                            onClick={() => updateActiveRestaurant({ logoUrl: '' })}
                            style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', fontSize: '10px' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="lf-form-group">
                    <input
                      type="text"
                      className="lf-input lf-input-mono"
                      style={{ fontSize: '11px' }}
                      value={activeRestaurant.logoUrl || ''}
                      onChange={(e) => updateActiveRestaurant({ logoUrl: e.target.value })}
                      placeholder="https://... logo.png"
                    />
                  </div>
                )}
              </div>

              {/* HERO BANNER PHOTO UPLOADER */}
              <div 
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: dragOverBanner ? 'rgba(212, 175, 55, 0.12)' : 'rgba(0,0,0,0.3)',
                  border: dragOverBanner ? '1.5px dashed #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOverBanner(true); }}
                onDragLeave={() => setDragOverBanner(false)}
                onDrop={handleBannerDrop}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="lf-label" style={{ fontWeight: 700 }}>Hero Banner / Phone Strip Photo</span>
                  <button
                    type="button"
                    onClick={() => setShowBannerUrlInput(!showBannerUrlInput)}
                    style={{ background: 'none', border: 'none', color: '#D4AF37', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Globe size={12} />
                    <span>{showBannerUrlInput ? 'Upload Mode' : 'Paste URL'}</span>
                  </button>
                </div>

                {/* Upload Action Area */}
                {!showBannerUrlInput ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Thumbnail Preview */}
                    <div style={{ position: 'relative', width: '74px', height: '54px', flexShrink: 0 }}>
                      {activeRestaurant.bannerUrl ? (
                        <img
                          src={activeRestaurant.bannerUrl}
                          alt="banner"
                          style={{ width: '74px', height: '54px', borderRadius: '10px', objectFit: 'cover', border: '1.5px solid rgba(212, 175, 55, 0.4)', boxShadow: '0 4px 12px rgba(0,0,0,0.6)' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ width: '74px', height: '54px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8478' }}>
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>

                    {/* Buttons & Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <input
                        type="file"
                        ref={bannerFileInputRef}
                        accept="image/*"
                        onChange={handleBannerFileUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => bannerFileInputRef.current?.click()}
                        className="lf-btn lf-btn-secondary"
                        style={{ padding: '8px 12px', fontSize: '11.5px', width: '100%', borderColor: 'rgba(212, 175, 55, 0.35)' }}
                      >
                        <Upload size={13} style={{ color: '#D4AF37' }} />
                        <span>Upload Banner Photo</span>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#8E8478' }}>
                        <span>Landscape 16:9</span>
                        {activeRestaurant.bannerUrl && (
                          <button
                            type="button"
                            onClick={() => updateActiveRestaurant({ bannerUrl: '' })}
                            style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', fontSize: '10px' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="lf-form-group">
                    <input
                      type="text"
                      className="lf-input lf-input-mono"
                      style={{ fontSize: '11px' }}
                      value={activeRestaurant.bannerUrl || ''}
                      onChange={(e) => updateActiveRestaurant({ bannerUrl: e.target.value })}
                      placeholder="https://... banner.jpg"
                    />
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 2. Visual Style & Curated Palettes */}
      <div className="lf-card">
        <div className="lf-card-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <div className="lf-card-title">
            <Palette size={18} className="lf-card-title-icon" />
            <span>2. Curated Hospitality & Clinic Themes</span>
          </div>

          {/* CUSTOM THEME & CLINIC BUTTON */}
          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="lf-btn lf-btn-gold"
            style={{ padding: '7px 14px', fontSize: '12px' }}
          >
            <Sliders size={14} />
            <span>+ Custom Style / Clinic</span>
          </button>
        </div>

        <div className="lf-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Preset Cards Grid */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label className="lf-label">
                Select Curated Theme Preset (Hospitality, Clinic, Spa & Custom)
              </label>
              <span style={{ fontSize: '11px', color: '#D4AF37' }}>
                {customThemesList.length} Styles Available
              </span>
            </div>

            <div className="lf-grid-3">
              {/* Add Custom Style Tile Button */}
              <div
                onClick={() => setShowCustomModal(true)}
                className="lf-preset-card"
                style={{
                  border: '1.5px dashed rgba(212, 175, 55, 0.4)',
                  background: 'rgba(212, 175, 55, 0.04)',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37' }}>
                    <Plus size={16} />
                  </div>
                  <div>
                    <div className="lf-preset-title" style={{ color: '#F3E5AB' }}>+ Custom Style / Clinic</div>
                    <div className="lf-preset-desc">Add New Business Theme</div>
                  </div>
                </div>
              </div>

              {/* Dynamic Themes */}
              {customThemesList.map((preset) => {
                const isSelected = theme.preset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={`lf-preset-card ${isSelected ? 'active' : ''}`}
                  >
                    <div
                      className="lf-preset-swatch"
                      style={{ backgroundColor: preset.cardBgColor, borderColor: preset.accentColor }}
                    />
                    <div>
                      <div className="lf-preset-title">{preset.name}</div>
                      <div className="lf-preset-desc">{preset.category || 'Theme Preset'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color Customization */}
          <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <label className="lf-label" style={{ marginBottom: '10px', display: 'block' }}>
              Custom Swatches
            </label>
            <div className="lf-grid-3">
              <div className="lf-form-group">
                <span className="lf-label">Pass Background</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={theme.cardBgColor || '#221A15'}
                    onChange={(e) => updateActiveRestaurant({ theme: { cardBgColor: e.target.value, preset: 'custom' } })}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', background: 'transparent' }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#D4CDC3' }}>{theme.cardBgColor}</span>
                </div>
              </div>

              <div className="lf-form-group">
                <span className="lf-label">Metallic Accent</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={theme.accentColor || '#D4AF37'}
                    onChange={(e) => updateActiveRestaurant({ theme: { accentColor: e.target.value } })}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', background: 'transparent' }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#D4CDC3' }}>{theme.accentColor}</span>
                </div>
              </div>

              <div className="lf-form-group">
                <span className="lf-label">Active Stamp Glow</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={theme.stampActiveColor || '#E5C07B'}
                    onChange={(e) => updateActiveRestaurant({ theme: { stampActiveColor: e.target.value } })}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', background: 'transparent' }}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#D4CDC3' }}>{theme.stampActiveColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stamp Icon Picker */}
          <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <label className="lf-label" style={{ marginBottom: '10px', display: 'block' }}>
              Stamp Mark Shape (Hospitality, Clinic, Spa & Fitness)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {stampIcons.map((item) => {
                const IconComponent = item.icon;
                const isSelected = theme.stampIcon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateActiveRestaurant({ theme: { stampIcon: item.id } })}
                    className={`lf-icon-pill ${isSelected ? 'active' : ''}`}
                  >
                    <IconComponent size={15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Loyalty & Reward Rules (PDF Specification) */}
      <div className="lf-card">
        <div className="lf-card-header">
          <div className="lf-card-title">
            <Award size={18} className="lf-card-title-icon" />
            <span>3. Loyalty Reward Rules (PDF Retention Model)</span>
          </div>
          <span className="lf-badge lf-badge-emerald">Revenue Engine</span>
        </div>

        <div className="lf-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="lf-grid-2">
            <div className="lf-form-group">
              <label className="lf-label">Stamps per Reward Cycle</label>
              <select
                className="lf-select"
                value={program.totalStamps || 5}
                onChange={(e) => updateActiveRestaurant({ program: { totalStamps: parseInt(e.target.value) } })}
              >
                <option value="3" style={{ background: '#1A1412' }}>3 Visits (Rapid Retention Clinic / Express)</option>
                <option value="5" style={{ background: '#1A1412' }}>5 Visits (High Engagement — Recommended)</option>
                <option value="8" style={{ background: '#1A1412' }}>8 Visits</option>
                <option value="10" style={{ background: '#1A1412' }}>10 Visits (Classic Loyalty Punch)</option>
                <option value="12" style={{ background: '#1A1412' }}>12 Visits</option>
              </select>
            </div>

            <div className="lf-form-group">
              <label className="lf-label">Primary Reward Offer</label>
              <input
                type="text"
                className="lf-input"
                value={program.rewardTitle || ''}
                onChange={(e) => updateActiveRestaurant({ program: { rewardTitle: e.target.value } })}
                placeholder="e.g. ₹100 Instant Discount, Free Dental Scaling"
              />
            </div>
          </div>

          <div className="lf-form-group">
            <label className="lf-label">Reward Description & Terms</label>
            <input
              type="text"
              className="lf-input"
              value={program.rewardDescription || ''}
              onChange={(e) => updateActiveRestaurant({ program: { rewardDescription: e.target.value } })}
              placeholder="Collect 5 stamps to receive ₹100 flat discount or complimentary consultation."
            />
          </div>

          <div className="lf-grid-2" style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="lf-form-group">
              <label className="lf-label" style={{ color: '#F3E5AB' }}>VIP Lifetime Spend Threshold (₹)</label>
              <input
                type="number"
                className="lf-input lf-input-mono"
                value={program.vipSpendThreshold || 5000}
                onChange={(e) => updateActiveRestaurant({ program: { vipSpendThreshold: parseFloat(e.target.value) || 0 } })}
                placeholder="5000"
              />
            </div>

            <div className="lf-form-group">
              <label className="lf-label" style={{ color: '#F3E5AB' }}>VIP Exclusive Gold Perk</label>
              <input
                type="text"
                className="lf-input"
                value={program.vipReward || ''}
                onChange={(e) => updateActiveRestaurant({ program: { vipReward: e.target.value } })}
                placeholder="e.g. VIP Gold: 15% Off all family check-ups"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Back-of-Pass Engagement Links */}
      <div className="lf-card">
        <div className="lf-card-header">
          <div className="lf-card-title">
            <Link2 size={18} className="lf-card-title-icon" />
            <span>4. Back-of-Pass Marketing & Social Links</span>
          </div>
        </div>

        <div className="lf-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="lf-grid-2">
            <div className="lf-form-group">
              <label className="lf-label">Google Review URL (Direct 5-Star Link)</label>
              <input
                type="text"
                className="lf-input lf-input-mono"
                value={links.googleReviewUrl || ''}
                onChange={(e) => updateActiveRestaurant({ links: { googleReviewUrl: e.target.value } })}
                placeholder="https://maps.google.com/place/..."
              />
            </div>

            <div className="lf-form-group">
              <label className="lf-label">Instagram Page URL or @handle</label>
              <input
                type="text"
                className="lf-input lf-input-mono"
                value={links.instagramHandle || ''}
                onChange={(e) => updateActiveRestaurant({ links: { instagramHandle: e.target.value } })}
                placeholder="https://www.instagram.com/get_burmixed or @get_burmixed"
              />
            </div>

            <div className="lf-form-group">
              <label className="lf-label">Contact Phone</label>
              <input
                type="text"
                className="lf-input lf-input-mono"
                value={links.phone || ''}
                onChange={(e) => updateActiveRestaurant({ links: { phone: e.target.value } })}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="lf-form-group">
              <label className="lf-label">WhatsApp Business Number</label>
              <input
                type="text"
                className="lf-input lf-input-mono"
                value={links.whatsapp || ''}
                onChange={(e) => updateActiveRestaurant({ links: { whatsapp: e.target.value } })}
                placeholder="+919876543210"
              />
            </div>
          </div>

          <div className="lf-form-group">
            <label className="lf-label">Physical Location Address</label>
            <input
              type="text"
              className="lf-input"
              value={links.address || ''}
              onChange={(e) => updateActiveRestaurant({ links: { address: e.target.value } })}
              placeholder="12, 100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038"
            />
          </div>
        </div>
      </div>

      {/* ==========================================================================
          CUSTOM THEME & CLINIC BUILDER MODAL
          ========================================================================== */}
      {showCustomModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="lf-card animate-fade-in" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gold-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#171108', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)' }}>
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FDFBF7' }}>Custom Style & Clinic Theme Builder</h3>
                  <p style={{ fontSize: '11px', color: '#8E8478' }}>
                    Create custom branding layouts for dental clinics, wellness centers, salons, or specialty eateries.
                  </p>
                </div>
              </div>

              <button type="button" onClick={() => setShowCustomModal(false)} className="lf-btn-ghost" style={{ cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAndApplyCustomTheme} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Quick Template Starters */}
              <div>
                <label className="lf-label" style={{ marginBottom: '8px', display: 'block' }}>
                  Select Industry Quick-Starter:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    { id: 'dental', label: '🦷 Dental Clinic' },
                    { id: 'medical', label: '⚕️ Medical Diagnostics' },
                    { id: 'spa', label: '💆 Aesthetics & Spa' },
                    { id: 'salon', label: '✂️ Salon & Barber' },
                    { id: 'fitness', label: '🏋️ Fitness / Physio' },
                    { id: 'cafe', label: '☕ Cafe & Bakery' },
                    { id: 'dining', label: '🍴 Fine Dining' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectIndustryStarter(s.id)}
                      className="lf-icon-pill"
                      style={{ fontSize: '11px', padding: '6px 12px' }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Fields */}
              <div className="lf-grid-2">
                <div className="lf-form-group">
                  <label className="lf-label">Theme / Style Name</label>
                  <input
                    type="text"
                    required
                    className="lf-input"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Dental Care & Orthodontics"
                  />
                </div>

                <div className="lf-form-group">
                  <label className="lf-label">Business Category</label>
                  <input
                    type="text"
                    required
                    className="lf-input"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Dental & Aesthetic Clinic"
                  />
                </div>
              </div>

              {/* Custom Hero Banner (Phone Strip Image) & Logo Upload Section in Modal */}
              <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(212, 175, 55, 0.25)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="lf-label" style={{ fontSize: '12.5px', fontWeight: 800, color: '#F3E5AB', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Camera size={14} style={{ color: '#D4AF37' }} />
                    <span>Card Hero Photo (Phone Display Image) & Brand Logo</span>
                  </span>
                </div>

                <div className="lf-grid-2">
                  
                  {/* Banner / Phone Strip Image Uploader */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="lf-label" style={{ fontSize: '11px' }}>Phone Hero Banner Image</span>
                      <button
                        type="button"
                        onClick={() => setShowModalBannerUrl(!showModalBannerUrl)}
                        style={{ background: 'none', border: 'none', color: '#D4AF37', fontSize: '10px', cursor: 'pointer' }}
                      >
                        {showModalBannerUrl ? 'Upload Mode' : 'Paste URL'}
                      </button>
                    </div>

                    {!showModalBannerUrl ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ position: 'relative', width: '80px', height: '52px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', border: '1.5px solid rgba(212, 175, 55, 0.4)' }}>
                          {customBannerUrl ? (
                            <img
                              src={customBannerUrl}
                              alt="custom banner"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8478', fontSize: '10px' }}>
                              No Image
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <input
                            type="file"
                            ref={modalBannerFileRef}
                            accept="image/*"
                            onChange={handleModalBannerFileUpload}
                            style={{ display: 'none' }}
                          />
                          <button
                            type="button"
                            onClick={() => modalBannerFileRef.current?.click()}
                            className="lf-btn lf-btn-gold"
                            style={{ padding: '7px 10px', fontSize: '11px', width: '100%' }}
                          >
                            <Upload size={12} />
                            <span>Upload from Gallery</span>
                          </button>
                          <span style={{ fontSize: '9.5px', color: '#8E8478' }}>Replaces phone card image</span>
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        className="lf-input lf-input-mono"
                        style={{ fontSize: '11px' }}
                        value={customBannerUrl}
                        onChange={(e) => setCustomBannerUrl(e.target.value)}
                        placeholder="https://... banner.jpg"
                      />
                    )}
                  </div>

                  {/* Logo Image Uploader */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="lf-label" style={{ fontSize: '11px' }}>Brand Logo Image</span>
                      <button
                        type="button"
                        onClick={() => setShowModalLogoUrl(!showModalLogoUrl)}
                        style={{ background: 'none', border: 'none', color: '#D4AF37', fontSize: '10px', cursor: 'pointer' }}
                      >
                        {showModalLogoUrl ? 'Upload Mode' : 'Paste URL'}
                      </button>
                    </div>

                    {!showModalLogoUrl ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ position: 'relative', width: '52px', height: '52px', flexShrink: 0, borderRadius: '10px', overflow: 'hidden', border: '1.5px solid rgba(212, 175, 55, 0.4)' }}>
                          {customLogoUrl ? (
                            <img
                              src={customLogoUrl}
                              alt="custom logo"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8E8478', fontSize: '10px' }}>
                              No Logo
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <input
                            type="file"
                            ref={modalLogoFileRef}
                            accept="image/*"
                            onChange={handleModalLogoFileUpload}
                            style={{ display: 'none' }}
                          />
                          <button
                            type="button"
                            onClick={() => modalLogoFileRef.current?.click()}
                            className="lf-btn lf-btn-secondary"
                            style={{ padding: '7px 10px', fontSize: '11px', width: '100%', borderColor: 'rgba(212, 175, 55, 0.3)' }}
                          >
                            <Upload size={12} style={{ color: '#D4AF37' }} />
                            <span>Upload Logo</span>
                          </button>
                          <span style={{ fontSize: '9.5px', color: '#8E8478' }}>Square icon (1:1)</span>
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        className="lf-input lf-input-mono"
                        style={{ fontSize: '11px' }}
                        value={customLogoUrl}
                        onChange={(e) => setCustomLogoUrl(e.target.value)}
                        placeholder="https://... logo.png"
                      />
                    )}
                  </div>

                </div>
              </div>

              {/* Color Customizer */}
              <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="lf-label" style={{ marginBottom: '10px', display: 'block', color: '#F3E5AB' }}>
                  Custom Theme Color Swatches
                </span>
                <div className="lf-grid-3">
                  <div className="lf-form-group">
                    <span className="lf-label">Pass Background</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={customCardBg}
                        onChange={(e) => setCustomCardBg(e.target.value)}
                        style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', background: 'transparent' }}
                      />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: '#D4CDC3' }}>{customCardBg}</span>
                    </div>
                  </div>

                  <div className="lf-form-group">
                    <span className="lf-label">Metallic Accent</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={customAccent}
                        onChange={(e) => setCustomAccent(e.target.value)}
                        style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', background: 'transparent' }}
                      />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: '#D4CDC3' }}>{customAccent}</span>
                    </div>
                  </div>

                  <div className="lf-form-group">
                    <span className="lf-label">Active Stamp Glow</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={customStampGlow}
                        onChange={(e) => setCustomStampGlow(e.target.value)}
                        style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', background: 'transparent' }}
                      />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: '#D4CDC3' }}>{customStampGlow}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stamp Mark Icons */}
              <div>
                <label className="lf-label" style={{ marginBottom: '8px', display: 'block' }}>
                  Select Stamp Mark Symbol:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {stampIcons.map((item) => {
                    const IconComponent = item.icon;
                    const isSelected = customStampIcon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCustomStampIcon(item.id)}
                        className={`lf-icon-pill ${isSelected ? 'active' : ''}`}
                        style={{ fontSize: '11px', padding: '6px 10px' }}
                      >
                        <IconComponent size={14} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reward Offer in Theme */}
              <div className="lf-form-group">
                <label className="lf-label">Default Milestone Reward Offer</label>
                <input
                  type="text"
                  className="lf-input"
                  value={customRewardTitle}
                  onChange={(e) => setCustomRewardTitle(e.target.value)}
                  placeholder="e.g. Free Dental Scaling / ₹100 Off Bill"
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="lf-btn lf-btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="lf-btn lf-btn-gold"
                  style={{ padding: '10px 22px' }}
                >
                  <CheckCircle2 size={15} />
                  <span>Save & Apply Custom Theme</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
