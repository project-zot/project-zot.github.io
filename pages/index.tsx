import Section from "@/components/Section";

import styles from "@/styles/Layout.module.scss";
import HeroSection from "@/components/HeroSection";
import ProductSection from "@/components/ProductSection";
import AboutSection from "@/components/AboutSection";

export default function App() {
  return (
    <>
      <div className={styles.container}>
        <main className={styles.main}>
          <Section key={0} index={0} color={"secondary"}>
            <HeroSection />
          </Section>
          <Section key={1} index={1} color={"white"}>
            <ProductSection />
          </Section>
          <Section key={2} index={2} color={"background"}>
            <AboutSection />
          </Section>
        </main>
      </div>
    </>
  );
}
