import QRCode from 'qrcode';

export async function generateQrDataUrl(text, options = {}) {
  const {
    colorDark = '#000000',
    colorLight = '#FFFFFF',
    width = 300,
    margin = 2
  } = options;

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
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
