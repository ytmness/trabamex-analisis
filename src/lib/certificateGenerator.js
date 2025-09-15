import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Función para generar un certificado de destrucción
export const generateDestructionCertificate = async (orderData) => {
  // Crear el contenido HTML del certificado
  const certificateHTML = createCertificateHTML(orderData);
  
  // Convertir HTML a canvas
  const canvas = await html2canvas(certificateHTML, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  });
  
  // Crear PDF
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgData = canvas.toDataURL('image/png');
  
  // Calcular dimensiones para ajustar a A4
  const imgWidth = 210; // A4 width in mm
  const pageHeight = 295; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  let heightLeft = imgHeight;
  let position = 0;
  
  // Agregar primera página
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  
  // Agregar páginas adicionales si es necesario
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  return pdf;
};

// Función para crear el HTML del certificado
const createCertificateHTML = (orderData) => {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const certificateNumber = `CERT-${new Date().getFullYear()}-${String(orderData.id).slice(-6)}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 40px;
          background: white;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #dc2626;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #dc2626;
          margin-bottom: 10px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 18px;
          color: #666;
        }
        .certificate-info {
          margin: 30px 0;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #f9f9f9;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }
        .info-label {
          font-weight: bold;
          color: #555;
        }
        .info-value {
          color: #333;
        }
        .waste-details {
          margin: 20px 0;
          padding: 15px;
          background: #fff;
          border-left: 4px solid #dc2626;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        .signature-section {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
        }
        .signature-box {
          text-align: center;
          width: 45%;
        }
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 50px;
          padding-top: 10px;
        }
        .stamp {
          position: absolute;
          top: 50%;
          right: 20%;
          transform: rotate(-15deg);
          font-size: 48px;
          color: #dc2626;
          opacity: 0.3;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="stamp">CERTIFICADO</div>
      
      <div class="header">
        <div class="logo">TRABAMEX</div>
        <div class="title">CERTIFICADO DE DESTRUCCIÓN FINAL</div>
        <div class="subtitle">Residuos Peligrosos y Biológico-Infecciosos</div>
      </div>
      
      <div class="certificate-info">
        <div class="info-row">
          <span class="info-label">Número de Certificado:</span>
          <span class="info-value">${certificateNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha de Emisión:</span>
          <span class="info-value">${currentDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Cliente:</span>
          <span class="info-value">${orderData.customer?.full_name || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">ID de Orden:</span>
          <span class="info-value">${orderData.id}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha de Recolección:</span>
          <span class="info-value">${orderData.scheduled_date || 'N/A'}</span>
        </div>
      </div>
      
      <div class="waste-details">
        <h3>Detalles del Residuo</h3>
        <div class="info-row">
          <span class="info-label">Tipo de Residuo:</span>
          <span class="info-value">${orderData.residue_type || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Cantidad:</span>
          <span class="info-value">${orderData.quantity || 'N/A'} ${orderData.unit || 'kg'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Procedencia:</span>
          <span class="info-value">${orderData.origin || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Claves de Residuo:</span>
          <span class="info-value">${(orderData.waste_keys || []).join(', ') || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tipo de Envasado:</span>
          <span class="info-value">${orderData.packaging || 'N/A'}</span>
        </div>
      </div>
      
      <div class="waste-details">
        <h3>Proceso de Tratamiento</h3>
        <p>Los residuos han sido procesados y destruidos de acuerdo con las normativas ambientales vigentes, 
        utilizando métodos aprobados por las autoridades competentes. El proceso incluye:</p>
        <ul>
          <li>Recepción y verificación de residuos</li>
          <li>Procesamiento en instalaciones autorizadas</li>
          <li>Destrucción final mediante métodos aprobados</li>
          <li>Disposición segura de residuos procesados</li>
        </ul>
      </div>
      
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line"></div>
          <p><strong>Responsable Técnico</strong><br>TRABAMEX</p>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <p><strong>Autoridad Ambiental</strong><br>Registro y Control</p>
        </div>
      </div>
      
      <div class="footer">
        <p>Este certificado confirma que los residuos han sido procesados y destruidos de manera segura y ambientalmente responsable.</p>
        <p><strong>TRABAMEX</strong> - Gestión Integral de Residuos</p>
        <p>Certificado válido para fines de cumplimiento normativo</p>
      </div>
    </body>
    </html>
  `;
  
  // Crear elemento DOM temporal
  const div = document.createElement('div');
  div.innerHTML = html;
  div.style.position = 'absolute';
  div.style.left = '-9999px';
  div.style.top = '0';
  div.style.width = '794px'; // A4 width in pixels at 96 DPI
  
  document.body.appendChild(div);
  
  return div;
};

// Función para generar manifiesto de entrega
export const generateManifest = async (orderData) => {
  const manifestHTML = createManifestHTML(orderData);
  
  const canvas = await html2canvas(manifestHTML, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  });
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgData = canvas.toDataURL('image/png');
  
  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  let heightLeft = imgHeight;
  let position = 0;
  
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  
  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  
  return pdf;
};

// Función para crear el HTML del manifiesto
const createManifestHTML = (orderData) => {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const manifestNumber = `MAN-${new Date().getFullYear()}-${String(orderData.id).slice(-6)}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 40px;
          background: white;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #dc2626;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #dc2626;
          margin-bottom: 10px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 18px;
          color: #666;
        }
        .manifest-info {
          margin: 30px 0;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #f9f9f9;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }
        .info-label {
          font-weight: bold;
          color: #555;
        }
        .info-value {
          color: #333;
        }
        .waste-details {
          margin: 20px 0;
          padding: 15px;
          background: #fff;
          border-left: 4px solid #dc2626;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        .signature-section {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
        }
        .signature-box {
          text-align: center;
          width: 45%;
        }
        .signature-line {
          border-top: 1px solid #333;
          margin-top: 50px;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">TRABAMEX</div>
        <div class="title">MANIFIESTO DE ENTREGA</div>
        <div class="subtitle">Residuos Peligrosos y Biológico-Infecciosos</div>
      </div>
      
      <div class="manifest-info">
        <div class="info-row">
          <span class="info-label">Número de Manifiesto:</span>
          <span class="info-value">${manifestNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha de Emisión:</span>
          <span class="info-value">${currentDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Cliente:</span>
          <span class="info-value">${orderData.customer?.full_name || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">ID de Orden:</span>
          <span class="info-value">${orderData.id}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fecha de Recolección:</span>
          <span class="info-value">${orderData.scheduled_date || 'N/A'}</span>
        </div>
      </div>
      
      <div class="waste-details">
        <h3>Detalles del Residuo</h3>
        <div class="info-row">
          <span class="info-label">Tipo de Residuo:</span>
          <span class="info-value">${orderData.residue_type || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Cantidad:</span>
          <span class="info-value">${orderData.quantity || 'N/A'} ${orderData.unit || 'kg'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Procedencia:</span>
          <span class="info-value">${orderData.origin || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Claves de Residuo:</span>
          <span class="info-value">${(orderData.waste_keys || []).join(', ') || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tipo de Envasado:</span>
          <span class="info-value">${orderData.packaging || 'N/A'}</span>
        </div>
      </div>
      
      <div class="waste-details">
        <h3>Condiciones de Entrega</h3>
        <p>Los residuos han sido entregados en las condiciones especificadas y serán procesados 
        de acuerdo con las normativas ambientales vigentes.</p>
      </div>
      
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line"></div>
          <p><strong>Cliente</strong><br>${orderData.customer?.full_name || 'N/A'}</p>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <p><strong>Responsable de Recolección</strong><br>TRABAMEX</p>
        </div>
      </div>
      
      <div class="footer">
        <p>Este manifiesto confirma la entrega de residuos para su procesamiento y destrucción.</p>
        <p><strong>TRABAMEX</strong> - Gestión Integral de Residuos</p>
      </div>
    </body>
    </html>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = html;
  div.style.position = 'absolute';
  div.style.left = '-9999px';
  div.style.top = '0';
  div.style.width = '794px';
  
  document.body.appendChild(div);
  
  return div;
};

// Función para limpiar elementos temporales
export const cleanupTemporaryElements = () => {
  const tempElements = document.querySelectorAll('[style*="position: absolute"][style*="left: -9999px"]');
  tempElements.forEach(element => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
};
