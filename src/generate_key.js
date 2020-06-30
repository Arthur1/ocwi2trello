'use strict'

import fs from 'fs/promises'
import crypto from 'crypto'

async function main() {
    const secretKey = crypto.randomBytes(32).toString('base64')
    const salt = crypto.randomBytes(16).toString('base64')
    await fs.writeFile('.env', `SECRET_KEY="${secretKey}" \nSALT="${salt}"\n`, 'utf-8')
    console.log('Success!')
}

main()
