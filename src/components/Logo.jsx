// The Grantly logo. It always shows your original /logo.png (put the file in the "public" folder).
// Every place that uses <Logo size={..} /> now shows the same picture.
export default function Logo({ size = 40, className = '', ...rest }) {
  return (
    <img
      src="/logo.png"
      alt="Grantly logo"
      width={size}
      height={size}
      draggable={false}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
      {...rest}
    />
  )
}