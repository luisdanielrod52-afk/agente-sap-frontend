import os
import pdfplumber
from pathlib import Path

def pdf_a_markdown(ruta_pdf, ruta_salida):
    """Convierte un PDF a formato Markdown"""
    try:
        with pdfplumber.open(ruta_pdf) as pdf:
            texto = ""
            for pagina in pdf.pages:
                texto += pagina.extract_text() or ""
                texto += "\n\n---\n\n"
        
        # Guardar como .md
        nombre = Path(ruta_pdf).stem
        with open(f"{ruta_salida}/{nombre}.md", 'w', encoding='utf-8') as f:
            f.write(f"# {nombre}\n\n")
            f.write(texto)
        print(f"✅ Convertido: {nombre}")
    except Exception as e:
        print(f"❌ Error con {ruta_pdf}: {e}")

# Carpeta de entrada (PDFs) y salida (MD)
carpeta_pdfs = "./sap-hcm-ecp-pcc"
carpeta_md = "./sap-hcm-ecp-pcc"

os.makedirs(carpeta_md, exist_ok=True)

for archivo in os.listdir(carpeta_pdfs):
    if archivo.endswith('.pdf'):
        pdf_a_markdown(
            f"{carpeta_pdfs}/{archivo}",
            carpeta_md
        )