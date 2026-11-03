import Image from "next/image";
import styles from "./AuthLayout.module.css";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <main className={styles.layout}>
      <section className={styles.videoPanel} aria-hidden="true">
        <video
          className={styles.video}
          autoPlay
          loop
          muted
          playsInline
          src="/assets/videos/braco-robotico-vermelho.webm"
          aria-hidden="true"
        />
      </section>

      <section className={styles.contentPanel}>
        <div className={styles.content}>
          <Image
            className={styles.logo}
            src="/assets/img/logo-site/logo_horizontal.svg"
            alt="Tenken"
            width={240}
            height={80}
            priority
          />
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
