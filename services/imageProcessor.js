import sharp from 'sharp';
import axios from 'axios';
import fs from 'fs';

/**
 * Download image from URL to buffer
 */
const downloadImage = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    return Buffer.from(response.data);
  } catch (error) {
    throw new Error(`Failed to download image: ${error.message}`);
  }
};

/**
 * Convert base64 to buffer
 */
const base64ToBuffer = (base64String) => {
  try {
    const base64Data = base64String.includes(',') 
      ? base64String.split(',')[1] 
      : base64String;
    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    throw new Error(`Failed to convert base64: ${error.message}`);
  }
};

/**
 * Add logo overlay to generated image
 * @param {string} imageUrl - URL or base64 of generated image
 * @param {string} logoPath - Path to logo file
 * @returns {string} - Base64 encoded image with logo
 */
export const addLogoOverlay = async (imageUrl, logoPath) => {
  try {
    console.log('🎨 Starting logo overlay process...');

    // Step 1: Get main image buffer
    let imageBuffer;
    
    if (imageUrl.startsWith('http')) {
      console.log('⬇️  Downloading image from URL...');
      imageBuffer = await downloadImage(imageUrl);
    } else if (imageUrl.startsWith('data:image')) {
      console.log('🔄 Converting base64 to buffer...');
      imageBuffer = base64ToBuffer(imageUrl);
    } else {
      throw new Error('Invalid image format. Must be URL or base64');
    }

    // Step 2: Read logo file
    if (!fs.existsSync(logoPath)) {
      throw new Error('Logo file not found');
    }
    
    const logoBuffer = fs.readFileSync(logoPath);
    console.log('✅ Logo file loaded');

    // Step 3: Get image dimensions
    const imageMetadata = await sharp(imageBuffer).metadata();
    const imageWidth = imageMetadata.width;
    const imageHeight = imageMetadata.height;

    console.log(`📐 Image dimensions: ${imageWidth}x${imageHeight}`);

    // Step 4: Resize logo (10% of image width, maintain aspect ratio)
    const logoWidth = Math.floor(imageWidth * 0.1);
    
    const resizedLogoBuffer = await sharp(logoBuffer)
      .resize(logoWidth, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png()
      .toBuffer();

    // Get resized logo dimensions
    const logoMetadata = await sharp(resizedLogoBuffer).metadata();
    const logoHeight = logoMetadata.height;

    console.log(`🔧 Logo resized to: ${logoWidth}x${logoHeight}`);

    // Step 5: Position logo (bottom-right corner with 20px padding)
    const left = imageWidth - logoWidth - 20;
    const top = imageHeight - logoHeight - 20;

    // Step 6: Composite logo onto image
    const finalImageBuffer = await sharp(imageBuffer)
      .composite([
        {
          input: resizedLogoBuffer,
          left: left,
          top: top,
          blend: 'over'
        }
      ])
      .png()
      .toBuffer();

    // Step 7: Convert to base64
    const base64Image = finalImageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`;

    // Clean up logo file
    try {
      fs.unlinkSync(logoPath);
      console.log('🧹 Logo file cleaned up');
    } catch (cleanupError) {
      console.warn('⚠️  Failed to cleanup logo file:', cleanupError.message);
    }

    console.log('✅ Logo overlay completed successfully');
    return dataUri;

  } catch (error) {
    console.error('❌ Logo overlay error:', error.message);
    
    // Clean up on error
    if (logoPath && fs.existsSync(logoPath)) {
      try {
        fs.unlinkSync(logoPath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup logo on error');
      }
    }
    
    throw new Error(`Logo overlay failed: ${error.message}`);
  }
};

/**
 * Add text watermark to image (alternative to logo)
 * @param {string} imageUrl - URL or base64 of image
 * @param {string} text - Watermark text
 * @param {string} position - 'bottom-right', 'bottom-left', 'top-right', 'top-left'
 * @returns {string} - Base64 encoded image with watermark
 */
export const addTextWatermark = async (imageUrl, text, position = 'bottom-right') => {
  try {
    console.log('📝 Adding text watermark...');

    // Get image buffer
    let imageBuffer;
    
    if (imageUrl.startsWith('http')) {
      imageBuffer = await downloadImage(imageUrl);
    } else if (imageUrl.startsWith('data:image')) {
      imageBuffer = base64ToBuffer(imageUrl);
    } else {
      throw new Error('Invalid image format');
    }

    // Get dimensions
    const metadata = await sharp(imageBuffer).metadata();
    const width = metadata.width;
    const height = metadata.height;

    // Calculate text position
    let x, y, anchor;
    
    switch(position) {
      case 'bottom-right':
        x = width - 20;
        y = height - 20;
        anchor = 'end';
        break;
      case 'bottom-left':
        x = 20;
        y = height - 20;
        anchor = 'start';
        break;
      case 'top-right':
        x = width - 20;
        y = 40;
        anchor = 'end';
        break;
      case 'top-left':
        x = 20;
        y = 40;
        anchor = 'start';
        break;
      default:
        x = width - 20;
        y = height - 20;
        anchor = 'end';
    }

    // Create SVG text overlay
    const svgText = `
      <svg width="${width}" height="${height}">
        <text 
          x="${x}" 
          y="${y}" 
          font-size="24" 
          font-family="Arial, sans-serif" 
          font-weight="bold"
          fill="white" 
          fill-opacity="0.8" 
          text-anchor="${anchor}"
          stroke="black"
          stroke-width="1"
          stroke-opacity="0.3"
        >${text}</text>
      </svg>
    `;

    // Composite watermark
    const finalImageBuffer = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(svgText),
          top: 0,
          left: 0
        }
      ])
      .png()
      .toBuffer();

    const base64Image = finalImageBuffer.toString('base64');
    console.log('✅ Text watermark added successfully');
    
    return `data:image/png;base64,${base64Image}`;

  } catch (error) {
    console.error('❌ Text watermark error:', error.message);
    throw new Error(`Watermark failed: ${error.message}`);
  }
};

/**
 * Resize image to specific dimensions
 * @param {Buffer} imageBuffer - Image buffer
 * @param {number} width - Target width
 * @param {number} height - Target height (optional)
 * @returns {Buffer} - Resized image buffer
 */
export const resizeImage = async (imageBuffer, width, height = null) => {
  try {
    return await sharp(imageBuffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .png()
      .toBuffer();
  } catch (error) {
    throw new Error(`Resize failed: ${error.message}`);
  }
};

/**
 * Compress image
 * @param {Buffer} imageBuffer - Image buffer
 * @param {number} quality - Quality (1-100)
 * @returns {Buffer} - Compressed image buffer
 */
export const compressImage = async (imageBuffer, quality = 80) => {
  try {
    return await sharp(imageBuffer)
      .png({ quality, compressionLevel: 9 })
      .toBuffer();
  } catch (error) {
    throw new Error(`Compression failed: ${error.message}`);
  }
};

// Export all functions
export default {
  addLogoOverlay,
  addTextWatermark,
  resizeImage,
  compressImage
};