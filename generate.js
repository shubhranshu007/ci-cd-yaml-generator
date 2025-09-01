const fs = require('fs-extra');
const Handlebars = require('handlebars');
const Ajv = require('ajv');

// Add custom helper for "if language =="
Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

async function main() {
  const config = await fs.readJson('config.json');
  const schema = await fs.readJson('pipeline.schema.json');

  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(config);

  if (!valid) {
    console.error('❌ Invalid config:', validate.errors);
    return;
  }

  const templateStr = await fs.readFile('templates/github-actions.hbs', 'utf-8');
  const template = Handlebars.compile(templateStr);

  const output = template(config);
  await fs.outputFile('.github/workflows/main.yml', output);

  console.log('✅ YAML generated at .github/workflows/main.yml');
}

main();
