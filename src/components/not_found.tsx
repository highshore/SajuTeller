import { Link } from "react-router-dom";
import { styled } from "styled-components";
import { useI18n } from "../i18n/i18n";

// Rendered outside the app shell, so it carries its own mobile column.
const Wrapper = styled.main`
  container: saju / inline-size;
  width: 100%;
  max-width: var(--st-app-width);
  min-height: 100dvh;
  margin: 0 auto;
  padding: 24px 20px 40px;
  display: flex;
  flex-direction: column;
  background: var(--st-paper);
  color: var(--st-ink);
  box-shadow: 0 0 0 1px var(--st-line);
  .brand { font: 600 22px/30px 'Cormorant Garamond', serif; letter-spacing: .5px; align-self: flex-start; min-height: 44px; display: flex; align-items: center; }
  .body { flex: 1; display: flex; flex-direction: column; justify-content: center; padding-bottom: 12vh; }
  .kicker { font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: var(--st-brand); }
  h1 { font: 600 40px/1.05 'Cormorant Garamond', serif; letter-spacing: -.5px; margin: 8px 0 12px; }
  p { font-size: 15px; line-height: 1.55; color: var(--st-muted); }
  .actions { display: grid; gap: 4px; margin-top: 28px; }
  .primary { display: flex; align-items: center; justify-content: center; min-height: 52px; border-radius: 14px; background: var(--st-action); color: var(--st-on-action); font-size: 16px; font-weight: 600; }
  .secondary { display: flex; align-items: center; justify-content: center; min-height: 48px; font-size: 14px; font-weight: 600; color: var(--st-brand); }
`;

export default function NotFound() {
  const { t } = useI18n();
  return (
    <Wrapper>
      <Link className="brand" to="/">SAJUTELLER</Link>
      <div className="body">
        <span className="kicker">{t("Page not found")} · 404</span>
        <h1>{t("This page has wandered off.")}</h1>
        <p>{t("Sorry, the page you’re looking for can’t be found.")}</p>
        <div className="actions">
          <Link className="primary" to="/">{t("Go back home")}</Link>
          <Link className="secondary" to="/support">{t("Help & support")}</Link>
        </div>
      </div>
    </Wrapper>
  );
}
