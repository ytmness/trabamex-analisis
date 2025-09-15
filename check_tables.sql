-- Verificar qué tablas existen relacionadas con planes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%plan%'
ORDER BY table_name;
