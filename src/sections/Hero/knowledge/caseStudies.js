export const caseStudies = [
  {
    projectId: 'petal-npins',
    title: 'Payment Verification Architecture',
    challenge: 'Preventing double-verification leaks in high-volume transaction environments.',
    solution: 'Designed and verified a dual-pair Razorpay signature webhook parser that checks database checkout statuses prior to processing stripe webhook hooks.'
  },
  {
    projectId: 'nova-assistant',
    title: 'Hold-To-Talk Voice Synapse',
    challenge: 'Synchronizing SpeechRecognition threads with standard web synthesis utterances without double-trigger conflicts.',
    solution: 'Engineered a unified ref state controller that acts as a gatekeeper, pausing browser audio capture during speech synthesis.'
  }
];
