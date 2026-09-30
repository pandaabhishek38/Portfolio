import { MdArrowDownward, MdArrowUpward } from 'react-icons/md'

/**
 * Move up / Move down controls for admin ordering.
 * Disabled at the first/last position and while an order is saving.
 */
export default function ReorderButtons({
  index,
  count,
  label,
  onMove,
  disabled = false,
}) {
  return (
    <div className="admin-reorder" role="group" aria-label={`Reorder ${label}`}>
      <span className="admin-reorder__position">
        {index + 1} of {count}
      </span>

      <button
        type="button"
        className="admin-reorder__button"
        onClick={() => onMove(index, index - 1)}
        disabled={disabled || index === 0}
        aria-label={`Move ${label} up`}
        title="Move up"
      >
        <MdArrowUpward aria-hidden="true" />
        <span>Up</span>
      </button>

      <button
        type="button"
        className="admin-reorder__button"
        onClick={() => onMove(index, index + 1)}
        disabled={disabled || index === count - 1}
        aria-label={`Move ${label} down`}
        title="Move down"
      >
        <MdArrowDownward aria-hidden="true" />
        <span>Down</span>
      </button>
    </div>
  )
}
