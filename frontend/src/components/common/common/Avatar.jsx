function Avatar({ name = 'AS', size = 48 }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="avatar" style={{ width: size, height: size, borderRadius: size * 0.35 }}>
      {initials}
    </div>
  );
}

export default Avatar;
