export function InitialAvatar({ name }: { name: string }) {
  return <span className="avatar">{name.trim().slice(0, 1).toUpperCase()}</span>;
}
