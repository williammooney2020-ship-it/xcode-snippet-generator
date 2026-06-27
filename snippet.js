"use strict";

// ── Built-in examples ────────────────────────────────────────────────────────
const EXAMPLES = [
  {
    title: "MARK Comment",
    summary: "Insert a MARK section divider",
    completion: "mark",
    platform: "All",
    language: "Swift",
    scope: "CodeBlock",
    code: "// MARK: - <#Section Name#>",
  },
  {
    title: "TODO Comment",
    summary: "Insert a TODO reminder",
    completion: "todo",
    platform: "All",
    language: "Swift",
    scope: "CodeBlock",
    code: "// TODO: <#description#>",
  },
  {
    title: "SwiftUI Preview",
    summary: "Add a #Preview block for a SwiftUI view",
    completion: "preview",
    platform: "iOS",
    language: "Swift",
    scope: "TopLevel",
    code: `#Preview {
    <#ViewName#>()
}`,
  },
  {
    title: "Async/Await Task",
    summary: "Wrap code in a Task for async context",
    completion: "task",
    platform: "All",
    language: "Swift",
    scope: "CodeBlock",
    code: `Task {
    <#await#>
}`,
  },
  {
    title: "NSManagedObject Subclass Fetch",
    summary: "Core Data fetch request for a managed object subclass",
    completion: "cdfetch",
    platform: "All",
    language: "Swift",
    scope: "CodeBlock",
    code: `let request = <#EntityName#>.fetchRequest()
request.predicate = NSPredicate(format: "<#key#> == %@", <#value#>)
request.sortDescriptors = [NSSortDescriptor(key: "<#key#>", ascending: true)]
let results = try context.fetch(request)`,
  },
  {
    title: "UserDefaults Key Enum",
    summary: "Type-safe UserDefaults key enum",
    completion: "udkeys",
    platform: "All",
    language: "Swift",
    scope: "TopLevel",
    code: `enum UDKey {
    static let <#key#> = "<#key#>"
}`,
  },
  {
    title: "Combine Sink",
    summary: "Store a Combine subscription in a cancellable set",
    completion: "sink",
    platform: "All",
    language: "Swift",
    scope: "CodeBlock",
    code: `<#publisher#>
    .receive(on: DispatchQueue.main)
    .sink { completion in
        if case .failure(let error) = completion {
            <#handle error#>
        }
    } receiveValue: { <#value#> in
        <#handle value#>
    }
    .store(in: &cancellables)`,
  },
  {
    title: "Logger Declaration",
    summary: "OSLog Logger instance",
    completion: "logger",
    platform: "All",
    language: "Swift",
    scope: "TopLevel",
    code: `import OSLog
private let logger = Logger(subsystem: Bundle.main.bundleIdentifier!, category: "<#category#>")`,
  },
];

// ── Platform / language / scope options ─────────────────────────────────────
const PLATFORMS = ["All","iOS","macOS","watchOS","tvOS","visionOS"];
const LANGUAGES = ["Swift","Objective-C","C","C++","Any"];
const SCOPES    = [
  { value: "CodeBlock",         label: "Code Block (inside a function)" },
  { value: "ClassImplementation",label: "Class Implementation (inside a class/struct)" },
  { value: "TopLevel",          label: "Top Level (file level)" },
  { value: "StringOrComment",   label: "String or Comment" },
  { value: "All",               label: "All Scopes" },
];

// ── State ────────────────────────────────────────────────────────────────────
const STATE = {
  title: "",
  summary: "",
  completion: "",
  platform: "All",
  language: "Swift",
  scope: "CodeBlock",
  code: "",
};

// ── UUID ─────────────────────────────────────────────────────────────────────
function makeUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16).toUpperCase();
  });
}

// ── XML escape ───────────────────────────────────────────────────────────────
function xmlEsc(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
          .replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}

// ── Collect ──────────────────────────────────────────────────────────────────
function el(id) { return document.getElementById(id); }

function collect() {
  STATE.title      = el("inp_title").value.trim();
  STATE.summary    = el("inp_summary").value.trim();
  STATE.completion = el("inp_completion").value.trim();
  STATE.platform   = el("inp_platform").value;
  STATE.language   = el("inp_language").value;
  STATE.scope      = el("inp_scope").value;
  STATE.code       = el("inp_code").value;
}

// ── Generate plist ────────────────────────────────────────────────────────────
function generate() {
  collect();

  // Map platform to Xcode IDECodeSnippetCompletionPlatforms value
  const PLATFORM_MAP = {
    "All": "",
    "iOS": "iphoneos",
    "macOS": "macosx",
    "watchOS": "watchos",
    "tvOS": "appletvos",
    "visionOS": "xros",
  };
  // Map language to UTI
  const LANG_MAP = {
    "Swift":         "xcode.lang.swift",
    "Objective-C":   "xcode.lang.objc",
    "C":             "xcode.lang.c",
    "C++":           "xcode.lang.cpp",
    "Any":           "",
  };

  const uuid = makeUUID();
  const platform = PLATFORM_MAP[STATE.platform] || "";
  const langUTI  = LANG_MAP[STATE.language] || "";

  let platformSection = "";
  if (platform) {
    platformSection = `
\t\t<key>IDECodeSnippetCompletionPlatforms</key>
\t\t<array>
\t\t\t<string>${xmlEsc(platform)}</string>
\t\t</array>`;
  }
  let langSection = "";
  if (langUTI) {
    langSection = `
\t\t<key>IDECodeSnippetLanguage</key>
\t\t<string>${xmlEsc(langUTI)}</string>`;
  }

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t\t<key>IDECodeSnippetCompletionScopes</key>
\t\t<array>
\t\t\t<string>${xmlEsc(STATE.scope)}</string>
\t\t</array>${platformSection}${langSection}
\t\t<key>IDECodeSnippetContents</key>
\t\t<string>${xmlEsc(STATE.code)}</string>
\t\t<key>IDECodeSnippetIdentifier</key>
\t\t<string>${uuid}</string>
\t\t<key>IDECodeSnippetSummary</key>
\t\t<string>${xmlEsc(STATE.summary)}</string>
\t\t<key>IDECodeSnippetTitle</key>
\t\t<string>${xmlEsc(STATE.title)}</string>
\t\t<key>IDECodeSnippetCompletionPrefix</key>
\t\t<string>${xmlEsc(STATE.completion)}</string>
\t\t<key>IDECodeSnippetUserSnippet</key>
\t\t<true/>
\t\t<key>IDECodeSnippetVersion</key>
\t\t<integer>2</integer>
</dict>
</plist>`;

  el("output").textContent = plist;

  // filename badge
  const slug = (STATE.completion || STATE.title || "snippet").replace(/[^a-zA-Z0-9_-]/g, "_");
  el("filenameBadge").textContent = slug + ".codesnippet";
  el("downloadBtn").dataset.slug = slug;
}

// ── Load example ─────────────────────────────────────────────────────────────
function loadExample(idx) {
  const ex = EXAMPLES[idx];
  if (!ex) return;
  el("inp_title").value      = ex.title;
  el("inp_summary").value    = ex.summary;
  el("inp_completion").value = ex.completion;
  el("inp_platform").value   = ex.platform;
  el("inp_language").value   = ex.language;
  el("inp_scope").value      = ex.scope;
  el("inp_code").value       = ex.code;
  generate();
  // highlight active
  document.querySelectorAll(".example-btn").forEach((b, i) => {
    b.classList.toggle("active", i === idx);
  });
}

// ── Copy / download ──────────────────────────────────────────────────────────
function copyOutput() {
  navigator.clipboard.writeText(el("output").textContent).then(() => {
    const b = el("copyBtn");
    const orig = b.textContent;
    b.textContent = "Copied!";
    setTimeout(() => { b.textContent = orig; }, 1500);
  });
}

function downloadOutput() {
  collect();
  const text = el("output").textContent;
  const slug = el("downloadBtn").dataset.slug || "snippet";
  const blob = new Blob([text], { type: "text/xml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = slug + ".codesnippet";
  a.click();
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // Build example buttons
  const exWrap = el("examplesContainer");
  EXAMPLES.forEach((ex, i) => {
    const btn = document.createElement("button");
    btn.className = "example-btn";
    btn.textContent = ex.title;
    btn.onclick = () => loadExample(i);
    exWrap.appendChild(btn);
  });

  // Initial example
  loadExample(0);
});
