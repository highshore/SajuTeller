import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { Bars3Icon, XMarkIcon, ChevronDownIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { supabase } from "../supabase";
import { useI18n } from "../i18n/i18n";

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  height: 76px;
  width: 100%;
  background: rgba(15, 0, 38, 0.97);
  border-bottom: 1px solid rgba(255,255,255,.12);
  backdrop-filter: blur(18px) saturate(150%);
`;

const Inner = styled.div`
  width: min(100%, 1440px);
  height: 100%;
  margin: 0 auto;
  padding: 0 64px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 28px;

  @media (max-width: 900px) {
    padding: 0 20px;
    grid-template-columns: 1fr auto;
  }
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: baseline;
  gap: 13px;
  width: max-content;
  color: white;
`;

const BrandLatin = styled.span`
  font-family: 'Cinzel', serif;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1.2px;
`;

const BrandKo = styled.span`
  font-family: 'Song Myung', serif;
  font-size: 20px;
  color: #eadcfb;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 34px;

  @media (max-width: 900px) { display: none; }
`;

const NavItem = styled.button<{ $active?: boolean }>`
  appearance: none;
  border: 0;
  background: transparent;
  color: ${p => p.$active ? '#ffffff' : '#d8cde7'};
  font-size: 14px;
  font-weight: ${p => p.$active ? 650 : 450};
  cursor: pointer;
  padding: 10px 0;
  transition: color .18s ease, opacity .18s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 3px;
    height: 1px;
    background: #d4af37;
    opacity: ${p => p.$active ? 1 : 0};
    transform: ${p => p.$active ? 'scaleX(1)' : 'scaleX(.4)'};
    transition: .18s ease;
  }
  &:hover { color: #fff; }
`;

const Actions = styled.div`
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Pill = styled.button<{ $light?: boolean }>`
  appearance: none;
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid ${p => p.$light ? '#ffffff' : 'rgba(255,255,255,.45)'};
  background: ${p => p.$light ? '#ffffff' : 'rgba(255,255,255,.08)'};
  color: ${p => p.$light ? '#0f0026' : '#ffffff'};
  font-weight: 650;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: transform .16s ease, background .16s ease;
  &:hover { transform: translateY(-1px); background: ${p => p.$light ? '#f8f6f0' : 'rgba(255,255,255,.14)'}; }

  @media (max-width: 560px) {
    ${p => p.$light ? 'display:none;' : ''}
  }
`;

const DropdownWrap = styled.div`position: relative;`;
const Dropdown = styled.div`
  position: absolute;
  right: 0;
  top: 48px;
  width: 210px;
  padding: 8px;
  background: #fffdf8;
  border: 1px solid #e8e0d5;
  border-radius: 16px;
  box-shadow: 0 18px 50px rgba(15,0,38,.18);
`;
const DropButton = styled.button<{ $active?: boolean }>`
  width: 100%;
  border: 0;
  border-radius: 10px;
  background: ${p => p.$active ? '#f1e8fb' : 'transparent'};
  color: #1f2937;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-align: left;
  &:hover { background: #f8f6f0; }
`;

const MobileButton = styled.button`
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.35);
  background: rgba(255,255,255,.08);
  color: white;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  svg { width: 20px; }
  @media (max-width: 900px) { display: inline-flex; }
`;

const MobileMenu = styled.div`
  position: fixed;
  inset: 76px 0 auto 0;
  z-index: 99;
  background: #0f0026;
  border-top: 1px solid rgba(255,255,255,.08);
  padding: 20px;
  box-shadow: 0 18px 40px rgba(0,0,0,.25);
`;
const MobileLink = styled.button`
  width: 100%;
  height: 48px;
  border: 0;
  background: transparent;
  color: white;
  text-align: left;
  font-size: 16px;
  border-bottom: 1px solid rgba(255,255,255,.08);
  cursor: pointer;
`;

export default function GNB() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const pref = user?.user_metadata?.preferred_language;
    if (pref && ['en','ko','zh','ja','es'].includes(pref)) setLanguage(pref);
  }, [user, setLanguage]);

  const languages = useMemo(() => [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ], []);
  const current = languages.find(l => l.code === language) ?? languages[0];

  const go = (path: string) => {
    setMobileOpen(false);
    setLangOpen(false);
    setProfileOpen(false);
    navigate(path);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    go('/');
  };

  return (
    <>
      <Header>
        <Inner>
          <Brand to="/" aria-label="K-Saju home">
            <BrandLatin>K-SAJU</BrandLatin><BrandKo>사주</BrandKo>
          </Brand>

          <Nav>
            <NavItem $active={location.pathname === '/locations'} onClick={() => go('/locations')}>Explore</NavItem>
            <NavItem $active={location.pathname === '/intro'} onClick={() => go('/intro')}>What is Saju?</NavItem>
            <NavItem $active={['/today-fortune','/name-creation','/live-translation'].includes(location.pathname)} onClick={() => go('/today-fortune')}>Culture Lab</NavItem>
          </Nav>

          <Actions>
            <DropdownWrap>
              <Pill onClick={() => { setLangOpen(v => !v); setProfileOpen(false); }}>
                <span>{current.flag}</span><span>{current.code.toUpperCase()}</span><ChevronDownIcon width={14}/>
              </Pill>
              {langOpen && (
                <Dropdown>
                  {languages.map(l => (
                    <DropButton key={l.code} $active={language === l.code} onClick={() => { setLanguage(l.code as any); setLangOpen(false); }}>
                      <span>{l.flag}</span><span>{l.label}</span>
                    </DropButton>
                  ))}
                </Dropdown>
              )}
            </DropdownWrap>

            {user ? (
              <DropdownWrap>
                <Pill $light onClick={() => { setProfileOpen(v => !v); setLangOpen(false); }}>Trips & profile</Pill>
                {profileOpen && (
                  <Dropdown>
                    <DropButton onClick={() => go('/profile')}>Profile & bookings</DropButton>
                    <DropButton onClick={() => go('/messages')}><ChatBubbleLeftRightIcon width={18}/>Messages</DropButton>
                    <DropButton onClick={() => go('/support')}>Help & support</DropButton>
                    <DropButton onClick={logout}>Log out</DropButton>
                  </Dropdown>
                )}
              </DropdownWrap>
            ) : <Pill $light onClick={() => go('/sign-in')}>Sign in</Pill>}

            <MobileButton onClick={() => setMobileOpen(v => !v)} aria-label="Open menu">
              {mobileOpen ? <XMarkIcon/> : <Bars3Icon/>}
            </MobileButton>
          </Actions>
        </Inner>
      </Header>

      {mobileOpen && (
        <MobileMenu>
          <MobileLink onClick={() => go('/locations')}>Explore</MobileLink>
          <MobileLink onClick={() => go('/intro')}>What is Saju?</MobileLink>
          <MobileLink onClick={() => go('/today-fortune')}>Culture Lab</MobileLink>
          <MobileLink onClick={() => go(user ? '/profile' : '/sign-in')}>{user ? 'Trips & profile' : 'Sign in'}</MobileLink>
        </MobileMenu>
      )}
    </>
  );
}
