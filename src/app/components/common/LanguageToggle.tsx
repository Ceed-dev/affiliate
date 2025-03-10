import Image from "next/image";

export const LanguageToggle = ({ language, setLanguage }: { language: "en" | "jp"; setLanguage: (lang: "en" | "jp") => void }) => {
  return (
    <div className="text-white py-1 relative bg-[#8E8E8E] border-2 border-[#A5E100] rounded-full flex items-center gap-4 w-32">
      {/* Sliding background for selected option */}
      <div
        className={`h-full absolute w-[50%] bg-[#A5E100] rounded-full transition-transform duration-300 ${
          language === "jp" ? "translate-x-full" : "translate-x-0"
        }`}
      />

      {/* English Button */}
      <button
        className={`relative flex items-center gap-1 z-10 pl-1 ${language === "en" && "text-black"}`}
        onClick={() => setLanguage("en")}
      >
        <Image src="/flags/uk.png" alt="English" width={24} height={24} />
        <span>EN</span>
      </button>

      {/* Japanese Button */}
      <button
        className={`relative flex items-center gap-1 z-10 ${language === "jp" && "text-black"}`}
        onClick={() => setLanguage("jp")}
      >
        <Image src="/flags/jp.png" alt="Japanese" width={24} height={24} />
        <span>JP</span>
      </button>
    </div>
  );
};