import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'

class JsonStore {
  private filePath: string
  private data: Record<string, unknown>

  constructor(options?: { defaults?: Record<string, unknown> }) {
    const userDataPath = app.getPath('userData')
    this.filePath = join(userDataPath, 'config.json')
    this.data = {}

    if (options?.defaults) {
      this.data = { ...options.defaults }
    }

    this.load()
  }

  private load(): void {
    try {
      if (existsSync(this.filePath)) {
        const content = readFileSync(this.filePath, 'utf-8')
        const parsed = JSON.parse(content)
        this.data = { ...this.data, ...parsed }
      }
    } catch {
      this.data = this.data
    }
  }

  private save(): void {
    try {
      const dir = join(this.filePath, '..')
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (error) {
      console.error('Failed to save store:', error)
    }
  }

  get(key: string): unknown {
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
