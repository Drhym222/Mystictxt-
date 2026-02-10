import { storage } from "./storage";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function seedDatabase() {
  const existingAdmin = await storage.getUserByEmail("admin@mystictxt.com");
  if (existingAdmin) return;

  await storage.createUser({
    email: "admin@mystictxt.com",
    passwordHash: hashPassword("admin123"),
    role: "admin",
  });

  const existingServices = await storage.getServices();
  if (existingServices.length === 0) {
    await storage.createService({
      slug: "psychic-reading",
      title: "Psychic Reading",
      shortDesc: "A deep, intuitive reading that reveals hidden truths about your life, relationships, and future path.",
      longDesc: "Our signature Psychic Reading provides a comprehensive look into the energies surrounding your life. Using a combination of clairvoyance, clairsentience, and intuitive guidance, our gifted psychics will tune into your energy field to uncover hidden patterns, upcoming opportunities, and potential challenges. Each reading is personalized to address your specific questions and concerns, providing you with actionable insights and spiritual guidance. Whether you're seeking clarity about a relationship, career direction, or personal growth, this reading will illuminate the path ahead with remarkable accuracy and compassion.",
      priceCents: 2999,
      currency: "USD",
      deliveryHours: 24,
      imageUrl: "/images/crystal-ball.png",
      includes: [
        "Detailed written reading (500+ words)",
        "Energy assessment and aura insights",
        "Past-present-future analysis",
        "Specific answers to up to 3 questions",
        "Follow-up clarification via email",
      ],
      requirements: [
        "Your full name",
        "Date of birth (optional but recommended)",
        "Up to 3 specific questions",
        "Brief background on your situation",
      ],
      active: true,
    });

    await storage.createService({
      slug: "telepathy-mind-reading",
      title: "Telepathy Mind Reading",
      shortDesc: "Experience the extraordinary power of telepathic connection. Discover unspoken thoughts and hidden intentions.",
      longDesc: "Our Telepathy Mind Reading service goes beyond traditional psychic readings by establishing a direct telepathic link between our practitioner and the subject of your inquiry. This advanced technique allows us to perceive thoughts, emotions, and intentions that are normally hidden from conscious awareness. Whether you want to understand what someone truly thinks about you, uncover hidden motivations in a business relationship, or gain insight into a loved one's unspoken feelings, our telepathic practitioners can bridge the gap between minds. Each session is conducted with the highest ethical standards and delivered with detailed, actionable insights.",
      priceCents: 4999,
      currency: "USD",
      deliveryHours: 48,
      imageUrl: "/images/third-eye.png",
      includes: [
        "Deep telepathic connection session",
        "Comprehensive thought analysis report",
        "Emotional frequency mapping",
        "Hidden intention decoding",
        "Relationship dynamic assessment",
        "Follow-up session (15 min)",
      ],
      requirements: [
        "Your full name and photo (optional)",
        "Name of the person you want to connect with",
        "Relationship to that person",
        "Specific areas of inquiry",
      ],
      active: true,
    });

    await storage.createService({
      slug: "telepathy-mind-implants",
      title: "Telepathy Mind Implants",
      shortDesc: "Plant positive thoughts, suggestions, and affirmations into the subconscious through advanced telepathic techniques.",
      longDesc: "Our Telepathy Mind Implant service utilizes advanced metaphysical techniques to embed positive thoughts, suggestions, and affirmations into the subconscious mind. This powerful service can help reinforce self-confidence, attract positive outcomes, strengthen relationships, and align your mental energy with your deepest desires. Our practitioners use a combination of remote viewing, energy channeling, and telepathic projection to create lasting impressions in the mental field. Each implant is carefully crafted to align with your personal goals and delivered with a comprehensive report detailing the work performed and expected outcomes. This service is designed to complement your own personal growth journey.",
      priceCents: 7999,
      currency: "USD",
      deliveryHours: 72,
      imageUrl: "/images/mind-implant.png",
      includes: [
        "Customized mind implant session",
        "3 targeted thought implantations",
        "Energy alignment and calibration",
        "Detailed session report",
        "30-day effectiveness monitoring",
        "Two follow-up adjustment sessions",
      ],
      requirements: [
        "Your full name",
        "Date of birth",
        "Detailed description of desired outcomes",
        "Current mental/emotional state assessment",
        "Photo (optional, enhances connection)",
      ],
      active: true,
    });
  }

  const existingTestimonials = await storage.getTestimonials();
  if (existingTestimonials.length === 0) {
    await storage.createTestimonial({
      name: "Sarah M.",
      text: "The psychic reading was incredibly accurate. Everything mentioned about my relationship came true within weeks. I'm amazed at the level of detail and care put into my reading.",
      rating: 5,
      active: true,
    });

    await storage.createTestimonial({
      name: "David R.",
      text: "I was skeptical at first, but the telepathy mind reading revealed things about my business partner that I later confirmed were true. This service is truly remarkable.",
      rating: 5,
      active: true,
    });

    await storage.createTestimonial({
      name: "Lisa K.",
      text: "The mind implant session helped me overcome my fear of public speaking. Within a month, I gave my first presentation with complete confidence. Life-changing experience.",
      rating: 5,
      active: true,
    });
  }

  const existingFaqs = await storage.getFaqs();
  if (existingFaqs.length === 0) {
    const faqs = [
      { question: "How do psychic readings work?", answer: "Our psychic readings are conducted remotely by gifted practitioners who tune into your energy field using the information you provide. The reading is delivered as a detailed written report to your email within the specified delivery time.", sortOrder: 1 },
      { question: "How long does delivery take?", answer: "Delivery times vary by service. Psychic Readings are delivered within 24 hours, Telepathy Mind Readings within 48 hours, and Mind Implants within 72 hours. Rush delivery is available for an additional fee.", sortOrder: 2 },
      { question: "What payment methods do you accept?", answer: "We accept all major credit and debit cards, Apple Pay, Google Pay (via Stripe), and PayPal. All payments are processed securely through encrypted channels.", sortOrder: 3 },
      { question: "Is my information kept confidential?", answer: "Absolutely. Your personal information, questions, and reading details are treated with the strictest confidentiality. We never share your data with third parties, and all readings are conducted in private.", sortOrder: 4 },
      { question: "Can I get a refund?", answer: "We offer a satisfaction guarantee. If you're not satisfied with your reading, please contact us within 7 days of delivery. Refunds are evaluated on a case-by-case basis to ensure fairness.", sortOrder: 5 },
      { question: "Do I need to provide my date of birth?", answer: "Date of birth is optional but recommended. It helps our practitioners establish a stronger energetic connection and can improve the accuracy of your reading.", sortOrder: 6 },
      { question: "How will I receive my reading?", answer: "All readings are delivered digitally via our platform. After purchase, you'll receive a link to submit your questions, and the completed reading will be sent to your email.", sortOrder: 7 },
    ];

    for (const faq of faqs) {
      await storage.createFaq({ ...faq, active: true });
    }
  }
}
