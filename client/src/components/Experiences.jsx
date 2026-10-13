import { motion } from "framer-motion";
import {
  Sparkles,
  UtensilsCrossed,
  Waves,
  CarFront,
  ArrowUpRight,
  Heart,
} from "lucide-react";

import spaWellness from "../assets/spa-wellness.jpg";
import fineDining from "../assets/fine-dining.jpg";
import privatePool from "../assets/private-pool.jpg";
import privateTransfer from "../assets/private-transfer.jpg";

import "./Experiences.css";

const experiences = [
  {
    id: "01",
    icon: Sparkles,
    title: "Spa & Wellness",
    subtitle: "RESTORE",
    description:
      "Slow down with calming treatments, restorative rituals and peaceful spaces designed around your wellbeing.",
    image: spaWellness,
  },
  {
    id: "02",
    icon: UtensilsCrossed,
    title: "Fine Dining",
    subtitle: "TASTE",
    description:
      "Thoughtfully prepared cuisine, intimate settings and memorable flavours from morning until late evening.",
    image: fineDining,
  },
  {
    id: "03",
    icon: Waves,
    title: "Private Pool",
    subtitle: "ESCAPE",
    description:
      "Unwind beside tranquil waters with private spaces created for quiet afternoons and unforgettable sunsets.",
    image: privatePool,
  },
  {
    id: "04",
    icon: CarFront,
    title: "Private Transfer",
    subtitle: "ARRIVE",
    description:
      "Enjoy effortless arrivals and departures with comfortable private transportation arranged around your stay.",
    image: privateTransfer,
  },
];

function Experiences() {
  return (
    <section className="experiences-section" id="services">
      <div className="experience-glow"></div>

      <div className="experiences-container">
        <motion.div
          className="experiences-heading"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="experiences-eyebrow">
            <Heart size={14} />
            <span>BEYOND YOUR ROOM</span>
          </div>

          <div className="experiences-title-row">
            <h2>
              Moments designed
              <span> around you.</span>
            </h2>

            <p>
              LuxuryStay is more than a place to sleep. Discover thoughtful
              experiences created to make every part of your stay feel
              effortless and memorable.
            </p>
          </div>
        </motion.div>

        <div className="experiences-grid">
          {experiences.map((experience, index) => {
            const Icon = experience.icon;

            return (
              <motion.article
                className="experience-card"
                key={experience.id}
                initial={{ opacity: 0, y: 45 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
              >
                <div className="experience-image">
                  <img
                    src={experience.image}
                    alt={experience.title}
                  />

                  <div className="experience-image-overlay"></div>

                  <span className="experience-number">
                    {experience.id}
                  </span>

                  <div className="experience-icon">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                </div>

                <div className="experience-content">
                  <span className="experience-subtitle">
                    {experience.subtitle}
                  </span>

                  <h3>{experience.title}</h3>

                  <p>{experience.description}</p>

                  <button className="experience-link">
                    Discover Experience
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Experiences;