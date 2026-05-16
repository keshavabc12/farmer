/**
 * Resizes and compresses an image base64 string or File.
 * @param {File|string} source - The source image (File object or base64 string)
 * @param {number} maxWidth - Maximum width of the output image
 * @param {number} maxHeight - Maximum height of the output image
 * @param {number} quality - Compression quality (0 to 1)
 * @returns {Promise<string>} - Resized image as base64 string
 */
export const resizeImage = (source, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = typeof source === 'string' ? source : URL.createObjectURL(source);
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const resizedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(resizedBase64);
    };

    img.onerror = (err) => reject(err);
  });
};

/**
 * Downloads data as CSV file.
 * @param {Array} data - Array of objects
 * @param {string} filename - Filename for download
 */
export const downloadCSV = (data, filename = 'responses.csv') => {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => {
    return Object.values(obj).map(val => {
      let cell = val === null || val === undefined ? '' : String(val);
      cell = cell.replace(/"/g, '""');
      if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
      return cell;
    }).join(',');
  });
  
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
