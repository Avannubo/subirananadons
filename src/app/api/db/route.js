import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
export async function GET() {
    try {
        await dbConnect()
        return NextResponse.json({ message: 'Connexió a la base de dades establerta correctament' })
    } catch (error) {
        return NextResponse.json({ error: 'Error en connectar amb la base de dades' }, { status: 500 })
    }
} 