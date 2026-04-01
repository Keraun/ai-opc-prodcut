import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

// 访问地址：/api/uploads/editor/xxx.webp
export async function GET(request) {
    try {
        const url = new URL(request.url);
        const filePath = url.pathname.replace('/api/uploads', '');
        const fullPath = path.join(process.cwd(), 'public', 'uploads', filePath);

        const file = await fs.readFile(fullPath);
        const ext = path.extname(fullPath).toLowerCase();

        const mime = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
            '.gif': 'image/gif',
        }[ext] || 'application/octet-stream';

        return new NextResponse(file, {
            headers: { 'Content-Type': mime },
        });
    } catch (e) {
        return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
}