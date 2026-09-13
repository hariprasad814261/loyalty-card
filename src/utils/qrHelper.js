import QRCode from 'qrcode';

export function getAppBaseOrigin() {
  if (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null') {
    return window.location.origin;
  }
  return 'https://your-domain.vercel.app';
}

export function getRestaurantPassUrl(restaurantId, baseOrigin = null) {
  const origin = baseOrigin || getAppBaseOrigin();
  const cleanRestId = restaurantId || 'rest_001';
  return `${origin}/?pass=${encodeURIComponent(cleanRestId)}`;
}

export function getCustomerPassUrl(restaurantId, phone, baseOrigin = null) {
  const origin = baseOrigin || getAppBaseOrigin();
  const cleanRestId = restaurantId || 'rest_001';
  const cleanPhone = (phone || '').replace(/\D/g, '');
  if (cleanPhone) {
    return `${origin}/?pass=${encodeURIComponent(cleanRestId)}&phone=${encodeURIComponent(cleanPhone)}`;
  }
  return `${origin}/?pass=${encodeURIComponent(cleanRestId)}`;
}

export function getVoucherRedeemUrl(restaurantId, phone, voucherCode, baseOrigin = null) {
  const origin = baseOrigin || getAppBaseOrigin();
  const cleanRestId = restaurantId || 'rest_001';
  const cleanPhone = (phone || '').replace(/\D/g, '');
  return `${origin}/?pass=${encodeURIComponent(cleanRestId)}&phone=${encodeURIComponent(cleanPhone)}&voucher=${encodeURIComponent(voucherCode || '')}`;
}

export function parseLoyaltyQrPayload(text) {
  if (!text) return null;
  const raw = String(text).trim();

  try {
    // If it's a URL
    if (raw.includes('?') || raw.includes('/pass/')) {
      let restId = null;
      let phone = null;
      let voucherCode = null;

      if (raw.includes('?')) {
        const queryPart = raw.split('?')[1];
        const params = new URLSearchParams(queryPart);
        restId = params.get('pass') || params.get('restaurant') || params.get('resto') || params.get('shop') || params.get('id');
        phone = params.get('phone') || params.get('mobile') || params.get('cust');
        voucherCode = params.get('voucher') || params.get('redeem') || params.get('code');
      }

      if (!restId && raw.includes('/pass/')) {
        const parts = raw.split('/pass/')[1]?.split(/[?#/]/)[0];
        if (parts) restId = parts;
      }

      return {
        isUrl: true,
        restaurantId: restId || null,
        phone: phone ? phone.replace(/\D/g, '') : null,
        voucherCode: voucherCode || null,
        raw
      };
    }

    // If it's JSON formatted
    if (raw.startsWith('{') && raw.endsWith('}')) {
      const parsed = JSON.parse(raw);
      return {
        isJson: true,
        restaurantId: parsed.restaurantId || parsed.restId || parsed.pass || null,
        phone: parsed.phone ? String(parsed.phone).replace(/\D/g, '') : null,
        voucherCode: parsed.voucherCode || parsed.code || null,
        raw
      };
    }

    // If it's just a 10-digit phone number
    const digitsOnly = raw.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
      return {
        isPhone: true,
        restaurantId: null,
        phone: digitsOnly,
        voucherCode: null,
        raw
      };
    }

    return { raw };
  } catch (err) {
    return { raw, error: err.message };
  }
}

export async function generateQrDataUrl(text, options = {}) {
  const {
    colorDark = '#000000',
    colorLight = '#FFFFFF',
    width = 300,
    margin = 2
  } = options;

  if (!text) return null;

  try {
    const url = await QRCode.toDataURL(text, {
      width,
      margin,
      color: {
        dark: colorDark,
        light: colorLight
      },
      errorCorrectionLevel: 'H'
    });
    return url;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return null;
  }
}

export function downloadDataUrl(dataUrl, filename = 'restaurant_pass_qr.png') {
  if (!dataUrl) return;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
