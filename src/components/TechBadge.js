import './TechBadge.css'

/*
 * Small, dependency-free technology marks.
 * These are intentionally simple so adding an unmapped technology
 * never breaks the build.
 */
export const TECH_META = {
  HTML: { mark: '</>', className: 'html' },
  HTML5: { mark: '</>', className: 'html' },

  CSS: { mark: '#', className: 'css' },
  CSS3: { mark: '#', className: 'css' },

  JavaScript: { mark: 'JS', className: 'javascript' },
  TypeScript: { mark: 'TS', className: 'typescript' },

  'Node.js': { mark: 'N', className: 'node' },
  'Express.js': { mark: 'E', className: 'express' },

  React: { mark: '⚛', className: 'react' },
  'Next.js': { mark: 'N', className: 'next' },

  Python: { mark: 'Py', className: 'python' },
  Java: { mark: 'J', className: 'java' },
  'C++': { mark: 'C++', className: 'cpp' },
  C: { mark: 'C', className: 'c' },
  'C#': { mark: 'C#', className: 'csharp' },
  Go: { mark: 'Go', className: 'go' },
  PHP: { mark: 'PHP', className: 'php' },

  MySQL: { mark: 'SQL', className: 'mysql' },
  PostgreSQL: { mark: 'PG', className: 'postgresql' },
  MongoDB: { mark: 'M', className: 'mongodb' },
  Oracle: { mark: 'DB', className: 'oracle' },

  Docker: { mark: '◇', className: 'docker' },
  Kubernetes: { mark: 'K8s', className: 'kubernetes' },

  AWS: { mark: 'AWS', className: 'aws' },
  Azure: { mark: 'AZ', className: 'azure' },
  Vercel: { mark: '▲', className: 'vercel' },

  TensorFlow: { mark: 'TF', className: 'tensorflow' },
  PyTorch: { mark: 'PT', className: 'pytorch' },
  Keras: { mark: 'K', className: 'keras' },
  'scikit-learn': { mark: 'sk', className: 'sklearn' },

  Django: { mark: 'D', className: 'django' },
  Flask: { mark: 'F', className: 'flask' },

  Prisma: { mark: 'P', className: 'prisma' },
  Supabase: { mark: 'S', className: 'supabase' },

  Git: { mark: '◆', className: 'git' },
  GitHub: { mark: 'GH', className: 'github' },

  OpenAI: { mark: 'AI', className: 'openai' },
  LangChain: { mark: 'LC', className: 'langchain' },

  Twilio: { mark: 'T', className: 'twilio' },
}

/**
 * Gets metadata for a technology without ever throwing an error.
 * Unknown technologies simply receive a generic text mark.
 */
export function getTechMeta(technology) {
  const normalized = String(technology || '').trim()

  return (
    TECH_META[normalized] || {
      mark: normalized.slice(0, 2).toUpperCase() || '?',
      className: 'generic',
    }
  )
}

/**
 * Convert the stack into individual technologies.
 * Supports the existing comma-separated database format.
 */
export function parseTechStack(stack) {
  if (!stack) return []

  if (Array.isArray(stack)) {
    return stack.map((tech) => String(tech).trim()).filter(Boolean)
  }

  return String(stack)
    .split(',')
    .map((tech) => tech.trim())
    .filter(Boolean)
}

/**
 * True when the technology has a dedicated mark in TECH_META.
 */
export function hasTechMeta(technology) {
  return Boolean(TECH_META[String(technology || '').trim()])
}

/**
 * showFallbackMark=false renders unmapped technologies as a plain,
 * neutral badge (no generated letter mark). Projects keeps the default.
 */
export default function TechBadge({ technology, showFallbackMark = true }) {
  const meta = getTechMeta(technology)
  const showMark = showFallbackMark || meta.className !== 'generic'

  return (
    <span
      className={`project-tech-badge project-tech-badge--${meta.className}`}
      title={technology}
    >
      {showMark && (
        <span className="project-tech-badge__mark" aria-hidden="true">
          {meta.mark}
        </span>
      )}

      <span className="project-tech-badge__name">{technology}</span>
    </span>
  )
}
