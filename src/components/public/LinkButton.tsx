import { linkHref } from "@/lib/link-href";
import type { LinkTypeValue } from "@/lib/validation";

const TYPE_STYLES: Record<LinkTypeValue, string> = {
  phone: "bg-green-600 hover:bg-green-700",
  telegram: "bg-sky-500 hover:bg-sky-600",
  instagram: "bg-fuchsia-600 hover:bg-fuchsia-700",
  maps: "bg-red-600 hover:bg-red-700",
  custom: "bg-slate-700 hover:bg-slate-800",
};

interface LinkButtonProps {
  type: LinkTypeValue;
  label: string;
  value: string;
}

export function LinkButton({ type, label, value }: LinkButtonProps) {
  const href = linkHref(type, value);
  const isExternal = href.startsWith("http");

  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={`block w-full rounded-lg px-4 py-3 text-center font-medium text-white transition-colors ${TYPE_STYLES[type]}`}
    >
      {label}
    </a>
  );
}
