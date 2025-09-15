import supabase from './customSupabaseClient.js';
import { generateDestructionCertificate, generateManifest, cleanupTemporaryElements } from './certificateGenerator';

// Función para generar y almacenar un certificado de destrucción
export const generateAndStoreCertificate = async (orderId) => {
  try {
    // 1. Obtener datos completos de la orden
    const { data: order, error: orderError } = await supabase
      .from('service_orders')
      .select(`
        *,
        customer:customer_id (
          id,
          full_name,
          email
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      throw new Error(`Error al obtener la orden: ${orderError.message}`);
    }

    // 2. Generar el PDF del certificado
    const pdf = await generateDestructionCertificate(order);
    
    // 3. Convertir PDF a blob
    const pdfBlob = pdf.output('blob');
    
    // 4. Generar nombre único para el archivo
    const fileName = `certificate_${orderId}_${Date.now()}.pdf`;
    const filePath = `certificates/${order.customer_id}/${fileName}`;
    
    // 5. Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });

    if (uploadError) {
      throw new Error(`Error al subir el certificado: ${uploadError.message}`);
    }

    // 6. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    // 7. Actualizar la orden con la URL del certificado
    const { error: updateError } = await supabase
      .from('service_orders')
      .update({
        certificate_url: publicUrl,
        certificate_generated_at: new Date().toISOString(),
        status: 'CERTIFIED'
      })
      .eq('id', orderId);

    if (updateError) {
      throw new Error(`Error al actualizar la orden: ${updateError.message}`);
    }

    // 8. Crear evento de tracking
    await supabase
      .from('tracking_events')
      .insert({
        service_order_id: orderId,
        event_type: 'CERTIFIED',
        description: 'Certificado de destrucción generado y emitido',
        metadata: { certificate_url: publicUrl }
      });

    // 9. Limpiar elementos temporales
    cleanupTemporaryElements();

    return {
      success: true,
      certificateUrl: publicUrl,
      fileName: fileName
    };

  } catch (error) {
    console.error('Error generando certificado:', error);
    cleanupTemporaryElements();
    throw error;
  }
};

// Función para generar y almacenar un manifiesto
export const generateAndStoreManifest = async (orderId) => {
  try {
    // 1. Obtener datos completos de la orden
    const { data: order, error: orderError } = await supabase
      .from('service_orders')
      .select(`
        *,
        customer:customer_id (
          id,
          full_name,
          email
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      throw new Error(`Error al obtener la orden: ${orderError.message}`);
    }

    // 2. Generar el PDF del manifiesto
    const pdf = await generateManifest(order);
    
    // 3. Convertir PDF a blob
    const pdfBlob = pdf.output('blob');
    
    // 4. Generar nombre único para el archivo
    const fileName = `manifest_${orderId}_${Date.now()}.pdf`;
    const filePath = `manifests/${order.customer_id}/${fileName}`;
    
    // 5. Subir a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        cacheControl: '3600'
      });

    if (uploadError) {
      throw new Error(`Error al subir el manifiesto: ${uploadError.message}`);
    }

    // 6. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    // 7. Actualizar la orden con la URL del manifiesto
    const { error: updateError } = await supabase
      .from('service_orders')
      .update({
        manifest_url: publicUrl,
        manifest_generated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      throw new Error(`Error al actualizar la orden: ${updateError.message}`);
    }

    // 8. Crear evento de tracking
    await supabase
      .from('tracking_events')
      .insert({
        service_order_id: orderId,
        event_type: 'MANIFEST_GENERATED',
        description: 'Manifiesto de entrega generado',
        metadata: { manifest_url: publicUrl }
      });

    // 9. Limpiar elementos temporales
    cleanupTemporaryElements();

    return {
      success: true,
      manifestUrl: publicUrl,
      fileName: fileName
    };

  } catch (error) {
    console.error('Error generando manifiesto:', error);
    cleanupTemporaryElements();
    throw error;
  }
};

// Función para descargar un certificado
export const downloadCertificate = async (orderId) => {
  try {
    // 1. Obtener la URL del certificado
    const { data: order, error: orderError } = await supabase
      .from('service_orders')
      .select('certificate_url, customer:customer_id(full_name)')
      .eq('id', orderId)
      .single();

    if (orderError) {
      throw new Error(`Error al obtener la orden: ${orderError.message}`);
    }

    if (!order.certificate_url) {
      throw new Error('No se ha generado el certificado para esta orden');
    }

    // 2. Descargar el archivo
    const response = await fetch(order.certificate_url);
    const blob = await response.blob();
    
    // 3. Crear enlace de descarga
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certificado_${orderId}_${order.customer.full_name}.pdf`;
    
    // 4. Simular clic para descargar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 5. Limpiar URL
    window.URL.revokeObjectURL(url);

    return { success: true };

  } catch (error) {
    console.error('Error descargando certificado:', error);
    throw error;
  }
};

// Función para descargar un manifiesto
export const downloadManifest = async (orderId) => {
  try {
    // 1. Obtener la URL del manifiesto
    const { data: order, error: orderError } = await supabase
      .from('service_orders')
      .select('manifest_url, customer:customer_id(full_name)')
      .eq('id', orderId)
      .single();

    if (orderError) {
      throw new Error(`Error al obtener la orden: ${orderError.message}`);
    }

    if (!order.manifest_url) {
      throw new Error('No se ha generado el manifiesto para esta orden');
    }

    // 2. Descargar el archivo
    const response = await fetch(order.manifest_url);
    const blob = await response.blob();
    
    // 3. Crear enlace de descarga
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Manifiesto_${orderId}_${order.customer.full_name}.pdf`;
    
    // 4. Simular clic para descargar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 5. Limpiar URL
    window.URL.revokeObjectURL(url);

    return { success: true };

  } catch (error) {
    console.error('Error descargando manifiesto:', error);
    throw error;
  }
};

// Función para obtener órdenes listas para certificar
export const getOrdersReadyForCertification = async () => {
  try {
    const { data, error } = await supabase
      .from('service_orders')
      .select(`
        id,
        status,
        created_at,
        scheduled_date,
        customer:customer_id (
          id,
          full_name,
          email
        )
      `)
      .in('status', ['TREATED', 'EN_TRATAMIENTO'])
      .is('certificate_url', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener órdenes: ${error.message}`);
    }

    return data;

  } catch (error) {
    console.error('Error obteniendo órdenes para certificar:', error);
    throw error;
  }
};

// Función para obtener órdenes certificadas
export const getCertifiedOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('service_orders')
      .select(`
        id,
        status,
        created_at,
        certificate_generated_at,
        customer:customer_id (
          id,
          full_name,
          email
        )
      `)
      .not('certificate_url', 'is', null)
      .order('certificate_generated_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener órdenes certificadas: ${error.message}`);
    }

    return data;

  } catch (error) {
    console.error('Error obteniendo órdenes certificadas:', error);
    throw error;
  }
};

// Función para verificar si una orden tiene certificado
export const hasCertificate = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('service_orders')
      .select('certificate_url, manifest_url')
      .eq('id', orderId)
      .single();

    if (error) {
      throw new Error(`Error al verificar certificado: ${error.message}`);
    }

    return {
      hasCertificate: !!data.certificate_url,
      hasManifest: !!data.manifest_url,
      certificateUrl: data.certificate_url,
      manifestUrl: data.manifest_url
    };

  } catch (error) {
    console.error('Error verificando certificado:', error);
    throw error;
  }
};
