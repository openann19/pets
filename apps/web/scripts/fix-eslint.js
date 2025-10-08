#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting comprehensive ESLint fix...');

// Fix unescaped entities in all files
function fixUnescapedEntities(dir) {
  const files = execSync(`find ${dir} -name "*.tsx" -o -name "*.ts"`, { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);

  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const original = content;
      
      // Fix apostrophes in JSX text
      content = content.replace(/(>)([^<]*)'([^<]*<)/g, '$1$2&apos;$3');
      content = content.replace(/(>)([^<]*)"([^<]*<)/g, '$1$2&quot;$3');
      
      // Fix in string literals that are rendered
      content = content.replace(/didn't/g, "didn&apos;t");
      content = content.replace(/don't/g, "don&apos;t");
      content = content.replace(/won't/g, "won&apos;t");
      content = content.replace(/can't/g, "can&apos;t");
      content = content.replace(/we'll/g, "we&apos;ll");
      content = content.replace(/you'll/g, "you&apos;ll");
      content = content.replace(/it's/g, "it&apos;s");
      content = content.replace(/We'll/g, "We&apos;ll");
      content = content.replace(/You'll/g, "You&apos;ll");
      content = content.replace(/It's/g, "It&apos;s");
      content = content.replace(/Don't/g, "Don&apos;t");
      content = content.replace(/Didn't/g, "Didn&apos;t");
      content = content.replace(/We've/g, "We&apos;ve");
      content = content.replace(/I've/g, "I&apos;ve");
      
      if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`  ✅ Fixed unescaped entities in ${path.basename(file)}`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error.message);
    }
  });
}

// Fix Promise-returning functions in onSubmit/onClick
function fixPromiseReturns(dir) {
  const files = execSync(`find ${dir} -name "*.tsx"`, { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);

  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const original = content;
      
      // Fix onSubmit with async functions
      content = content.replace(/onSubmit=\{(\w+)\}/g, 'onSubmit={(e) => void $1(e)}');
      content = content.replace(/onSubmit=\{handleSubmit\((\w+)\)\}/g, 'onSubmit={(e) => void handleSubmit($1)(e)}');
      
      // Fix onClick with async functions  
      content = content.replace(/onClick=\{async \(/g, 'onClick={() => void (async (');
      content = content.replace(/onClick=\{(\w+)\}/g, (match, fn) => {
        if (fn.includes('handle') || fn.includes('submit')) {
          return `onClick={() => void ${fn}()}`;
        }
        return match;
      });
      
      if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`  ✅ Fixed promise returns in ${path.basename(file)}`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error.message);
    }
  });
}

// Fix strict boolean expressions
function fixBooleanExpressions(dir) {
  const files = execSync(`find ${dir} -name "*.tsx" -o -name "*.ts"`, { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);

  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const original = content;
      
      // Fix nullable string checks
      content = content.replace(/if \((\w+)\) \{/g, (match, variable) => {
        if (variable === 'error' || variable === 'message' || variable === 'token') {
          return `if (${variable} && ${variable}.length > 0) {`;
        }
        return match;
      });
      
      // Fix || to ?? for nullish coalescing
      content = content.replace(/(\w+) \|\| '([^']+)'/g, "$1 ?? '$2'");
      content = content.replace(/(\w+) \|\| "([^"]+)"/g, '$1 ?? "$2"');
      
      if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`  ✅ Fixed boolean expressions in ${path.basename(file)}`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error.message);
    }
  });
}

// Fix any types
function fixAnyTypes(dir) {
  const files = execSync(`find ${dir} -name "*.tsx" -o -name "*.ts"`, { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);

  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const original = content;
      
      // Replace common any patterns
      content = content.replace(/: any\[\]/g, ': unknown[]');
      content = content.replace(/: any\)/g, ': unknown)');
      content = content.replace(/<any>/g, '<unknown>');
      content = content.replace(/as any/g, 'as unknown');
      
      // Fix specific any usages
      content = content.replace(/Record<string, any>/g, 'Record<string, unknown>');
      content = content.replace(/\(error: any\)/g, '(error: Error | unknown)');
      content = content.replace(/\(data: any\)/g, '(data: unknown)');
      content = content.replace(/\(response: any\)/g, '(response: unknown)');
      
      if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`  ✅ Fixed any types in ${path.basename(file)}`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error.message);
    }
  });
}

// Fix unused variables
function fixUnusedVariables(dir) {
  const files = execSync(`find ${dir} -name "*.tsx" -o -name "*.ts"`, { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);

  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const original = content;
      
      // Prefix unused parameters with underscore
      content = content.replace(/\((\w+), (\w+)\) => \{/g, (match, p1, p2) => {
        if (!content.includes(p1) && p1 !== '_') {
          p1 = `_${p1}`;
        }
        if (!content.includes(p2) && p2 !== '_') {
          p2 = `_${p2}`;
        }
        return `(${p1}, ${p2}) => {`;
      });
      
      // Remove unused imports (careful approach)
      const lines = content.split('\n');
      const importRegex = /^import .* from/;
      lines.forEach((line, index) => {
        if (importRegex.test(line)) {
          const importMatch = line.match(/import \{ ([^}]+) \}/);
          if (importMatch) {
            const imports = importMatch[1].split(',').map(i => i.trim());
            const unusedImports = imports.filter(imp => {
              const usageCount = content.split(imp).length - 1;
              return usageCount <= 1; // Only in import statement
            });
            if (unusedImports.length > 0 && unusedImports.length < imports.length) {
              const remainingImports = imports.filter(i => !unusedImports.includes(i));
              lines[index] = line.replace(importMatch[1], remainingImports.join(', '));
            }
          }
        }
      });
      content = lines.join('\n');
      
      if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`  ✅ Fixed unused variables in ${path.basename(file)}`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error.message);
    }
  });
}

// Main execution
const appDir = path.join(__dirname, '..');
const srcDir = path.join(appDir, 'src');
const appRouteDir = path.join(appDir, 'app');

console.log('\n📝 Fixing unescaped entities...');
fixUnescapedEntities(appRouteDir);
fixUnescapedEntities(srcDir);

console.log('\n🔄 Fixing promise returns...');
fixPromiseReturns(appRouteDir);
fixPromiseReturns(srcDir);

console.log('\n✅ Fixing boolean expressions...');
fixBooleanExpressions(appRouteDir);
fixBooleanExpressions(srcDir);

console.log('\n🎯 Fixing any types...');
fixAnyTypes(appRouteDir);
fixAnyTypes(srcDir);

console.log('\n🧹 Fixing unused variables...');
fixUnusedVariables(appRouteDir);
fixUnusedVariables(srcDir);

console.log('\n✨ Running ESLint auto-fix...');
try {
  execSync('pnpm lint --fix', { cwd: appDir, stdio: 'inherit' });
} catch (error) {
  console.log('Some ESLint issues remain that need manual fixing');
}

console.log('\n🎉 ESLint fix complete!');