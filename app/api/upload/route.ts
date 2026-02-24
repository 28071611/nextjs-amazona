import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { writeFile } from 'fs/promises'

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public/uploads')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        // Generate unique filename
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
        const filepath = path.join(uploadDir, filename)

        await writeFile(filepath, buffer)

        const fileUrl = `/uploads/${filename}`

        console.log(`Saved file to ${filepath}`)

        return NextResponse.json({ success: true, url: fileUrl })
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
    }
}
