import React from 'react';
import { Link } from 'react-router-dom';
import theme from '../theme';
import { useIsMobile } from '../hooks/useIsMobile';

function LandingPage() {
  const isMobile = useIsMobile();

  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    borderBottom: `${theme.borders.width} ${theme.borders.style} ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    padding: isMobile ? '12px 16px' : '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  };

  const logoStyle = {
    fontSize: isMobile ? '1rem' : '1.25rem',
    fontWeight: 900,
    letterSpacing: '0.1em',
    margin: 0,
    textTransform: 'uppercase',
  };

  const navLinksStyle = {
    display: 'flex',
    gap: isMobile ? '8px' : '16px',
    flexWrap: 'wrap',
  };

  const navLinkStyle = {
    fontSize: isMobile ? '0.65rem' : '0.75rem',
    fontWeight: 900,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    color: theme.colors.text,
    padding: isMobile ? '6px 10px' : '8px 12px',
    border: `${theme.borders.width} ${theme.borders.style} ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    transition: 'none',
  };

  const mainStyle = {
    flex: 1,
    paddingTop: isMobile ? '60px' : '80px',
    paddingBottom: theme.spacing.xxl,
  };

  const heroStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isMobile ? '60vh' : '70vh',
    textAlign: 'center',
    gap: theme.spacing.xl,
    padding: isMobile ? '24px 16px' : '48px 32px',
  };

  const titleStyle = {
    fontSize: isMobile ? '2.5rem' : 'clamp(3rem, 10vw, 6rem)',
    fontWeight: 900,
    letterSpacing: '0.05em',
    lineHeight: 1,
    margin: 0,
    textTransform: 'uppercase',
  };

  const buttonStyle = {
    padding: isMobile ? '14px 28px' : '16px 48px',
    border: `${theme.borders.width} ${theme.borders.style} ${theme.colors.border}`,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: isMobile ? '0.8rem' : '0.85rem',
    fontWeight: 900,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'none',
  };

  const sectionStyle = {
    padding: isMobile ? '32px 16px' : '48px 32px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const sectionTitleStyle = {
    fontSize: isMobile ? '1.5rem' : '2rem',
    fontWeight: 900,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  };

  const featuresGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
    gap: theme.spacing.xl,
  };

  const featureCardStyle = {
    border: `${theme.borders.width} ${theme.borders.style} ${theme.colors.border}`,
    padding: isMobile ? '24px 16px' : '32px 24px',
    textAlign: 'center',
  };

  const featureTitleStyle = {
    fontSize: isMobile ? '1rem' : '1.25rem',
    fontWeight: 900,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  };

  const featureDescStyle = {
    fontSize: isMobile ? '0.75rem' : '0.85rem',
    letterSpacing: '0.05em',
    lineHeight: 1.5,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  };

  const premiumBadgeStyle = {
    display: 'inline-block',
    fontSize: isMobile ? '0.6rem' : '0.7rem',
    fontWeight: 900,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '4px 8px',
    border: `${theme.borders.width} ${theme.borders.style} ${theme.colors.text}`,
    marginTop: theme.spacing.sm,
  };

  const instructionsStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.lg,
    maxWidth: '800px',
    margin: '0 auto',
  };

  const stepStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: theme.spacing.md,
    alignItems: isMobile ? 'flex-start' : 'center',
  };

  const stepNumberStyle = {
    fontSize: isMobile ? '2rem' : '3rem',
    fontWeight: 900,
    letterSpacing: '0.1em',
    minWidth: isMobile ? 'auto' : '80px',
    color: theme.colors.text,
  };

  const stepTextStyle = {
    fontSize: isMobile ? '0.8rem' : '0.9rem',
    letterSpacing: '0.05em',
    lineHeight: 1.6,
    color: theme.colors.text,
    textTransform: 'uppercase',
  };

  return (
    <div style={containerStyle}>
      {/* ===== HEADER ===== */}
      <header style={headerStyle}>
        <div style={logoStyle}>PT-1.0</div>
        <nav style={navLinksStyle}>
          <Link to="/" style={navLinkStyle}>HOME</Link>
          <Link to="#features" style={navLinkStyle}>FEATURES</Link>
          <Link to="#instructions" style={navLinkStyle}>INSTRUCTIONS</Link>
          <Link to="/login" style={navLinkStyle}>LOGIN</Link>
        </nav>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main style={mainStyle}>
        {/* ===== HERO SECTION ===== */}
        <section style={heroStyle}>
          <h1 style={titleStyle}>
            FINANCIAL
            <br />
            TRACKER
          </h1>
          <Link to="/login" style={buttonStyle}>
            [ LAUNCH APP ]
          </Link>
        </section>

        {/* ===== FEATURES SECTION ===== */}
        <section id="features" style={sectionStyle}>
          <h2 style={sectionTitleStyle}>FEATURES</h2>
          <div style={featuresGridStyle}>
            {/* Dashboard Feature */}
            <div style={featureCardStyle}>
              <h3 style={featureTitleStyle}>DASHBOARD</h3>
              <p style={featureDescStyle}>
                COMPREHENSIVE OVERVIEW OF YOUR FINANCIAL DATA WITH BRUTAL PRECISION.
              </p>
            </div>

            {/* Charts Feature */}
            <div style={featureCardStyle}>
              <h3 style={featureTitleStyle}>CHARTS</h3>
              <p style={featureDescStyle}>
                VISUALIZE YOUR SPENDING PATTERNS AND INCOME TRENDS.
              </p>
            </div>

            {/* Telegram Bot Integration - PREMIUM */}
            <div style={featureCardStyle}>
              <h3 style={featureTitleStyle}>TELEGRAM BOT INTEGRATION</h3>
              <span style={premiumBadgeStyle}>PREMIUM</span>
              <p style={featureDescStyle}>
                TRACK EXPENSES AND TRANSACTIONS DIRECTLY FROM TELEGRAM.
              </p>
            </div>
          </div>
        </section>

        {/* ===== INSTRUCTIONS SECTION ===== */}
        <section id="instructions" style={sectionStyle}>
          <h2 style={sectionTitleStyle}>INSTRUCTIONS</h2>
          <div style={instructionsStyle}>
            <div style={stepStyle}>
              <div style={stepNumberStyle}>01</div>
              <div style={stepTextStyle}>
                CLICK THE [ LAUNCH APP ] BUTTON ABOVE OR THE LOGIN LINK IN THE HEADER.
              </div>
            </div>
            <div style={stepStyle}>
              <div style={stepNumberStyle}>02</div>
              <div style={stepTextStyle}>
                ON THE LOGIN PAGE, LEAVE BOTH EMAIL AND PASSWORD FIELDS EMPTY.
              </div>
            </div>
            <div style={stepStyle}>
              <div style={stepNumberStyle}>03</div>
              <div style={stepTextStyle}>
                CLICK LOGIN TO ACCESS THE APP AS A GUEST USER. YOUR SESSION IS STORED IN SESSIONSTORAGE.
              </div>
            </div>
            <div style={stepStyle}>
              <div style={stepNumberStyle}>04</div>
              <div style={stepTextStyle}>
                START TRACKING YOUR FINANCES IMMEDIATELY WITHOUT ANY REGISTRATION.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;