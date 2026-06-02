const fs = require('fs')
const path = require('path')

const buildDir = path.join(__dirname)
const sizes = [16, 32, 48, 64, 128, 256]
const pngs = sizes.map((s) => ({
  size: s,
  data: fs.readFileSync(path.join(buildDir, `icon-${s}.png`))
}))

const headerSize = 6
const entrySize = 16
const totalHeader = headerSize + entrySize * pngs.length

let offset = totalHeader
const entries = []
for (const p of pngs) {
  const sizeByte = p.size >= 256 ? 0 : p.size
  const e = Buffer.alloc(entrySize)
  e.writeUInt8(sizeByte, 0)
  e.writeUInt8(sizeByte, 1)
  e.writeUInt8(0, 2)
  e.writeUInt8(0, 3)
  e.writeUInt16LE(1, 4)
  e.writeUInt16LE(32, 6)
  e.writeUInt32LE(p.data.length, 8)
  e.writeUInt32LE(offset, 12)
  offset += p.data.length
  entries.push(e)
}

const header = Buffer.alloc(headerSize)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(pngs.length, 4)

const ico = Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)])
const icoPath = path.join(buildDir, 'icon.ico')
fs.writeFileSync(icoPath, ico)
console.log(`ICO file generated: ${icoPath} (${ico.length} bytes)`)
