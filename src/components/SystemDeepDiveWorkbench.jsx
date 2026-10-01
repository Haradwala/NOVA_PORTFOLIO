/**
 * SystemDeepDiveWorkbench.jsx
 *
 * Master technical environment for inspecting the Engineering Core systems:
 *   - Finance Manager
 *   - Trading Intelligence
 *   - NOVA AI
 *   - Forge IDE
 *
 * Tabs:
 *   1. OVERVIEW — Mathematical invariants, problem statements, verified deliverables
 *   2. ARCHITECTURE — Visual interactive component diagram with inspectable contracts
 *   3. ENGINEERING DECISIONS — "Why did I build it this way?" (Why Decimal? Why Decimal128? What failed? What changed?)
 *   4. DATA FLOW — Step-by-step interactive telemetry simulator with JSON payloads
 *   5. TESTING & VERIFICATION — Pytest test suites, edge case matrix, mathematical assertions
 *   6. TECH STACK — Exact libraries and architectural roles
 *   7. STATUS & ROADMAP — Honest engineering progress (Completed / In Progress / Planned)
 */

import { useState } from 'react';
import { ENGINEERING_SYSTEMS } from '../data/engineeringCore';

export default function SystemDeepDiveWorkbench({ systemId, onSelectSystem }) {
  const [activeTab, setActiveTab] = useState('architecture');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [simStep, setSimStep] = useState(0);

  const system = ENGINEERING_SYSTEMS.find(s => s.id === systemId) || ENGINEERING_SYSTEMS[0];

  const TABS = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'architecture', label: 'ARCHITECTURE' },
    { id: 'decisions', label: 'ENGINEERING DECISIONS' },
    { id: 'dataflow', label: 'DATA FLOW' },
    { id: 'testing', label: 'TESTING & CORRECTNESS' },
    { id: 'techstack', label: 'TECH STACK' },
  ];

  const activeNode = system.architecture.nodes.find(n => n.id === selectedNodeId) || system.architecture.nodes[0];

  const handleNextSimStep = () => {
    setSimStep(prev => (prev + 1) % system.architecture.nodes.length);
  };

  const handleResetSim = () => {
    setSimStep(0);
  };

  return (
    <div
      style={{
        background: 'rgba(10, 10, 18, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 20,
        padding: 'clamp(1.5rem, 3.5vw, 3rem)',
        boxShadow: '0 30px 90px rgba(0, 0, 0, 0.65)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative subtle grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.03) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      {/* Workbench Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '2rem',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.65rem',
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem',
                color: system.statusColor,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              SYS {system.number} // {system.category}
            </span>
            <span
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                background: `${system.statusColor}18`,
                border: `1px solid ${system.statusColor}44`,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.58rem',
                color: system.statusColor,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              {system.status}
            </span>
          </div>

          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#EEEEF5',
              margin: '0 0 0.5rem 0',
            }}
          >
            {system.title}
          </h2>

          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(0.9rem, 1.3vw, 1.05rem)',
              color: 'rgba(160, 160, 192, 0.85)',
              margin: 0,
              maxWidth: 620,
              lineHeight: 1.6,
            }}
          >
            {system.headline}
          </p>
        </div>

        {/* System Switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {ENGINEERING_SYSTEMS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onSelectSystem(s.id);
                setSelectedNodeId(null);
                setSimStep(0);
              }}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                background: s.id === system.id ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${s.id === system.id ? s.statusColor : 'rgba(255, 255, 255, 0.08)'}`,
                color: s.id === system.id ? '#FFFFFF' : 'rgba(160, 160, 192, 0.7)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.64rem',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Invariant Alert Ribbon */}
      <div
        style={{
          marginTop: '1.5rem',
          padding: '0.75rem 1.25rem',
          borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.02)',
          borderLeft: `3px solid ${system.statusColor}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: system.statusColor }}>⚡</span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.68rem',
              letterSpacing: '0.08em',
              color: '#EEEEF5',
            }}
          >
            {system.badge}
          </span>
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.62rem',
            color: 'rgba(160, 160, 192, 0.65)',
            letterSpacing: '0.08em',
          }}
        >
          {system.statusDescription}
        </div>
      </div>

      {/* Workbench Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingTop: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '6px',
                background: isActive ? `${system.statusColor}18` : 'transparent',
                border: `1px solid ${isActive ? system.statusColor : 'transparent'}`,
                color: isActive ? '#EEEEF5' : 'rgba(160, 160, 192, 0.6)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.68rem',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.12em',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div style={{ marginTop: '2rem', position: 'relative', zIndex: 2 }}>
        {/* ── TAB 1: OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h3
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.78rem',
                  letterSpacing: '0.14em',
                  color: system.statusColor,
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                // SYSTEM SUMMARY
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.98rem',
                  lineHeight: 1.8,
                  color: 'rgba(238, 238, 245, 0.88)',
                  marginBottom: '1.5rem',
                }}
              >
                {system.shortSummary}
              </p>

              <h4
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.72rem',
                  letterSpacing: '0.12em',
                  color: 'rgba(160, 160, 192, 0.7)',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                }}
              >
                // TELEMETRY & SPECIFICATIONS
              </h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                {Object.entries(system.liveTelemetry).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      padding: '0.85rem',
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.58rem',
                        color: 'rgba(160, 160, 192, 0.55)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '0.3rem',
                      }}
                    >
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.74rem',
                        color: '#EEEEF5',
                        fontWeight: 600,
                      }}
                    >
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 12,
                padding: '1.75rem',
              }}
            >
              <h3
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.78rem',
                  letterSpacing: '0.14em',
                  color: system.statusColor,
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                // DATA FLOW TOPOLOGY
              </h3>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.76rem',
                  color: '#EEEEF5',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 6,
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                  wordBreak: 'break-word',
                }}
              >
                {system.architecture.flowSummary}
              </div>

              <h4
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.72rem',
                  letterSpacing: '0.12em',
                  color: 'rgba(160, 160, 192, 0.7)',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                }}
              >
                // ARCHITECTURAL INVARIANTS
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {system.architecture.nodes.map((node) => (
                  <li
                    key={node.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      marginBottom: '0.75rem',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.85rem',
                      color: 'rgba(160, 160, 192, 0.8)',
                    }}
                  >
                    <span style={{ color: system.statusColor, fontSize: '0.75rem', flexShrink: 0, marginTop: '0.1rem' }}>▹</span>
                    <span>
                      <strong style={{ color: '#EEEEF5' }}>{node.label}:</strong> {node.invariants}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── TAB 2: ARCHITECTURE ── */}
        {activeTab === 'architecture' && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.72rem',
                  letterSpacing: '0.12em',
                  color: 'rgba(160, 160, 192, 0.7)',
                  textTransform: 'uppercase',
                }}
              >
                Click any component node below to inspect its mathematical & data contract
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.62rem',
                  color: system.statusColor,
                  letterSpacing: '0.1em',
                }}
              >
                {system.architecture.nodes.length} COMPONENTS CONNECTED
              </div>
            </div>

            {/* Visual Node Flow */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${system.architecture.nodes.length}, minmax(130px, 1fr))`,
                gap: '0.75rem',
                overflowX: 'auto',
                paddingBottom: '1.5rem',
              }}
            >
              {system.architecture.nodes.map((node, index) => {
                const isSelected = activeNode.id === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{
                      background: isSelected ? `${system.statusColor}15` : 'rgba(255, 255, 255, 0.02)',
                      border: `1px solid ${isSelected ? system.statusColor : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: 10,
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.55rem',
                        color: isSelected ? system.statusColor : 'rgba(160, 160, 192, 0.5)',
                        letterSpacing: '0.12em',
                        marginBottom: '0.4rem',
                      }}
                    >
                      STEP 0{index + 1}
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#EEEEF5',
                        marginBottom: '0.3rem',
                      }}
                    >
                      {node.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.58rem',
                        color: 'rgba(160, 160, 192, 0.7)',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {node.role}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Component Inspection Pane */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: `1px solid ${system.statusColor}44`,
                borderRadius: 12,
                padding: '1.75rem',
                marginTop: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingBottom: '0.75rem',
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.62rem',
                      color: system.statusColor,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                    }}
                  >
                    COMPONENT INSPECTOR
                  </span>
                  <h4
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: '#EEEEF5',
                      margin: '0.2rem 0 0 0',
                    }}
                  >
                    {activeNode.label} — {activeNode.role}
                  </h4>
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.65rem',
                    color: 'rgba(160, 160, 192, 0.6)',
                  }}
                >
                  ID: {activeNode.id}
                </div>
              </div>

              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.94rem',
                  lineHeight: 1.7,
                  color: 'rgba(238, 238, 245, 0.9)',
                  marginBottom: '1.5rem',
                }}
              >
                {activeNode.description}
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 8,
                    padding: '1rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.58rem',
                      letterSpacing: '0.12em',
                      color: '#38BDF8',
                      textTransform: 'uppercase',
                      marginBottom: '0.4rem',
                    }}
                  >
                    INPUT CONTRACT
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.72rem',
                      color: 'rgba(238, 238, 245, 0.85)',
                      lineHeight: 1.5,
                    }}
                  >
                    {activeNode.inputs}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 8,
                    padding: '1rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.58rem',
                      letterSpacing: '0.12em',
                      color: '#4ADE80',
                      textTransform: 'uppercase',
                      marginBottom: '0.4rem',
                    }}
                  >
                    OUTPUT CONTRACT
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.72rem',
                      color: 'rgba(238, 238, 245, 0.85)',
                      lineHeight: 1.5,
                    }}
                  >
                    {activeNode.outputs}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 8,
                    padding: '1rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.58rem',
                      letterSpacing: '0.12em',
                      color: '#F59E0B',
                      textTransform: 'uppercase',
                      marginBottom: '0.4rem',
                    }}
                  >
                    SYSTEM INVARIANT
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.72rem',
                      color: 'rgba(238, 238, 245, 0.85)',
                      lineHeight: 1.5,
                    }}
                  >
                    {activeNode.invariants}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: ENGINEERING DECISIONS ── */}
        {activeTab === 'decisions' && (
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                color: 'rgba(160, 160, 192, 0.7)',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
              }}
            >
              Architectural Tradeoffs, Edge Cases, Failures & Lessons Learned
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {system.engineeringDecisions.map((dec, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 12,
                    padding: '1.5rem',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.75rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: system.statusColor,
                      }}
                    >
                      0{idx + 1}
                    </span>
                    <h4
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: '#EEEEF5',
                        margin: 0,
                      }}
                    >
                      {dec.question}
                    </h4>
                  </div>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.92rem',
                      lineHeight: 1.75,
                      color: 'rgba(200, 200, 220, 0.85)',
                      margin: 0,
                      paddingLeft: '1.5rem',
                      borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    {dec.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 4: DATA FLOW SIMULATOR ── */}
        {activeTab === 'dataflow' && (
          <div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.72rem',
                    letterSpacing: '0.12em',
                    color: 'rgba(160, 160, 192, 0.7)',
                    textTransform: 'uppercase',
                  }}
                >
                  Interactive Event Pipeline Simulation
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.62rem',
                    color: system.statusColor,
                  }}
                >
                  Active Stage: Step {simStep + 1} of {system.architecture.nodes.length} — {system.architecture.nodes[simStep].label}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleNextSimStep}
                  style={{
                    padding: '0.5rem 1.1rem',
                    borderRadius: 6,
                    background: system.statusColor,
                    color: '#07070F',
                    border: 'none',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                  }}
                >
                  STEP NEXT →
                </button>
                <button
                  onClick={handleResetSim}
                  style={{
                    padding: '0.5rem 0.9rem',
                    borderRadius: 6,
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgba(160, 160, 192, 0.7)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                  }}
                >
                  RESET
                </button>
              </div>
            </div>

            {/* Pipeline progress bar */}
            <div
              style={{
                display: 'flex',
                height: 4,
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 2,
                overflow: 'hidden',
                marginBottom: '2rem',
              }}
            >
              {system.architecture.nodes.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    background: i <= simStep ? system.statusColor : 'transparent',
                    transition: 'background 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Active Simulation Step Card */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: `1px solid ${system.statusColor}44`,
                borderRadius: 12,
                padding: '1.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.65rem',
                    color: system.statusColor,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  EVENT PROCESSING TELEMETRY
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.6rem',
                    color: 'rgba(160, 160, 192, 0.5)',
                  }}
                >
                  TIMESTAMP: {new Date().toISOString()}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#EEEEF5',
                  marginBottom: '0.5rem',
                }}
              >
                {system.architecture.nodes[simStep].label} — {system.architecture.nodes[simStep].role}
              </h3>

              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.94rem',
                  lineHeight: 1.7,
                  color: 'rgba(200, 200, 225, 0.9)',
                  marginBottom: '1.5rem',
                }}
              >
                {system.architecture.nodes[simStep].description}
              </p>

              {/* Synthetic Payload Display */}
              <div
                style={{
                  background: '#07070F',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 8,
                  padding: '1rem 1.25rem',
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.6rem',
                    color: 'rgba(160, 160, 192, 0.6)',
                    letterSpacing: '0.1em',
                    marginBottom: '0.5rem',
                  }}
                >
                  // SIMULATED PAYLOAD DATA
                </div>
                <pre
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.72rem',
                    color: '#A78BFA',
                    margin: 0,
                    lineHeight: 1.5,
                    overflowX: 'auto',
                  }}
                >
                  {JSON.stringify(
                    {
                      system: system.id,
                      step: system.architecture.nodes[simStep].label,
                      inputs: system.architecture.nodes[simStep].inputs,
                      outputs: system.architecture.nodes[simStep].outputs,
                      invariant_enforced: system.architecture.nodes[simStep].invariants,
                      state: 'VERIFIED_CORRECT'
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: TESTING & CORRECTNESS ── */}
        {activeTab === 'testing' && (
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                color: 'rgba(160, 160, 192, 0.7)',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
              }}
            >
              Test Suites, Automated Verification Harnesses & Invariant Protections
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: 10,
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.62rem',
                  color: system.statusColor,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: '0.3rem',
                }}
              >
                TESTING FRAMEWORK & HARNESS
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.85rem',
                  color: '#EEEEF5',
                  fontWeight: 600,
                  marginBottom: '0.4rem',
                }}
              >
                {system.testingStrategy.framework}
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.88rem',
                  color: 'rgba(160, 160, 192, 0.8)',
                }}
              >
                {system.testingStrategy.coverageSummary}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              {system.testingStrategy.tests.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 10,
                    padding: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#4ADE80',
                        boxShadow: '0 0 6px #4ADE80',
                      }}
                    />
                    <h5
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: '#EEEEF5',
                        margin: 0,
                      }}
                    >
                      {t.name}
                    </h5>
                  </div>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.84rem',
                      lineHeight: 1.6,
                      color: 'rgba(160, 160, 192, 0.75)',
                      margin: 0,
                    }}
                  >
                    {t.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 6: TECH STACK ── */}
        {activeTab === 'techstack' && (
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                color: 'rgba(160, 160, 192, 0.7)',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
              }}
            >
              Exact Technologies, Drivers & Architectural Roles
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {system.techStack.map((tech, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 8,
                    padding: '1rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#EEEEF5',
                      marginBottom: '0.3rem',
                    }}
                  >
                    {tech.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.82rem',
                      color: 'rgba(160, 160, 192, 0.75)',
                    }}
                  >
                    {tech.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
