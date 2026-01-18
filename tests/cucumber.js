default:
  require:
    - Steps/**/*.ts
  requireModule:
    - ts-node/register
  format:
    - progress-bar
    - html:reports/test-report.html
    - json:reports/test-report.json
  formatOptions:
    snippetInterface: async-await
