function normalize(text) {
  return (text || '').toLowerCase();
}

function latestUserText(messages = []) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === 'user') return messages[i].content || '';
  }
  return '';
}

export function getNovaFallbackReply(input) {
  const userText = Array.isArray(input) ? latestUserText(input) : input;
  const text = normalize(userText);

  if (!text) {
    return "Shadab is an AI Developer & Designer based in Ahmedabad, open for freelance work globally. Ask about his projects, skills, pricing, or availability and NOVA can help.";
  }

  if (text.includes('project') || text.includes('portfolio') || text.includes('best work')) {
    return "Shadab's standout projects include NOVA, the AI assistant powering this portfolio, Bloom Wellness App with a 4.9-star launch, Verdant Studio Rebrand with 2x engagement, and Folio Portfolio System used by 200+ designers. Nōva Luxury E-commerce is another strong one, delivering a full brand system and a 3x conversion lift.";
  }

  if (text.includes('skill') || text.includes('tech') || text.includes('stack') || text.includes('react') || text.includes('python')) {
    return "Shadab works across React, Three.js, Python, Node.js, LangChain, TensorFlow, Figma, Webflow, and full UI/UX systems. He blends product design with AI integration, which is what makes his work feel both polished and deeply functional.";
  }

  if (text.includes('price') || text.includes('pricing') || text.includes('cost') || text.includes('rate') || text.includes('budget')) {
    return "Shadab's brand projects start from $3,000, product design from $5,000+, and AI integration or development from about $4,000. Most timelines land between 2 and 8 weeks depending on scope.";
  }

  if (text.includes('contact') || text.includes('email') || text.includes('hire') || text.includes('available')) {
    return "Shadab is open for new freelance projects and can start immediately. The best way to reach him is hello@shadab.design.";
  }

  if (text.includes('experience') || text.includes('background') || text.includes('career') || text.includes('worked')) {
    return "Shadab has 6+ years of experience across AI, design, and digital products. He has worked as a freelance Senior Product Designer, at Razorpay, and at Lollypop Design Studio after studying Visual Communication at NID Ahmedabad.";
  }

  if (text.includes('who is shadab') || text.includes('about shadab') || text.includes('tell me about shadab')) {
    return "Shadab is an AI Developer & Designer based in Ahmedabad, India, with 6+ years of experience and 40+ projects delivered across 8 countries. He focuses on intelligent systems, strong visual design, and polished product experiences.";
  }

  return "Shadab is an AI Developer & Designer based in Ahmedabad, currently open for freelance work globally. NOVA's live AI connection is offline right now, but you can still ask about his projects, skills, pricing, experience, or contact details.";
}
