import { styled } from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";
import { useI18n } from "../i18n/i18n";

const Shell = styled.div`
  min-height: calc(100vh - 64px);
  width: 100vw;
  margin: 0;
  padding: 0;
  background: #f7f7f7;
`;

const Container = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    padding: 16px;
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const Sidebar = styled.nav`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 12px;
  height: fit-content;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  width: 100%;
  text-align: left;
  appearance: none;
  border: 1px solid ${p => (p.$active ? "#111827" : "#e5e7eb")};
  background: ${p => (p.$active ? "#111827" : "#ffffff")};
  color: ${p => (p.$active ? "#ffffff" : "#111827")};
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 8px;
`;

const Panel = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 12px 0;
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
`;

const Label = styled.label`
  font-size: 12px;
  color: #6b7280;
`;

const Input = styled.input`
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-size: 14px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  appearance: none;
  border: 1px solid ${p => (p.$primary ? "#111827" : "#e5e7eb")};
  background: ${p => (p.$primary ? "#111827" : "#ffffff")};
  color: ${p => (p.$primary ? "#ffffff" : "#111827")};
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
`;

type TabKey = "about" | "purchases" | "reviews";

type ProfileForm = {
  firstName?: string;
  lastName?: string;
  gender?: "M" | "F" | "O" | "";
  birthday?: string;
  birthHour?: string;
  country?: string;
  language?: string; // preferred_language (auth)
  email: string;
  phone: string;
  phoneCountry?: string; // e.g., +82
  avatarUrl?: string;
};

const COUNTRY_OPTIONS = [
  { code: "KR", label: "South Korea", dial: "+82", flag: "🇰🇷" },
  { code: "US", label: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "JP", label: "Japan", dial: "+81", flag: "🇯🇵" },
  { code: "CN", label: "China", dial: "+86", flag: "🇨🇳" },
  { code: "ES", label: "Spain", dial: "+34", flag: "🇪🇸" },
];

export default function Profile() {
  const { t, setLanguage } = useI18n();
  const [active, setActive] = useState<TabKey>("about");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [phoneVerified, setPhoneVerified] = useState<boolean>(false);
  const [phoneCode, setPhoneCode] = useState<string>("");
  const [showPhoneVerification, setShowPhoneVerification] = useState<boolean>(false);
  const [openGender, setOpenGender] = useState(false);
  const [openBirthHour, setOpenBirthHour] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const [openLanguage, setOpenLanguage] = useState(false);
  const [openDial, setOpenDial] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    gender: "",
    birthday: "",
    birthHour: "",
    country: "",
    language: "",
    email: "",
    phone: "",
    phoneCountry: COUNTRY_OPTIONS[0].dial,
  });

  const languageOptions = useMemo(
    () => [
      { code: "en", label: "English", icon: "🇺🇸" },
      { code: "ko", label: "한국어", icon: "🇰🇷" },
      { code: "zh", label: "中文", icon: "🇨🇳" },
      { code: "ja", label: "日本語", icon: "🇯🇵" },
      { code: "es", label: "Español", icon: "🇪🇸" },
    ],
    []
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest("[data-dropdown]")) {
        setOpenGender(false);
        setOpenBirthHour(false);
        setOpenCountry(false);
        setOpenLanguage(false);
        setOpenDial(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      setUserId(u?.id ?? null);
      setEmailVerified(!!u?.email_confirmed_at);
      setPhoneVerified(Boolean((u as unknown as { phone_confirmed_at?: string | null })?.phone_confirmed_at));
      const lang = (u?.user_metadata as any)?.preferred_language || "";
      const fullPhone = (u?.user_metadata as any)?.phone || "";
      const detectedDial = COUNTRY_OPTIONS.find(o => fullPhone?.startsWith(o.dial))?.dial || COUNTRY_OPTIONS[0].dial;
      setForm(f => ({
        ...f,
        firstName: (u?.user_metadata as any)?.first_name || "",
        lastName: (u?.user_metadata as any)?.last_name || "",
        gender: (u?.user_metadata as any)?.gender || "",
        birthday: (u?.user_metadata as any)?.birthday || "",
        birthHour: (u?.user_metadata as any)?.birth_hour || "",
        country: (u?.user_metadata as any)?.country || "",
        language: lang,
        email: u?.email || "",
        phone: fullPhone?.replace(detectedDial, "") || "",
        phoneCountry: detectedDial,
        avatarUrl: (u?.user_metadata as any)?.avatar_url || (u as any)?.photoURL || "",
      }));
      // Load extended fields from profiles
      if (u?.id) {
        const { data: row } = await supabase
          .from("profiles")
          .select("first_name, last_name, gender, birthday, birth_hour, country, preferred_language")
          .eq("id", u.id)
          .maybeSingle();
        if (row) {
          setForm(f => ({
            ...f,
            firstName: row.first_name ?? f.firstName,
            lastName: row.last_name ?? f.lastName,
            gender: (row.gender as any) ?? f.gender,
            birthday: (row.birthday as any) ?? f.birthday,
            birthHour: (row.birth_hour as any) ?? f.birthHour,
            country: row.country ?? f.country,
            language: (row.preferred_language as any) ?? f.language,
          }));
        }
      }
      setLoading(false);
    })();
  }, []);

  const onChange = (key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
  };

  const sendEmailVerification = async () => {
    if (!form.email) return;
    try {
      const { error: resendError } = await (supabase.auth as any).resend?.({ type: "signup", email: form.email });
      if (resendError) throw resendError;
      alert("Verification email sent.");
    } catch (e1) {
      const { error } = await supabase.auth.updateUser({ email: form.email });
      if (error) alert(error.message);
      else alert("Verification email sent.");
    }
  };

  const sendPhoneCode = async () => {
    const full = `${form.phoneCountry || ""}${form.phone || ""}`;
    try {
      const { error } = await supabase.auth.updateUser({ phone: full });
      if (error) throw error;
      setShowPhoneVerification(true);
      alert("Verification code sent to your phone");
    } catch (e: any) {
      alert(e?.message || "Failed to send code");
    }
  };

  const verifyPhone = async () => {
    if (!phoneCode) return;
    try {
      const full = `${form.phoneCountry || ""}${form.phone || ""}`;
      const { error } = await supabase.auth.verifyOtp({ type: "sms", token: phoneCode, phone: full });
      if (error) throw error;
      setPhoneVerified(true);
      setShowPhoneVerification(false);
      setPhoneCode("");
      alert("Phone number verified successfully!");
    } catch (e: any) {
      alert(e?.message || "Verification failed");
    }
  };

  const onSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // Update auth metadata (language, basic personal fields, phone is handled by separate flows)
      const authPayload: any = {
        data: {
          first_name: form.firstName || null,
          last_name: form.lastName || null,
          gender: form.gender || null,
          birthday: form.birthday || null,
          birth_hour: form.birthHour || null,
          country: form.country || null,
          preferred_language: form.language || null,
        },
      };
      const { error: aerr } = await supabase.auth.updateUser(authPayload);
      if (aerr) throw aerr;

      // Persist non-auth fields in profiles
      if (userId) {
        const { error: derr } = await supabase.from("profiles").upsert({
          id: userId,
          first_name: form.firstName || null,
          last_name: form.lastName || null,
          gender: form.gender || null,
          birthday: form.birthday || null,
          birth_hour: form.birthHour ? Number(form.birthHour) : null,
          country: form.country || null,
          preferred_language: form.language || null,
          updated_at: new Date().toISOString(),
        });
        if (derr) throw derr;
      }

      // Apply localization immediately
      if (form.language) setLanguage(form.language as any);

      alert("Profile saved");
    } catch (e: any) {
      alert(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;

  return (
    <Shell>
      <Container>
        <Sidebar>
        <TabButton $active={active === "about"} onClick={() => setActive("about")}>{t("aboutMe") || "About Me"}</TabButton>
        <TabButton $active={active === "purchases"} onClick={() => setActive("purchases")}>{t("myPurchases") || "My Purchases"}</TabButton>
        <TabButton $active={active === "reviews"} onClick={() => setActive("reviews")}>{t("myReviews") || "My Reviews"}</TabButton>
        </Sidebar>
        <Panel>
        {active === "about" && (
          <div>
            <SectionTitle>{t("aboutMe") || "About Me"}</SectionTitle>
              {/* Profile photo */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <label htmlFor="avatar-input" style={{ width: 72, height: 72, borderRadius: 999, background: "#e5e7eb", overflow: "hidden", display: "inline-flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  {form.avatarUrl ? (
                    <img src={form.avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: 36, height: 36 }}>
                      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" fill="#9ca3af" />
                    </svg>
                  )}
                </label>
                <input id="avatar-input" type="file" accept="image/*" onChange={async (e) => {
                  const { files } = e.target as HTMLInputElement;
                  if (!userId || !files || files.length !== 1) return;
                  const file = files[0];
                  const filePath = `avatars/${userId}`;
                  await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
                  const { data: pub } = supabase.storage.from("avatars").getPublicUrl(filePath);
                  const avatarUrl = pub.publicUrl;
                  // save to auth metadata
                  await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
                  alert(t("changePhoto") || "Change Photo");
                }} style={{ display: "none" }} />
                <Button onClick={() => {
                  const el = document.getElementById("avatar-input") as HTMLInputElement | null;
                  el?.click();
                }}>{t("changePhoto") || "Change Photo"}</Button>
              </div>
            <Grid2>
              <Row>
                <Label>{t("firstName") || "First name"}</Label>
                <Input value={form.firstName || ""} onChange={onChange("firstName")} placeholder="Kyle" />
              </Row>
              <Row>
                <Label>{t("lastName") || "Last name"}</Label>
                <Input value={form.lastName || ""} onChange={onChange("lastName")} placeholder="Kim" />
              </Row>
              <Row data-dropdown>
                <Label>{t("gender") || "Gender"}</Label>
                <button
                  type="button"
                  onClick={() => setOpenGender(v => !v)}
                  style={{
                    appearance: 'none', border: '1px solid #e5e7eb', background: '#ffffff', color: '#111827',
                    height: 38, padding: '0 14px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: 14 }}>
                    {(form.gender === 'M' && (t('male') || 'Male')) ||
                     (form.gender === 'F' && (t('female') || 'Female')) ||
                     (form.gender === 'O' && (t('other') || 'Other')) ||
                     (t('notSelected') || 'Not Selected')}
                  </span>
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: 16, height: 16, marginLeft: 'auto' }}>
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.09 1.03l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.26a.75.75 0 01.02-1.06z" fill="#6b7280"/>
                  </svg>
                </button>
                {openGender && (
                  <div style={{ position: 'absolute', right: 0, top: 62, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 20, boxShadow: '0 10px 20px rgba(0,0,0,0.08)', width: '100%', overflow: 'hidden', zIndex: 10 }}>
                    {[{v:'',l:t('notSelected')||'Not Selected'}, {v:'M',l:t('male')||'Male'}, {v:'F',l:t('female')||'Female'}, {v:'O',l:t('other')||'Other'}].map(opt => (
                      <button key={opt.v||'none'} onClick={(ev) => { ev.preventDefault(); setForm(f=>({...f, gender: opt.v as any})); setOpenGender(false); }} style={{ display:'flex', width:'100%', alignItems:'center', gap:10, padding:'10px 12px', background: form.gender===opt.v ? '#f3f4f6' : '#ffffff', border:0, cursor:'pointer' }}>
                        <span style={{ fontSize: 14 }}>{opt.l}</span>
                      </button>
                    ))}
                  </div>
                )}
              </Row>
              <Row>
                <Label>{t("birthday") || "Birth Day"}</Label>
                <Input type="date" value={form.birthday || ""} onChange={onChange("birthday")} />
              </Row>
              <Row data-dropdown>
                <Label>{t("birthHour") || "Birth Hour"}</Label>
                <button
                  type="button"
                  onClick={() => setOpenBirthHour(v => !v)}
                  style={{
                    appearance: 'none', border: '1px solid #e5e7eb', background: '#ffffff', color: '#111827',
                    height: 38, padding: '0 14px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: 14 }}>{form.birthHour ? `${form.birthHour}:00` : (t('notSelected') || 'Not Selected')}</span>
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: 16, height: 16, marginLeft: 'auto' }}>
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.09 1.03l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.26a.75.75 0 01.02-1.06z" fill="#6b7280"/>
                  </svg>
                </button>
                {openBirthHour && (
                  <div style={{ position: 'absolute', right: 0, top: 62, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 20, boxShadow: '0 10px 20px rgba(0,0,0,0.08)', width: '100%', overflow: 'auto', maxHeight: 240, zIndex: 10 }}>
                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2,'0')).map(v => (
                      <button key={v} onClick={(ev)=>{ ev.preventDefault(); setForm(f=>({...f, birthHour: v})); setOpenBirthHour(false); }} style={{ display:'flex', width:'100%', alignItems:'center', gap:10, padding:'10px 12px', background: form.birthHour===v ? '#f3f4f6' : '#ffffff', border:0, cursor:'pointer' }}>
                        <span style={{ fontSize: 14 }}>{v}:00</span>
                      </button>
                    ))}
                  </div>
                )}
              </Row>
              <Row data-dropdown>
                <Label>{t("country") || "Nationality"}</Label>
                <button
                  type="button"
                  onClick={() => setOpenCountry(v => !v)}
                  style={{
                    appearance: 'none', border: '1px solid #e5e7eb', background: '#ffffff', color: '#111827',
                    height: 38, padding: '0 14px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: 14 }}>{COUNTRY_OPTIONS.find(o=>o.code===form.country)?.label || (t('notSelected') || 'Not Selected')}</span>
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: 16, height: 16, marginLeft: 'auto' }}>
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.09 1.03l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.26a.75.75 0 01.02-1.06z" fill="#6b7280"/>
                  </svg>
                </button>
                {openCountry && (
                  <div style={{ position: 'absolute', right: 0, top: 62, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 20, boxShadow: '0 10px 20px rgba(0,0,0,0.08)', width: '100%', overflow: 'hidden', zIndex: 10 }}>
                    <button onClick={(ev)=>{ ev.preventDefault(); setForm(f=>({...f, country: ''})); setOpenCountry(false); }} style={{ display:'flex', width:'100%', alignItems:'center', gap:10, padding:'10px 12px', background: !form.country ? '#f3f4f6' : '#ffffff', border:0, cursor:'pointer' }}>
                      <span style={{ fontSize: 14 }}>{t('notSelected') || 'Not Selected'}</span>
                    </button>
                    {COUNTRY_OPTIONS.map(opt => (
                      <button key={opt.code} onClick={(ev)=>{ ev.preventDefault(); setForm(f=>({...f, country: opt.code})); setOpenCountry(false); }} style={{ display:'flex', width:'100%', alignItems:'center', gap:10, padding:'10px 12px', background: form.country===opt.code ? '#f3f4f6' : '#ffffff', border:0, cursor:'pointer' }}>
                        <span style={{ fontSize: 18 }}>{opt.flag}</span>
                        <span style={{ fontSize: 14 }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </Row>
              <Row data-dropdown>
                <Label>{t("language") || "Language"}</Label>
                <button
                  type="button"
                  onClick={() => setOpenLanguage(v => !v)}
                  style={{
                    appearance: 'none', border: '1px solid #e5e7eb', background: '#ffffff', color: '#111827',
                    height: 38, padding: '0 14px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: 18 }}>
                    {form.language === 'en' && '🇺🇸'}
                    {form.language === 'ko' && '🇰🇷'}
                    {form.language === 'zh' && '🇨🇳'}
                    {form.language === 'ja' && '🇯🇵'}
                    {form.language === 'es' && '🇪🇸'}
                    {!form.language && '❓'}
                  </span>
                  <span style={{ fontSize: 14 }}>
                    {languageOptions.find(o=>o.code===form.language)?.label || (t('notSelected') || 'Not Selected')}
                  </span>
                  <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: 16, height: 16, marginLeft: 'auto' }}>
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.09 1.03l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.26a.75.75 0 01.02-1.06z" fill="#6b7280"/>
                  </svg>
                </button>
                {openLanguage && (
                  <div style={{ position: 'absolute', right: 0, top: 62, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 20, boxShadow: '0 10px 20px rgba(0,0,0,0.08)', width: '100%', overflow: 'hidden', zIndex: 10 }}>
                    <button onClick={(ev)=>{ ev.preventDefault(); setForm(f=>({...f, language: ''})); setOpenLanguage(false); }} style={{ display:'flex', width:'100%', alignItems:'center', gap:10, padding:'10px 12px', background: !form.language ? '#f3f4f6' : '#ffffff', border:0, cursor:'pointer' }}>
                      <span style={{ fontSize: 18 }}>❓</span>
                      <span style={{ fontSize: 14 }}>{t('notSelected') || 'Not Selected'}</span>
                    </button>
                    {languageOptions.map(opt => (
                      <button key={opt.code} onClick={(ev)=>{ ev.preventDefault(); setForm(f=>({...f, language: opt.code})); setOpenLanguage(false); }} style={{ display:'flex', width:'100%', alignItems:'center', gap:10, padding:'10px 12px', background: form.language===opt.code ? '#f3f4f6' : '#ffffff', border:0, cursor:'pointer' }}>
                        <span style={{ fontSize: 18 }}>{opt.icon}</span>
                        <span style={{ fontSize: 14 }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </Row>
              <Row>
                <Label>{t("email") || "Email"}</Label>
                <div style={{ display: "flex", gap: 8 }}>
                  <Input style={{ flex: 1 }} type="email" value={form.email} onChange={onChange("email")} placeholder="you@example.com" />
                  {!emailVerified && (
                    <Button onClick={sendEmailVerification}>{t("verify") || "Verify"}</Button>
                  )}
                </div>
              </Row>
              <Row data-dropdown>
                <Label>{t("phoneNumber") || "Phone Number"}</Label>
                <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8, position: 'relative' }}>
                  <div data-dropdown style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => setOpenDial(v => !v)}
                      style={{
                        appearance: 'none', border: '1px solid #e5e7eb', background: '#ffffff', color: '#111827',
                        height: 38, padding: '0 14px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', width: '100%'
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{COUNTRY_OPTIONS.find(o=>o.dial===form.phoneCountry)?.flag}</span>
                      <span style={{ fontSize: 14 }}>{COUNTRY_OPTIONS.find(o=>o.dial===form.phoneCountry)?.dial}</span>
                      <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: 16, height: 16, marginLeft: 'auto' }}>
                        <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.09 1.03l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.26a.75.75 0 01.02-1.06z" fill="#6b7280"/>
                      </svg>
                    </button>
                    {openDial && (
                      <div style={{ position: 'absolute', right: 0, top: 44, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 20, boxShadow: '0 10px 20px rgba(0,0,0,0.08)', width: '100%', overflow: 'hidden', zIndex: 10 }}>
                        {COUNTRY_OPTIONS.map(opt => (
                          <button key={opt.code} onClick={(ev)=>{ ev.preventDefault(); setForm(f=>({...f, phoneCountry: opt.dial})); setOpenDial(false); }} style={{ display:'flex', width:'100%', alignItems:'center', gap:10, padding:'10px 12px', background: form.phoneCountry===opt.dial ? '#f3f4f6' : '#ffffff', border:0, cursor:'pointer' }}>
                            <span style={{ fontSize: 18 }}>{opt.flag}</span>
                            <span style={{ fontSize: 14 }}>{opt.dial}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Input value={form.phone} onChange={onChange("phone")} placeholder="10-1234-5678" />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {!phoneVerified && (
                    <>
                      <Button onClick={sendPhoneCode}>{t("sendCode") || "Send code"}</Button>
                      <Input style={{ width: 160 }} value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} placeholder={t("enterCode") || "Enter code"} />
                      <Button $primary onClick={verifyPhone}>{t("verify") || "Verify"}</Button>
                    </>
                  )}
                </div>
              </Row>
            </Grid2>
            <Actions>
              <Button $primary disabled={saving} onClick={onSave}>{saving ? (t("saving") || "Saving…") : (t("saveChanges") || "Save changes")}</Button>
            </Actions>
          </div>
        )}

        {active === "purchases" && (
          <div>
            <SectionTitle>{t("myPurchases") || "My Purchases"}</SectionTitle>
            <div style={{ color: "#6b7280" }}>Coming soon.</div>
          </div>
        )}

        {active === "reviews" && (
          <div>
            <SectionTitle>{t("myReviews") || "My Reviews"}</SectionTitle>
            <UserReviews />
          </div>
        )}
        </Panel>
      </Container>
    </Shell>
  );
}

function UserReviews() {
  const [rows, setRows] = useState<Array<{ id: number; title: string | null; body: string | null; rating: number; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) { setLoading(false); return; }
      const { data } = await supabase
        .from("location_reviews")
        .select("id, title, body, rating, created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      setRows(data || []);
      setLoading(false);
    })();
  }, []);
  if (loading) return <div>Loading…</div>;
  if (rows.length === 0) return <div style={{ color: "#6b7280" }}>No reviews yet.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rows.map(r => (
        <div key={r.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Stars n={r.rating} />
            <span style={{ fontWeight: 600 }}>{r.title || "(No title)"}</span>
            <span style={{ color: "#9ca3af", marginLeft: "auto", fontSize: 12 }}>{new Date(r.created_at).toLocaleString()}</span>
          </div>
          <div style={{ marginTop: 6 }}>{r.body}</div>
        </div>
      ))}
    </div>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span aria-label={`${n} stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" width={14} height={14} style={{ marginRight: 2 }}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81H6.93a1 1 0 00.95-.69l1.07-3.292z" fill={i < n ? "#f59e0b" : "#e5e7eb"} />
        </svg>
      ))}
    </span>
  );
}


