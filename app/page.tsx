import Button from "@/components/Button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background transition-colors duration-500">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Brand Identity Established&nbsp;
          <code className="font-bold text-brand-primary">Sky Theme</code>
        </p>
        <div className="fixed right-8 top-8 lg:static lg:p-0">
          <ThemeToggle />
        </div>
      </div>

      <div className="relative flex flex-col items-center place-items-center mt-20">
        <h1 className="text-6xl font-extrabold tracking-tight mb-4 text-foreground sm:text-7xl">
          Premium <span className="text-brand-primary">Design</span>
        </h1>
        <p className="text-xl text-foreground/60 mb-12 max-w-2xl text-center leading-relaxed">
          Clean, minimal, and premium components built with a subtle sky brand theme.
          Now with full dark mode support powered by <span className="text-foreground font-semibold underline decoration-brand-primary">next-themes</span>.
        </p>

        <div className="flex gap-6 items-center">
          <Button variant="primary" size="lg">
            Get Started
          </Button>
          <Button variant="secondary" size="lg">
            Learn More
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-4xl text-center md:text-left">
        <div className="p-8 rounded-2xl bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/10 transition-all hover:border-brand-primary/30">
          <h3 className="text-lg font-semibold text-brand-primary mb-2">Modern Palette</h3>
          <p className="text-sm text-foreground/70">Custom tailored sky blue tones for a professional interface.</p>
        </div>
        <div className="p-8 rounded-2xl bg-brand-secondary/50 dark:bg-brand-secondary/30 border border-brand-secondary-hover/50 dark:border-brand-secondary-hover/20 transition-all hover:border-brand-primary/30">
          <h3 className="text-lg font-semibold text-foreground mb-2">Dark Mode</h3>
          <p className="text-sm text-foreground/70">Seamless switching between light and dark themes out of the box.</p>
        </div>
        <div className="p-8 rounded-2xl bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/10 transition-all hover:border-brand-primary/30">
          <h3 className="text-lg font-semibold text-brand-primary mb-2">Inter Typeface</h3>
          <p className="text-sm text-foreground/70">Optimized typography for superior legibility and craft.</p>
        </div>
      </div>
    </main>
  );
}
