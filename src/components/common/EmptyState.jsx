import { decodeUnicodeText } from '../../utils/format';

export default function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <h3>{decodeUnicodeText(title)}</h3>
      <p>{decodeUnicodeText(description)}</p>
    </div>
  );
}
