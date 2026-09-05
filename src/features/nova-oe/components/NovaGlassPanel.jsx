import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowUpRight, Cpu, Folder, Code2, User, Mail, ExternalLink } from 'lucide-react';
import aboutData from '../../../data/knowledge/about.json';
import skillsData from '../../../data/knowledge/skills.json';
import projectsData from '../../../data/knowledge/projects.json';
import contactData from '../../../data/knowledge/contact.json';

const forgeData = {
  id: 'forge',
  title: 'FORGE OS',
  subtitle: 'WORLD 01 // ARCHITECTURE & ORCHESTRATION',
  headline: 'Engineering, orchestrated in real-time.',
  description: 'An AI-native engineering operating system that unifies architecture design, multi-agent orchestration, and execution pipelines into a single coherent cognitive stream.',
  highlights: [
    { title: 'Multi-Agent Orchestration', detail: 'Parallel execution of specialized AI agents with unified context.' },
    { title: 'Neural Canvas', detail: 'Real-time WebGL workspace for interactive systems modeling.' },
    { title: 'Desktop Runtime', detail: 'Low-latency local-first execution environment built for speed.' }
  ],
  tags: ['Architecture', 'Agents', 'Execution', 'Desktop AI']
};

export default function NovaGlassPanel({ activeWorld, onClose }) {
  const closeBtnRef = useRef(null);

  // Keyboard trap & Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Auto focus close button on open for screen readers / keyboard users
    if (closeBtnRef.current) {
      closeBtnRef.current.focus();
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!activeWorld) return null;

  return (
    <div
      className="nova-panel-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <motion.aside
        className="nova-glass-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${activeWorld} information panel`}
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="panel-top-bar">
          <div className="panel-world-badge">
            <span className="badge-dot" />
            {activeWorld.toUpperCase()}
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="panel-close-btn"
            aria-label="Close panel (Press Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Content based on activeWorld */}
        {activeWorld === 'forge' && (
          <div className="panel-content">
            <p className="panel-kicker">{forgeData.subtitle}</p>
            <h1 className="panel-title">{forgeData.headline}</h1>
            <div className="panel-rule" />
            <p className="panel-desc">{forgeData.description}</p>

            <div className="panel-section">
              <h2 className="section-heading"><Cpu size={14} /> Core Capabilities</h2>
              <div className="features-grid">
                {forgeData.highlights.map((item, idx) => (
                  <div key={idx} className="feature-card">
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="tags-row">
              {forgeData.tags.map((tag) => (
                <span key={tag} className="panel-tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {activeWorld === 'projects' && (
          <div className="panel-content">
            <p className="panel-kicker">PROJECT VAULT // WORLD 02</p>
            <h1 className="panel-title">Systems & Products Built to Scale.</h1>
            <div className="panel-rule" />
            <p className="panel-desc">A curated selection of AI systems, WebGL spaces, and high-performance digital products.</p>

            <div className="panel-section">
              <h2 className="section-heading"><Folder size={14} /> Featured Systems</h2>
              <div className="projects-list">
                {projectsData.slice(0, 3).map((proj) => (
                  <div key={proj.id} className="project-item">
                    <div className="project-header">
                      <h3>{proj.title}</h3>
                      <span className="project-category">{proj.category}</span>
                    </div>
                    <p>{proj.summary}</p>
                    <div className="tech-chips">
                      {proj.technologies.slice(0, 4).map((tech) => (
                        <span key={tech} className="tech-chip">{tech}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeWorld === 'skills' && (
          <div className="panel-content">
            <p className="panel-kicker">NEURAL MAP // WORLD 03</p>
            <h1 className="panel-title">Capabilities & Engineering Disciplines.</h1>
            <div className="panel-rule" />
            <p className="panel-desc">{skillsData.summary}</p>

            <div className="panel-section">
              <h2 className="section-heading"><Code2 size={14} /> Technical Stack</h2>
              <div className="skills-grid">
                {skillsData.categories.map((cat) => (
                  <div key={cat.id} className="skill-card">
                    <h3>{cat.name}</h3>
                    <p>{cat.summary}</p>
                    <div className="tech-chips">
                      {cat.techs.map((t) => (
                        <span key={t} className="tech-chip">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeWorld === 'story' || activeWorld === 'about') && (
          <div className="panel-content">
            <p className="panel-kicker">ARCHITECT STORY // WORLD 04</p>
            <h1 className="panel-title">{aboutData.name} — {aboutData.title}</h1>
            <div className="panel-rule" />
            <p className="panel-desc">{aboutData.bio}</p>
            
            <div className="philosophy-box">
              <p className="philosophy-text">"{aboutData.philosophy}"</p>
            </div>

            <div className="panel-section">
              <h2 className="section-heading"><User size={14} /> Core Focus Areas</h2>
              <ul className="focus-list">
                {aboutData.focus.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeWorld === 'contact' && (
          <div className="panel-content">
            <p className="panel-kicker">COMMUNICATION // WORLD 05</p>
            <h1 className="panel-title">Open a Direct Channel.</h1>
            <div className="panel-rule" />
            <p className="panel-desc">{contactData.availability}</p>

            <div className="contact-details">
              <a
                href={`mailto:${contactData.email}`}
                className="contact-email-link"
                aria-label={`Send email to ${contactData.email}`}
              >
                <Mail size={16} />
                <span>{contactData.email}</span>
                <ArrowUpRight size={16} />
              </a>
              <span className="location-text">Based in {contactData.location}</span>
            </div>

            <div className="panel-section">
              <h2 className="section-heading">Social Coordinates</h2>
              <div className="socials-row">
                {contactData.socials.map((soc) => (
                  <a
                    key={soc.id}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn"
                    aria-label={`Visit Shadab on ${soc.name}`}
                  >
                    <span>{soc.name}</span>
                    <ExternalLink size={12} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.aside>
    </div>
  );
}
