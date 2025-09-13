// lib/cert/makeCertificate.ts
// Genera un PDF de certificado en el lado del cliente usando pdf-lib y un QR con qrcode
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import QRCode from 'qrcode'

export type CertData = {
  alumno: string
  curso: string
  horas: string
  nota: string
  fecha: string       // YYYY-MM-DD
  instructor: string
  empresa?: string
  rutEmpresa?: string
  folio: string       // id/folio visible en el certificado
  verifyUrl: string   // URL de verificación (irá en el QR)
  logoUrl?: string    // /images/logo-oretec.png
  firmaUrl?: string   // /images/cert-firma.png (opcional)
}

async function fetchAsUint8Array(url: string): Promise<Uint8Array> {
  const r = await fetch(url)
  const b = await r.arrayBuffer()
  return new Uint8Array(b)
}

export async function makeCertificatePdf(data: CertData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([842, 595]) // A4 apaisado (842x595 puntos)
  const { width, height } = page.getSize()

  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  // Fondo suave
  page.drawRectangle({
    x: 0, y: 0, width, height,
    color: rgb(0.97, 0.98, 1)
  })

  // Marco
  page.drawRectangle({
    x: 24, y: 24, width: width-48, height: height-48,
    borderColor: rgb(0.12, 0.23, 0.54),
    borderWidth: 2,
  })

  // Logo
  if (data.logoUrl) {
    try {
      const logoBytes = await fetchAsUint8Array(data.logoUrl)
      const logoImg = await pdf.embedPng(logoBytes).catch(async () => pdf.embedJpg(logoBytes))
      const lw = 120
      const lh = (logoImg.height / logoImg.width) * lw
      page.drawImage(logoImg, { x: 40, y: height-60-lh, width: lw, height: lh })
    } catch {}
  }

  // Título
  const title = "CERTIFICADO DE ASISTENCIA"
  page.drawText(title, {
    x: 0,
    y: height - 110,
    size: 28,
    font: fontBold,
    color: rgb(0.12, 0.23, 0.54),
  })
  // Centrar título
  const titleWidth = fontBold.widthOfTextAtSize(title, 28)
  page.drawText(title, {
    x: (width - titleWidth)/2,
    y: height - 110,
    size: 28,
    font: fontBold,
    color: rgb(0.12, 0.23, 0.54),
  })

  // Subtítulo
  const subtitle = "Se certifica que"
  const stw = font.widthOfTextAtSize(subtitle, 14)
  page.drawText(subtitle, {
    x: (width - stw)/2,
    y: height - 150,
    size: 14,
    font,
    color: rgb(0.25, 0.3, 0.4),
  })

  // Nombre alumno
  const alumnoSize = 26
  const alumnoWidth = fontBold.widthOfTextAtSize(data.alumno, alumnoSize)
  page.drawText(data.alumno, {
    x: (width - alumnoWidth)/2,
    y: height - 190,
    size: alumnoSize,
    font: fontBold,
    color: rgb(0.05, 0.08, 0.15),
  })

  // Texto curso/hours/nota
  const line1 = `ha asistido al curso "${data.curso}" por ${data.horas} horas.`
  const line2 = `Fecha: ${data.fecha}   |   Nota: ${data.nota}`
  const infoSize = 14
  const l1w = font.widthOfTextAtSize(line1, infoSize)
  const l2w = font.widthOfTextAtSize(line2, infoSize)

  page.drawText(line1, { x: (width - l1w)/2, y: height - 225, size: infoSize, font, color: rgb(0.1,0.12,0.2) })
  page.drawText(line2, { x: (width - l2w)/2, y: height - 248, size: infoSize, font, color: rgb(0.1,0.12,0.2) })

  if (data.empresa) {
    const emp = `Empresa: ${data.empresa}${data.rutEmpresa ? `   |   RUT: ${data.rutEmpresa}` : ''}`
    const empw = font.widthOfTextAtSize(emp, infoSize)
    page.drawText(emp, { x: (width - empw)/2, y: height - 271, size: infoSize, font, color: rgb(0.1,0.12,0.2) })
  }

  // Firma (si existe)
  const baseY = 120
  if (data.firmaUrl) {
    try {
      const firmaBytes = await fetchAsUint8Array(data.firmaUrl)
      const firmaImg = await pdf.embedPng(firmaBytes).catch(async () => pdf.embedJpg(firmaBytes))
      const fw = 180
      const fh = (firmaImg.height / firmaImg.width) * fw
      page.drawImage(firmaImg, { x: 90, y: baseY + 10, width: fw, height: fh, opacity: 0.9 })
    } catch {}
  }
  // Línea firma + nombre instructor
  page.drawLine({
    start: { x: 80, y: baseY },
    end:   { x: 320, y: baseY },
    thickness: 1,
    color: rgb(0.2, 0.25, 0.3)
  })
  const firmTxt = `Instructor/a: ${data.instructor}`
  page.drawText(firmTxt, { x: 80, y: baseY - 16, size: 12, font, color: rgb(0.2, 0.25, 0.3) })

  // QR de verificación
  const qrText = `${data.verifyUrl}?folio=${encodeURIComponent(data.folio)}`
  const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 1, scale: 6 })
  try {
    const qru8 = await fetchAsUint8Array(qrDataUrl)
    const qrImg = await pdf.embedPng(qru8)
    const qSize = 110
    page.drawImage(qrImg, { x: width - qSize - 80, y: 90, width: qSize, height: qSize })
  } catch {}

  // Folio y leyenda verificación
  page.drawText(`Folio: ${data.folio}`, { x: width - 280, y: 210, size: 12, font: fontBold, color: rgb(0.12,0.23,0.54) })
  page.drawText("Verifique el certificado escaneando el código QR", { x: width - 320, y: 193, size: 10, font, color: rgb(0.2,0.25,0.3) })

  const bytes = await pdf.save()
  return bytes
}
