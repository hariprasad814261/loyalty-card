import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Trigger clean file download directly to the user's Downloads folder
 */
function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = filename;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 1000);
}

/**
 * Directly download the generated QR Code PNG image to the Downloads folder
 */
export function exportQrCodePng(qrDataUrl, filename = 'restaurant_qr_code.png') {
  if (!qrDataUrl) return false;
  try {
    downloadFile(qrDataUrl, filename);
    return true;
  } catch (err) {
    console.error('Error downloading QR code:', err);
    return false;
  }
}

/**
 * Capture an HTML element with html2canvas reliably (handling CORS & canvas tainting)
 */
async function captureElementCanvas(element) {
  const options = {
    scale: 2.5,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#FFFFFF',
    imageTimeout: 10000,
    onclone: (clonedDoc) => {
      const imgs = clonedDoc.getElementsByTagName('img');
      for (let i = 0; i < imgs.length; i++) {
        imgs[i].crossOrigin = 'anonymous';
      }
    }
  };

  try {
    return await html2canvas(element, options);
  } catch (err) {
    console.warn('Initial html2canvas capture failed, retrying with fallback options...', err);
    return await html2canvas(element, {
      ...options,
      useCORS: false,
      allowTaint: true,
      ignoreElements: (el) => el.tagName === 'IMG' && el.src && el.src.startsWith('http') && !el.src.includes(window.location.host)
    });
  }
}

/**
 * Export Standee Element as PDF (A5 / A6) directly to Downloads folder
 */
export async function exportElementAsPdf(elementId, filename = 'restaurant_standee.pdf', format = 'a5') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id '${elementId}' not found for PDF export.`);
    return false;
  }

  try {
    const canvas = await captureElementCanvas(element);
    const imgData = canvas.toDataURL('image/png');
    
    const isA5 = format.toLowerCase() === 'a5';
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: isA5 ? 'a5' : 'a6'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    
    // jsPDF native save directly downloads to C:\Users\<user>\Downloads
    pdf.save(filename);

    return true;
  } catch (err) {
    console.error('Error generating PDF export:', err);
    return false;
  }
}

/**
 * Export Standee Element as High-Res PNG directly to Downloads folder
 */
export async function exportElementAsPng(elementId, filename = 'restaurant_standee.png') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id '${elementId}' not found for PNG export.`);
    return false;
  }

  try {
    const canvas = await captureElementCanvas(element);
    const dataUrl = canvas.toDataURL('image/png');
    downloadFile(dataUrl, filename);
    return true;
  } catch (err) {
    console.error('Error generating PNG export:', err);
    return false;
  }
}
