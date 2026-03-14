import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema({
  asciiArt: {
    type: String,
    default: '',
  },
  originalFilename: {
    type: String,
    default: '',
  },
  width: {
    type: Number,
    default: 50,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Only one profile document should exist — singleton pattern
profileSchema.statics.getProfile = async function () {
  let profile = await this.findOne()
  if (!profile) {
    profile = await this.create({})
  }
  return profile
}

profileSchema.statics.updateAscii = async function (asciiArt, filename, width) {
  let profile = await this.findOne()
  if (profile) {
    profile.asciiArt = asciiArt
    profile.originalFilename = filename
    profile.width = width
    profile.updatedAt = Date.now()
    await profile.save()
  } else {
    profile = await this.create({ asciiArt, originalFilename: filename, width })
  }
  return profile
}

export default mongoose.model('Profile', profileSchema)
