-- Demo mode: signed-in users can send requests to Preview (is_mock) studios and get an automated reply.
-- The server decides what is a demo (never the client). Demo requests are labelled everywhere, book nothing,
-- and are answered ~90 s later: a notification is scheduled at insert time, and the status flips when the
-- user's app calls sajuteller_advance_demo_requests().
begin;

alter table public.sajuteller_booking_requests
  add column is_demo boolean not null default false,
  add column demo_outcome text check (demo_outcome in ('confirmed','declined')),
  add column demo_reply_at timestamptz,
  add column demo_notification_id uuid references public.sajuteller_notifications(id) on delete set null;
comment on column public.sajuteller_booking_requests.is_demo is 'Set by trigger from saju_studios.is_mock. A demo request is answered automatically and never reaches a studio.';

-- Preview studios may now receive (demo) requests; everything else in the policy is unchanged.
drop policy requests_insert_own on public.sajuteller_booking_requests;
create policy requests_insert_own on public.sajuteller_booking_requests for insert to authenticated with check (
 user_id=(select auth.uid()) and status='requested' and requested_date >= (now() at time zone 'Asia/Seoul')::date
 and exists(select 1 from public.saju_studios s join public.studio_services v on v.studio_id=s.id
 where s.id=sajuteller_booking_requests.studio_id and v.id=sajuteller_booking_requests.service_id and s.status='active' and v.active and guests<=v.max_guests and guests<=s.max_guests)
 and exists(select 1 from public.studio_languages l where l.studio_id=sajuteller_booking_requests.studio_id and l.language_code=language)
);

create function public.sajuteller_demo_request_prepare() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  studio record;
  taken boolean;
begin
  select is_mock, name into studio from public.saju_studios where id = new.studio_id;
  new.is_demo := coalesce(studio.is_mock, false);
  if not new.is_demo then
    new.demo_outcome := null; new.demo_reply_at := null; new.demo_notification_id := null;
    return new;
  end if;
  -- Decline only when the sample timetable already has that exact time taken.
  select exists(select 1 from public.studio_availability_slots x
    where x.studio_id = new.studio_id and x.status in ('booked','blocked')
      and (x.starts_at at time zone 'Asia/Seoul')::date = new.requested_date
      and (x.starts_at at time zone 'Asia/Seoul')::time = new.requested_time) into taken;
  new.demo_outcome := case when taken then 'declined' else 'confirmed' end;
  new.demo_reply_at := now() + interval '90 seconds';
  insert into public.sajuteller_notifications (category, title, body, translations, action_path, recipient_id, status, published_at)
  values ('update',
    case when taken then 'Demo · ' || studio.name || ' declined your request' else 'Demo · ' || studio.name || ' accepted your request' end,
    case when taken then 'Automated reply from a sample studio: that time is already taken. Try another time. Nothing was booked.'
         else 'Automated reply from a sample studio. This is a demo, so nothing is booked and no studio will expect you.' end,
    case when taken then jsonb_build_object(
      'ko', jsonb_build_object('title', '데모 · ' || studio.name || '에서 요청을 거절했어요', 'body', '샘플 스튜디오의 자동 답장: 이미 마감된 시간이에요. 다른 시간을 골라 보세요. 예약된 것은 없어요.'),
      'zh', jsonb_build_object('title', '演示 · ' || studio.name || '婉拒了您的请求', 'body', '示例工作室自动回复：该时间已被预约，请换一个时间。没有产生任何预约。'),
      'ja', jsonb_build_object('title', 'デモ · ' || studio.name || 'がリクエストをお断りしました', 'body', 'サンプルスタジオからの自動返信：その時間はすでに埋まっています。別の時間をお選びください。予約は発生していません。'),
      'es', jsonb_build_object('title', 'Demo · ' || studio.name || ' rechazó tu solicitud', 'body', 'Respuesta automática de un estudio de muestra: esa hora ya está ocupada. Prueba otra. No se ha reservado nada.'))
    else jsonb_build_object(
      'ko', jsonb_build_object('title', '데모 · ' || studio.name || '에서 요청을 수락했어요', 'body', '샘플 스튜디오의 자동 답장이에요. 데모이므로 실제로 예약되지 않으며 방문을 기다리는 스튜디오도 없어요.'),
      'zh', jsonb_build_object('title', '演示 · ' || studio.name || '接受了您的请求', 'body', '这是示例工作室的自动回复。这是演示，不会产生真实预约，也没有工作室在等您。'),
      'ja', jsonb_build_object('title', 'デモ · ' || studio.name || 'がリクエストを承認しました', 'body', 'サンプルスタジオからの自動返信です。デモのため実際の予約はなく、来店を待つスタジオもありません。'),
      'es', jsonb_build_object('title', 'Demo · ' || studio.name || ' aceptó tu solicitud', 'body', 'Respuesta automática de un estudio de muestra. Es una demo: no se reserva nada y ningún estudio te espera.'))
    end,
    '/trips', new.user_id, 'published', new.demo_reply_at)
  returning id into new.demo_notification_id;
  return new;
end $$;
create trigger sajuteller_demo_request_prepare before insert on public.sajuteller_booking_requests
  for each row execute function public.sajuteller_demo_request_prepare();

-- Cancelling before the automated reply withdraws the scheduled notification.
create function public.sajuteller_demo_request_cancelled() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.is_demo and new.status = 'cancelled' and old.status = 'requested' and new.demo_notification_id is not null then
    delete from public.sajuteller_notifications where id = new.demo_notification_id and published_at > now();
  end if;
  return new;
end $$;
create trigger sajuteller_demo_request_cancelled after update of status on public.sajuteller_booking_requests
  for each row execute function public.sajuteller_demo_request_cancelled();

-- Applies due automated replies to the caller's own demo requests. Never touches real requests.
create function public.sajuteller_advance_demo_requests() returns integer
language sql security definer set search_path = '' as $$
  with done as (
    update public.sajuteller_booking_requests set status = demo_outcome
    where user_id = (select auth.uid()) and is_demo and status = 'requested' and demo_reply_at <= now()
    returning 1)
  select count(*)::integer from done;
$$;
revoke all on function public.sajuteller_advance_demo_requests() from public, anon;
grant execute on function public.sajuteller_advance_demo_requests() to authenticated;
revoke all on function public.sajuteller_demo_request_prepare() from public, anon, authenticated;
revoke all on function public.sajuteller_demo_request_cancelled() from public, anon, authenticated;

-- Every Preview studio gets the automated demo chat host.
update public.saju_studios set demo_chat_enabled = true where is_mock and not demo_chat_enabled;

commit;
