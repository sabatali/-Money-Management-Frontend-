/**
 * Shows English + Roman Urdu on one line, with optional hint below.
 */
const BilingualLabel = ({
  en,
  ur,
  hint,
  className = '',
  primaryClassName = '',
  urClassName = 'text-app-muted font-normal',
  hintClassName = 'mt-0.5 text-xs text-app-muted/80',
  as = 'span',
}) => {
  const Tag = as

  return (
    <Tag className={className}>
      <span className={primaryClassName}>
        {en}
        {ur ? (
          <>
            {' '}
            <span className={urClassName}>· {ur}</span>
          </>
        ) : null}
      </span>
      {hint ? <p className={hintClassName}>{hint}</p> : null}
    </Tag>
  )
}

export default BilingualLabel
