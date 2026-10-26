#!/usr/bin/env node
/**
 * SmartRank AI SEO — Build Script
 * Packages the React dashboard into the WordPress plugin and creates a ZIP file.
 *
 * Usage: node build-plugin.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PLUGIN_DIR = path.join(__dirname, 'wordpress-plugin');
const ADMIN_DIST = path.join(PLUGIN_DIR, 'admin', 'dist');
const PROJECT_DIST = path.join(__dirname, 'dist');

console.log('🚀 SmartRank AI SEO — WordPress Plugin Builder\n');

// Step 1: Build the React app
console.log('📦 Step 1: Building React dashboard...');
try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ React build complete\n');
} catch (e) {
    console.error('❌ React build failed');
    process.exit(1);
}

// Step 2: Copy dist to plugin admin folder
console.log('📁 Step 2: Copying build to plugin...');
if (fs.existsSync(ADMIN_DIST)) {
    fs.rmSync(ADMIN_DIST, { recursive: true });
}
fs.mkdirSync(ADMIN_DIST, { recursive: true });

// Copy files from dist to admin/dist
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

if (fs.existsSync(PROJECT_DIST)) {
    copyDir(PROJECT_DIST, ADMIN_DIST);
    console.log('✅ Build copied to wordpress-plugin/admin/dist/\n');
} else {
    console.error('❌ dist/ folder not found after build');
    process.exit(1);
}

// Step 3: Create ZIP file
console.log('🗜️  Step 3: Creating plugin ZIP...');
const zipName = 'smartrank-ai-seo.zip';
const zipPath = path.join(__dirname, zipName);

// Remove existing ZIP
if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
}

try {
    // Use system zip command (available on macOS/Linux)
    execSync(`cd "${PLUGIN_DIR}" && zip -r "${zipPath}" . -x "*.git*" -x "node_modules/*"`, { stdio: 'inherit' });
    console.log(`\n✅ Plugin ZIP created: ${zipPath}`);
} catch (e) {
    // Fallback: try PowerShell on Windows
    try {
        execSync(`powershell Compress-Archive -Path "${PLUGIN_DIR}\\*" -DestinationPath "${zipPath}" -Force`, { stdio: 'inherit' });
        console.log(`\n✅ Plugin ZIP created: ${zipPath}`);
    } catch (e2) {
        console.log('\n⚠️  Could not create ZIP automatically.');
        console.log('   You can manually zip the wordpress-plugin/ folder:');
        console.log(`   cd wordpress-plugin && zip -r ../${zipName} .`);
    }
}

console.log('\n🎉 Build complete!');
console.log('\n📋 Installation:');
console.log('   1. Upload smartrank-ai-seo.zip via WordPress → Plugins → Add New → Upload');
console.log('   2. Activate the plugin');
console.log('   3. Go to SmartRank SEO → Setup Wizard');
console.log('\n📁 Plugin structure:');
console.log('   smartrank-ai-seo/');
console.log('   ├── smartrank-ai-seo.php    (main plugin file)');
console.log('   ├── includes/               (PHP classes)');
console.log('   ├── admin/');
console.log('   │   ├── dist/              (React build)');
console.log('   │   ├── css/admin.css');
console.log('   │   └── js/admin.js');
console.log('   ├── readme.txt');
console.log('   └── uninstall.php');
