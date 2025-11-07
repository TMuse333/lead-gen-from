import { FlowConfig } from "@/lib/config/flowConfig";
import { FlowResultConfig } from "@/types/flow.types";


interface HeroBannerProps {
  flow: FlowConfig;
}

export function HeroBanner({ flow }: HeroBannerProps) {
  return (
    <div className="hero-banner bg-primary text-white p-6 rounded-lg">
      <div className="flex items-center gap-4">
        <span className={`icon-${flow.iconName}`} />
        <h1>{flow.heroTitle}</h1>
      </div>
      <p>{flow.heroSubtitle}</p>
      <button className="cta-btn">{flow.cta}</button>
    </div>
  );
}
