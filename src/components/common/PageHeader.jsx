import { decodeUnicodeText } from '../../utils/format';

export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="page-header__eyebrow">{decodeUnicodeText(eyebrow)}</p>}
        <h1>{decodeUnicodeText(title)}</h1>
        {description && <p className="page-header__description">{decodeUnicodeText(description)}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
