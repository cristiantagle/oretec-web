import zipfile, os

outfile = "Checklist_Grúa_Horquilla.docx"

content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml"
    ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>"""

rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1"
    Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
    Target="word/document.xml"/>
</Relationships>"""

def p(text):
    text = (text.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;"))
    return f"<w:p><w:r><w:t xml:space=\"preserve\">{text}</w:t></w:r></w:p>"

lines = []
lines.append(p("LISTA DE VERIFICACIÓN – MONITOREO DE CONDUCTAS"))
lines.append(p("OPERADOR DE GRÚA HORQUILLA"))
lines.append(p(""))
lines.append(p("Nombre Operador: ______________________________"))
lines.append(p("Antigüedad en el cargo: ________________________"))
lines.append(p("Tipo de contrato:    Permanente: ____   Eventual: ____   CPPT: ____"))
lines.append(p("Faena observada: ______________________________   Área: ___________________________"))
lines.append(p("Verificación N°: _______________________________"))
lines.append(p("Fecha verificación anterior: ____________________"))
lines.append(p(""))
lines.append(p("Marque con X según corresponda:  [SI] [A VECES] [NO] [N/A]"))
lines.append(p(""))

items = [
    "1) Mediante Lista de Chequeo revisa el estado del equipo previo inicio de faenas.",
    "2) Deja registro del resultado de la verificación e informa si es necesario.",
    "3) Porta licencia de conducir Clase D.",
    "4) Usa los equipos de protección personal.",
    "5) Usa cinturón de seguridad.",
    "6) Conduce a una velocidad razonable y prudente que le permite detener el equipo oportunamente.",
    "7) Transita sobre piso resistente y estable.",
    "8) Conduce sin elementos distractores (pasajeros, teléfono, música, alimentos/bebidas).",
    "9) Mantiene un ritmo de trabajo constante y seguro.",
    "10) Al operar, se asegura que no hay personas cerca de su equipo.",
    "11) Arranca la grúa en forma gradual.",
    "12) Detiene la grúa en forma gradual.",
    "13) Toma las curvas a baja velocidad.",
    "14) Cruza las intersecciones a baja velocidad.",
    "15) Mira siempre en el sentido de la marcha.",
]
for it in items:
    lines.append(p(f"[  ] {it}"))

document_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    %s
    <w:sectPr/>
  </w:body>
</w:document>""" % ("\n    ".join(lines))

with zipfile.ZipFile(outfile, "w", compression=zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", content_types)
    z.writestr("_rels/.rels", rels)
    z.writestr("word/document.xml", document_xml)

print(f"OK: creado {outfile} ({os.path.getsize(outfile)} bytes)")
