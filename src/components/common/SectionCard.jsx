import { decodeUnicodeText } from '../../utils/format';

export default function SectionCard({ title, description, action, children, className = '' }) {
  return (
    <section className={`section-card ${className}`.trim()}>
      {(title || description || action) && (
        <header className="section-card__header">
          <div>
            {title && <h2>{decodeUnicodeText(title)}</h2>}
            {description && <p>{decodeUnicodeText(description)}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
