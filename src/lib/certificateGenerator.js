import jsPDF from 'jspdf';

// Función para generar un certificado de destrucción
export const generateDestructionCertificate = async (orderData) => {
  // Crear PDF nativo
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Configurar fuentes y colores
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(220, 38, 38); // Color rojo #dc2626
  
  // Header
  pdf.setFontSize(24);
  pdf.text('TRABAMEX', 105, 30, { align: 'center' });
  
  pdf.setFontSize(28);
  pdf.text('CERTIFICADO DE DESTRUCCIÓN FINAL', 105, 45, { align: 'center' });
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(18);
  pdf.setTextColor(102, 102, 102);
  pdf.text('Residuos Peligrosos y Biológico-Infecciosos', 105, 55, { align: 'center' });
  
  // Línea divisoria
  pdf.setDrawColor(220, 38, 38);
  pdf.setLineWidth(1);
  pdf.line(20, 65, 190, 65);
  
  // Información del certificado
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const certificateNumber = `CERT-${new Date().getFullYear()}-${String(orderData.id).slice(-6)}`;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  
  let yPosition = 85;
  
  // Información básica
  pdf.setFont('helvetica', 'bold');
  pdf.text('Número de Certificado:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(certificateNumber, 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Fecha de Emisión:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(currentDate, 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Cliente:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(orderData.customer?.full_name || 'N/A', 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('ID de Orden:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(orderData.id, 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Fecha de Recolección:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(orderData.scheduled_date || 'N/A', 80, yPosition);
  yPosition += 15;
  
  // Detalles del residuo
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Detalles del Residuo', 30, yPosition);
  yPosition += 10;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tipo de Residuo:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(orderData.residue_type || 'N/A', 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Cantidad:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${orderData.quantity || 'N/A'} ${orderData.unit || 'kg'}`, 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Procedencia:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(orderData.origin || 'N/A', 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Claves de Residuo:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text((orderData.waste_keys || []).join(', ') || 'N/A', 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tipo de Envasado:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(orderData.packaging || 'N/A', 80, yPosition);
  yPosition += 15;
  
  // Proceso de tratamiento
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Proceso de Tratamiento', 30, yPosition);
  yPosition += 10;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  
  const treatmentText = 'Los residuos han sido procesados y destruidos de acuerdo con las normativas ambientales vigentes, utilizando métodos aprobados por las autoridades competentes. El proceso incluye:';
  const treatmentLines = pdf.splitTextToSize(treatmentText, 150);
  pdf.text(treatmentLines, 30, yPosition);
  yPosition += treatmentLines.length * 5 + 5;
  
  const processItems = [
    '• Recepción y verificación de residuos',
    '• Procesamiento en instalaciones autorizadas',
    '• Destrucción final mediante métodos aprobados',
    '• Disposición segura de residuos procesados'
  ];
  
  processItems.forEach(item => {
    pdf.text(item, 35, yPosition);
    yPosition += 6;
  });
  
  yPosition += 20;
  
  // Firmas
  pdf.setFont('helvetica', 'bold');
  pdf.text('Responsable Técnico', 30, yPosition);
  pdf.text('Autoridad Ambiental', 120, yPosition);
  yPosition += 5;
  
  pdf.setFont('helvetica', 'normal');
  pdf.text('TRABAMEX', 30, yPosition);
  pdf.text('Registro y Control', 120, yPosition);
  yPosition += 5;
  
  // Líneas de firma
  pdf.line(30, yPosition, 80, yPosition);
  pdf.line(120, yPosition, 170, yPosition);
  yPosition += 20;
  
  // Footer
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(102, 102, 102);
  
  const footerText1 = 'Este certificado confirma que los residuos han sido procesados y destruidos de manera segura y ambientalmente responsable.';
  const footerLines1 = pdf.splitTextToSize(footerText1, 150);
  pdf.text(footerLines1, 30, yPosition);
  yPosition += footerLines1.length * 4 + 5;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('TRABAMEX - Gestión Integral de Residuos', 105, yPosition, { align: 'center' });
  yPosition += 5;
  
  pdf.setFont('helvetica', 'normal');
  pdf.text('Certificado válido para fines de cumplimiento normativo', 105, yPosition, { align: 'center' });
  
  return pdf;
};


// Función para generar manifiesto de entrega
export const generateManifest = async (orderData) => {
  // Crear PDF nativo
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Configurar fuentes y colores
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(220, 38, 38); // Color rojo #dc2626
  
  // Header
  pdf.setFontSize(24);
  pdf.text('TRABAMEX', 105, 30, { align: 'center' });
  
  pdf.setFontSize(28);
  pdf.text('MANIFIESTO DE ENTREGA', 105, 45, { align: 'center' });
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(18);
  pdf.setTextColor(102, 102, 102);
  pdf.text('Residuos Peligrosos y Biológico-Infecciosos', 105, 55, { align: 'center' });
  
  // Línea divisoria
  pdf.setDrawColor(220, 38, 38);
  pdf.setLineWidth(1);
  pdf.line(20, 65, 190, 65);
  
  // Información del manifiesto
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const manifestNumber = `MAN-${new Date().getFullYear()}-${String(orderData.id).slice(-6)}`;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  
  let yPosition = 85;
  
  // Información básica
  pdf.setFont('helvetica', 'bold');
  pdf.text('Número de Manifiesto:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(manifestNumber, 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Fecha de Emisión:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(currentDate, 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Cliente:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(orderData.customer?.full_name || 'N/A', 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('ID de Orden:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(orderData.id, 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Fecha de Recolección:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(orderData.scheduled_date || 'N/A', 80, yPosition);
  yPosition += 15;
  
  // Detalles del residuo
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Detalles del Residuo', 30, yPosition);
  yPosition += 10;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tipo de Residuo:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(orderData.residue_type || 'N/A', 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Cantidad:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${orderData.quantity || 'N/A'} ${orderData.unit || 'kg'}`, 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Procedencia:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(orderData.origin || 'N/A', 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Claves de Residuo:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text((orderData.waste_keys || []).join(', ') || 'N/A', 80, yPosition);
  yPosition += 8;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tipo de Envasado:', 30, yPosition);
  pdf.setFont('helvetica', 'normal');
  pdf.text(orderData.packaging || 'N/A', 80, yPosition);
  yPosition += 15;
  
  // Condiciones de entrega
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Condiciones de Entrega', 30, yPosition);
  yPosition += 10;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  
  const conditionsText = 'Los residuos han sido entregados en las condiciones especificadas y serán procesados de acuerdo con las normativas ambientales vigentes.';
  const conditionsLines = pdf.splitTextToSize(conditionsText, 150);
  pdf.text(conditionsLines, 30, yPosition);
  yPosition += conditionsLines.length * 5 + 20;
  
  // Firmas
  pdf.setFont('helvetica', 'bold');
  pdf.text('Cliente', 30, yPosition);
  pdf.text('Responsable de Recolección', 120, yPosition);
  yPosition += 5;
  
  pdf.setFont('helvetica', 'normal');
  pdf.text(orderData.customer?.full_name || 'N/A', 30, yPosition);
  pdf.text('TRABAMEX', 120, yPosition);
  yPosition += 5;
  
  // Líneas de firma
  pdf.line(30, yPosition, 80, yPosition);
  pdf.line(120, yPosition, 170, yPosition);
  yPosition += 20;
  
  // Footer
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(102, 102, 102);
  
  const footerText1 = 'Este manifiesto confirma la entrega de residuos para su procesamiento y destrucción.';
  const footerLines1 = pdf.splitTextToSize(footerText1, 150);
  pdf.text(footerLines1, 30, yPosition);
  yPosition += footerLines1.length * 4 + 5;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('TRABAMEX - Gestión Integral de Residuos', 105, yPosition, { align: 'center' });
  
  return pdf;
};

