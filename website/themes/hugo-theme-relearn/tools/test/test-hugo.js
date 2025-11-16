#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import * as TOML from 'js-toml';

// Parse command line arguments
let hvmVersion = process.argv[2] || 'latest';
const hugoPrefix = '';
const hugoEnvironment = 'testing';

// Check for content directory
if (!fs.existsSync('content')) {
  console.error('No content directory found.');
  process.exit(1);
}

// Find Relearn theme directory
function findThemeDir() {
  const possiblePaths = [path.join(process.cwd(), '..'), path.join(process.cwd(), '..', 'hugo-theme-relearn'), path.join(process.cwd(), '..', '..', 'hugo-theme-relearn'), path.join(process.cwd(), 'themes', 'hugo-theme-relearn'), path.join(process.cwd(), 'themes', 'relearn')];

  for (const themePath of possiblePaths) {
    const versionFile = path.join(themePath, 'layouts', 'partials', 'version.txt');
    if (fs.existsSync(versionFile)) {
      return themePath;
    }
  }

  console.error('Relearn theme not found.');
  process.exit(1);
}

const themeDir = findThemeDir();

// If hvmVersion is "min", extract from hugo.toml
if (hvmVersion === 'min') {
  const hugoTomlPath = path.join(themeDir, 'hugo.toml');
  if (fs.existsSync(hugoTomlPath)) {
    const hugoTomlContent = fs.readFileSync(hugoTomlPath, 'utf8');
    const parsed = TOML.load(hugoTomlContent);
    if (parsed.module?.hugoVersion?.min) {
      hvmVersion = parsed.module.hugoVersion.min;
    } else {
      console.error('Could not find module.hugoVersion.min in hugo.toml');
      process.exit(1);
    }
  } else {
    console.error('hugo.toml not found in theme directory');
    process.exit(1);
  }
}

// Find config directory for environment
function findConfigDir() {
  if (!hugoEnvironment) {
    return null;
  }

  const possibleConfigs = [path.join(themeDir, 'docs', 'config', hugoEnvironment, 'hugo.toml'), path.join(themeDir, 'exampleSite', 'config', hugoEnvironment, 'hugo.toml')];

  for (const configPath of possibleConfigs) {
    if (fs.existsSync(configPath)) {
      return path.dirname(configPath);
    }
  }

  console.error(`Environment configuration ${hugoEnvironment} not found.`);
  process.exit(1);
}

const configDir = findConfigDir();

// Build config parameter
function buildConfigParam() {
  if (!hugoEnvironment) {
    return '';
  }

  const cwd = process.cwd();

  if (fs.existsSync(path.join(cwd, 'config', hugoEnvironment))) {
    // In theme docs, no need to copy
    return `--environment ${hugoEnvironment}`;
  } else if (fs.existsSync(path.join(cwd, 'config.toml'))) {
    return `--config config.toml,${path.join(configDir, 'hugo.toml')}`;
  } else if (fs.existsSync(path.join(cwd, 'hugo.toml'))) {
    return `--config hugo.toml,${path.join(configDir, 'hugo.toml')}`;
  } else if (fs.existsSync(path.join(cwd, 'config'))) {
    // Copy config directory
    const targetDir = path.join(cwd, 'config', hugoEnvironment);
    fs.cpSync(configDir, targetDir, { recursive: true });
    return `--environment ${hugoEnvironment}`;
  } else if (fs.existsSync(path.join(cwd, 'hugo'))) {
    // Copy to hugo directory
    const targetDir = path.join(cwd, 'hugo', hugoEnvironment);
    fs.cpSync(configDir, targetDir, { recursive: true });
    return `--environment ${hugoEnvironment}`;
  } else {
    console.error('Environment configuration can not be applied.');
    process.exit(1);
  }
}

const config = buildConfigParam();

// Set Hugo version using hvm
try {
  execSync(`hvm use ${hvmVersion}`, { stdio: 'ignore' });
} catch (error) {
  console.error('Failed to set Hugo version with hvm');
  process.exit(1);
}

// Read HVM version
const hvmContent = fs.readFileSync('.hvm', 'utf8').trim();
const hugoVersion = `+hugo.${hvmContent.substring(1)}`;

// Read theme version
const version = fs.readFileSync(path.join(themeDir, 'layouts', 'partials', 'version.txt'), 'utf8').trim();
const themeVersion = `.${version}`;

// Prepare output paths
const metricsFile = path.join(process.cwd(), `metrics${themeVersion}${hugoPrefix}${hugoVersion}.log`);
const destinationDir = path.join(process.cwd(), `public${themeVersion}${hugoPrefix}${hugoVersion}`);

// Write initial version to metrics file
fs.writeFileSync(metricsFile, version + '\n');

// Build Hugo command
const hugoArgs = [config, '--printPathWarnings', '--printI18nWarnings', '--templateMetrics', '--templateMetricsHints', '--cleanDestinationDir', '--logLevel', 'info', '--destination', destinationDir].filter((arg) => arg); // Remove empty strings

// Run Hugo and capture output
// Build command string for shell execution (to get hvm-modified PATH)
const hugoCommand = `hugo ${hugoArgs
  .map((arg) => {
    // Quote paths that contain spaces and backslashes (Windows paths)
    if (arg.includes(path.sep) && arg.includes(' ')) {
      return `"${arg}"`;
    }
    return arg;
  })
  .join(' ')}`;

console.log(hugoCommand);
const hugoProcess = spawn(hugoCommand, {
  cwd: process.cwd(),
  shell: true,
});

const logStream = fs.createWriteStream(metricsFile, { flags: 'a' });

hugoProcess.stdout.pipe(logStream);
hugoProcess.stderr.pipe(logStream);

hugoProcess.on('error', (error) => {
  console.error(`Failed to start Hugo: ${error.message}`);
  process.exit(1);
});

hugoProcess.on('close', (code) => {
  logStream.end();

  // Generate directory listing
  const dirFile = path.join(process.cwd(), `dir${themeVersion}${hugoPrefix}${hugoVersion}.log`);
  const startDir = destinationDir;

  if (fs.existsSync(startDir)) {
    // Get all files recursively
    const entries = fs.readdirSync(startDir, { recursive: true, withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const fullPath = path.join(entry.parentPath || entry.path || startDir, entry.name);
        return path.relative(startDir, fullPath);
      });

    fs.writeFileSync(dirFile, files.join('\n'));

    // Move dir.log to public directory
    const finalDirLog = path.join(destinationDir, 'dir.log');
    fs.renameSync(dirFile, finalDirLog);

    // Move metrics.log to public directory
    const finalMetricsLog = path.join(destinationDir, 'metrics.log');
    if (fs.existsSync(metricsFile)) {
      fs.renameSync(metricsFile, finalMetricsLog);

      // Read and display last line
      const metricsContent = fs.readFileSync(finalMetricsLog, 'utf8');
      const lines = metricsContent.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      console.log(lastLine);
    }
  } else {
    console.error(`Build failed: destination directory ${startDir} does not exist`);
  }

  process.exit(code);
});
