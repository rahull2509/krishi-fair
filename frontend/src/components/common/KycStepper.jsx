import { Check } from "lucide-react";

const STEPS = [
  { key: "NOT_SUBMITTED", label: "Submit details" },
  { key: "PENDING", label: "Under review" },
  { key: "VERIFIED", label: "Verified" },
];

export default function KycStepper({ status = "NOT_SUBMITTED" }) {
  const idx = Math.max(
    0,
    STEPS.findIndex((s) => s.key === status)
  );
  const rejected = status === "REJECTED";

  return (
    <div className="w-full">
      <div className="flex items-center">
        {STEPS.map((s, i) => {
          const done = i < idx || (i === idx && status === "VERIFIED");
          const active = i === idx && !done;
          return (
            <div key={s.key} className="flex-1 flex items-center last:flex-none">
              <div className="flex flex-col items-center text-center w-full">
                <div
                  className={`w-9 h-9 rounded-full grid place-items-center border-2 transition ${
                    done
                      ? "bg-secondary text-secondary-foreground border-secondary"
                      : active
                      ? "bg-primary text-primary-foreground border-primary pulse-ring"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`mt-2 text-xs ${done || active ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${i < idx ? "bg-secondary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>
      {rejected && (
        <p className="mt-3 text-sm text-destructive text-center">KYC rejected — please resubmit with valid documents.</p>
      )}
    </div>
  );
}
