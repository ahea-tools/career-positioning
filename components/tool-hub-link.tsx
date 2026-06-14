import { AHEA_TOOLS_HUB_URL } from "@/lib/constants";

export function ToolHubLink() {
  return (
    <nav aria-label="AHEA tool navigation" className="pt-2 text-sm">
      <a
        href={AHEA_TOOLS_HUB_URL}
        className="font-medium text-[#495A58] underline underline-offset-4 transition-colors hover:text-[#303636] focus:outline-none focus:ring-2 focus:ring-[#D4967D] focus:ring-offset-2 focus:ring-offset-[#E5E3DC]"
      >
        ← Return to AHEA Tools
      </a>
    </nav>
  );
}
