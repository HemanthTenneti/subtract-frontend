"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { TranscribeIcon, SummarizeIcon } from "./components/icons.js";
gsap.registerPlugin(SplitText);

export default function Home() {
  const inputRef = useRef(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    summarize: true,
    transcribe: false,
  });

  const toggleOption = option => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    const url = inputRef.current.value;
    if (!url) {
      alert("Please enter a URL");
      return;
    }

    setLoading(true);
    setSummary("Generating summary...");

    try {
      let data = await fetch("https://subtractapi.10eti.me/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_BACKEND_API_KEY,
        },
        body: JSON.stringify({ url }),
      });
      let response = await data.json();
      if (response) setSummary(response);
      else
        setSummary({ summary: "", transcription: "", error: response.error });
    } catch (err) {
      setSummary({ summary: "", transcription: "", error: err.message });
    } finally {
      setLoading(false);
    }
  }

  useGSAP(() => {
    let split = new SplitText(".summary");
    gsap.from(split.words, {
      duration: 0.5,
      y: 10,
      opacity: 0,
      stagger: 0.05,
    });
  }, [summary]);

  return (
    <div className="bg-neutral-950 text-white h-screen w-screen font-mono p-5 flex flex-col items-center justify-center">
      <div className="flex items-center justify-center font-bold text-2xl gap-2 mb-3">
        <Image src="/subtract.svg" alt="Subtract Logo" width={32} height={32} />
        Subtract
      </div>
      <div className="bg-neutral-900 rounded-lg mb-3 flex gap-2 p-2 px-3">
        <Image src="/link.svg" alt="Link Icon" width={24} height={24} />
        <input
          className="rounded-lg w-96 border-none focus:outline-none bg-neutral-900 text-white"
          placeholder="Enter URL"
          ref={inputRef}
        />
      </div>
      <button
        className="bg-white hover:bg-neutral-200 transition duration-200 w-[440px] text-neutral-900 p-2 rounded-lg cursor-pointer"
        onClick={onSubmit}>
        {selectedOptions.summarize
          ? selectedOptions.transcribe
            ? "Generate Summary & Transcription"
            : "Generate Summary"
          : selectedOptions.transcribe
          ? "Generate Transcription"
          : "Generate Summary"}
      </button>

      {loading && (
        <div className="w-[440px] mt-4">
          <div className="text-sm text-neutral-400 mb-1">Generating...</div>
          <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full animate-pulse w-full" />
          </div>
        </div>
      )}

      <div className="my-3 w-[440px] flex items-center justify-center gap-0">
        <button
          onClick={() => toggleOption("summarize")}
          className={`flex p-5 py-3 items-center gap-2 transition duration-200 rounded-l-lg border border-neutral-800 cursor-pointer ${
            selectedOptions.summarize ? "bg-white text-black" : "bg-neutral-900"
          }`}>
          <SummarizeIcon isActive={selectedOptions.summarize} /> Summarize
        </button>
        <button
          onClick={() => toggleOption("transcribe")}
          className={`flex p-5 py-3 items-center gap-2 transition duration-200 rounded-r-lg border border-neutral-800 cursor-pointer ${
            selectedOptions.transcribe
              ? "bg-white text-black"
              : "bg-neutral-900"
          }`}>
          <TranscribeIcon isActive={selectedOptions.transcribe} /> Transcribe
        </button>
      </div>

      {summary && (
        <div className="w-[880px] p-5 rounded-lg mt-5 bg-neutral-900 h-96 overflow-y-auto">
          <div className="flex gap-2 font-bold mb-1">
            <Image src="/ai.svg" alt="AI Icon" width={18} height={18} /> Result
          </div>
          <p className="text-neutral-400 text-sm mb-2">
            Powered by{" "}
            <a
              href="https://gemini.google.com/app"
              target="_blank"
              className="text-blue-200 hover:underline">
              Google Gemini
            </a>{" "}
            &{" "}
            <a
              href="https://www.assemblyai.com/"
              target="_blank"
              className="text-blue-200 hover:underline">
              AssemblyAI
            </a>
          </p>
          <div className="flex gap-4 h-[calc(100%-70px)]">
            {selectedOptions.summarize && selectedOptions.transcribe ? (
              <>
                <div className="w-1/2 border-r border-neutral-700 pr-4 overflow-y-auto">
                  <h2 className="font-semibold text-lg mb-2">Summary</h2>
                  <p className="summary text-sm text-neutral-300">
                    {summary.summary}
                  </p>
                </div>
                <div className="w-1/2 pl-4 overflow-y-auto">
                  <h2 className="font-semibold text-lg mb-2">Transcription</h2>
                  <p className="summary text-sm text-neutral-300">
                    {summary.transcription}
                  </p>
                </div>
              </>
            ) : selectedOptions.summarize ? (
              <div className="w-full overflow-y-auto">
                <h2 className="font-semibold text-lg mb-2">Summary</h2>
                <p className="summary text-sm text-neutral-300">
                  {summary.summary}
                </p>
              </div>
            ) : selectedOptions.transcribe ? (
              <div className="w-full overflow-y-auto">
                <h2 className="font-semibold text-lg mb-2">Transcription</h2>
                <p className="summary text-sm text-neutral-300">
                  {summary.transcription}
                </p>
              </div>
            ) : (
              "Please select an option above"
            )}
          </div>
        </div>
      )}
      <h1 className="text-center text-xl m-5">
        Due to a bug with yt-dlp failing to download YouTube videos
        <br />
        because of Google&apos;s TnC,
        <br />
        some YouTube videos might not generate any summary.
        <br /> If you see this message, please consider above mentioned
        <br />
        and try summarizing Instagram, Reddit, Twitter, etc. <br />
        This issue should be fixed in the near future.
      </h1>
    </div>
  );
}
