#!/usr/bin/env node

import { execSync } from 'child_process';
import { readdirSync, existsSync } from 'fs';
import { basename, join } from 'path';

const mdFilesDir = 'contents';
const projectName = process.argv[2]; // 获取命令行参数

// 获取所有 .md 文件
const allMdFiles = readdirSync(mdFilesDir)
  .filter(file => file.endsWith('.md'));

// 如果提供了项目名，只导出该项目
let mdFiles;
if (projectName) {
  const targetFile = `${projectName}.md`;
  const targetPath = join(mdFilesDir, targetFile);

  if (!existsSync(targetPath)) {
    console.error(`Error: Project "${projectName}" not found.`);
    console.log('\nAvailable presentations:');
    allMdFiles.forEach(file => console.log(`  - ${file.replace('.md', '')}`));
    process.exit(1);
  }

  mdFiles = [targetFile];
  console.log(`Exporting ${targetFile}...\n`);
} else {
  // 没有参数，导出所有项目
  mdFiles = allMdFiles;
  console.log(`Found ${mdFiles.length} presentation(s) to export:\n`);
  mdFiles.forEach(file => console.log(`  - ${file}`));
  console.log('');
}

// 依次导出每个演示文稿
mdFiles.forEach((file, index) => {
  const fileName = basename(file, '.md');
  if (mdFiles.length > 1) {
    console.log(`\n[${index + 1}/${mdFiles.length}] Exporting ${file}...`);
  }
  try {
    execSync(`slidev export ${mdFilesDir}/${file} --output ${fileName}.pdf`, {
      stdio: 'inherit'
    });
    console.log(`✓ Successfully exported ${file} to ${fileName}.pdf`);
  } catch (error) {
    console.error(`✗ Failed to export ${file}`);
    process.exit(1);
  }
});

if (mdFiles.length > 1) {
  console.log('\n✓ All presentations exported successfully!');
}

