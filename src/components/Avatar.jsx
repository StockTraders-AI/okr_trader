export default function Avatar({ children, className = "" }) {
  return <span className={`avatar ${className}`}>{children}</span>;
}
