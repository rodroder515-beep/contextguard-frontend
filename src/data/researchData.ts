export interface StackCardItem {
  id: string;
  stageIndex: number;
  kicker: string;
  title: string;
  description: string;
}

export const STACK_CARDS: StackCardItem[] = [
  {
    id: 'stack-principle',
    stageIndex: 0,
    kicker: 'THE PRINCIPLE',
    title: 'Relevance is not permission.',
    description:
      'Modern AI workflows are too interconnected to police manually. Engineers and users define task objectives, while sensitive context must be evaluated and scoped automatically before leaving the workflow boundary.',
  },
  {
    id: 'stack-engine',
    stageIndex: 1,
    kicker: 'THE EVALUATION MODEL',
    title: 'A layer that governs the outbound boundary.',
    description:
      'At its core sits a dual-axis evaluation model: continuous sensitive entity recognition paired with semantic task-relevance analysis. On top, policy evaluators determine whether tokens are necessary for the task.',
  },
  {
    id: 'stack-workflow',
    stageIndex: 2,
    kicker: 'THE AUTHORIZATION LAYER',
    title: 'Static filters watch patterns. We evaluate context.',
    description:
      'Conventional DLP stops at rigid regex matching, either breaking legitimate agent tasks or leaking contextual secrets. ContextGuard weighs task necessity against destination-specific authorization to allow, redact, or block.',
  },
];

export interface ArchitectureStage {
  id: 'detection' | 'relevance' | 'authorization' | 'explanation';
  kicker: string;
  title: string;
  summary: string;
  technicalDetail: string;
  inputSignal: string;
  outputArtifact: string;
  sphereMode: 0 | 1 | 2 | 3;
}

export const ARCHITECTURE_STAGES: ArchitectureStage[] = [
  {
    id: 'detection',
    kicker: 'STAGE 01 · SENSITIVE ENTITY DETECTION',
    title: 'Detection',
    summary:
      'Continuously scans prompts, retrieved RAG chunks, and tool arguments for PII, credentials, financial figures, and proprietary identifiers.',
    technicalDetail:
      'Combines deterministic lexical recognizers with contextual entity span classification to identify both structured secrets (API keys, connection strings, MRNs) and unstructured sensitive context (unannounced project codenames, internal financial figures).',
    inputSignal: 'Unstructured prompt + retrieved context window',
    outputArtifact: 'Typed entity span graph with sensitivity tiers',
    sphereMode: 0,
  },
  {
    id: 'relevance',
    kicker: 'STAGE 02 · TASK RELEVANCE ANALYSIS',
    title: 'Relevance',
    summary:
      'Turns raw context spans into structured necessity scores by measuring whether each sensitive entity is required to accomplish the stated task.',
    technicalDetail:
      'Evaluates semantic dependency between the user’s explicit task objective and each detected sensitive span. Incidental secrets pulled in from thread history or .env files receive extraneous scores, separating bloated context from required inputs.',
    inputSignal: 'Entity span graph + explicit task objective',
    outputArtifact: 'Per-entity semantic necessity classification (Required / Contextual / Extraneous)',
    sphereMode: 1,
  },
  {
    id: 'authorization',
    kicker: 'STAGE 03 · DESTINATION-SPECIFIC POLICY',
    title: 'Authorization',
    summary:
      'Evaluates whether the target external model, MCP plugin, or webhook is permitted to receive each sensitive entity.',
    technicalDetail:
      'Enforces ContextGuard’s core invariant: task relevance does not automatically grant sharing permission. Cross-references entity sensitivity and task relevance against the destination’s trust boundary, retention posture, and scope.',
    inputSignal: 'Relevance-scored spans + destination trust profile',
    outputArtifact: 'Deterministic policy decision (Allow / Redact / Block)',
    sphereMode: 2,
  },
  {
    id: 'explanation',
    kicker: 'STAGE 04 · REDACTION & EXPLAINABLE AUDIT',
    title: 'Policy Engine',
    summary:
      'Applies structure-preserving redaction transforms and generates transparent explanations for every outbound policy decision.',
    technicalDetail:
      'Replaces unauthorized sensitive spans with typed synthetic tokens (e.g., <SCOPED_AMOUNT_1>) so downstream reasoning remains intact, while emitting human-readable explanations and verifiable policy rule citations.',
    inputSignal: 'Policy decision vector + raw outbound payload',
    outputArtifact: 'Sanitized payload + transparent audit explanation trace',
    sphereMode: 3,
  },
];

export interface ResearchNote {
  id: string;
  category: string;
  date: string;
  title: string;
  summary: string;
  author: string;
  authorRole: string;
  readTime: string;
  blueprintType: 'turbine' | 'radial' | 'funnel' | 'circuit' | 'grid-matrix' | 'horizon';
  methodologyPoints: string[];
  fullAbstract: string;
}

export const RESEARCH_NOTES: ResearchNote[] = [
  {
    id: 'relevance-vs-permission',
    category: 'METHODOLOGY',
    date: '10/14/2026',
    title: 'Separating Task Relevance from Shareability in Agentic Workflows',
    summary:
      'Why semantic usefulness to an LLM prompt must be evaluated independently from destination authorization boundaries.',
    author: 'Elena Vance',
    authorRole: 'Principal Security Researcher',
    readTime: '6 MIN',
    blueprintType: 'turbine',
    methodologyPoints: [
      'Formalizes the dual-axis evaluation matrix: Semantic Task Utility (U) vs. Destination Authorization Scope (A).',
      'Demonstrates failure modes where high-utility tokens (e.g., confidential M&A figures in a valuation prompt) cause unauthorized leakage to third-party plugins.',
      'Defines structure-preserving placeholder substitution to retain reasoning accuracy without exposing raw values.',
    ],
    fullAbstract:
      'When an AI agent assembles context from local files, emails, and databases, conventional guards ask either "Is this pattern a secret?" or "Did the user ask for this task?". ContextGuard introduces a stricter invariant: even when a piece of information is 100% relevant to the user’s task, the target external tool or model may not be authorized to receive it. This note details our two-stage evaluation methodology separating task necessity from destination trust.',
  },
  {
    id: 'multi-step-dlp-limits',
    category: 'RESEARCH',
    date: '09/28/2026',
    title: 'Why Static Pattern Matching Fails in Multi-Step Tool Execution',
    summary:
      'Examining how over-privileged context windows carry incidental secrets across chained model and tool invocations.',
    author: 'Marcus Thorne',
    authorRole: 'Systems Architecture Lead',
    readTime: '5 MIN',
    blueprintType: 'radial',
    methodologyPoints: [
      'Analyzes context accumulation across multi-turn agent loops where thread history mixes public instructions with private credentials.',
      'Compares static regular-expression blocking against task-scoped relevance pruning.',
      'Outlines pre-flight inspection hooks that intercept outbound payloads prior to network serialization.',
    ],
    fullAbstract:
      'Static Data Loss Prevention (DLP) rules operate without awareness of either the user’s task objective or the specific external endpoint receiving a payload. In agentic workflows, an assistant summarizing a support thread often inherits raw API keys or national identifiers from earlier log dumps. By scoring task relevance before evaluating destination rules, ContextGuard strips incidental secrets without halting legitimate workflows.',
  },
  {
    id: 'structure-preserving-redaction',
    category: 'ARCHITECTURE',
    date: '09/15/2026',
    title: 'Structure-Preserving Redaction for External Model Inference',
    summary:
      'Replacing sensitive spans with typed symbolic placeholders so external models can reason over structure without seeing raw data.',
    author: 'Soren Lindqvist',
    authorRole: 'Applied Cryptography & NLP',
    readTime: '7 MIN',
    blueprintType: 'funnel',
    methodologyPoints: [
      'Maps sensitive entities to deterministic typed tokens (<CONTACT_EMAIL_1>, <SCOPED_AMOUNT_2>) within the outbound prompt.',
      'Preserves referential integrity across multi-entity prompts so external LLMs can still draft coherent replies or code diffs.',
      'Supports local re-hydration of authorized tokens upon response return inside the trusted boundary.',
    ],
    fullAbstract:
      'Blocking every prompt that references a customer email or patient identifier creates severe friction for teams using external AI services. Structure-preserving redaction resolves this tension: ContextGuard replaces unauthorized sensitive spans with consistent symbolic placeholders prior to transmission, allowing the external service to complete structural reasoning while keeping raw sensitive values inside the local boundary.',
  },
  {
    id: 'mcp-destination-scopes',
    category: 'PROTOCOL',
    date: '08/30/2026',
    title: 'Destination-Scoped Authorization for Model Context Protocol (MCP)',
    summary:
      'A declarative policy schema for governing what context categories may cross into third-party MCP servers and webhooks.',
    author: 'Devon K.',
    authorRole: 'Protocol Security Engineer',
    readTime: '4 MIN',
    blueprintType: 'circuit',
    methodologyPoints: [
      'Defines per-destination trust profiles categorizing External Frontier LLMs, Scoped B2B Gateways, and Untrusted MCP Plugins.',
      'Enforces least-privilege parameter filtering on tool-call JSON payloads.',
      'Prevents cross-tool exfiltration when an agent chains data between an internal database reader and an external web search tool.',
    ],
    fullAbstract:
      'As AI agents connect to dozens of external tools via standardized protocols, every tool invocation becomes a distinct trust boundary crossing. An identifier authorized for an internal CRM webhook is rarely authorized for an external search or code-execution plugin. ContextGuard attaches explicit destination policy manifests to each tool endpoint.',
  },
  {
    id: 'contextual-integrity-model',
    category: 'RESEARCH',
    date: '08/12/2026',
    title: 'Formalizing Contextual Integrity for Autonomous AI Pipelines',
    summary:
      'Adapting information flow theory to evaluate sender, recipient, attribute type, and transmission principle in LLM calls.',
    author: 'Elena Vance & Aria Chen',
    authorRole: 'Research Group',
    readTime: '8 MIN',
    blueprintType: 'grid-matrix',
    methodologyPoints: [
      'Models every outbound AI request as a 5-tuple: (Data Subject, Sender Workflow, Destination Endpoint, Entity Attribute, Task Necessity).',
      'Provides decidable policy evaluation rules with predictable latency overhead.',
      'Eliminates opaque "black-box" guardrails in favor of inspectable policy predicates.',
    ],
    fullAbstract:
      'Contextual integrity holds that privacy is preserved when information flows conform to contextual norms governing who receives what attribute under which transmission principle. We translate this foundational framework into an engineering architecture for AI workflows, ensuring every outbound token is justified by both task necessity and destination authorization.',
  },
  {
    id: 'explainable-policy-decisions',
    category: 'EXPLAINABILITY',
    date: '07/29/2026',
    title: 'Transparent Policy Explanations: Designing Auditable Security Decisions',
    summary:
      'Why every allow, redact, and block action must produce a human-readable rationale for developers and security reviewers.',
    author: 'aria.c',
    authorRole: 'Human-Centered Security',
    readTime: '5 MIN',
    blueprintType: 'horizon',
    methodologyPoints: [
      'Generates structured decision traces citing the exact entity sensitivity, task relevance score, and destination rule ID.',
      'Helps engineers distinguish between accidental context bloat (extraneous tokens) and policy boundary violations.',
      'Reduces policy tuning friction through interactive pre-flight simulation.',
    ],
    fullAbstract:
      'Security layers that silently mutate prompts or return generic error codes frustrate developers and lead to policy bypasses. ContextGuard pairs every allow, redact, or block action with a transparent explanation detailing what was detected, how relevant it was to the task, and which destination authorization rule governed the outcome.',
  },
];

export interface EvaluationTrackCategory {
  id: string;
  name: string;
  countLabel: string;
  items: {
    id: string;
    title: string;
    meta: string;
    scope: string;
    description: string;
  }[];
}

export const EVALUATION_TRACKS: EvaluationTrackCategory[] = [
  {
    id: 'detection-nlp',
    name: 'Detection & Relevance',
    countLabel: '4 Evaluation Modules',
    items: [
      {
        id: 'mod-1',
        title: 'Structured Secret & Credential Recognizer',
        meta: 'Lexical + Entropy Analysis · Zero External Calls',
        scope: 'API Keys, JWTs, DB Connection URIs, SSH Keys',
        description:
          'Evaluates high-entropy tokens and provider-specific prefixes within prompts and tool payloads before serialization.',
      },
      {
        id: 'mod-2',
        title: 'Contextual PII & Clinical Span Classifier',
        meta: 'Span Classification · Boundary-Aware',
        scope: 'Emails, National IDs, MRNs, Contact Records',
        description:
          'Identifies personal and regulated health identifiers embedded inside unstructured support threads and clinical notes.',
      },
      {
        id: 'mod-3',
        title: 'Semantic Task-Necessity Scorer',
        meta: 'Intent-to-Entity Alignment · Relevance Axis',
        scope: 'Required vs. Contextual vs. Extraneous Spans',
        description:
          'Measures whether a detected sensitive entity is functionally required to satisfy the stated workflow objective.',
      },
      {
        id: 'mod-4',
        title: 'Proprietary & Financial Entity Detector',
        meta: 'Custom Taxonomy · Organization Dictionaries',
        scope: 'M&A Codenames, Unannounced Revenue, Internal Hosts',
        description:
          'Recognizes organization-specific codenames and non-public financial metrics across executive and engineering prompts.',
      },
    ],
  },
  {
    id: 'policy-verification',
    name: 'Policy & Authorization',
    countLabel: '3 Evaluation Modules',
    items: [
      {
        id: 'pol-1',
        title: 'Destination Trust Matrix Evaluator',
        meta: 'Per-Endpoint Scope · Deterministic Predicates',
        scope: 'Frontier LLMs, B2B Gateways, Community MCP Servers',
        description:
          'Enforces destination-specific sharing permissions based on endpoint retention posture, compliance tier, and trust boundary.',
      },
      {
        id: 'pol-2',
        title: 'Structure-Preserving Redaction Transformer',
        meta: 'Symbolic Token Substitution · Reversible Mapping',
        scope: 'Typed Placeholders (<SCOPED_AMOUNT_1>, <CONTACT_EMAIL_1>)',
        description:
          'Replaces unauthorized sensitive values with consistent symbolic tokens so downstream model reasoning remains syntactically valid.',
      },
      {
        id: 'pol-3',
        title: 'Transparent Decision Trace Generator',
        meta: 'Explainable Audit Log · Rule Citations',
        scope: 'Human-Readable Explanations & Policy Rule IDs',
        description:
          'Produces clear explanations for every allow, redact, or block outcome to support developer debugging and governance review.',
      },
    ],
  },
  {
    id: 'mcp-boundaries',
    name: 'Agentic & MCP Boundaries',
    countLabel: '2 Evaluation Modules',
    items: [
      {
        id: 'mcp-1',
        title: 'Pre-Flight Tool Argument Interceptor',
        meta: 'JSON-RPC Inspection · Outbound Boundary',
        scope: 'MCP Tool Calls, Webhook Payloads, Function Calling',
        description:
          'Inspects structured tool arguments generated by autonomous agents before external tool execution occurs.',
      },
      {
        id: 'mcp-2',
        title: 'Cross-Tool Context Contamination Guard',
        meta: 'Multi-Hop Lineage · Least Privilege',
        scope: 'RAG Retrieval -> LLM Context -> External Plugin',
        description:
          'Prevents sensitive context retrieved from high-trust internal stores from flowing laterally into untrusted external plugins.',
      },
    ],
  },
  {
    id: 'governance-posture',
    name: 'Governance & Audit Posture',
    countLabel: '3 Evaluation Modules',
    items: [
      {
        id: 'gov-1',
        title: 'Hard-Denial Invariant Verifier',
        meta: 'Formal Policy Invariant · Non-Overridable Deny',
        scope: 'High-Relevance Credentials, Regulated National IDs, DB URIs',
        description:
          'Guarantees that explicit destination authorization denials (BLOCK) can never be overridden by high semantic task-relevance scores or manual allow overrides.',
      },
      {
        id: 'gov-2',
        title: 'Zero-Secret-Retention Audit Formatter',
        meta: 'Partial Token Masking · Ephemeral Inspection',
        scope: 'Masked Audit Logs, Redaction Previews, Rule Citations',
        description:
          'Formats decision explanations and audit traces with partial token masking so raw credentials are never persisted in telemetry or external logs.',
      },
      {
        id: 'gov-3',
        title: 'Pre-Flight Boundary Simulation Harness',
        meta: 'Deterministic Replay · Multi-Destination Diff',
        scope: 'External LLM API, Community MCP, Support CRM, Triage Webhook',
        description:
          'Simulates identical workflow prompts across multiple destination trust profiles to verify how authorization boundaries change outbound decisions.',
      },
    ],
  },
];
