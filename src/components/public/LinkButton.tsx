import { linkHref } from "@/lib/link-href";
import { LINK_TYPE_META } from "@/lib/link-type-meta";
import type { LinkTypeValue } from "@/lib/validation";

const TYPE_COLORS: Record<LinkTypeValue, { bg: string; hoverBg: string }> = {
  phone: { bg: "bg-green-600", hoverBg: "hover:bg-green-700" },
  telegram: { bg: "bg-sky-500", hoverBg: "hover:bg-sky-600" },
  instagram: { bg: "bg-fuchsia-600", hoverBg: "hover:bg-fuchsia-700" },
  maps: { bg: "bg-red-600", hoverBg: "hover:bg-red-700" },
  custom: { bg: "bg-slate-700", hoverBg: "hover:bg-slate-800" },
};

interface LinkButtonProps {
  type: LinkTypeValue;
  label: string;
  value: string;
}

export function LinkButton({ type, label, value }: LinkButtonProps) {
  const href = linkHref(type, value);
  const isExternal = href.startsWith("http");
  const { bg, hoverBg } = TYPE_COLORS[type];
  const Icon = LINK_TYPE_META[type].icon;

  return (
    <div className="relative">
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={`block w-full rounded-lg px-4 py-3 text-center font-medium text-white transition-colors ${bg} ${hoverBg}`}
      >
        {label}
      </a>
      <span
        className={`absolute left-0 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-md ring-4 ring-slate-900 ${bg}`}
      >
        <Icon className="size-4" />
      </span>
    </div>
  );
}
