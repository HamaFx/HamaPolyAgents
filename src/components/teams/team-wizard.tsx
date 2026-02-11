"use client";

import { useMemo, useState } from "react";
import { TeamForm } from "@/components/teams/team-form";

const steps = ["Identity", "Strategy", "Risk", "Deploy"];

export function TeamWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep]);

  return (
    <section className="space-y-3">
      <article className="surface p-4">
        <div className="mb-3 flex items-center justify-between text-xs text-textSecondary">
          <span>Guided Builder</span>
          <span>
            Step {currentStep + 1} / {steps.length}
          </span>
        </div>
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-bgInput">
          <div className="h-full rounded-full bg-gradient-to-r from-accentCyan to-accentBlue" style={{ width: `${progress}%` }} />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {steps.map((step, index) => (
            <button
              key={step}
              onClick={() => setCurrentStep(index)}
              className={`rounded-lg border px-2 py-1 text-xs ${
                index === currentStep
                  ? "border-accentBlue/40 bg-accentBlue/15 text-textPrimary"
                  : "border-border text-textSecondary"
              }`}
            >
              {step}
            </button>
          ))}
        </div>
      </article>

      <TeamForm />
    </section>
  );
}
