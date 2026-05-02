import Image from "next/image";
import Link from "next/link";
import styles from "./HeroBanner.module.css";
import type { HeroConfig } from "@/lib/site-config";
import { DEFAULT_SITE_CONFIG } from "@/lib/site-config";

export default function HeroBanner({ config = DEFAULT_SITE_CONFIG.hero }: { config?: HeroConfig }) {
  return (
    <section className={styles.section} aria-labelledby="hero-title">
      <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.left}>
          <p className={styles.eyebrow}>{config.eyebrow}</p>

          <h1 id="hero-title" className={styles.title}>
            {config.title}
            <br />
            <span className={styles.titleAccent}>{config.titleAccent}</span>
          </h1>

          <span className={styles.divider} aria-hidden="true" />

          <p className={styles.lead}>{config.lead}</p>

          <Link href={config.ctaHref} className={styles.cta}>
            {config.ctaText}
            <svg
              className={styles.ctaArrow}
              width="18"
              height="12"
              viewBox="0 0 18 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 6h15m0 0L11 1m5 5l-5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <div className={styles.right}>
              <Image
                src={config.image}
                alt={config.imageAlt}
                width={1001}
                height={588}
                priority
                className={styles.model}
              />
        </div>
      </div>

      </div>
    </section>
  );
}
