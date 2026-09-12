import { Link, useLocation, useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { supabase } from "../supabase";
import { useI18n } from "../i18n/i18n";
import { useEffect, useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "../assets/logo.png";

const Bar = styled.header<{ $isScrolled: boolean }>`
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  backdrop-filter: saturate(180%) blur(8px);
  background: ${props => props.$isScrolled ? '#ffffff' : '#0F0026'};
  border-bottom: 1px solid ${props => props.$isScrolled ? 'rgba(17, 24, 39, 0.06)' : 'rgba(255, 255, 255, 0.1)'};
  transition: all 0.3s ease;
`;

const Inner = styled.div`
  margin: 0 auto;
  width: 100%;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;


const Logo = styled(Link)<{ $isScrolled: boolean }>`
  display: flex;
  align-items: center;

  img {
    height: 28px;
    width: auto;
    filter: ${props => props.$isScrolled ? 'invert(1)' : 'invert(0)'};
    transition: filter 0.3s ease;
  }
`;

const IconButton = styled.button<{ $isScrolled: boolean }>`
  appearance: none;
  border: 1px solid ${props => props.$isScrolled ? '#e5e7eb' : 'rgba(255, 255, 255, 0.2)'};
  background: ${props => props.$isScrolled ? '#ffffff' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$isScrolled ? '#111827' : '#ffffff'};
  height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  svg {
    width: 18px;
    height: 18px;
  }
  &:hover {
    background: ${props => props.$isScrolled ? '#f9fafb' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const ProfileImg = styled.img<{ $isScrolled: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid ${props => props.$isScrolled ? '#e5e7eb' : 'rgba(255, 255, 255, 0.2)'};
  display: block;
`;

const ProfileButton = styled.button`
  appearance: none;
  border: 0;
  background: transparent;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Divider = styled.span<{ $isScrolled: boolean }>`
  display: inline-block;
  width: 1px;
  height: 20px;
  background: ${props => props.$isScrolled ? '#e5e7eb' : 'rgba(255, 255, 255, 0.2)'};
  margin: 0 4px;
`;

// Mobile hamburger button
const HamburgerButton = styled.button<{ $isScrolled: boolean }>`
  appearance: none;
  border: 1px solid ${props => props.$isScrolled ? '#e5e7eb' : 'rgba(255, 255, 255, 0.2)'};
  background: ${props => props.$isScrolled ? '#ffffff' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$isScrolled ? '#111827' : '#ffffff'};
  height: 38px;
  width: 38px;
  border-radius: 999px;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  @media (max-width: 768px) {
    display: flex;
  }

  &:hover {
    background: ${props => props.$isScrolled ? '#f9fafb' : 'rgba(255, 255, 255, 0.2)'};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Mobile menu overlay
const MobileMenu = styled.div<{ $isOpen: boolean; $isScrolled: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 60;
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: flex-start;
  justify-content: flex-end;
  padding-top: 70px;

  @media (min-width: 769px) {
    display: none;
  }
`;

// Mobile menu panel
const MobileMenuPanel = styled.div<{ $isScrolled: boolean }>`
  background: #ffffff;
  border-radius: 20px 0 0 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 280px;
  max-width: 80vw;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  padding: 20px 0;
`;

// Mobile menu item
const MobileMenuItem = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 16px;
  color: #111827;
  transition: background 0.15s ease;

  &:hover {
    background: #f3f4f6;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

// Desktop navigation items
const DesktopNav = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    display: none;
  }
`;

// Mobile-only language selector
const MobileLangSection = styled.div`
  border-top: 1px solid #e5e7eb;
  margin-top: 8px;
  padding-top: 8px;
`;

export default function GNB() {
  const { t, language, setLanguage } = useI18n();
  const navigate = useNavigate();
  useLocation();
  const [user, setUser] = useState<null | { id: string; user_metadata?: any; user_metadata_photo?: string; }>(null);
  const [openLang, setOpenLang] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user as any);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user as any ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // Apply user's preferred language globally when present
  useEffect(() => {
    const pref = (user?.user_metadata as any)?.preferred_language as string | undefined;
    if (pref && ["en", "ko", "zh", "ja", "es"].includes(pref)) {
      setLanguage(pref as any);
    }
  }, [user, setLanguage]);

  // Handle scroll to change background color
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-dropdown]")) {
        setOpenLang(false);
        setOpenProfile(false);
      }
      if (!target.closest("[data-mobile-menu]") && !target.closest("[data-hamburger]")) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onMessages = () => navigate("/messages");
  const onSignIn = () => navigate("/sign-in");
  const onProfile = () => navigate("/profile");
  const onLogout = async () => {
    const ok = confirm("Are you sure you want to log out?");
    if (ok) {
      await supabase.auth.signOut();
      navigate("/sign-in");
    }
  };

  const onToggleLang = () => {
    setOpenLang((v) => !v);
    setOpenProfile(false); // Close profile dropdown when opening language
  };
  const onPickLang = (code: string) => setLanguage(code as any);
  const onToggleProfile = () => {
    setOpenProfile((v) => !v);
    setOpenLang(false); // Close language dropdown when opening profile
  };
  const onToggleMobileMenu = () => {
    setMobileMenuOpen((v) => !v);
    setOpenLang(false);
    setOpenProfile(false);
  };
  const onCloseMobileMenu = () => setMobileMenuOpen(false);

  // Mobile menu navigation handlers
  const onIntro = () => navigate("/intro");
  const onMobileIntro = () => {
    navigate("/intro");
    onCloseMobileMenu();
  };
  const onMobileMessages = () => {
    navigate("/messages");
    onCloseMobileMenu();
  };
  const onMobileSignIn = () => {
    navigate("/sign-in");
    onCloseMobileMenu();
  };
  const onMobileProfile = () => {
    navigate("/profile");
    onCloseMobileMenu();
  };
  const onMobileSettings = () => {
    navigate("/settings");
    onCloseMobileMenu();
  };
  const onMobileLogout = async () => {
    const ok = confirm("Are you sure you want to log out?");
    if (ok) {
      await supabase.auth.signOut();
      navigate("/sign-in");
      onCloseMobileMenu();
    }
  };

  return (
    <>
      <Bar $isScrolled={isScrolled}>
        <Inner>
          <Left>
            <Logo $isScrolled={isScrolled} to="/">
              <img src={logo} alt="K-Saju" />
            </Logo>
          </Left>
          <Right>
            {/* Desktop Navigation */}
            <DesktopNav>
              {/* What is Saju? Link */}
              <button
                onClick={onIntro}
                style={{
                  background: "none",
                  border: "none",
                  color: isScrolled ? "#6b7280" : "#ffffff",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  transition: "all 0.2s ease",
                  marginRight: "8px"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = isScrolled ? "#f3f4f6" : "rgba(255,255,255,0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {language === 'ko' ? '사주란?' : 'What is Saju?'}
              </button>
              
              <div style={{ position: "relative" }} data-dropdown>
                <IconButton $isScrolled={isScrolled} onClick={onToggleLang} aria-label={t("language")}>
                  <span style={{ fontSize: 20 }}>
                    {language === "en" && "🇺🇸"}
                    {language === "ko" && "🇰🇷"}
                    {language === "zh" && "🇨🇳"}
                    {language === "ja" && "🇯🇵"}
                    {language === "es" && "🇪🇸"}
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    style={{ width: 16, height: 16 }}
                  >
                    <path
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.09 1.03l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.26a.75.75 0 01.02-1.06z"
                      fill={isScrolled ? "#6b7280" : "#ffffff"}
                    />
                  </svg>
                </IconButton>
                {openLang && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 44,
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 20,
                      boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                      width: 200,
                      overflow: "hidden",
                    }}
                  >
                    {[
                      { code: "en", label: "English", icon: "🇺🇸" },
                      { code: "ko", label: "한국어", icon: "🇰🇷" },
                      { code: "zh", label: "中文", icon: "🇨🇳" },
                      { code: "ja", label: "日本語", icon: "🇯🇵" },
                      { code: "es", label: "Español", icon: "🇪🇸" },
                    ].map((opt) => (
                      <button
                        key={opt.code}
                        onClick={() => {
                          onPickLang(opt.code);
                          setOpenLang(false);
                        }}
                        style={{
                          display: "flex",
                          width: "100%",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          background: language === opt.code ? "#f3f4f6" : "#ffffff",
                          border: 0,
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ fontSize: 18 }}>{opt.icon}</span>
                        <span style={{ fontSize: 14 }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {user && (
                <IconButton $isScrolled={isScrolled} onClick={onMessages} aria-label={t("messages")}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 8h10M7 12h7"
                      stroke={isScrolled ? "#111827" : "#ffffff"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-5.586a2 2 0 0 0-1.414.586L8 21v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                      stroke={isScrolled ? "#111827" : "#ffffff"}
                      strokeWidth="1.5"
                    />
                  </svg>
                </IconButton>
              )}
              <Divider $isScrolled={isScrolled} />
              {user ? (
                <div style={{ position: "relative" }} data-dropdown>
                  <ProfileButton onClick={onToggleProfile} aria-label={t("profile")}>
                    {(user.user_metadata?.avatar_url || (user as any).photoURL) ? (
                      <ProfileImg $isScrolled={isScrolled} src={user.user_metadata?.avatar_url || (user as any).photoURL} alt="profile" />
                    ) : (
                      <svg
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        style={{ width: 38, height: 38 }}
                      >
                        <path
                          d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z"
                          fill={isScrolled ? "#111827" : "#ffffff"}
                        />
                      </svg>
                    )}
                  </ProfileButton>
                  {openProfile && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: 44,
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 20,
                        boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                        width: 200,
                        overflow: "hidden",
                      }}
                    >
                      <button
                        onClick={() => {
                          onProfile();
                          setOpenProfile(false);
                        }}
                        style={{
                          display: "flex",
                          width: "100%",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          background: "#ffffff",
                          border: 0,
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          style={{ width: 18, height: 18 }}
                        >
                          <path
                            d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z"
                            fill="#111827"
                          />
                        </svg>
                        {t("myProfile")}
                      </button>
                      <button
                        onClick={() => {
                          navigate("/settings");
                          setOpenProfile(false);
                        }}
                        style={{
                          display: "flex",
                          width: "100%",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          background: "#ffffff",
                          border: 0,
                          cursor: "pointer",
                          fontSize: 14,
                        }}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          style={{ width: 18, height: 18 }}
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z"
                            clipRule="evenodd"
                            fill="#111827"
                          />
                        </svg>
                        {t("settings")}
                      </button>
                      <div
                        style={{
                          height: 1,
                          background: "#e5e7eb",
                          margin: "4px 0",
                        }}
                      ></div>
                      <button
                        onClick={() => {
                          onLogout();
                          setOpenProfile(false);
                        }}
                        style={{
                          display: "flex",
                          width: "100%",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          background: "#ffffff",
                          border: 0,
                          cursor: "pointer",
                          fontSize: 14,
                          color: "#dc2626",
                        }}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          style={{ width: 18, height: 18 }}
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                            clipRule="evenodd"
                            fill="#dc2626"
                          />
                          <path
                            fillRule="evenodd"
                            d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
                            clipRule="evenodd"
                            fill="#dc2626"
                          />
                        </svg>
                        {t("logout")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <IconButton
                  $isScrolled={isScrolled}
                  onClick={onSignIn}
                  aria-label={t("signIn")}
                  style={{
                    background: isScrolled ? "#181818" : "#ffffff",
                    color: isScrolled ? "#ffffff" : "#181818",
                    borderColor: isScrolled ? "#181818" : "#ffffff",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    {t("signIn")}
                  </span>
                </IconButton>
              )}
            </DesktopNav>


            {/* Mobile Hamburger Button */}
            <HamburgerButton $isScrolled={isScrolled} onClick={onToggleMobileMenu} data-hamburger aria-label="Open menu">
              {mobileMenuOpen ? (
                <XMarkIcon />
              ) : (
                <Bars3Icon />
              )}
            </HamburgerButton>
          </Right>
        </Inner>
      </Bar>

      {/* Mobile Menu */}
      <MobileMenu $isOpen={mobileMenuOpen} $isScrolled={isScrolled} onClick={onCloseMobileMenu}>
        <MobileMenuPanel $isScrolled={isScrolled} data-mobile-menu onClick={(e) => e.stopPropagation()}>
          {/* What is Saju? */}
          <MobileMenuItem onClick={onMobileIntro}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {language === 'ko' ? '사주란?' : 'What is Saju?'}
          </MobileMenuItem>
          
          {user ? (
            <>
              {/* Messages */}
              <MobileMenuItem onClick={onMobileMessages}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 8h10M7 12h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-5.586a2 2 0 0 0-1.414.586L8 21v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                {t("messages")}
              </MobileMenuItem>

              {/* Profile */}
              <MobileMenuItem onClick={onMobileProfile}>
                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" fill="currentColor"/>
                </svg>
                {t("myProfile")}
              </MobileMenuItem>

              {/* Settings */}
              <MobileMenuItem onClick={onMobileSettings}>
                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" fill="currentColor"/>
                </svg>
                {t("settings")}
              </MobileMenuItem>

              {/* Language Selection for Mobile */}
                <MobileLangSection>
                  {[
                    { code: "en", label: "English", icon: "🇺🇸" },
                    { code: "ko", label: "한국어", icon: "🇰🇷" },
                    { code: "zh", label: "中文", icon: "🇨🇳" },
                    { code: "ja", label: "日本語", icon: "🇯🇵" },
                    { code: "es", label: "Español", icon: "🇪🇸" },
                  ].map((opt) => (
                    <MobileMenuItem
                      key={opt.code}
                      onClick={() => {
                        onPickLang(opt.code);
                        onCloseMobileMenu();
                      }}
                      style={{
                        background: language === opt.code ? "#f3f4f6" : "transparent",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </MobileMenuItem>
                  ))}
                </MobileLangSection>

              {/* Logout */}
              <MobileMenuItem onClick={onMobileLogout} style={{ color: "#dc2626", marginTop: "8px", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" fill="currentColor"/>
                  <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" fill="currentColor"/>
                </svg>
                {t("logout")}
              </MobileMenuItem>
            </>
          ) : (
            <>
              {/* Language Selection for Mobile */}
                <MobileLangSection>
                  {[
                    { code: "en", label: "English", icon: "🇺🇸" },
                    { code: "ko", label: "한국어", icon: "🇰🇷" },
                    { code: "zh", label: "中文", icon: "🇨🇳" },
                    { code: "ja", label: "日本語", icon: "🇯🇵" },
                    { code: "es", label: "Español", icon: "🇪🇸" },
                  ].map((opt) => (
                    <MobileMenuItem
                      key={opt.code}
                      onClick={() => {
                        onPickLang(opt.code);
                        onCloseMobileMenu();
                      }}
                      style={{
                        background: language === opt.code ? "#f3f4f6" : "transparent",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </MobileMenuItem>
                  ))}
                </MobileLangSection>

              {/* Sign In */}
              <MobileMenuItem onClick={onMobileSignIn} style={{ marginTop: "8px", borderTop: "1px solid #e5e7eb", paddingTop: "16px", background: "#f3f4f6", fontWeight: 600 }}>
                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" fill="currentColor"/>
                </svg>
                {t("signIn")}
              </MobileMenuItem>
            </>
          )}
        </MobileMenuPanel>
      </MobileMenu>
    </>
  );
}
