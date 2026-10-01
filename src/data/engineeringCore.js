/**
 * engineeringCore.js
 *
 * Master technical repository for Shadab Haradwala's Engineering Core systems.
 * All technical claims are grounded in actual project architectures and codebases:
 * - Finance Manager (Python, FastAPI, MongoDB Decimal128, Ledger Balance Engine)
 * - Trading Intelligence (Python, CCXT, Regime Classification, Paper Trading Simulations)
 * - NOVA AI (FastAPI, Hybrid RAG Vector/Keyword, Session Memory, Context Engine, Living R3F Core)
 * - FORGE IDE (TypeScript, React, Electron, Monaco, xterm.js, IPC, Local-First Architecture)
 *
 * Status labels adhere strictly to engineering truth:
 * - IN DEVELOPMENT
 * - SIMULATION / PAPER TRADING
 * - ACTIVE / MULTI-PHASE
 * - ARCHITECTURE STAGE
 */

export const ENGINEERING_SYSTEMS = [
  {
    id: 'finance-manager',
    number: '01',
    title: 'FINANCE MANAGER',
    subtitle: 'Financial Management & Accounting Engine',
    category: 'Financial Engineering / Distributed Backend',
    status: 'IN DEVELOPMENT',
    statusColor: '#38BDF8', // Sky blue
    statusDescription: 'Core ledger architecture & MongoDB Decimal128 schema established; conversational agent loop in active development.',
    badge: 'CORE FINANCIAL INVARIANT: ZERO-FLOAT ERROR',
    shortSummary: 'High-precision accounting and financial transaction engine designed with Python, FastAPI, and MongoDB, where monetary precision is treated as a first-class mathematical invariant.',
    headline: 'Treating monetary precision not as a formatting detail, but as an architectural invariant.',
    year: '2026',
    github: '#',
    techStack: [
      { name: 'Python 3.11+', role: 'Core runtime with strict typing' },
      { name: 'FastAPI', role: 'High-performance async API contracts' },
      { name: 'MongoDB 7 (Motor)', role: 'Document storage with native BSON Decimal128' },
      { name: 'Python Decimal', role: 'Fixed-point base-10 arithmetic across all math' },
      { name: 'Redis / RQ', role: 'Asynchronous balance snapshot & analytics workers' },
      { name: 'Pydantic v2', role: 'Strict Decimal schema deserialization & validation' },
      { name: 'Pytest & Mongomock', role: 'Property-based precision and ledger test suites' }
    ],
    architecture: {
      flowSummary: 'TRANSACTION → LEDGER → BALANCE ENGINE → MONGODB (DECIMAL128) → ANALYTICS',
      nodes: [
        {
          id: 'fm-ingest',
          label: 'TRANSACTION',
          role: 'Event Ingestion',
          description: 'Validates raw incoming payload via Pydantic. Guarantees amounts are parsed directly as Decimal from string or integer inputs without float coercion.',
          inputs: 'JSON / Telegram payload (amount_str, category, account_id, timestamp)',
          outputs: 'Validated UncommittedTransaction schema with Decimal(amount)',
          invariants: 'Zero IEEE-754 float representation allowed in memory'
        },
        {
          id: 'fm-ledger',
          label: 'LEDGER',
          role: 'Immutable Journal',
          description: 'Append-only event journal. Every economic movement is recorded as an immutable debit/credit entry with cryptographic sequence linkage.',
          inputs: 'Validated UncommittedTransaction',
          outputs: 'CommittedLedgerEntry with UUIDv7, sequence_num, and entry_hash',
          invariants: 'Ledger entries are strictly append-only; updates and deletes are forbidden'
        },
        {
          id: 'fm-engine',
          label: 'BALANCE ENGINE',
          role: 'Reconciliation Core',
          description: 'Calculates true account balances by folding over ledger deltas from the last verified daily snapshot document. Resolves concurrency race conditions.',
          inputs: 'Ledger delta stream + latest AccountSnapshot',
          outputs: 'Deterministic AccountBalance with 4-decimal precision',
          invariants: 'Sum(Credits) - Sum(Debits) must equal derived balance at all times'
        },
        {
          id: 'fm-db',
          label: 'MONGODB',
          role: 'Decimal128 Storage',
          description: 'Persists ledger records and account entities using native BSON Decimal128. Enables in-database atomic increments and aggregation pipelines without float distortion.',
          inputs: 'BSON documents with bson.decimal128.Decimal128 fields',
          outputs: 'Indexed historical records with compound tenant/timestamp keys',
          invariants: 'Aggregation pipelines ($sum, $avg) run exclusively on Decimal128'
        },
        {
          id: 'fm-analytics',
          label: 'ANALYTICS',
          role: 'Time-Series Engine',
          description: 'Generates rolling monthly burn velocity, category allocations, and net-worth trends for Telegram bot conversational summaries and web dashboards.',
          inputs: 'Aggregated monthly ledger slices',
          outputs: 'Spend velocity metrics, category distributions, anomaly alerts',
          invariants: 'Analytics read queries never block the transactional write path'
        }
      ]
    },
    engineeringDecisions: [
      {
        question: 'WHY DECIMAL INSTEAD OF STANDARD FLOATS?',
        answer: 'Standard binary floating-point representations (IEEE 754 float64) cannot accurately represent base-10 fractions like 0.1 or 0.2. In Python floats, 0.1 + 0.2 produces 0.30000000000000004. In personal finance, accumulating microscopic rounding discrepancies across hundreds of transactions causes ledger balance reconciliations to fail and creates phantom fractions of cents. Python\'s `decimal.Decimal` performs true fixed-point base-10 arithmetic with explicit rounding modes (ROUND_HALF_EVEN), completely eliminating rounding drift.'
      },
      {
        question: 'WHY MONGODB DECIMAL128?',
        answer: 'Many teams store money as strings or integer cents. Integer cents break down when handling fractional fees, foreign exchange splits, or micro-transactions. Strings prevent native database aggregation operators ($sum, $group) and numerical comparisons ($gt, $lt) without pulling all documents into application memory. MongoDB 3.4+ natively supports BSON Decimal128 (128-bit decimal floating point conforming to IEEE 754-2008), allowing high-performance in-engine aggregations while guaranteeing exact decimal precision.'
      },
      {
        question: 'WHY TRANSACTION → LEDGER → BALANCE ENGINE (EVENT-SOURCED)?',
        answer: 'In naive CRUD architectures, account balance is stored as a single mutable column: `UPDATE accounts SET balance = balance - 500`. If two requests hit simultaneously, a race condition occurs. If a network error happens mid-flight, the system cannot verify if the deduction occurred. By treating the Ledger as an append-only event stream, the Balance Engine computes balances deterministically from immutable transactions. Historical balances can be audited or reconstructed at any millisecond in history.'
      },
      {
        question: 'WHAT FAILED IN INITIAL PROTOTYPES?',
        answer: 'During initial schema validation with Pydantic, feeding JSON numbers like `{"amount": 500.50}` caused standard Pydantic parsers to coerce the value into a float before converting to Decimal. The damage was already done at the deserialization threshold. We resolved this by enforcing strict string-only amount inputs or custom pre-deserialization hooks that reject raw JSON floats entirely.'
      },
      {
        question: 'WHAT CHANGED IN ARCHITECTURE?',
        answer: 'Re-calculating account balance by scanning the entire historical ledger on every transaction became an O(N) bottleneck as transaction counts grew. We introduced daily account snapshot records generated by Redis background workers at 23:55 IST. The Balance Engine now only needs to fold ledger transactions that occurred after the latest snapshot checkpoint, reducing balance lookups to O(k) where k is transactions since midnight.'
      },
      {
        question: 'WHAT WOULD I DO DIFFERENTLY?',
        answer: 'I would set up property-based fuzz testing using the Hypothesis library from the very first commit. Writing hundreds of randomized micro-transaction batches (including zero-delta transfers, extreme scale decimals, and concurrent interleaved deposits) upfront exposes subtle boundary conditions much faster than manual integration tests.'
      }
    ],
    testingStrategy: {
      framework: 'Pytest + pytest-asyncio + mongomock-motor',
      coverageSummary: 'Focus on mathematical correctness, double-entry equality, and zero float leakage.',
      tests: [
        { name: 'Decimal Precision Invariant', desc: 'Verifies 10,000 randomized micro-transactions sum exactly to zero when reversed, with zero fractional penny residue.' },
        { name: 'Append-Only Ledger Guard', desc: 'Asserts that update and delete operations on committed ledger collection raise hard exceptions.' },
        { name: 'Concurrency Lock Test', desc: 'Simulates 50 simultaneous transfer requests to an account with exact balance to verify race conditions cannot cause negative balances.' },
        { name: 'Snapshot Roll-forward', desc: 'Verifies balance engine produces identical totals whether calculated from inception or rolled forward from any arbitrary snapshot.' }
      ]
    },
    liveTelemetry: {
      activeLedgerCount: 'Test environment: 1,420 synthetic events',
      averageLatency: '< 18ms balance resolution',
      roundingDelta: '0.000000000000000000 INR (Strict 0)'
    }
  },
  {
    id: 'trading-intelligence',
    number: '02',
    title: 'TRADING INTELLIGENCE',
    subtitle: 'Algorithmic Trading & Regime Classification System',
    category: 'Quantitative Systems / Autonomous Agents',
    status: 'SIMULATION / PAPER TRADING',
    statusColor: '#F59E0B', // Amber
    statusDescription: 'Tested strictly in paper simulation and backtesting mode with real-time exchange WebSocket feeds. No unverified live capital claims.',
    badge: 'STAGE: PAPER SIMULATION & BACKTEST',
    shortSummary: 'Multi-layer algorithmic trading and execution architecture designed to classify volatile market regimes, dynamically evaluate quantitative strategies, and execute risk-bounded paper orders.',
    headline: 'Eliminating strategy curve-fitting through dynamic market regime classification and realistic execution modeling.',
    year: '2025–2026',
    github: '#',
    techStack: [
      { name: 'Python 3.11', role: 'Core quantitative engine and agent runner' },
      { name: 'CCXT', role: 'Unified multi-exchange WebSocket & REST protocol' },
      { name: 'NumPy & Pandas', role: 'Vectorized time-series metrics & rolling windows' },
      { name: 'PyYAML', role: 'Deterministic paper simulation configurations' },
      { name: 'SQLite / DuckDB', role: 'Tick-level orderbook & trade snapshot caching' },
      { name: 'Matplotlib / Seaborn', role: 'Equity curve analysis & drawdown distributions' }
    ],
    architecture: {
      flowSummary: 'MARKET DATA → DATA AGENT → ANALYSIS AGENT → REGIME CLASSIFIER → STRATEGY ENGINE → PORTFOLIO ENGINE → EXECUTION ENGINE',
      nodes: [
        {
          id: 'ti-market',
          label: 'MARKET DATA',
          role: 'Exchange Ingestion',
          description: 'Maintains low-latency WebSocket streams for L2 orderbook depth and trades across major crypto pairs via CCXT.',
          inputs: 'Exchange WebSocket tick streams (bids, asks, trade sizes)',
          outputs: 'Normalized TickPacket stream with monotonic timestamping',
          invariants: 'Zero synthetic candle synthesis without verified trade receipt'
        },
        {
          id: 'ti-data',
          label: 'DATA AGENT',
          role: 'Tick Hygiene',
          description: 'Filters out anomalous exchange spikes, gaps, and duplicate sequence IDs. Buffers tick data into rolling memory rings.',
          inputs: 'Raw TickPacket stream',
          outputs: 'Cleaned multi-timeframe OHLCV bars + micro-structure state',
          invariants: 'Strict chronological ordering enforced prior to feature extraction'
        },
        {
          id: 'ti-analysis',
          label: 'ANALYSIS AGENT',
          role: 'Feature Engineering',
          description: 'Calculates rolling volatility (Garman-Klass, Parkinson), order-flow imbalance (OFI), and momentum signals using Welford rolling accumulators.',
          inputs: 'Cleaned OHLCV + Orderbook depth',
          outputs: 'Vector of volatility metrics, spread dynamics, and volume profiles',
          invariants: 'All metrics calculated using strictly causal data (zero lookahead)'
        },
        {
          id: 'ti-regime',
          label: 'REGIME CLASSIFIER',
          role: 'Macro State Detector',
          description: 'Classifies current market into statistical regimes: Trending Bullish, Trending Bearish, Mean-Reverting Choppy, or High-Volatility Disruption.',
          inputs: 'Rolling volatility, ADX trend strength, order-flow ratio',
          outputs: 'Classified MarketRegime enum with Bayesian confidence score',
          invariants: 'Strategies are gated if regime confidence drops below threshold'
        },
        {
          id: 'ti-strategy',
          label: 'STRATEGY ENGINE',
          role: 'Signal Generator',
          description: 'Generates directional trade propositions. Only executes sub-strategies validated for the active classified regime (e.g., mean-reversion during low vol chop).',
          inputs: 'Analysis features + active MarketRegime',
          outputs: 'RawTradeSignal (direction, entry_target, invalidation_level)',
          invariants: 'Every signal must include an explicit invalidation stop price'
        },
        {
          id: 'ti-portfolio',
          label: 'PORTFOLIO ENGINE',
          role: 'Risk & Sizing Core',
          description: 'Determines position sizing via fractional Kelly and maximum volatility allocation. Enforces hard maximum daily portfolio drawdown circuit breakers.',
          inputs: 'RawTradeSignal + Current Portfolio Equity + Open Exposures',
          outputs: 'SizedOrder (symbol, side, size_base, stop_loss, take_profit)',
          invariants: 'Single-position risk capped strictly at <= 1.5% of simulated equity'
        },
        {
          id: 'ti-execution',
          label: 'EXECUTION ENGINE',
          role: 'Paper Simulation Router',
          description: 'Simulates realistic order execution against live bid/ask orderbook queues, modeling crossing costs, partial fills, and simulated latency.',
          inputs: 'SizedOrder',
          outputs: 'SimulatedFill with realized slippage and daily snapshot logging',
          invariants: 'Fills require actual trade volume on exchange tape at that price'
        }
      ]
    },
    engineeringDecisions: [
      {
        question: 'WHY REGIME CLASSIFICATION FIRST?',
        answer: 'Most quantitative strategies suffer from regime fragility: a trend-following breakout strategy prints continuous losses in a sideways range, while a mean-reversion strategy gets annihilated during a macro liquidity trend. By decoupling regime classification from signal generation, the system only activates strategies whose historical edge aligns with current statistical market dynamics.'
      },
      {
        question: 'WHY STRICT PAPER SIMULATION OVER BACKTESTING?',
        answer: 'Traditional vector backtests suffer from severe lookahead bias, survivorship bias, and magical zero-slippage assumptions. The system connects to live exchange WebSockets, runs continuous paper-trading cycles in real-time, models order book queue priority, and writes daily JSON snapshot state files (`results/paper_daily_snapshots`). This provides truthful execution feedback without risk.'
      },
      {
        question: 'WHAT FAILED IN EARLY ITERATIONS?',
        answer: 'Early versions attempted to retain raw tick history in Python lists for rolling feature calculations. Under high market volatility, memory exploded and GC pauses introduced 200ms+ latency spikes into the event loop. We replaced naive lists with fixed-capacity ring buffers (collections.deque with maxlen) and Welford\'s online algorithm for computing rolling variance in O(1) space and time.'
      },
      {
        question: 'WHAT CHANGED IN RISK ARCHITECTURE?',
        answer: 'We migrated from static percentage position sizes to dynamic volatility-adjusted sizing (ATR-normalized risk budgeting). If volatility spikes by 300%, position sizes automatically scale down by 300% to keep absolute dollar variance per trade strictly constant.'
      },
      {
        question: 'WHAT WOULD I DO DIFFERENTLY?',
        answer: 'Implement an automated exchange-orderbook replay harness with synthetic latency injection earlier to benchmark execution performance against extreme flash-crash orderbook liquidity voids.'
      }
    ],
    testingStrategy: {
      framework: 'Pytest + Custom Paper Simulation Harness',
      coverageSummary: 'Rigorous validation of mathematical indicators, lookahead bias prevention, and risk brakes.',
      tests: [
        { name: 'Lookahead Bias Check', desc: 'Asserts that time index t only consumes data from <= t-1; future candle prices are inaccessible.' },
        { name: 'Circuit Breaker Invariant', desc: 'Simulates 5 consecutive stop-outs; verifies execution engine enters locked halt state until next UTC session.' },
        { name: 'Slippage Penalty Verification', desc: 'Verifies simulated fills reflect full spread width + depth impact on orders exceeding top-of-book volume.' }
      ]
    },
    liveTelemetry: {
      feedProtocol: 'CCXT Async WebSocket Feed',
      activePairs: 'BTC/USDT, ETH/USDT, SOL/USDT',
      classificationWindow: '15m / 1h / 4h Multi-Resolution'
    }
  },
  {
    id: 'nova-ai',
    number: '03',
    title: 'NOVA AI',
    subtitle: 'Personal AI Engine & Operating Environment',
    category: 'Autonomous AI / Agentic Architecture',
    status: 'ACTIVE / MULTI-PHASE',
    statusColor: '#A78BFA', // Violet
    statusDescription: 'Living Three.js operating environment, full-duplex voice pipeline, and hybrid RAG engine live in this very portfolio; multi-agent autonomous tool synthesis in active development.',
    badge: 'ARCHITECTURE: LIVING OPERATING ENVIRONMENT',
    shortSummary: 'Autonomous personal AI operating system combining a real-time WebGL neural core, full-duplex conversational voice pipelines, hybrid vector/keyword RAG retrieval, and deterministic tool orchestration.',
    headline: 'Merging visual computing with cognitive agent architecture to create an operating environment rather than a mere chatbot.',
    year: '2024–2026',
    github: '#',
    techStack: [
      { name: 'Python & FastAPI', role: 'Async cognitive backend & RAG pipeline' },
      { name: 'React & Three.js', role: 'Living neural core canvas & particle shaders' },
      { name: '@react-three/fiber', role: 'Declarative WebGL scene graph integration' },
      { name: 'OpenAI API & Ollama', role: 'Dual-provider hybrid LLM inference' },
      { name: 'Web Speech API', role: 'Low-latency full-duplex speech recognition & TTS' },
      { name: 'Vector Cosine + BM25', role: 'Reciprocal rank fusion hybrid document search' },
      { name: 'Pydantic v2', role: 'Strict agent tool execution contracts' }
    ],
    architecture: {
      flowSummary: 'NOVA UI (VOICE/TEXT) → MEMORY & INTENT → RAG RETRIEVAL → CONTEXT ENGINE → AI ORCHESTRATOR',
      nodes: [
        {
          id: 'nova-ui',
          label: 'NOVA CORE',
          role: 'Living Interface',
          description: 'Client-side 3D neural core running GLSL particle shaders and full-duplex audio reactivity. Handles real-time voice state machine (Idle / Listening / Thinking / Speaking).',
          inputs: 'Microphone stream, mouse vector, text inputs',
          outputs: 'Normalized intent request + audio waveform visual reactivity',
          invariants: 'Full-duplex audio echo prevention: mic mutes during TTS output'
        },
        {
          id: 'nova-mem',
          label: 'MEMORY SERVICE',
          role: 'Session & Entity Retention',
          description: 'Tracks user visit counts, discussed project topics, and conversational turn history across browser sessions using local storage with server synchronization.',
          inputs: 'User interaction events and conversational turns',
          outputs: 'Structured UserMemory profile & contextual greeting hints',
          invariants: 'Memory state operates offline-first without requiring cloud login'
        },
        {
          id: 'nova-rag',
          label: 'RAG PIPELINE',
          role: 'Knowledge Retrieval',
          description: 'Hybrid search system combining dense vector embeddings with BM25 keyword matching via Reciprocal Rank Fusion (RRF) to retrieve authentic project facts.',
          inputs: 'User query string',
          outputs: 'Ranked relevant knowledge chunks with source metadata',
          invariants: 'Zero hallucinated portfolio facts: strictly answers from verified corpus'
        },
        {
          id: 'nova-context',
          label: 'CONTEXT ENGINE',
          role: 'Token Assembler',
          description: 'Assembles dynamic LLM system prompts by pruning irrelevant facts, injecting active route state, and enforcing concise, technical responses under token budgets.',
          inputs: 'Raw prompt template + retrieved RAG chunks + memory state',
          outputs: 'Optimized contextual message payload (typically < 1,200 tokens)',
          invariants: 'Token budgets strictly bounded to guarantee sub-second TTFT'
        },
        {
          id: 'nova-orch',
          label: 'AI ORCHESTRATOR',
          role: 'Model Router & Tool Dispatcher',
          description: 'Routes queries between cloud LLMs (GPT-4o-mini) and local models (Ollama Llama 3.1 8B). Dispatches deterministic navigation actions (scroll to section, open modal).',
          inputs: 'Assembled context payload',
          outputs: 'Structured streaming response + client navigation triggers',
          invariants: 'Local deterministic intent overrides LLM inference for UI navigation'
        }
      ]
    },
    engineeringDecisions: [
      {
        question: 'WHY DUAL-PROVIDER (OPENAI + LOCAL OLLAMA)?',
        answer: 'Cloud LLM APIs introduce network round-trip latencies (often 800ms+ TTFT) and can fail during outages or rate limits. NOVA backend is architected with provider abstraction: queries can run against cloud models for high-nuance answers or fall back instantly to local Ollama instances (Llama 3.1 8B, Qwen 2.5 14B) for offline independence and zero API cost.'
      },
      {
        question: 'WHY RECIPROCAL RANK FUSION (HYBRID RAG)?',
        answer: 'Dense vector embeddings alone struggle with exact technical keywords, proper nouns, and version strings (e.g. searching for "FORGE" or "MongoDB Decimal128"). Pure keyword BM25 struggles with semantic conceptual questions like "how do you handle accounting precision?". Reciprocal Rank Fusion (RRF) normalizes ranks across both dense and sparse retrieval to guarantee superior precision and recall.'
      },
      {
        question: 'HOW WAS FULL-DUPLEX AUDIO ECHO SOLVED?',
        answer: 'In early web voice implementations, the computer\'s speaker output was picked up by the browser microphone, causing the AI to transcribe and respond to its own voice in an infinite loop. We engineered a deterministic 4-state finite state machine (Idle -> Listening -> Thinking -> Speaking) that programmatically suspends microphone speech recognition listeners during speech synthesis execution.'
      },
      {
        question: 'WHAT CHANGED IN THE BACKEND ARCHITECTURE?',
        answer: 'Originally, the backend attempted to maintain stateful WebSocket sessions for every visitor. Under concurrent traffic spikes, maintaining idle persistent WebSocket connections exhausted server worker pools. We transitioned to stateless async REST endpoints with idempotent conversation IDs, backed by an async Redis conversation buffer.'
      }
    ],
    testingStrategy: {
      framework: 'Pytest + FastAPI TestClient + Web Speech Mock',
      coverageSummary: 'Validates RAG retrieval relevance, context token bounds, and voice state transitions.',
      tests: [
        { name: 'RAG Retrieval Benchmark', desc: 'Runs 50 benchmark questions; asserts that expected project IDs appear in top 3 retrieved context chunks with 98%+ recall.' },
        { name: 'Token Truncation Invariant', desc: 'Feeds 10,000-word query input; verifies Context Engine trims context to stay strictly under max_context_tokens.' },
        { name: 'Navigation Intent Determinism', desc: 'Verifies phrases like "take me to work" trigger local navigation router in 0ms without consuming LLM API calls.' }
      ]
    },
    liveTelemetry: {
      ragCorpusSize: '6 core domains (Projects, About, Skills, Experience, Philosophy)',
      inferenceEngines: 'Cloud GPT-4o-mini + Local Ollama Llama 3.1 8B',
      voiceLatency: '~120ms local intent evaluation'
    }
  },
  {
    id: 'forge-ide',
    number: '04',
    title: 'FORGE IDE',
    subtitle: 'Personal AI Engineering OS',
    category: 'Developer Platforms / Desktop Systems',
    status: 'IN DEVELOPMENT, ARCHITECTURE STAGE',
    statusColor: '#2DD4BF', // Teal
    statusDescription: 'Foundational runtime contracts, IPC specifications, and agent execution sandbox designed; started July 2026.',
    badge: 'STAGE: ARCHITECTURE SPECIFICATION',
    shortSummary: 'A local-first desktop AI software engineering platform and multi-agent execution environment built for high-performance offline-first agentic development.',
    headline: 'Building an agent-first desktop engineering environment where code editing, terminal execution, and local models share a unified runtime.',
    year: 'Started July 2026',
    github: '#',
    techStack: [
      { name: 'TypeScript', role: 'End-to-end type contracts across UI and main processes' },
      { name: 'React 18', role: 'Component hierarchy for multi-pane workspace layout' },
      { name: 'Electron', role: 'Desktop container with strict context isolation' },
      { name: 'Monaco Editor', role: 'High-performance code editing & AST language services' },
      { name: 'xterm.js & node-pty', role: 'Low-latency pseudoterminal process execution' },
      { name: 'Zustand', role: 'Zero-overhead reactive workspace state management' },
      { name: 'Local Model IPC', role: 'Asynchronous streaming interface to local LLM runners' }
    ],
    architecture: {
      flowSummary: 'ELECTRON SHELL → MONACO/XTERM → ZUSTAND STORE → ASYNC IPC BUS → AGENT SANDBOX → LOCAL RUNTIME',
      nodes: [
        {
          id: 'forge-shell',
          label: 'ELECTRON RUNTIME',
          role: 'Native Shell',
          description: 'Provides cross-platform window management, native filesystem access, and process supervisor. Operates with nodeIntegration disabled for security.',
          inputs: 'OS window events, file system watchers',
          outputs: 'Secure context bridge to React frontend',
          invariants: 'Renderer process is completely isolated from direct Node.js access'
        },
        {
          id: 'forge-editor',
          label: 'MONACO & XTERM',
          role: 'Workspace UI',
          description: 'Embeds Monaco for code editing with full syntax tree support, paired with xterm.js powered by node-pty for direct terminal command execution.',
          inputs: 'Keystrokes, terminal input, agent edit proposals',
          outputs: 'Dirty file buffers, terminal stdout streams',
          invariants: 'Terminal output rendered via requestAnimationFrame throttling'
        },
        {
          id: 'forge-state',
          label: 'ZUSTAND STORE',
          role: 'State Fabric',
          description: 'Manages open tabs, active terminal splits, agent thought stream panels, and workspace file trees in a high-performance, non-blocking store.',
          inputs: 'UI actions, background agent updates',
          outputs: 'Immutable state slices to subscribed React components',
          invariants: 'Zero full-screen re-renders during high-volume terminal output'
        },
        {
          id: 'forge-ipc',
          label: 'ASYNC IPC BUS',
          role: 'Process Communication',
          description: 'Asynchronous message protocol bridging the UI renderer with native system processes, background language servers, and local model threads.',
          inputs: 'Serialized IPC commands (file_read, run_command, agent_step)',
          outputs: 'Streaming stdout, binary diff chunks, execution exit codes',
          invariants: 'All IPC requests must pass strict schema validation'
        },
        {
          id: 'forge-agent',
          label: 'AGENT COORDINATOR',
          role: 'Autonomous Supervisor',
          description: 'Manages multi-agent execution loops: code search agent, test verification agent, and diff editor agent running in constrained local subprocesses.',
          inputs: 'User development prompt + repository context',
          outputs: 'Structured diff proposals + verification test runs',
          invariants: 'Agent tool execution requires explicit user authorization gates'
        }
      ]
    },
    engineeringDecisions: [
      {
        question: 'WHY LOCAL-FIRST INSTEAD OF CLOUD SAAS?',
        answer: 'Cloud-based AI developer tools create latency bottlenecks, leak proprietary source code over external networks, and incur massive API token bills during repetitive autonomous reasoning loops. FORGE targets local-first execution: repository indexing, code AST traversal, and LLM reasoning run directly on the engineer\'s machine with zero external cloud dependencies.'
      },
      {
        question: 'WHY STRICT IPC ISOLATION OVER NODE INTEGRATION?',
        answer: 'Enabling `nodeIntegration: true` in Electron allows malicious scripts or compromised packages in the project tree to execute arbitrary code with full host privileges. FORGE enforces hardened context isolation: the UI communicates with the host operating system strictly through an explicit, typed asynchronous IPC message bus with strict schema validation.'
      },
      {
        question: 'WHAT WAS LEARNED DURING ARCHITECTURAL PLANNING?',
        answer: 'Standard terminal emulators choke when build tools output tens of thousands of log lines in seconds. We decoupled node-pty process stdout from xterm.js rendering using a circular byte buffer and batched RAF flushes, preventing terminal lockups during heavy builds.'
      }
    ],
    testingStrategy: {
      framework: 'TypeScript type check + Vitest unit contracts + Spectron/Playwright E2E',
      coverageSummary: 'Validates IPC contract parity, terminal output stability, and state persistence.',
      tests: [
        { name: 'IPC Contract Schema Validation', desc: 'Validates that malformed or unauthorized IPC messages are rejected at the preload bridge boundary.' },
        { name: 'Terminal Buffer Overflow Guard', desc: 'Pumps 100,000 lines of stdout into virtual terminal; asserts zero dropped bytes and steady 60fps render loop.' },
        { name: 'State Checkpointing', desc: 'Simulates sudden app kill; verifies workspace tabs, open files, and terminal scrollback restore faithfully.' }
      ]
    },
    liveTelemetry: {
      specVersion: 'FORGE-RFC-001 (Architecture Draft)',
      targetPlatforms: 'macOS, Linux, Windows 11',
      editorCore: 'Monaco Editor 0.45+'
    }
  }
];

export const PHILOSOPHY_POINTS = [
  {
    number: '01',
    title: 'THE VISIBLE & THE HIDDEN',
    statement: 'The portfolio is the visible layer. The engineering systems are the hidden layer behind it.',
    detail: 'Most developer sites stop at visual aesthetics and project cards. My work is structured as two worlds: the polished interactive experience on the surface, and the rigorous mathematical, financial, and agentic systems operating underneath.'
  },
  {
    number: '02',
    title: 'INVARIANTS OVER CONVENIENCE',
    statement: 'Financial accuracy, floating-point drift, and lookahead bias cannot be fixed in CSS.',
    detail: 'When engineering systems handle money, market trades, or autonomous reasoning, architectural decisions matter. We choose Decimal128 over floats, event-sourced ledgers over mutable rows, and causal paper simulation over flattering backtests.'
  },
  {
    number: '03',
    title: 'HONEST SPECIFICATIONS',
    statement: 'Clear boundaries between In Development, Simulation, and Production.',
    detail: 'Real engineering maturity means never disguising paper trading as live profit, nor prototypes as production SaaS. We document what is built, what is in progress, what failed, and what changed.'
  }
];
