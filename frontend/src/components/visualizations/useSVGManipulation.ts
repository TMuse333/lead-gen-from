// hooks/useSVGManipulation.ts
// Custom hook for manipulating SVG elements programmatically

import { useEffect, useRef } from 'react';

export interface StepConfig {
  id: string;
  highlightColor?: string;
  defaultColor?: string;
  showConnector?: boolean;
}

export interface SVGManipulationOptions {
  activeStep: number;
  totalSteps: number;
  stepConfigs?: StepConfig[];
  animationDuration?: number;
  highlightColor?: string;
  defaultColor?: string;
  connectorColor?: string;
}

export function useSVGManipulation(options: SVGManipulationOptions) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const {
    activeStep,
    totalSteps,
    stepConfigs = [],
    animationDuration = 500,
    highlightColor = '#3b82f6',
    defaultColor = '#64748b',
    connectorColor = '#64748b',
  } = options;

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;

    // Update all steps
    for (let i = 1; i <= totalSteps; i++) {
      const stepGroup = svg.querySelector(`#step-${i}`) as SVGGElement;
      const stepConfig = stepConfigs.find(c => c.id === `step-${i}`);

      if (stepGroup) {
        const isActive = i === activeStep;
        const isCompleted = i < activeStep;
        const isPending = i > activeStep;

        // Update opacity
        stepGroup.style.opacity = isPending ? '0.3' : '1';
        stepGroup.style.transition = `opacity ${animationDuration}ms ease-in-out`;

        // Update circle color
        const circle = stepGroup.querySelector(`#step-${i}-circle`) as SVGCircleElement;
        if (circle) {
          if (isActive) {
            circle.setAttribute('fill', stepConfig?.highlightColor || highlightColor);
          } else if (isCompleted) {
            circle.setAttribute('fill', stepConfig?.defaultColor || '#10b981'); // green for completed
          } else {
            circle.setAttribute('fill', stepConfig?.defaultColor || defaultColor);
          }
          circle.style.transition = `fill ${animationDuration}ms ease-in-out`;
        }

        // Update text visibility
        const text = stepGroup.querySelector(`#step-${i}-text`) as SVGTextElement;
        if (text) {
          text.style.opacity = isPending ? '0.5' : '1';
        }

        // Update label
        const label = stepGroup.querySelector(`#step-${i}-label`) as SVGTextElement;
        if (label) {
          label.style.fontWeight = isActive ? 'bold' : 'normal';
          label.style.opacity = isPending ? '0.5' : '1';
        }
      }

      // Update connectors
      if (i < totalSteps) {
        const connector = svg.querySelector(`#connector-${i}-${i + 1}`) as SVGPathElement;
        if (connector) {
          const isActive = i < activeStep;
          connector.style.opacity = isActive ? '1' : '0.3';
          connector.style.stroke = isActive ? highlightColor : connectorColor;
          connector.style.strokeWidth = isActive ? '3' : '2';
          connector.style.transition = `all ${animationDuration}ms ease-in-out`;
        }
      }
    }
  }, [activeStep, totalSteps, stepConfigs, highlightColor, defaultColor, connectorColor, animationDuration]);

  return svgRef;
}

