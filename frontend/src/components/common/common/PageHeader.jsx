function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header-row">
      <div>
        {eyebrow && <div className="badge badge-primary">{eyebrow}</div>}
        <h1 className="page-title" style={{ marginTop: eyebrow ? 12 : 0 }}>{title}</h1>
        {description && <p className="page-subtitle">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export default PageHeader;
