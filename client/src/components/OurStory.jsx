import { motion } from "framer-motion";
import {
  Sparkles,
  Heart,
  Clock3,
  BedDouble,
  ArrowUpRight,
} from "lucide-react";

import "./OurStory.css";

function OurStory() {
  return (
    <section className="story-section" id="about">
      <div className="story-decoration story-decoration-one"></div>
      <div className="story-decoration story-decoration-two"></div>

      <div className="story-container">

        <motion.div
          className="story-heading"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75 }}
        >
          <div className="story-eyebrow">
            <Sparkles size={14} />
            <span>OUR STORY</span>
          </div>

          <h2>
            Luxury that feels
            <span> beautifully personal.</span>
          </h2>

          <div className="story-signature">
            <div className="signature-line"></div>
            <span>THE LUXURYSTAY PHILOSOPHY</span>
          </div>
        </motion.div>
        <div className="story-content">
          <motion.p
            className="story-lead"
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            We created LuxuryStay with one simple belief:
            <strong> true luxury should never feel distant.</strong>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            It should feel warm, thoughtful and personal from the moment you
            arrive. A beautifully prepared room, a quiet morning by the pool,
            dinner remembered long after the final course, and a team that
            understands when to be present and when to simply let you enjoy
            the moment.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Every space at LuxuryStay has been designed around the way our
            guests want to feel. Calm when they need to slow down. Inspired
            when they want to explore. Comfortable enough to feel at home,
            yet special enough to remind them that they are somewhere
            extraordinary.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            From our private retreats and signature suites to dining,
            wellness and personalised guest services, every detail serves a
            purpose. We believe memorable hospitality is not created through
            extravagance alone, but through the small moments of care that
            transform an ordinary journey into a story worth remembering.
          </motion.p>

          <motion.blockquote
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            “You arrive as our guest. You leave with a story.”
          </motion.blockquote>
        </div>

        {/* STATS */}
        <motion.div
          className="story-stats"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="story-stat">
            <Heart size={20} />
            <strong>2K+</strong>
            <span>HAPPY GUESTS</span>
          </div>

          <div className="story-stat">
            <Clock3 size={20} />
            <strong>24/7</strong>
            <span>GUEST SERVICE</span>
          </div>

          <div className="story-stat">
            <BedDouble size={20} />
            <strong>03</strong>
            <span>SIGNATURE STAYS</span>
          </div>

          <div className="story-stat story-stat-final">
            <span>OUR PROMISE</span>
            <strong>Every stay, remembered.</strong>
            <ArrowUpRight size={20} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default OurStory;