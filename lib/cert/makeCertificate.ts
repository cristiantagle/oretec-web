/**
 * lib/cert/makeCertificate.ts
 * Genera un PDF de certificado (cliente) con pdf-lib y un QR (qrcode).
 */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import * as QRCode from 'qrcode'

export type CertData = {
  alumno: string
  rut?: string | null
  curso: string
  horas?: number | null
  nota?: number | null
  fecha: string // YYYY-MM-DD
  instructor?: string | null
  folio?: string | null
  verificacionUrl?: string | null
  logoUrl?: string // opcional
}

function formatFechaEs(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
}

export async function makeCertificate(data: CertData): Promise<Blob> {
  const {
    alumno,
    rut,
    curso,
    horas,
    nota,
    fecha,
    instructor,
    folio,
    verificacionUrl = 'https://oretec.cl/cert/validar?folio=XXXX',
    logoUrl,
  } = data

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([842, 595]) // A4 apaisado
  const { width, height } = page.getSize()

  const fontTitle = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontBody = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Fondo
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.98, 0.99, 1) })
  // Marco
  page.drawRectangle({
    x: 24, y: 24, width: width - 48, height: height - 48,
    borderColor: rgb(0.2, 0.35, 0.65), borderWidth: 2, color: rgb(1,1,1),
  })

  // Logo (opcional)
  if (logoUrl) {
    try {
      const res = await fetch(logoUrl)
      if (res.ok) {
        const arr = await res.arrayBuffer()
        let img
        try { img = await pdfDoc.embedPng(arr) } catch { img = await pdfDoc.embedJpg(arr) }
        const iw = 120
        const ih = (img.height / img.width) * iw
        page.drawImage(img, { x: 40, y: height - 40 - ih, width: iw, height: ih })
      }
    } catch { /* ignore */ }
  }

  // Título
  const titulo = 'CERTIFICADO DE ASISTENCIA'
  const tw = fontTitle.widthOfTextAtSize(titulo, 28)
  page.drawText(titulo, {
    x: (width - tw) / 2, y: height - 120,
    size: 28, font: fontTitle, color: rgb(0.12, 0.25, 0.55),
  })

  // Texto principal
  const linea1 = `Se certifica que ${alumno}${rut ? ` (RUT: ${rut})` : ''}`
  const linea2 = `ha participado en el curso "${curso}"${horas ? ` con una duración de ${horas} horas` : ''}${nota != null ? ` y nota final ${nota}` : ''}.`
  const linea3 = `Fecha de término: ${formatFechaEs(fecha)}.${folio ? ` Folio: ${folio}.` : ''}`

  let y = height - 180
  const sizeBody = 14
  page.drawText(linea1, { x: 60, y, size: sizeBody, font: fontBody, color: rgb(0,0,0) })
  y -= 26
  page.drawText(linea2, { x: 60, y, size: sizeBody, font: fontBody, color: rgb(0,0,0) })
  y -= 26
  page.drawText(linea3, { x: 60, y, size: sizeBody, font: fontBody, color: rgb(0,0,0) })

  // Firma
  const firmaY = 120
  page.drawLine({ start: { x: 120, y: firmaY }, end: { x: 370, y: firmaY }, thickness: 1, color: rgb(0.2, 0.2, 0.2) })
  page.drawText(instructor ? instructor : '________________________', {
    x: 130, y: firmaY - 18, size: 12, font: fontBody, color: rgb(0.1,0.1,0.1),
  })
  page.drawText('Instructor', { x: 210, y: firmaY - 34, size: 10, font: fontBody, color: rgb(0.35,0.35,0.35) })

  // QR verificación
  try {
    const url = verificacionUrl || ''
    if (url) {
      const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 200 })
      const b64 = dataUrl.split(',')[1]
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
      const img = await pdfDoc.embedPng(bytes)
      page.drawImage(img, { x: width - 260, y: 80, width: 180, height: 180 })
      page.drawText('Verificación', { x: width - 220, y: 70, size: 10, font: fontBody, color: rgb(0.35,0.35,0.35) })
    }
  } catch { /* ignore */ }

  page.drawText('Emitido por OreTec', { x: 60, y: 60, size: 10, font: fontBody, color: rgb(0.35,0.35,0.35) })
  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}
