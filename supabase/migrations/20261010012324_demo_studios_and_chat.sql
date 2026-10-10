-- Only explicitly designated demo studios may use simulated business chat.
alter table public.saju_studios add column demo_chat_enabled boolean not null default false;
alter table public.saju_studios add constraint demo_chat_requires_mock check (not demo_chat_enabled or is_mock);
comment on column public.saju_studios.demo_chat_enabled is 'Server-managed opt-in for clearly labeled automated demo conversations. Never enables booking.';

insert into public.saju_studios (slug,name,name_ko,tagline,description,status,is_mock,demo_chat_enabled,is_featured,verified,address_line1,latitude,longitude,neighborhood,district,base_price,min_duration_minutes,max_guests,specialties,modalities)
values
('demo-moon-gate','Moon Gate Saju','문게이트 사주','A gentle first reading in the heart of Seoul.','A fictional studio for trying SajuTeller. Explore a private introduction to the four pillars, with space for questions about your next chapter. Chat with an automated demo host about prices, languages, or preparing for a reading. No real appointments or payments.', 'active',true,true,true,false,'Illustrative location · Insadong, Seoul',37.5744,126.9856,'Insadong','Jongno-gu',55000,30,1,array['general','career','wealth'],array['saju']),
('demo-seoul-starlight','Seoul Starlight Tarot','서울 스타라이트 타로','A little perspective for love and life.','A fictional tarot lounge for demonstrating SajuTeller. Browse a relaxed one-to-one reading and ask the automated demo host a question. All studio details and availability are illustrative. No real appointments or payments.', 'active',true,true,true,false,'Illustrative location · Hongdae, Seoul',37.5563,126.9236,'Hongdae','Mapo-gu',45000,30,1,array['love','general'],array['tarot']),
('demo-two-moons','Two Moons Atelier','투문 아틀리에','Discover your story, together.','A fictional couples reading studio for trying SajuTeller. Explore compatibility and shared questions in a calm private setting. The chat host is automated and can explain the sample experience. No real appointments or payments.', 'active',true,true,true,false,'Illustrative location · Seongsu, Seoul',37.5445,127.0557,'Seongsu','Seongdong-gu',80000,50,2,array['compatibility','love'],array['saju'])
on conflict (slug) do nothing;

insert into public.studio_languages (studio_id,language_code,support_type)
select s.id,l.code,'conversational' from public.saju_studios s cross join (values ('en'),('ko'),('zh'),('ja'),('es')) l(code)
where s.slug in ('demo-moon-gate','demo-seoul-starlight','demo-two-moons')
on conflict do nothing;

insert into public.studio_services (studio_id,service_type,name,description,duration_minutes,price,max_guests,requires_birth_date,birth_time_recommended)
select id,case when slug='demo-seoul-starlight' then 'tarot' when slug='demo-two-moons' then 'compatibility' else 'general' end,
'Demo reading','An illustrative session. No payment or reservation will be made.',min_duration_minutes,base_price,max_guests,false,false
from public.saju_studios s where s.slug in ('demo-moon-gate','demo-seoul-starlight','demo-two-moons')
and not exists (select 1 from public.studio_services x where x.studio_id=s.id);

-- Reuse existing illustrative artwork; never imply that photos depict a real business.
insert into public.studio_images (studio_id,image_url,alt_text,image_type,sort_order)
select s.id,case s.slug when 'demo-moon-gate' then 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1400&q=82' when 'demo-seoul-starlight' then 'https://images.unsplash.com/photo-1577702312706-e23ff063064f?auto=format&fit=crop&w=1400&q=82' else 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1400&q=82' end,'Illustrative studio artwork','cover',0
from public.saju_studios s where s.slug in ('demo-moon-gate','demo-seoul-starlight','demo-two-moons')
and not exists (select 1 from public.studio_images x where x.studio_id=s.id);
