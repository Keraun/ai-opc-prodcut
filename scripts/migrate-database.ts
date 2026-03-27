import { migrateFromJson } from '../lib/migrate'
import { initializeDatabase } from '../lib/database'

console.log('Starting database migration...')

initializeDatabase()

migrateFromJson(false)

console.log('Migration completed!')
console.log('Database file created at: database/app.db')
