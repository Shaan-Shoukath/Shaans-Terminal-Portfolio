import Jimp from 'jimp'

// Extended ASCII character ramp for better detail (70 chars, dark to light)
const ASCII_CHARS = '@%#*+=-:. '

/**
 * Convert an image buffer to ASCII art
 * @param {Buffer} imageBuffer - The image file buffer
 * @param {number} width - ASCII output width (characters)
 * @returns {Promise<string>} - The ASCII art string
 */
export async function imageToAscii(imageBuffer, width = 60) {
  const image = await Jimp.read(imageBuffer)

  // Calculate height maintaining aspect ratio
  // Terminal characters are ~2x taller than wide, so halve the height
  const aspectRatio = image.getHeight() / image.getWidth()
  const height = Math.round(width * aspectRatio * 0.45)

  // Resize image with better quality
  image.resize(width, height, Jimp.RESIZE_BEZIER)

  // Enhance contrast for better ASCII output
  image.contrast(0.3)
  image.greyscale()

  let ascii = ''

  for (let y = 0; y < height; y++) {
    let row = ''
    for (let x = 0; x < width; x++) {
      const pixel = Jimp.intToRGBA(image.getPixelColor(x, y))
      // Use luminance formula for better brightness perception
      const brightness = (0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b)

      // Map brightness to ASCII character (inverted - dark bg means bright pixels = dense chars)
      const charIndex = Math.floor(((255 - brightness) / 255) * (ASCII_CHARS.length - 1))
      row += ASCII_CHARS[Math.min(charIndex, ASCII_CHARS.length - 1)]
    }
    // Trim trailing spaces but keep leading ones for alignment
    ascii += row.replace(/\s+$/, '') + '\n'
  }

  return ascii
}
