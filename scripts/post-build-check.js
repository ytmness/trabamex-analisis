#!/usr/bin/env node

/**
 * Script de verificación post-build
 * Verifica la integridad del build de producción
 */

const fs = require('fs');
const path = require('path');

// Colores para output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

function log(message, color = 'green') {
  console.log(`${colors[color]}[$(new Date().toISOString())] ${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${description} encontrado: ${filePath}`, 'green');
    return true;
  } else {
    log(`✗ ${description} NO encontrado: ${filePath}`, 'red');
    return false;
  }
}

function checkDirectoryContents(dirPath, description) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    log(`✓ ${description} encontrado con ${files.length} archivos: ${dirPath}`, 'green');
    return files.length > 0;
  } else {
    log(`✗ ${description} NO encontrado: ${dirPath}`, 'red');
    return false;
  }
}

function main() {
  log('Iniciando verificación post-build...', 'yellow');
  
  const distPath = path.join(process.cwd(), 'dist');
  const assetsPath = path.join(distPath, 'assets');
  const indexPath = path.join(distPath, 'index.html');
  
  let allChecksPassed = true;
  
  // Verificar directorio dist
  if (!checkFileExists(distPath, 'Directorio dist')) {
    allChecksPassed = false;
  }
  
  // Verificar index.html
  if (!checkFileExists(indexPath, 'Archivo index.html')) {
    allChecksPassed = false;
  }
  
  // Verificar directorio assets
  if (!checkDirectoryContents(assetsPath, 'Directorio assets')) {
    allChecksPassed = false;
  }
  
  // Verificar archivos JS y CSS en assets
  if (fs.existsSync(assetsPath)) {
    const assetFiles = fs.readdirSync(assetsPath);
    const jsFiles = assetFiles.filter(file => file.endsWith('.js'));
    const cssFiles = assetFiles.filter(file => file.endsWith('.css'));
    
    if (jsFiles.length > 0) {
      log(`✓ Archivos JS encontrados: ${jsFiles.length}`, 'green');
    } else {
      log('✗ No se encontraron archivos JS', 'red');
      allChecksPassed = false;
    }
    
    if (cssFiles.length > 0) {
      log(`✓ Archivos CSS encontrados: ${cssFiles.length}`, 'green');
    } else {
      log('✗ No se encontraron archivos CSS', 'red');
      allChecksPassed = false;
    }
  }
  
  if (allChecksPassed) {
    log('✓ Verificación post-build completada exitosamente', 'green');
    process.exit(0);
  } else {
    log('✗ Verificación post-build falló', 'red');
    process.exit(1);
  }
}

main();