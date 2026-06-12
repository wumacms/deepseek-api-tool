import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import DOMPurify from 'dompurify';

// ==================== Marked 配置 ====================

marked.setOptions({
  breaks: true,
  gfm: true,
});

const renderer = new marked.Renderer();

/**
 * 自定义代码块渲染：highlight.js 语法高亮 + 复制按钮（事件委托触发）
 */
renderer.code = function (codeOrObj: any, lang?: string) {
  let text = '';
  let codeLang = 'plaintext';
  if (typeof codeOrObj === 'object' && codeOrObj !== null) {
    text = codeOrObj.text || '';
    codeLang = codeOrObj.lang || 'plaintext';
  } else {
    text = codeOrObj || '';
    codeLang = lang || 'plaintext';
  }

  let highlighted = text;
  try {
    if (codeLang && hljs.getLanguage(codeLang)) {
      highlighted = hljs.highlight(text, { language: codeLang }).value;
    } else {
      highlighted = hljs.highlightAuto(text).value;
    }
  } catch (err) {
    console.error('Highlight error:', err);
  }

  return `<div class="relative border border-white/10 rounded-none overflow-hidden bg-black/40 font-mono text-xs my-3">
    <div class="bg-white/5 px-4 py-2 flex justify-between items-center text-[10px] text-gray-400 select-none">
      <span>${codeLang.toUpperCase()}</span>
      <button class="copy-code-btn hover:text-white transition-colors cursor-pointer px-2 py-0.5 rounded-none hover:bg-white/5">复制</button>
    </div>
    <pre class="overflow-x-auto text-blue-200/90"><code class="hljs language-${codeLang}">${highlighted}</code></pre>
  </div>`;
};

// ==================== KaTeX 数学公式扩展 ====================

const blockMath = {
  name: 'blockMath',
  level: 'block' as const,
  start(src: string) { return src.indexOf('$$'); },
  tokenizer(src: string) {
    const match = src.match(/^\$\$([\s\S]+?)\$\$/);
    if (match) {
      return {
        type: 'blockMath',
        raw: match[0],
        text: match[1].trim(),
      };
    }
  },
  renderer(token: any) {
    try {
      return `<div class="katex-block-container my-4 overflow-x-auto text-center">${katex.renderToString(token.text, { displayMode: true, throwOnError: false })}</div>`;
    } catch (err) {
      console.error('KaTeX block render error:', err);
      return `<div class="text-red-500 font-mono my-2">${token.raw}</div>`;
    }
  },
};

const inlineMath = {
  name: 'inlineMath',
  level: 'inline' as const,
  start(src: string) { return src.indexOf('$'); },
  tokenizer(src: string) {
    const match = src.match(/^\$([^\$\s\n](?:[^\$\n]*?[^\$\s\n])?)\$/);
    if (match) {
      return {
        type: 'inlineMath',
        raw: match[0],
        text: match[1],
      };
    }
  },
  renderer(token: any) {
    try {
      return katex.renderToString(token.text, { displayMode: false, throwOnError: false });
    } catch (err) {
      console.error('KaTeX inline render error:', err);
      return token.raw;
    }
  },
};

marked.use({
  renderer,
  extensions: [blockMath, inlineMath],
});

// ==================== 渲染 + DOMPurify 消毒 ====================

/**
 * 将 Markdown 文本渲染为安全的 HTML 字符串。
 * 使用 DOMPurify 消毒，防止 XSS 注入。
 */
export function renderMarkdown(text: string): string {
  if (!text) return '';
  try {
    const raw = marked.parse(text) as string;
    return DOMPurify.sanitize(raw, {
      ADD_TAGS: ['button'], // 允许代码块中的复制按钮
      ADD_ATTR: ['class', 'title'],
    });
  } catch (err) {
    console.error('Markdown parsing failed:', err);
    return DOMPurify.sanitize(text);
  }
}

// ==================== 解析结果缓存 ====================

const markdownCache = new Map<string, string>();
const MAX_CACHE_SIZE = 200;

/**
 * 带缓存的 Markdown 渲染，适用于已完成的消息。
 * 流式消息不应使用此函数（内容不断变化导致缓存失效）。
 */
export function renderMarkdownCached(text: string): string {
  if (!text) return '';
  
  const cached = markdownCache.get(text);
  if (cached) return cached;

  const result = renderMarkdown(text);
  
  // LRU-like: 超出上限时清空（简单策略）
  if (markdownCache.size >= MAX_CACHE_SIZE) {
    const firstKey = markdownCache.keys().next().value;
    if (firstKey !== undefined) {
      markdownCache.delete(firstKey);
    }
  }
  
  markdownCache.set(text, result);
  return result;
}
