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
    return "Shadab is an AI Developer & Designer based in Ahmedabad, India, and a Computer Science student at GTU. Ask about his projects, skills, or experience and NOVA can help.";
  }

  if (text.includes('project') || text.includes('portfolio') || text.includes('best work')) {
    return "Shadab's flagship projects include NOVA (the living AI operating environment powering this site), FORGE (a local-first AI software engineering platform), Petal n Pins (full-stack hair accessories e-commerce live at petalnpins.com), and the NOVA Desktop Assistant (an earlier Python automation tool).";
  }

  if (text.includes('skill') || text.includes('tech') || text.includes('stack') || text.includes('react') || text.includes('python')) {
    return "Shadab builds with React, Three.js, React Three Fiber, WebGL shaders, Python, Node.js, TypeScript, Tailwind, Hono, tRPC, MongoDB, and Supabase. He blends intelligent agent pipelines with responsive 3D interfaces.";
  }

  if (text.includes('contact') || text.includes('email') || text.includes('hire') || text.includes('available')) {
    return "To collaborate or get in touch with Shadab, please submit the project inquiry form on this page with your details. Public direct emails and social links are kept private.";
  }

  if (text.includes('experience') || text.includes('background') || text.includes('career') || text.includes('education') || text.includes('college')) {
    return "Shadab is studying Computer Science at Gujarat Technological University (GTU, expected graduation May 2028). He currently serves as Student Coordinator at Tech Smart / American Education International, where he previously graduated Rank 1 in his High School Dual Diploma program.";
  }

  if (text.includes('who is shadab') || text.includes('about shadab') || text.includes('tell me about shadab')) {
    return "Shadab Haradwala is an AI Developer & Designer based in Ahmedabad, India, and a CS student at GTU (class of 2028). He is an independent builder creating FORGE (local-first AI software engineering) and this NOVA portfolio system.";
  }

  return "Shadab is an AI Developer & Designer based in Ahmedabad, India. NOVA's live AI connection is offline right now, but you can still ask about his projects (NOVA, FORGE, Petal n Pins), skills, or submit an inquiry through the form below.";
}
