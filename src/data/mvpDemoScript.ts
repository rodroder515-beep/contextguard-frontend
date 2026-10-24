export interface DemoChapter {
  id: string;
  title: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  timeLabel: string;
  sectionId: string;
  transcript: string[];
  keyPoints: string[];
  autoAction?: {
    type: 'configure-demo' | 'switch-destination' | 'highlight-stack';
    payload?: string;
  };
}

export const MVP_DEMO_SCRIPT: DemoChapter[] = [
  {
    id: 'intro',
    title: 'Introduction',
    startTime: 0,
    endTime: 20,
    timeLabel: '0:00–0:20',
    sectionId: 'hero',
    transcript: [
      "Hello everyone. Today, I'm presenting ContextGuard, a context-aware data privacy system designed to make AI workflows safer.",
      "As AI becomes increasingly integrated into our daily work, protecting sensitive information while allowing legitimate tasks to continue is becoming more important than ever.",
    ],
    keyPoints: [
      'Context-aware privacy and authorization for AI workflows',
      'Protects sensitive data while enabling legitimate task completion',
    ],
  },
  {
    id: 'problem',
    title: 'The Problem',
    startTime: 20,
    endTime: 45,
    timeLabel: '0:20–0:45',
    sectionId: 'problem',
    transcript: [
      'Traditional privacy checks may not fully account for the context in which information is shared.',
      'The same information may be appropriate for one task but unnecessary or unauthorized for another. ContextGuard addresses this challenge by considering the purpose of a request, its destination, and the data being shared.',
    ],
    keyPoints: [
      'Traditional checks miss contextual boundaries',
      'Identical data may be authorized for an internal CRM but unauthorized for an external MCP',
      'Considers task purpose + destination boundary + payload',
    ],
  },
  {
    id: 'approach',
    title: 'Our Approach',
    startTime: 45,
    endTime: 70,
    timeLabel: '0:45–1:10',
    sectionId: 'architecture-stack',
    transcript: [
      'ContextGuard introduces a policy evaluation layer for outbound data.',
      'It examines the task objective, intended destination, and outbound payload against the applicable policy rules. This helps determine whether the proposed transfer should be allowed or blocked.',
      'An important principle behind our approach is that information being relevant to a task does not automatically make it authorized for sharing.',
    ],
    keyPoints: [
      'Dedicated policy evaluation layer for outbound egress',
      'Evaluates task objective + destination boundary + payload against policy rules',
      'First Principle: Relevance to a task is not authorization to share',
    ],
    autoAction: {
      type: 'highlight-stack',
    },
  },
  {
    id: 'live-demo',
    title: 'Live MVP Demonstration',
    startTime: 70,
    endTime: 125,
    timeLabel: '1:10–2:05',
    sectionId: 'interactive-demo',
    transcript: [
      "Now, let's look at the actual ContextGuard interface.",
      'Here, we can configure the task, select the intended destination, and provide the information that needs to be evaluated.',
      'When we run the evaluation, the system checks the request against its configured policies and presents the resulting decision.',
      "Let's examine the outcome and its explanation. This makes it easier to understand which conditions influenced the decision and why the proposed data transfer was allowed or blocked.",
      'By making these decisions more transparent, ContextGuard aims to help users identify privacy risks before information is shared.',
    ],
    keyPoints: [
      'Interactive task configuration & destination selection (Untrusted MCP, External LLM, Scoped CRM)',
      'Deterministic policy enforcement: HALT OUTBOUND / ALLOW WITH REDACTION',
      'Granular condition explainability & sanitized egress payload',
    ],
    autoAction: {
      type: 'configure-demo',
    },
  },
  {
    id: 'applications',
    title: 'Applications & Scalability',
    startTime: 125,
    endTime: 155,
    timeLabel: '2:05–2:35',
    sectionId: 'research-notes',
    transcript: [
      'ContextGuard could be useful in enterprise AI workflows, including healthcare, finance, and other environments where sensitive information requires careful handling.',
      'Its policy-based architecture provides a foundation for extending context-aware privacy controls across different applications and destinations.',
    ],
    keyPoints: [
      'Enterprise-grade domains: Healthcare (HIPAA), Finance (SOX/PCI), Engineering (API credentials)',
      'Extensible policy-as-code for MCP tools, agent runtimes, and external LLMs',
      'Low latency pre-flight verification layer',
    ],
  },
  {
    id: 'closing',
    title: 'Closing',
    startTime: 155,
    endTime: 170,
    timeLabel: '2:35–2:50',
    sectionId: 'closing-cta',
    transcript: [
      'To conclude, ContextGuard aims to make AI workflows safer through context-aware evaluation, policy enforcement, and transparent decisions.',
      'Our vision is simple: enable responsible AI adoption without compromising data privacy.',
      'Thank you.',
    ],
    keyPoints: [
      'Context-aware evaluation + deterministic policy enforcement',
      'Transparent, inspectable decisions before data leaves the workflow',
      'Responsible AI adoption without compromising data privacy',
    ],
  },
];

export const TOTAL_DEMO_DURATION = 170; // 2 minutes 50 seconds
