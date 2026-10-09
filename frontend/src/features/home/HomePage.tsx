import { IconBrand } from "../../components/Icons";

interface HomePageProps {
  onLogin: () => void;
}

export function HomePage({ onLogin }: HomePageProps) {
  return (
    <div className="home-screen">
      <header className="home-header">
        <a className="home-brand" href="/" aria-label="Lindero, inicio">
          <span className="brand-mark">
            <IconBrand />
          </span>
          <span className="home-brand-copy">
            <span className="brand-name">Lindero</span>
            <span className="brand-sub">Land Management</span>
          </span>
        </a>
        <button type="button" className="home-login-link" onClick={onLogin}>
          Sign in
        </button>
      </header>

      <main>
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="home-eyebrow">LAND MANAGEMENT, MADE CLEAR</p>
            <h1>Every lot. Every contract. All in order.</h1>
            <p className="home-intro">
              Manage projects, customers, and payments in one place, with the
              information you need always within reach.
            </p>
            <button type="button" className="home-cta" onClick={onLogin}>
              Sign in to Lindero
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <p className="home-access-note">For Lindero account holders</p>
          </div>

          <div className="home-visual" aria-hidden="true">
            <div className="home-visual-caption">
              <span className="home-caption-dot" />
              Your operation at a glance
            </div>
            <svg className="home-lot-plan" viewBox="0 0 520 390" fill="none">
              <path d="M64 59 426 32l39 278-364 44L64 59Z" fill="#EAF3EF" />
              <path d="m104 87 99-8 7 72-99 10-7-74Z" fill="#fff" />
              <path d="m219 78 99-8 7 72-99 10-7-74Z" fill="#fff" />
              <path d="m334 69 79-6 7 72-79 7-7-73Z" fill="#fff" />
              <path d="m113 176 99-10 7 72-99 11-7-73Z" fill="#fff" />
              <path d="m228 164 99-10 7 72-99 11-7-73Z" fill="#FBECE8" />
              <path d="m343 152 79-8 7 72-79 9-7-73Z" fill="#fff" />
              <path d="m122 265 99-11 7 60-99 12-7-61Z" fill="#fff" />
              <path d="m237 244 99-11 7 61-99 12-7-62Z" fill="#fff" />
              <path d="m352 231 79-9 8 61-80 10-7-62Z" fill="#fff" />
              <path
                d="m91 55 337-26M97 344l364-44M104 87l18 240M203 79l20 235M318 70l25 224M413 63l25 219M64 59l39 294M465 310l-17-122-18-156M104 87l309-24M113 176l309-32M122 265l309-43"
                stroke="#B4CCBF"
                strokeWidth="2"
              />
              <path d="m44 77 26-2m-21 19 26-2m-21 19 26-2" stroke="#D6C6B3" strokeWidth="2" />
              <path d="m453 340 25-3m-22 20 25-3" stroke="#D6C6B3" strokeWidth="2" />
              <circle cx="260" cy="190" r="5" fill="#E07A5F" />
            </svg>
            <div className="home-visual-note">
              <span className="home-note-mark">L</span>
              <span>
                <strong>A clearer view</strong>
                <small>Projects, lots, and transactions</small>
              </span>
            </div>
          </div>
        </section>

        <section className="home-features" aria-label="Lindero tools">
          <article className="home-feature">
            <span className="home-feature-number">01</span>
            <h2>Projects and lots</h2>
            <p>Review your inventory and check the availability of each lot.</p>
          </article>
          <article className="home-feature">
            <span className="home-feature-number">02</span>
            <h2>Contracts and customers</h2>
            <p>Keep your sales and customer information connected.</p>
          </article>
          <article className="home-feature">
            <span className="home-feature-number">03</span>
            <h2>Payments and receipts</h2>
            <p>Record transactions and check balances from one place.</p>
          </article>
        </section>
      </main>

      <footer className="home-footer">
        <span>Lindero</span>
        <span>Land management</span>
      </footer>
    </div>
  );
}
