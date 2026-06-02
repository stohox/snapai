import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'

class JsonStore {
  private filePath: string | null = null
  private data: Record<string, unknown>
  private defaults: Record<string, unknown>

  constructor(options?: { defaults?: Record<string, unknown> }) {
    this.defaults = options?.defaults ?? {}
    this.data = { ...this.defaults }
  }

  private getFilePath(): string {
    if (!this.filePath) {
      this.filePath = join(app.getPath('userData'), 'config.json')
      this.load()
    }
    return this.filePath
  }

  private load(): void {
    try {
      const fp = this.filePath!
      if (existsSync(fp)) {
        const content = readFileSync(fp, 'utf-8')
        const parsed = JSON.parse(content)
        this.data = { ...this.defaults, ...parsed }
      }
    } catch {
      // keep defaults
    }
  }

  private save(): void {
    try {
      const fp = this.getFilePath()
      const dir = join(fp, '..')
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      writeFileSync(fp, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (error) {
      console.error('Failed to save store:', error)
    }
  }

  get(key: string): unknown {
    this.getFilePath()
    return this.data[key]
  }

  set(key: string, value: unknown): void {
    this.data[key] = value
    this.save()
  }

  delete(key: string): void {
    delete this.data[key]
    this.save()
  }

  clear(): void {
    this.data = {}
    this.save()
  }
}

export default JsonStore
