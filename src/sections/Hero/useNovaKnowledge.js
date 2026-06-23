import { useCallback } from 'react';
import aboutData from '../../data/knowledge/about.json' with { type: 'json' };
import projectsData from '../../data/knowledge/projects.json' with { type: 'json' };
import skillsData from '../../data/knowledge/skills.json' with { type: 'json' };
import experienceData from '../../data/knowledge/experience.json' with { type: 'json' };
import contactData from '../../data/knowledge/contact.json' with { type: 'json' };
import portfolioData from '../../data/knowledge/portfolio.json' with { type: 'json' };

// Simple filler words to filter out before matching
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'to', 'for', 'in', 'on', 'at', 'by',
  'of', 'with', 'about', 'and', 'or', 'tell', 'me', 'show', 'what', 'who',
  'how', 'you', 'your', 'have', 'do', 'does', 'this', 'that', 'i'
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0 && !STOP_WORDS.has(word));
}

export function queryKnowledgeEngine(text = '') {
  if (!text?.trim()) {
    return { intent: 'fallback', text: null, preview: null, confidence: 0, action: null };
  }

  const rawQuery = text.toLowerCase().trim();
  const queryTokens = tokenize(rawQuery);

  let bestMatch = {
    intent: 'fallback',
    text: null,
    preview: null,
    confidence: 0.0,
    action: null
  };

  const updateBest = (intent, confidence, textComposer, preview, action) => {
    if (confidence > bestMatch.confidence) {
      bestMatch = { intent, confidence, text: textComposer(), preview, action };
    }
  };

  // Calculate token match ratio (intersection / query size)
  const getMatchRatio = (dbKeywords = [], dbTags = []) => {
    if (queryTokens.length === 0) return 0;
    const dbSet = new Set([
      ...dbKeywords.map(k => k.toLowerCase()),
      ...dbTags.map(t => t.toLowerCase())
    ]);
    let hits = 0;
    queryTokens.forEach(t => {
      if (dbSet.has(t)) hits += 1.0;
      else {
        // Check substring containment
        for (const dw of dbSet) {
          if (dw.includes(t) || t.includes(dw)) {
            hits += 0.5;
            break;
          }
        }
      }
    });
    return hits / queryTokens.length;
  };

  // ── 1. PORTFOLIO IDENTITY INTENTS ──
  {
    let score = 0.0;
    if (rawQuery.includes('who created') || rawQuery.includes('who designed') || rawQuery.includes('who built') || rawQuery.includes('creator')) {
      score = 1.0;
    } else {
      score = getMatchRatio(portfolioData.keywords, portfolioData.tags);
    }
    updateBest(
      'portfolio',
      score,
      () => `This portfolio, "${portfolioData.title}" (version ${portfolioData.version}), was designed and created by ${portfolioData.owner} based in ${portfolioData.location}. It is ${portfolioData.summary} ${portfolioData.copyright}.`,
      null,
      null
    );
  }

  // ── 2. ABOUT/PROFILE INTENTS ──
  {
    const score = getMatchRatio(aboutData.keywords, aboutData.tags);
    updateBest(
      'about',
      score,
      () => `${aboutData.bio} My design philosophy is: ${aboutData.philosophy} I specialize in: ${aboutData.focus.join(', ')}.`,
      null,
      null
    );
  }

  // ── 3. PROJECTS INTENTS (General vs Specific) ──
  {
    // A. General projects match
    const generalKeywords = ['project', 'projects', 'work', 'works', 'portfolio', 'case studies', 'case study'];
    const isGeneralQuery = generalKeywords.some(kw => rawQuery.includes(kw)) && 
                          !projectsData.some(p => rawQuery.includes(p.id) || rawQuery.includes(p.title.toLowerCase()));
    
    if (isGeneralQuery) {
      updateBest(
        'projects',
        0.85,
        () => `I have featured projects across Brand Identity, Wellness Mobile Apps, Modular Portfolio design templates, and Financial tracker dashboards. You can select a project grid item or say "Open project" to view the details.`,
        null,
        'scroll_projects'
      );
    } else {
      // B. Specific project match
      projectsData.forEach(p => {
        let score = 0.0;
        const pIdLower = p.id.toLowerCase();
        const pTitleLower = p.title.toLowerCase();

        if (rawQuery.includes(pIdLower) || rawQuery.includes(pTitleLower) || rawQuery.includes(pIdLower.replace('-', ''))) {
          score = 1.0;
        } else {
          score = getMatchRatio(p.keywords, p.tags);
        }

        updateBest(
          'projects',
          score,
          () => `The project "${p.title}" is a ${p.category} system. I designed and built this in ${p.year} (difficulty: ${p.difficulty}, status: ${p.status}). Technologies used include: ${p.technologies.join(', ')}. The key challenge was: ${p.challenges} and the result was: ${p.results}.`,
          {
            type: 'project',
            data: {
              id: p.id,
              name: p.title,
              category: p.category,
              summary: p.summary,
              description: p.description,
              tech: p.technologies,
              route: p.route,
              features: p.features || [],
              related: p.related || []
            }
          },
          p.action || 'open_project'
        );
      });
    }
  }

  // ── 4. SKILLS INTENTS ──
  {
    let score = 0.0;
    const skillsKeywords = ['skills', 'toolkit', 'stack', 'three.js', 'react', 'supabase', 'figma', 'webgl'];
    const hasSkillKw = skillsKeywords.some(kw => rawQuery.includes(kw));
    
    if (hasSkillKw) {
      score = 0.95;
    } else {
      score = getMatchRatio(skillsData.keywords, skillsData.tags);
    }

    updateBest(
      'skills',
      score,
      () => `${skillsData.summary} My skillset is structured in categories: ${skillsData.categories.map(c => `${c.name} (${c.techs.slice(0, 3).join(', ')}...)`).join('; ')}. My top competencies are: ${skillsData.rawList.map(r => r.name).join(', ')}.`,
      {
        type: 'skills',
        data: {
          categories: skillsData.categories,
          rawList: skillsData.rawList
        }
      },
      'highlight_skills'
    );
  }

  // ── 5. EXPERIENCE INTENTS ──
  {
    const score = getMatchRatio(experienceData.flatMap(e => e.keywords || []), experienceData.flatMap(e => e.tags || []));
    updateBest(
      'experience',
      score,
      () => `My professional experience chronology consists of: ${experienceData.map(e => `${e.role} at ${e.company} (${e.year} - status: ${e.status}, difficulty level: ${e.difficulty})`).join(' | ')}.`,
      {
        type: 'experience',
        data: experienceData
      },
      null
    );
  }

  // ── 6. CONTACT INTENTS ──
  {
    const score = getMatchRatio(contactData.keywords, contactData.tags);
    updateBest(
      'contact',
      score,
      () => `${contactData.detailedDescription} I am based in ${contactData.location} and my current status is: ${contactData.availability}.`,
      {
        type: 'contact',
        data: contactData
      },
      'scroll_contact'
    );
  }

  // If the best confidence is too low, fall back
  if (bestMatch.confidence < 0.25) {
    return { intent: 'fallback', text: null, preview: null, confidence: 0.0, action: null };
  }

  return bestMatch;
}

export function useNovaKnowledge() {
  const queryKnowledge = useCallback((text = '') => {
    return queryKnowledgeEngine(text);
  }, []);

  return { queryKnowledge };
}
