import React, { useState, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { ProtectedRoute } from "../../context/ProtectedRoute";
import {
  Play,
  Code2,
  RefreshCw,
  Terminal,
  File,
  FileText,
  Plus,
  Download,
  X,
  Settings2,
  FolderTree,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  Check,
  Save,
  Cloud,
  FolderOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../services/api";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const getLanguageFromExtension = (filename) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
      return "javascript";
    case "html":
      return "html";
    case "css":
      return "css";
    case "py":
      return "python";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "sql":
      return "sql";
    default:
      return "plaintext";
  }
};

const defaultFiles = {
  "index.html": {
    name: "index.html",
    language: "html",
    value: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>STAR LMS Web Project</h1>
  <p>This is a live preview. The CSS and JS files are dynamically linked from the workspace!</p>
  
  <button id="actionBtn">Click Me</button>

  <!-- Linking the workspace JS file -->
  <script src="script.js"></script>
</body>
</html>`,
  },
  "style.css": {
    name: "style.css",
    language: "css",
    value: `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  text-align: center;
  margin-top: 50px;
  background: #1e1e2e;
  color: #cdd6f4;
}

h1 {
  color: #a6e3a1;
}

button {
  background: #89b4fa;
  color: #11111b;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

button:active {
  transform: scale(0.95);
}`,
  },
  "script.js": {
    name: "script.js",
    language: "javascript",
    value: `document.getElementById('actionBtn').addEventListener('click', () => {
  alert('Hello from script.js!');
  console.log('Button was clicked!');
});`,
  },
};

const THEMES = {
  "vs-dark": "VS Dark",
  light: "VS Light",
  dracula: "Dracula",
  monokai: "Monokai",
};

const draculaTheme = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { background: "282a36" },
    { token: "keyword", foreground: "ff79c6" },
    { token: "string", foreground: "f1fa8c" },
    { token: "number", foreground: "bd93f9" },
    { token: "comment", foreground: "6272a4" },
  ],
  colors: {
    "editor.background": "#282a36",
    "editor.foreground": "#f8f8f2",
    "editorLineNumber.foreground": "#6272a4",
  },
};

const monokaiTheme = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { background: "272822" },
    { token: "keyword", foreground: "f92672" },
    { token: "string", foreground: "e6db74" },
    { token: "number", foreground: "ae81ff" },
    { token: "comment", foreground: "75715e" },
  ],
  colors: {
    "editor.background": "#272822",
    "editor.foreground": "#f8f8f2",
  },
};

export default function CodeLab() {
  return (
    <ProtectedRoute>
      <CodeLabContent />
    </ProtectedRoute>
  );
}

function CodeLabContent() {
  const monaco = useMonaco();
  const [files, setFiles] = useState(defaultFiles);
  const [activeFilename, setActiveFilename] = useState("index.html");
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");

  const [newFileName, setNewFileName] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  const [editingFile, setEditingFile] = useState(null);
  const [editNameValue, setEditNameValue] = useState("");

  const [editorTheme, setEditorTheme] = useState(
    localStorage.getItem("codelab-theme") || "vs-dark",
  );

  const [projectName, setProjectName] = useState("My Cloud Web Project");
  const [savedProjects, setSavedProjects] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const activeFile = files[activeFilename];

  const loadSavedProjects = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.codelab.getMyProjects(token);
      if (res && res.success) {
        setSavedProjects(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load cloud projects", err);
    }
  }, []);

  useEffect(() => {
    loadSavedProjects();
  }, [loadSavedProjects]);

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.codelab.saveProject(projectName, files, token);
      if (res && res.success) {
        toast.success(
          `Cloud project '${projectName}' successfully synchronized!`,
        );
        loadSavedProjects();
      }
    } catch (err) {
      toast.error("Failed to sync project to Supabase.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadCloudProject = (proj) => {
    setProjectName(proj.title);
    setFiles(proj.files);
    const fileKeys = Object.keys(proj.files);
    if (fileKeys.length > 0) {
      setActiveFilename(fileKeys[0]);
    }
    toast.success(`Loaded project: ${proj.title}`);
  };

  const handleDeleteCloudProject = async (id) => {
    try {
      const res = await api.codelab.deleteProject(id);
      if (res.success) {
        toast.success("Project deleted from cloud.");
        loadSavedProjects();
      }
    } catch (err) {
      toast.error("Failed to delete project.");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveToCloud();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [projectName, files]);

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme("dracula", draculaTheme);
      monaco.editor.defineTheme("monokai", monokaiTheme);
      monaco.editor.setTheme(editorTheme);
    }
  }, [monaco, editorTheme]);

  const handleThemeChange = (themeKey) => {
    setEditorTheme(themeKey);
    localStorage.setItem("codelab-theme", themeKey);
    if (monaco) {
      monaco.editor.setTheme(themeKey);
    }
    toast.success(`Theme changed to ${THEMES[themeKey]}`);
  };

  const handleEditorChange = (value) => {
    setFiles((prev) => ({
      ...prev,
      [activeFilename]: {
        ...prev[activeFilename],
        value,
      },
    }));
  };

  const handleCreateFile = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    if (files[newFileName]) {
      toast.error("File already exists!");
      return;
    }

    setFiles((prev) => ({
      ...prev,
      [newFileName]: {
        name: newFileName,
        language: getLanguageFromExtension(newFileName),
        value: "",
      },
    }));
    setActiveFilename(newFileName);
    setNewFileName("");
    setIsCreatingFile(false);
    toast.success(`Created ${newFileName}`);
  };

  const handleDeleteFile = (filename) => {
    const newFiles = { ...files };
    delete newFiles[filename];
    setFiles(newFiles);
    if (activeFilename === filename) {
      const remainingFiles = Object.keys(newFiles);
      setActiveFilename(remainingFiles.length > 0 ? remainingFiles[0] : null);
    }
    toast.info(`Deleted ${filename}`);
  };

  const handleRenameFile = (e) => {
    e.preventDefault();
    if (!editNameValue.trim() || editNameValue === editingFile) {
      setEditingFile(null);
      return;
    }
    if (files[editNameValue]) {
      toast.error("Filename already exists!");
      return;
    }

    const newFiles = { ...files };
    const oldFile = newFiles[editingFile];

    newFiles[editNameValue] = {
      ...oldFile,
      name: editNameValue,
      language: getLanguageFromExtension(editNameValue),
    };
    delete newFiles[editingFile];

    setFiles(newFiles);
    if (activeFilename === editingFile) setActiveFilename(editNameValue);
    setEditingFile(null);
    toast.success(`Renamed to ${editNameValue}`);
  };

  const handleDuplicateFile = (filename) => {
    const file = files[filename];
    const nameParts = filename.split(".");
    const ext = nameParts.pop();
    const baseName = nameParts.join(".");

    let copyName = `${baseName}-copy.${ext}`;
    let counter = 1;
    while (files[copyName]) {
      copyName = `${baseName}-copy-${counter}.${ext}`;
      counter++;
    }

    setFiles((prev) => ({
      ...prev,
      [copyName]: {
        ...file,
        name: copyName,
      },
    }));
    toast.success(`Duplicated ${filename}`);
  };

  const handleDownloadWorkspace = async () => {
    const zip = new JSZip();
    Object.values(files).forEach((f) => {
      zip.file(f.name, f.value);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "starlms-workspace.zip");
    toast.success("Workspace downloaded successfully!");
  };

  // HTML Compiler logic: replaces link and script tags with inline workspace content
  const compileHTML = () => {
    let htmlContent = files["index.html"] ? files["index.html"].value : "";

    // Replace <link rel="stylesheet" href="filename.css">
    htmlContent = htmlContent.replace(
      /<link\s+[^>]*href=["']([^"']+)["'][^>]*>/gi,
      (match, href) => {
        if (files[href]) {
          return `<style>${files[href].value}</style>`;
        }
        return match;
      },
    );

    // Replace <script src="filename.js"></script>
    htmlContent = htmlContent.replace(
      /<script\s+[^>]*src=["']([^"']+)["'][^>]*>[\s\S]*?<\/script>/gi,
      (match, src) => {
        if (files[src]) {
          return `<script>${files[src].value}</script>`;
        }
        return match;
      },
    );

    return htmlContent;
  };

  const runCode = () => {
    setIsRunning(true);
    setShowIframe(false);
    setOutput([]);

    // Web Project Runner
    if (activeFile.language === "html" || activeFilename === "index.html") {
      const bundledHTML = compileHTML();
      const blob = new Blob([bundledHTML], { type: "text/html" });
      setIframeSrc(URL.createObjectURL(blob));
      setShowIframe(true);
      setIsRunning(false);
      return;
    }

    // Pure JavaScript Runner
    if (activeFile.language === "javascript") {
      const originalLog = console.log;
      const logs = [];
      console.log = (...args) => {
        logs.push(
          args
            .map((a) =>
              typeof a === "object" ? JSON.stringify(a, null, 2) : String(a),
            )
            .join(" "),
        );
        originalLog(...args);
      };

      try {
        const execution = new Function(activeFile.value);
        execution();
        setOutput(logs);
      } catch (error) {
        setOutput([`Error: ${error.message}`]);
      }

      console.log = originalLog;
      setIsRunning(false);
      return;
    }

    setOutput([
      `Execution for ${activeFile.language} is mocked in browser.`,
      "HTML/JS files run natively. Please run index.html to test web projects.",
    ]);
    setIsRunning(false);
  };

  // Iframe console message listener
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === "console") {
        setOutput((prev) => [...prev, e.data.message]);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <main className="min-h-screen bg-surface pt-24 pb-20 px-4 sm:px-8">
      <div className="max-w-[1920px] mx-auto h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl signature-gradient flex items-center justify-center text-white shadow-lg shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="text-2xl sm:text-3xl font-headline font-bold text-primary bg-transparent border-b border-transparent hover:border-primary/40 focus:border-primary outline-none px-1 py-0.5 rounded transition-all truncate max-w-[300px] sm:max-w-[450px]"
                title="Click to edit project title"
              />
              <span className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary font-mono uppercase tracking-wider font-bold shadow-inner border border-primary/20 shrink-0">
                Cloud Sync Active
              </span>
            </div>
            <p className="text-on-surface-variant text-sm">
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-surface-container font-mono text-xs text-primary rounded border border-surface-dim">
                Ctrl + S
              </kbd>{" "}
              anywhere to synchronize your code workspace to Supabase
              PostgreSQL.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {/* Theme Selector */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="px-4 py-2.5 bg-surface-container text-on-surface rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-surface-dim transition-all outline-none">
                  <Settings2 className="w-4 h-4 text-primary" />
                  <span className="hidden xl:inline">
                    {THEMES[editorTheme]}
                  </span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[180px] bg-surface-container-high border border-surface-dim rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in duration-200"
                  sideOffset={5}
                >
                  <div className="px-2 py-1.5 text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                    Editor Theme
                  </div>
                  {Object.entries(THEMES).map(([key, label]) => (
                    <DropdownMenu.Item
                      key={key}
                      onClick={() => handleThemeChange(key)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-primary/10 hover:text-primary cursor-pointer outline-none"
                    >
                      {label}
                      {editorTheme === key && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* Load Cloud Projects Dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="px-4 py-2.5 bg-surface-container-high text-primary rounded-xl font-bold flex items-center gap-2 hover:bg-surface-dim transition-all shadow-md">
                  <FolderOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Load Cloud Project</span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[260px] max-w-[340px] max-h-80 overflow-y-auto bg-surface-container-high border border-surface-dim rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in"
                  sideOffset={5}
                >
                  <div className="px-2 py-1.5 text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1 flex items-center justify-between border-b border-surface-dim/20 pb-2">
                    <span>Saved Cloud Workspaces</span>
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-mono">
                      {savedProjects.length}
                    </span>
                  </div>
                  {savedProjects.length === 0 ? (
                    <div className="p-6 text-center text-xs text-on-surface-variant italic">
                      No saved cloud projects found. Press Ctrl+S or click Save
                      to Cloud!
                    </div>
                  ) : (
                    savedProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-primary/10 group cursor-pointer transition-colors my-1 border border-transparent hover:border-primary/20"
                      >
                        <div
                          onClick={() => handleLoadCloudProject(proj)}
                          className="flex-1 truncate pr-2"
                        >
                          <div className="text-sm font-bold text-on-surface truncate group-hover:text-primary">
                            {proj.title}
                          </div>
                          <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                            Saved{" "}
                            {new Date(proj.last_saved).toLocaleDateString()}{" "}
                            {new Date(proj.last_saved).toLocaleTimeString()}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCloudProject(proj.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <button
              onClick={handleSaveToCloud}
              disabled={isSaving}
              className="px-5 py-2.5 bg-primary/15 text-primary border border-primary/30 rounded-xl font-bold flex items-center gap-2 hover:bg-primary hover:text-on-primary transition-all shadow-md active:scale-95"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Save Cloud Workspace</span>
            </button>

            <button
              onClick={runCode}
              disabled={isRunning || !activeFile}
              className="px-6 py-2.5 signature-gradient text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg active:scale-95"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Run Code</span>
            </button>
          </div>
        </div>

        {/* Main IDE Layout */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Sidebar - File Explorer */}
          <div className="w-64 bg-surface-container-lowest rounded-3xl border border-surface-dim/20 shadow-xl flex flex-col overflow-hidden shrink-0 hidden md:flex">
            <div className="p-4 border-b border-surface-dim/20 flex items-center justify-between bg-surface-container/50">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <FolderTree className="w-4 h-4" /> WORKSPACE
              </div>
              <button
                onClick={() => setIsCreatingFile(true)}
                className="w-7 h-7 flex items-center justify-center bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <AnimatePresence>
                {isCreatingFile && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleCreateFile}
                    className="mb-2"
                  >
                    <input
                      type="text"
                      autoFocus
                      placeholder="filename.ext"
                      className="w-full bg-surface-container text-on-surface text-sm px-3 py-2 rounded-lg border border-primary/30 outline-none focus:border-primary"
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      onBlur={() => !newFileName && setIsCreatingFile(false)}
                    />
                  </motion.form>
                )}
              </AnimatePresence>

              {Object.values(files).map((file) => (
                <div key={file.name}>
                  {editingFile === file.name ? (
                    <form onSubmit={handleRenameFile} className="px-2 py-1">
                      <input
                        type="text"
                        autoFocus
                        value={editNameValue}
                        onChange={(e) => setEditNameValue(e.target.value)}
                        onBlur={handleRenameFile}
                        className="w-full bg-surface text-on-surface text-sm px-2 py-1.5 rounded border border-primary outline-none"
                      />
                    </form>
                  ) : (
                    <div
                      onClick={() => setActiveFilename(file.name)}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${activeFilename === file.name ? "bg-primary/10 text-primary font-bold border border-primary/20" : "text-on-surface-variant hover:bg-surface-container"}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText
                          className={`w-4 h-4 shrink-0 ${activeFilename === file.name ? "text-primary" : "opacity-60"}`}
                        />
                        <span className="text-sm truncate">{file.name}</span>
                      </div>

                      {/* Context Menu using Radix */}
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-surface-dim rounded transition-all outline-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className="min-w-[160px] bg-surface-container-high border border-surface-dim rounded-xl shadow-xl p-1 z-50 animate-in fade-in"
                            sideOffset={5}
                            align="start"
                          >
                            <DropdownMenu.Item
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingFile(file.name);
                                setEditNameValue(file.name);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-dim rounded-lg cursor-pointer outline-none"
                            >
                              <Edit2 className="w-4 h-4" /> Rename
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateFile(file.name);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-dim rounded-lg cursor-pointer outline-none"
                            >
                              <Copy className="w-4 h-4" /> Duplicate
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="h-px bg-surface-dim my-1" />
                            <DropdownMenu.Item
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file.name);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer outline-none"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Editor and Output Area */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
            {/* Editor Container */}
            <div className="flex-1 bg-[#1e1e1e] rounded-3xl border border-surface-dim/20 shadow-2xl overflow-hidden flex flex-col min-w-0">
              <div className="bg-[#2d2d2d] px-4 py-2 flex items-center justify-between border-b border-[#404040]">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  {activeFile && (
                    <div className="flex items-center gap-2 bg-[#1e1e1e] px-3 py-1 rounded-t-lg -mb-2 border-t border-l border-r border-[#404040]">
                      <File className="w-3.5 h-3.5 text-[#cccccc]" />
                      <span className="text-[#cccccc] text-xs font-mono">
                        {activeFile.name}
                      </span>
                    </div>
                  )}
                </div>
                {activeFile && (
                  <span className="text-xs font-mono text-primary px-2 py-0.5 rounded bg-primary/10">
                    {activeFile.language}
                  </span>
                )}
              </div>
              <div className="flex-1 min-h-0">
                {activeFile ? (
                  <Editor
                    height="100%"
                    language={activeFile.language}
                    value={activeFile.value}
                    onChange={handleEditorChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: "Roboto Mono, monospace",
                      padding: { top: 20 },
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      cursorBlinking: "smooth",
                      automaticLayout: true,
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-[#666]">
                    No file open
                  </div>
                )}
              </div>
            </div>

            {/* Console Output / Preview Container */}
            <div className="w-full lg:w-[400px] xl:w-[500px] bg-surface-container-lowest rounded-3xl border border-surface-dim/20 shadow-2xl overflow-hidden flex flex-col shrink-0">
              <div className="bg-surface-container-low px-4 py-3 flex items-center justify-between border-b border-surface-dim/20">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="text-primary text-xs font-bold uppercase tracking-widest">
                    Live Output & Preview
                  </span>
                </div>
              </div>
              <div className="flex-1 min-h-0 relative bg-white">
                {showIframe ? (
                  <iframe
                    src={iframeSrc}
                    className="w-full h-full border-0"
                    title="Preview"
                  />
                ) : (
                  <div className="w-full h-full p-6 overflow-auto font-mono text-sm space-y-2 bg-[#0a0a0e] text-[#dce8ff]">
                    {output.length === 0 ? (
                      <span className="text-[#485468] italic">
                        Click Run Code to execute scripts or preview HTML...
                      </span>
                    ) : (
                      output.map((line, i) => (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={i}
                          className={`${line.startsWith("Error:") ? "text-red-400" : "text-emerald-400"}`}
                        >
                          <span className="text-[#485468] mr-4">{">"}</span>
                          {line}
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
