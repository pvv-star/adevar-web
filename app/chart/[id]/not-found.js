import Link from 'next/link';

export default function ChartNotFound() {
  return (
    <div className="page-scroll" style={{ textAlign: 'center', paddingTop: '80px' }}>
      <h1 className="view-heading">404</h1>
      <p className="view-subheading" style={{ marginBottom: '24px' }}>
        Acest indicator nu a fost gasit.
      </p>
      <Link href="/" className="ctrl-btn">
        Inapoi la Dashboard
      </Link>
    </div>
  );
}
