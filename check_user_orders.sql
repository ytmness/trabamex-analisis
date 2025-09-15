-- Verificar las órdenes de servicio del usuario carlos@hospital.com
SELECT 
    so.id,
    so.status,
    so.quantity,
    so.unit,
    so.created_at,
    so.scheduled_date,
    u.email
FROM public.service_orders so
JOIN auth.users u ON so.customer_id = u.id
WHERE u.email = 'carlos@hospital.com'
ORDER BY so.created_at DESC;
