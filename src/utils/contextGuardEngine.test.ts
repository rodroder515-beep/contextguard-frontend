import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateWorkflowContext,
  WORKFLOW_SCENARIOS,
} from './contextGuardEngine.ts';

test('detects credentials, SSNs, emails, and invoice figures in billing scenario', () => {
  const scenario = WORKFLOW_SCENARIOS[0];
  const result = evaluateWorkflowContext(
    scenario.rawPrompt,
    scenario.taskObjective,
    'external-llm'
  );

  assert.equal(result.entities.length, 4);
  const categories = result.entities.map((e) => e.category);
  assert.ok(categories.includes('API_CREDENTIAL'));
  assert.ok(categories.includes('NATIONAL_ID'));
  assert.ok(categories.includes('PII_CONTACT'));
  assert.ok(categories.includes('FINANCIAL_RECORD'));

  // API key and SSN must be BLOCKED with extraneous relevance
  const apiKey = result.entities.find((e) => e.category === 'API_CREDENTIAL');
  assert.ok(apiKey);
  assert.equal(apiKey.decision, 'BLOCK');
  assert.equal(apiKey.relevanceLevel, 'EXTRANEOUS');

  // Invoice amount is REQUIRED for billing refund and ALLOWED for external-llm
  const amount = result.entities.find((e) => e.category === 'FINANCIAL_RECORD');
  assert.ok(amount);
  assert.equal(amount.relevanceLevel, 'REQUIRED');
  assert.equal(amount.decision, 'ALLOW');
});

test('enforces core principle: task relevance does not override destination permission', () => {
  const maScenario = WORKFLOW_SCENARIOS[3]; // Strategic M&A Briefing
  const result = evaluateWorkflowContext(
    maScenario.rawPrompt,
    maScenario.taskObjective,
    'mcp-plugin'
  );

  const codename = result.entities.find((e) => e.category === 'PROPRIETARY_CODENAME');
  const revenue = result.entities.find((e) => e.category === 'FINANCIAL_RECORD');

  assert.ok(codename);
  assert.ok(revenue);

  // Both are REQUIRED for the M&A valuation memo task
  assert.equal(codename.relevanceLevel, 'REQUIRED');
  assert.equal(revenue.relevanceLevel, 'REQUIRED');

  // Yet both are REDACTED when destination is an untrusted MCP plugin
  assert.equal(codename.decision, 'REDACT');
  assert.equal(revenue.decision, 'REDACT');
  assert.equal(result.principleTriggered, true);
  assert.ok(!result.sanitizedPrompt.includes('Project Helios'));
  assert.ok(!result.sanitizedPrompt.includes('$48.2M'));
});

test('destination switching updates authorization decisions for the same prompt', () => {
  const billing = WORKFLOW_SCENARIOS[0];

  const externalLlmRes = evaluateWorkflowContext(
    billing.rawPrompt,
    billing.taskObjective,
    'external-llm'
  );
  const crmRes = evaluateWorkflowContext(
    billing.rawPrompt,
    billing.taskObjective,
    'support-crm'
  );

  const emailExternal = externalLlmRes.entities.find((e) => e.category === 'PII_CONTACT');
  const emailCrm = crmRes.entities.find((e) => e.category === 'PII_CONTACT');

  assert.ok(emailExternal);
  assert.ok(emailCrm);

  // Email is REDACTED for external LLM, but ALLOWED for authorized Support CRM
  assert.equal(emailExternal.decision, 'REDACT');
  assert.equal(emailCrm.decision, 'ALLOW');
});

test('supports interactive decision overrides and updates sanitized output', () => {
  const clinical = WORKFLOW_SCENARIOS[2];
  const baseResult = evaluateWorkflowContext(
    clinical.rawPrompt,
    clinical.taskObjective,
    'external-llm'
  );

  const mrnEntity = baseResult.entities.find((e) => e.category === 'CLINICAL_IDENTIFIER');
  assert.ok(mrnEntity);
  assert.equal(mrnEntity.decision, 'REDACT');

  // Override MRN to BLOCK
  const overridden = evaluateWorkflowContext(
    clinical.rawPrompt,
    clinical.taskObjective,
    'external-llm',
    { [mrnEntity.id]: 'BLOCK' }
  );

  const updatedMrn = overridden.entities.find((e) => e.id === mrnEntity.id);
  assert.equal(updatedMrn?.decision, 'BLOCK');
  assert.ok(overridden.sanitizedPrompt.includes('[BLOCKED:CLINICAL_IDENTIFIER]'));
});

test('never allows overriding a hard authorization denial (BLOCK) to ALLOW even at high task relevance', () => {
  const res = evaluateWorkflowContext(
    'Rotate compromised key sk_live_98a7f65c44b2109d immediately',
    'rotate key and revoke credential',
    'external-llm'
  );
  const keyEntity = res.entities.find((e) => e.category === 'API_CREDENTIAL');
  assert.ok(keyEntity);
  assert.equal(keyEntity.relevanceLevel, 'REQUIRED');
  assert.equal(keyEntity.relevanceScore, 92);
  assert.equal(keyEntity.decision, 'BLOCK');

  const attemptedAllow = evaluateWorkflowContext(
    'Rotate compromised key sk_live_98a7f65c44b2109d immediately',
    'rotate key and revoke credential',
    'external-llm',
    { [keyEntity.id]: 'ALLOW' }
  );
  assert.equal(attemptedAllow.entities[0].decision, 'BLOCK');
});

