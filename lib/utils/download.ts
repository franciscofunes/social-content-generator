export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
  try {
    console.log('Downloading image from URL:', imageUrl);
    
    // Handle CORS issues by using a proxy if needed
    let response;
    try {
      response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit'
      });
    } catch (corsError) {
      console.warn('CORS error, trying without mode:', corsError);
      response = await fetch(imageUrl);
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('Image blob created, size:', blob.size);
    
    const url = window.URL.createObjectURL(blob);
    
    // Get current date for filename
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    
    // Determine file extension from content type or URL
    const contentType = blob.type;
    let extension = 'jpg';
    if (contentType.includes('png')) extension = 'png';
    else if (contentType.includes('webp')) extension = 'webp';
    else if (contentType.includes('gif')) extension = 'gif';
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${dateStr}-${timeStr}.${extension}`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
    
    console.log('Image download initiated:', a.download);
    
  } catch (error) {
    console.error('Download error:', error);
    throw new Error(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}