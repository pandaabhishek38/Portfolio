import './ProjectCard.css'

export default function ProjectCard({
  title,
  techStack,
  description,
  githubLink,
}) {
  return (
    <div className="project-card">
      <h2 className="project-card__title">{title}</h2>
      <p className="project-card__tech">{techStack}</p>
      <p
        className="project-card__desc"
        dangerouslySetInnerHTML={{
          __html: description.replace(/\n/g, '<br />'),
        }}
      ></p>

      {githubLink && (
        <a
          className="project-card__github"
          href={githubLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          View →
        </a>
      )}
    </div>
  )
}
