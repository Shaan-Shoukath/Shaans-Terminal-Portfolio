import Jimp from 'jimp'

// ASCII characters from dark to light
const ASCII_CHARS = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`. '

/**
 * Convert an image buffer to ASCII art
 * @param {Buffer} imageBuffer - The image file buffer
 * @param {number} width - ASCII output width (characters)
 * @returns {Promise<string>} - The ASCII art string
 */
export async function imageToAscii(imageBuffer, width = 50) {
  const image = await Jimp.read(imageBuffer)

  // Calculate height maintaining aspect ratio
  // Terminal characters are ~2x taller than wide, so halve the height
  const aspectRatio = image.getHeight() / image.getWidth()
  const height = Math.round(width * aspectRatio * 0.45)

  // Resize image
  image.resize(width, height)
  image.greyscale()

  let ascii = ''

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = Jimp.intToRGBA(image.getPixelColor(x, y))
      // Calculate brightness (0-255)
      const brightness = pixel.r

      // Map brightness to ASCII character
      const charIndex = Math.floor((brightness / 255) * (ASCII_CHARS.length - 1))
      ascii += ASCII_CHARS[charIndex]
    }
    ascii += '\n'
  }

  return ascii
}
